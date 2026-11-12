import Link from 'next/link';
import { PROCESS } from '@/lib/content';

export default function Studio() {
  return (
    <section className="studio" id="studio">
      <div className="wrap studio__grid">
        <div className="studio__intro">
          <h2 className="section-title reveal">How the studio works</h2>
          <p className="reveal">
            Small senior team, no account layer. You talk to the people doing the
            work, from the first call to the last file.
          </p>
          <Link className="btn btn--ghost reveal" href="/contact">
            Start a conversation
          </Link>
        </div>

        {/* An ordered list because this genuinely is a sequence — the numbers
            carry information rather than decorating three parallel cards. */}
        <ol className="steps reveal">
          {PROCESS.map((step) => (
            <li className="step" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
