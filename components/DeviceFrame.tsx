import Image, { type StaticImageData } from 'next/image';

/** Visible slice of a capture, as a fraction of its width. */
const RATIO = { imac: 0.625, phone: 844 / 390 } as const;

/**
 * Pace every project the same. Duration follows how many screenfuls the
 * capture actually is, not its pixel height, so a short site drifts and a
 * long one does not become a blur.
 */
function scrollSeconds(src: StaticImageData, kind: keyof typeof RATIO) {
  const frame = src.width * RATIO[kind];
  const screens = (src.height - frame) / frame;
  return Math.min(46, Math.max(14, Math.round(screens * 7)));
}

/**
 * The client's site running on a desktop machine.
 *
 * The screen content is a tall screenshot translated upward by CSS, not a
 * video: type stays crisp at any size, it weighs a fraction of an encode, and
 * alternating the direction means the loop has no seam. The travel is
 * `100cqh - 100%` — frame height minus the image's own height — which lands
 * flush with the bottom edge whatever the capture's length, with no
 * per-project numbers to keep in sync.
 */
export function MacFrame({
  src,
  alt,
  priority,
}: {
  src: StaticImageData;
  alt: string;
  priority?: boolean;
}) {
  return (
    <figure className="imac">
      <div className="imac__body">
        <div className="imac__bezel">
          <div
            className="device__screen"
            style={{ ['--scroll-dur' as string]: `${scrollSeconds(src, 'imac')}s` }}
          >
            <Image
              src={src}
              alt={alt}
              priority={priority}
              sizes="(max-width: 900px) 100vw, 1080px"
            />
          </div>
        </div>
        <div className="imac__chin" aria-hidden="true" />
      </div>
      <div className="imac__neck" aria-hidden="true" />
      <div className="imac__foot" aria-hidden="true" />
    </figure>
  );
}

/**
 * Three phones, each holding a different part of the same mobile capture.
 *
 * Three real screens of the live site without taking three more screenshots.
 * The offsets are measured per project from the capture's own content — fixed
 * fractions put two of Bassi's three phones on blank page, because the lower
 * half of that site is mostly whitespace. The first is always the hero, since
 * that is the screen that identifies the site.
 */
export function PhoneTrio({
  src,
  alt,
  slices,
}: {
  src: StaticImageData;
  alt: string;
  slices: readonly [number, number, number];
}) {
  return (
    <div className="trio">
      {slices.map((slice, i) => (
        <figure className={`device--phone trio__item trio__item--${i}`} key={slice}>
          {/* The island and the side buttons are what make a rounded rectangle
              read as a phone rather than a card. */}
          <span className="phone__island" aria-hidden="true" />
          <span className="phone__btn phone__btn--vol" aria-hidden="true" />
          <span className="phone__btn phone__btn--pwr" aria-hidden="true" />
          <div
            className="device__screen"
            style={{ ['--slice' as string]: `${slice}` }}
          >
            {/* Only the first carries the description; the other two are the
                same page further down and would just repeat it. */}
            <Image src={src} alt={i === 0 ? alt : ''} sizes="320px" />
          </div>
        </figure>
      ))}
    </div>
  );
}

/**
 * One phone, large, with a status bar.
 *
 * The trio shows three places in a site at a glance; this shows one screen
 * the size it deserves. The status bar is what makes the frame read as a
 * device photograph rather than a drawn rectangle — the reference has one,
 * and without it the top of the screen looks cropped.
 *
 * The figure is an inline-size container so the bar scales in `cqw` with the
 * phone instead of needing a font size per breakpoint.
 */
export function PhoneSolo({
  src,
  alt,
  slice = 0.02,
}: {
  src: StaticImageData;
  alt: string;
  slice?: number;
}) {
  return (
    <figure className="device--phone phone--solo">
      <span className="phone__island" aria-hidden="true" />
      <span className="phone__btn phone__btn--vol" aria-hidden="true" />
      <span className="phone__btn phone__btn--pwr" aria-hidden="true" />

      <span className="phone__status" aria-hidden="true">
        <span className="phone__time">15:01</span>
        <span className="phone__meters">
          <svg viewBox="0 0 16 12" className="phone__wifi">
            <path d="M8 10.6 6.1 8.4a2.9 2.9 0 0 1 3.8 0L8 10.6Zm0-4.3a5 5 0 0 0-3.4 1.3L3.2 6a7.1 7.1 0 0 1 9.6 0l-1.4 1.6A5 5 0 0 0 8 6.3Zm0-4.1a9.2 9.2 0 0 0-6.2 2.4L.4 3.1a11.3 11.3 0 0 1 15.2 0l-1.4 1.5A9.2 9.2 0 0 0 8 2.2Z" />
          </svg>
          <svg viewBox="0 0 26 12" className="phone__batt">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" className="phone__batt-case" />
            <rect x="2.2" y="2.2" width="16" height="7.6" rx="1.8" />
            <path d="M23.4 4.2c1.4.5 1.4 3.1 0 3.6V4.2Z" />
          </svg>
        </span>
      </span>

      <div className="device__screen" style={{ ['--slice' as string]: `${slice}` }}>
        <Image src={src} alt={alt} sizes="(max-width: 700px) 70vw, 420px" />
      </div>
    </figure>
  );
}
