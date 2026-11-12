import { NextResponse } from 'next/server';
import { normalise, validate, type Enquiry } from '@/lib/enquiry';

export const runtime = 'nodejs';

/**
 * Enquiry endpoint.
 *
 * Delivery is pluggable via environment variables:
 *   ENQUIRY_WEBHOOK_URL  POST the enquiry as JSON (Zapier, Make, n8n, a CRM)
 *   RESEND_API_KEY + ENQUIRY_TO + ENQUIRY_FROM   send via Resend
 *
 * With neither set the route answers 501 and the form falls back to the
 * visitor's mail client, so an unconfigured deployment still reaches someone
 * rather than silently dropping enquiries.
 */

// ponytail: in-memory limiter — resets on redeploy and is per-instance, which
// is fine for a brochure site. Move to Redis/Upstash if this ever runs at scale.
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_KEYS = 5_000;

/**
 * The client address, as seen by the proxy in front of us.
 *
 * `x-forwarded-for` is a client-supplied header that each proxy APPENDS to,
 * so the leftmost entry is whatever the caller typed and the rightmost is the
 * one our nearest trusted hop added. Keying the limiter on the leftmost entry
 * made it a no-op: `-H 'X-Forwarded-For: <anything>'` minted a fresh bucket
 * per request, and this route sends mail and fires a webhook.
 *
 * Assumes exactly one trusted proxy (Vercel, nginx, Cloudflare). Behind two,
 * take the second from the right; behind none, neither header can be trusted
 * at all and this needs the platform's own connection address.
 */
function clientKey(request: Request): string {
  // Set by the proxy itself, single-valued, not a list the caller can prepend to.
  const real = request.headers.get('x-real-ip')?.trim();
  if (real) return real;

  const forwarded = request.headers.get('x-forwarded-for');
  const hops = forwarded?.split(',').map((h) => h.trim()).filter(Boolean) ?? [];
  return hops.at(-1) ?? 'unknown';
}

/** Drop expired buckets, then oldest-first, until back under the ceiling. */
function evict(now: number): void {
  for (const [key, times] of HITS) {
    if (times.every((t) => now - t >= WINDOW_MS)) HITS.delete(key);
  }
  if (HITS.size <= MAX_KEYS) return;

  // Still over: shed the least recently seen. Never clear() — a global wipe
  // resets every legitimate caller's counter too, which is the bypass.
  const byAge = [...HITS].sort((a, b) => (a[1].at(-1) ?? 0) - (b[1].at(-1) ?? 0));
  for (const [key] of byAge.slice(0, HITS.size - MAX_KEYS)) HITS.delete(key);
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);

  if (HITS.size > MAX_KEYS) evict(now);
  return recent.length > MAX_PER_WINDOW;
}

async function deliver(enquiry: Enquiry): Promise<boolean> {
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (webhook) {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry),
    });
    return res.ok;
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO;
  const from = process.env.ENQUIRY_FROM;

  if (key && to && from) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: enquiry.email,
        subject: `Enquiry from ${enquiry.name}`,
        text: [
          `Name:  ${enquiry.name}`,
          `Email: ${enquiry.email}`,
          `Brand: ${enquiry.brand || '—'}`,
          `Needs: ${enquiry.service || 'Not sure yet'}`,
          '',
          enquiry.brief,
        ].join('\n'),
      }),
    });
    return res.ok;
  }

  return false;
}

export async function POST(request: Request) {
  const ip = clientKey(request);

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: 'Too many enquiries from this address. Try again shortly.' },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Malformed request.' }, { status: 400 });
  }

  if (typeof payload !== 'object' || payload === null) {
    return NextResponse.json({ ok: false, message: 'Malformed request.' }, { status: 400 });
  }

  // Honeypot: a real person never fills a field they cannot see.
  if (typeof (payload as { company?: unknown }).company === 'string'
      && (payload as { company: string }).company.length > 0) {
    return NextResponse.json({ ok: true }); // accept silently, deliver nothing
  }

  const enquiry = normalise(payload as Partial<Enquiry>);
  const errors = validate(enquiry);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const configured =
    Boolean(process.env.ENQUIRY_WEBHOOK_URL) ||
    Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_TO && process.env.ENQUIRY_FROM);

  if (!configured) {
    return NextResponse.json(
      {
        ok: false,
        fallback: 'mailto',
        message: 'No delivery provider configured on the server.',
      },
      { status: 501 },
    );
  }

  try {
    const sent = await deliver(enquiry);
    if (!sent) throw new Error('Provider rejected the enquiry');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, fallback: 'mailto', message: 'The enquiry could not be delivered.' },
      { status: 502 },
    );
  }
}
