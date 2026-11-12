import type { Metadata } from 'next';
import PageIntro from '@/components/PageIntro';
import ProjectCard from '@/components/ProjectCard';
import CTABand from '@/components/CTABand';
import { DISCIPLINE_LABEL, PROJECTS, type Discipline } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Websites, brand identities and search work for The Chigwell Marquees, Pink Tree Media, Swifty Beats, Beam Global Services, Neo Eco Cleaning and Bassi Clothing.',
};

const ORDER: Discipline[] = ['web', 'brand', 'seo'];

export default function WorkPage() {
  return (
    <>
      <PageIntro
        title="Selected work"
        lede="Six live sites. Every screen on these pages is the real thing, captured from the site as it runs today."
      >
        {/* A count per discipline rather than a filter: with six projects a
            filter hides more than it helps, and the overlap is the useful
            part — most of these started as one brief and grew. */}
        <ul className="pintro__facts">
          {ORDER.map((d) => (
            <li key={d}>
              <span>{DISCIPLINE_LABEL[d]}</span>
              <span>{PROJECTS.filter((p) => p.disciplines.includes(d)).length}</span>
            </li>
          ))}
        </ul>
      </PageIntro>

      <section className="worklist">
        <div className="wrap mosaic">
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={i}
              priority={i < 2}
            />
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
