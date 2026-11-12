import Image from 'next/image';
import Link from 'next/link';
import { type Project } from '@/lib/projects';

/**
 * Where each tile sits in the mosaic.
 *
 * Six shapes that tile a 12-column grid exactly — and the first three tile it
 * exactly too, which is what the home page shows. Adding a seventh project
 * repeats the pattern rather than leaving a ragged row.
 */
const SHAPE = ['full', 'four', 'eight', 'eight', 'four', 'full'] as const;

/**
 * What fraction of the viewport each shape actually occupies, so the browser
 * picks the right variant. One `sizes` for all three was wrong: a full-width
 * tile declared 60vw and got a 500w image for a 767px slot on a tablet —
 * visibly soft. Below 760px the mosaic is one column, so everything is 100vw.
 *
 * The grid is 12 columns inside `.wrap`: 12/12, 8/12, 4/12.
 */
const SIZES = {
  full: '(max-width: 760px) 100vw, 92vw',
  eight: '(max-width: 760px) 100vw, 61vw',
  four: '(max-width: 760px) 100vw, 31vw',
} as const;

export default function ProjectCard({
  project,
  index,
  priority,
}: {
  project: Project;
  index: number;
  priority?: boolean;
}) {
  const shape = SHAPE[index % SHAPE.length];

  return (
    <Link className={`tile tile--${shape} reveal`} href={`/work/${project.slug}`}>
      {/* Atmosphere, generated at the tile's own aspect — so no crop
          gymnastics, and no client's headline sliced mid-word. The real site
          is on the case page, in a device frame, captured live. */}
      <Image
        src={project.atmos}
        alt={`${project.sector} — ${project.name}`}
        fill
        priority={priority}
        sizes={SIZES[shape]}
      />
      <span className="tile__scrim" aria-hidden="true" />
      <span className="tile__label">
        <span className="tile__sector">{project.sector}</span>
        <span className="tile__name">{project.name}</span>
      </span>
    </Link>
  );
}
