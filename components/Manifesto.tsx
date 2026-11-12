import Link from 'next/link';

/**
 * Centred statement, then the argument beneath it.
 *
 * This was a two-column split — the lead on the left, the body in a column
 * beside it. Stacking the body under a centred header reads as one thought
 * rather than two, which is what the reference layout does.
 */
export default function Manifesto() {
  return (
    <section className="manifesto" id="manifesto">
      <div className="wrap manifesto__inner">
        <h2 className="manifesto__lead reveal">
          Luxury is not a price point. It is everything that happens{' '}
          <em>before</em> the price is mentioned.
        </h2>

        <div className="manifesto__body reveal">
          <p>
            A discount brand convinces you it is worth the money. A luxury brand
            never has to raise the subject. The difference is built — in the
            typography, the loading time, the weight of the packaging, the first
            thirty seconds on the website.
          </p>
          <p>
            We work on all of it. One studio for the identity, the site, the
            campaigns and the physical objects that carry your name out of the
            room. No handoffs between four agencies who have never met.
          </p>
          <Link className="link" href="/studio">
            How the studio works
          </Link>
        </div>
      </div>
    </section>
  );
}
