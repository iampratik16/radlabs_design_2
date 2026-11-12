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

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);

  if (HITS.size > 5_000) HITS.clear(); // crude ceiling on memory growth
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
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

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
