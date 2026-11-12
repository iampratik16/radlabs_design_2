import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';
import Studio from '@/components/Studio';
import CTABand from '@/components/CTABand';
import { SECTORS } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Studio',
  description:
    'A small senior design and growth studio: no account layer, no handoffs between four agencies who have never met.',
};

export default function StudioPage() {
  return (
    <>
      <PageIntro
        title="The studio"
        lede="RadLabs Design is the design arm of RadLabs. We build the identity, the site, the campaigns and the physical objects that carry a name out of the room."
      />

      <section className="manifesto">
        <div className="wrap manifesto__grid">
          <h2 className="manifesto__lead reveal">
            Luxury is not a price point. It is everything that happens{' '}
            <em>before</em> the price is mentioned.
          </h2>

          <div className="manifesto__body reveal">
            <p>
              A discount brand convinces you it is worth the money. A luxury
              brand never has to raise the subject. The difference is built — in
              the typography, the loading time, the weight of the packaging, the
              first thirty seconds on the website.
            </p>
            <p>
              Which is why we would rather do four things for one client than
              one thing for four. A site built by people who did not write the
              brand guidelines will drift from them inside a year, and a
              campaign run by people who have never seen the product will sell
              the wrong thing beautifully.
            </p>
            <p>
              We are deliberately small. The people in the first call are the
              people who open the design file, and there is nobody in between
              whose job is to relay a message.
            </p>
          </div>
        </div>
      </section>

      <Studio />

      <section className="sectorsband">
        <div className="wrap sectors reveal">
          <h2 className="sectors__title">Sectors we build in</h2>
          <ul className="sectors__list">
            {SECTORS.map((sector) => (
              <li key={sector}>{sector}</li>
            ))}
          </ul>
        </div>
      </section>

      <CTABand />
    </>
  );
}
