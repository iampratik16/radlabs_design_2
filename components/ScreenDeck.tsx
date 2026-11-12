'use client';

import Image, { type StaticImageData } from 'next/image';
import { useState } from 'react';

/** How many screenfuls of the capture the deck steps through. */
const STEPS = 3;

/**
 * The client's site in a browser, steppable.
 *
 * The reference lets you page through screens of the finished site. We have
 * one capture per project rather than a set of designed screens, so the deck
 * steps down the real page instead of across a gallery — same affordance,
 * and every frame is the site as it actually runs.
 *
 * The travel is `100cqh - 100%`: the frame's height minus the image's own
 * height. No per-project numbers, whatever length the capture is.
 */
export default function ScreenDeck({
  src,
  alt,
  domain,
}: {
  src: StaticImageData;
  alt: string;
  domain: string;
}) {
  const [i, setI] = useState(0);
  const step = i / (STEPS - 1);

  return (
    <figure className="deck">
      <div className="deck__frame">
        <div className="deck__chrome" aria-hidden="true">
          <span className="deck__dot" />
          <span className="deck__dot" />
          <span className="deck__dot" />
          <span className="deck__url">{domain}</span>
        </div>

        <div className="deck__screen" style={{ ['--step' as string]: `${step}` }}>
          <Image src={src} alt={alt} sizes="(max-width: 900px) 100vw, 1100px" />
        </div>
      </div>

      <nav className="deck__nav" aria-label="Screens">
        <button
          type="button"
          className="deck__arrow"
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0}
          aria-label="Previous screen"
        >
          <span aria-hidden="true">&#8592;</span>
        </button>

        <span className="deck__rail" aria-hidden="true">
          <span
            className="deck__rail-on"
            style={{ width: `${100 / STEPS}%`, left: `${(i * 100) / STEPS}%` }}
          />
        </span>

        <button
          type="button"
          className="deck__arrow"
          onClick={() => setI((n) => Math.min(STEPS - 1, n + 1))}
          disabled={i === STEPS - 1}
          aria-label="Next screen"
        >
          <span aria-hidden="true">&#8594;</span>
        </button>
      </nav>

      <figcaption className="deck__count">
        Screen {i + 1} of {STEPS}
      </figcaption>
    </figure>
  );
}
