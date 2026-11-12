/**
 * Enquiry shape and validation.
 *
 * Imported by both the form component and the API route so the two can never
 * disagree about what a valid enquiry is. Client-side checks are a courtesy;
 * the server repeats them because anything arriving over the wire is untrusted.
 */

export type EnquiryField = 'name' | 'email' | 'brief';

export type Enquiry = {
  name: string;
  email: string;
  brand: string;
  service: string;
  brief: string;
};

export type Errors = Partial<Record<EnquiryField, string>>;

export const SERVICE_OPTIONS = [
  'Website development',
  'AI-powered growth marketing',
  'Branding',
  'Luxury merchandising',
  'More than one of these',
] as const;

/** Deliberately permissive: one @, no spaces, a dot in the domain. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX = { name: 120, email: 200, brand: 160, service: 80, brief: 4000 } as const;

export function validate(input: Partial<Enquiry>): Errors {
  const errors: Errors = {};
  const name = (input.name ?? '').trim();
  const email = (input.email ?? '').trim();
  const brief = (input.brief ?? '').trim();

  if (!name) errors.name = 'Enter your name so we know who we are replying to.';
  else if (name.length > MAX.name) errors.name = 'That name is too long.';

  if (!email) errors.email = 'Enter an email address we can reply to.';
  else if (!EMAIL.test(email) || email.length > MAX.email)
    errors.email = 'That email address does not look right.';

  if (!brief) errors.brief = 'A sentence or two is plenty — we just need somewhere to start.';
  else if (brief.length > MAX.brief) errors.brief = 'That is longer than we can accept.';

  return errors;
}

/** Trims and caps every field. Runs server-side before anything is forwarded. */
export function normalise(input: Partial<Enquiry>): Enquiry {
  const take = (v: unknown, limit: number) =>
    typeof v === 'string' ? v.trim().slice(0, limit) : '';

  return {
    name: take(input.name, MAX.name),
    email: take(input.email, MAX.email),
    brand: take(input.brand, MAX.brand),
    service: take(input.service, MAX.service),
    brief: take(input.brief, MAX.brief),
  };
}

/** Builds the mailto fallback used when no delivery provider is configured. */
export function mailtoHref(to: string, e: Enquiry): string {
  const body = [
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    `Brand: ${e.brand || '—'}`,
    `Needs: ${e.service || 'Not sure yet'}`,
    '',
    e.brief,
  ].join('\n');

  return `mailto:${to}?subject=${encodeURIComponent(
    `Enquiry from ${e.name}`,
  )}&body=${encodeURIComponent(body)}`;
}
