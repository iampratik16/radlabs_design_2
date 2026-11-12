import Image from 'next/image';
import { SERVICES } from '@/lib/content';

/**
 * The four services as an editorial grid.
 *
 * This replaced a film-strip accordion — four dark video panels, one open at a
 * time. The grid shows all four at full weight at once, and because nothing
 * here is interactive it is a server component: no state, no media-query
 * effect, and no JavaScript shipped for this section at all.
 */
export default function ServicesRail() {
  return (
    <div className="wrap sgrid">
      {SERVICES.map((service) => (
        <article className="scard reveal" key={service.id}>
          <div className="scard__frame">
            <Image
              src={service.image}
              alt={service.imageAlt}
              fill
              sizes="(max-width: 620px) 100vw, (max-width: 1100px) 50vw, 24vw"
              placeholder="blur"
            />
          </div>
          <h3 className="scard__title">{service.title}</h3>
          <p className="scard__body">{service.blurb}</p>
        </article>
      ))}
    </div>
  );
}
