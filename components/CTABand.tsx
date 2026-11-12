import Link from 'next/link';

export default function CTABand({
  title = 'Start a project',
  body = 'Tell us what you are building and who it is for. We will tell you whether we are the right studio for it.',
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="ctaband">
      <div className="wrap">
        <div className="ctaband__inner reveal">
          <h2 className="ctaband__title">{title}</h2>
          <p className="ctaband__body">{body}</p>
          <Link className="btn btn--solid" href="/contact">
            Start a conversation
          </Link>
        </div>
      </div>
    </section>
  );
}
