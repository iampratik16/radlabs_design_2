/**
 * The RadLabs wordmark: the name written as a signature.
 *
 * This replaced an ember symbol plus `RADLABS` plus `Design` — three elements
 * where the reference uses one. The lowercase spelling is deliberate: a hand
 * does not write an internal capital.
 *
 * `app/icon.svg` still carries the ember. A script hairline is unreadable at
 * 16px, so the favicon keeps the symbol, which is the one size where a mark
 * does more work than a name.
 */
export default function Logo() {
  return <span className="logo__sig">Radlabs.</span>;
}
