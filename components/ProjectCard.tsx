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
        sizes="(max-width: 760px) 100vw, (max-width: 1100px) 60vw, 70vw"
      />
      <span className="tile__scrim" aria-hidden="true" />
      <span className="tile__label">
        <span className="tile__sector">{project.sector}</span>
        <span className="tile__name">{project.name}</span>
      </span>
    </Link>
  );
}
