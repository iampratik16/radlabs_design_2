/**
 * Selected work.
 *
 * The screens are static imports rather than string paths so Next resolves
 * each capture's intrinsic size at build time. The case pages derive their
 * scroll duration from that height — re-capture a site at a different length
 * and the animation re-times itself instead of silently going wrong.
 */
import type { StaticImageData } from 'next/image';

import chigwellDesktop from '@/public/img/work/chigwell-marquees-desktop.jpg';
import chigwellPhone from '@/public/img/work/chigwell-marquees-phone.jpg';
import chigwellCard from '@/public/img/work/chigwell-marquees-card.jpg';
import pinktreeDesktop from '@/public/img/work/pink-tree-media-desktop.jpg';
import pinktreePhone from '@/public/img/work/pink-tree-media-phone.jpg';
import pinktreeCard from '@/public/img/work/pink-tree-media-card.jpg';
import swiftyDesktop from '@/public/img/work/swifty-beats-desktop.jpg';
import swiftyPhone from '@/public/img/work/swifty-beats-phone.jpg';
import swiftyCard from '@/public/img/work/swifty-beats-card.jpg';
import beamDesktop from '@/public/img/work/beam-global-desktop.jpg';
import beamPhone from '@/public/img/work/beam-global-phone.jpg';
import beamCard from '@/public/img/work/beam-global-card.jpg';
import neoecoDesktop from '@/public/img/work/neo-eco-cleaning-desktop.jpg';
import neoecoPhone from '@/public/img/work/neo-eco-cleaning-phone.jpg';
import neoecoCard from '@/public/img/work/neo-eco-cleaning-card.jpg';
import bassiDesktop from '@/public/img/work/bassi-clothing-desktop.jpg';
import bassiPhone from '@/public/img/work/bassi-clothing-phone.jpg';
import bassiCard from '@/public/img/work/bassi-clothing-card.jpg';

/* Sector atmosphere for the work mosaic — see tools/generate-work-images.sh. */
import chigwellAtmos from '@/public/img/work/atmos/chigwell-marquees.jpg';
import pinktreeAtmos from '@/public/img/work/atmos/pink-tree-media.jpg';
import swiftyAtmos from '@/public/img/work/atmos/swifty-beats.jpg';
import beamAtmos from '@/public/img/work/atmos/beam-global.jpg';
import neoecoAtmos from '@/public/img/work/atmos/neo-eco-cleaning.jpg';
import bassiAtmos from '@/public/img/work/atmos/bassi-clothing.jpg';
import chigwellCraft from '@/public/img/work/atmos/chigwell-marquees-craft.jpg';
import chigwellScene from '@/public/img/work/atmos/chigwell-marquees-scene.jpg';
import pinktreeCraft from '@/public/img/work/atmos/pink-tree-media-craft.jpg';
import pinktreeScene from '@/public/img/work/atmos/pink-tree-media-scene.jpg';
import swiftyCraft from '@/public/img/work/atmos/swifty-beats-craft.jpg';
import swiftyScene from '@/public/img/work/atmos/swifty-beats-scene.jpg';
import beamCraft from '@/public/img/work/atmos/beam-global-craft.jpg';
import beamScene from '@/public/img/work/atmos/beam-global-scene.jpg';
import neoecoCraft from '@/public/img/work/atmos/neo-eco-cleaning-craft.jpg';
import neoecoScene from '@/public/img/work/atmos/neo-eco-cleaning-scene.jpg';
import bassiCraft from '@/public/img/work/atmos/bassi-clothing-craft.jpg';
import bassiScene from '@/public/img/work/atmos/bassi-clothing-scene.jpg';

export type Discipline = 'web' | 'brand' | 'seo';

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  web: 'Website development',
  brand: 'Branding and digital marketing',
  seo: 'SEO, AEO and GEO',
};

export type Project = {
  slug: string;
  name: string;
  /** Shown in the browser frame, so it is written the way a visitor types it. */
  domain: string;
  url: string;
  sector: string;
  /** One line for the index card. */
  summary: string;
  disciplines: Discipline[];
  /** What the client arrived with. */
  challenge: string;
  /** What we did about it. */
  solution: string;
  /** What the finished thing does. Observable, never a claimed metric. */
  outcome: string;
  /** What we made. Observable things, not claimed outcomes. */
  build: string[];
  /** Where the three phones sit in the mobile capture. Measured from the
   *  capture's own content, not guessed: fixed fractions left blank screens
   *  on sites whose lower page is mostly whitespace. */
  phoneSlices: [number, number, number];
  /** Real, client-supplied numbers. Undefined until there are some: the
   *  results band simply does not render without them. */
  metrics?: { value: string; label: string }[];
  /** A note on the phone build, shown beside the phone frames. */
  mobile: string;
  desktop: StaticImageData;
  phone: StaticImageData;
  card: StaticImageData;
  /** Sector atmosphere for the mosaic tile and the case hero. Not the
   *  client's premises or product — the real site is what the case page
   *  shows, in device frames, captured live. */
  atmos: StaticImageData;
  /** A detail shot, for the identity band. */
  craft: StaticImageData;
  /** A context shot, beside the mobile view. */
  scene: StaticImageData;
  /** The line the client's own site is built around, quoted from it. Not
   *  copy we wrote, and not a testimonial — we have none. */
  line: string;
};

export const PROJECTS: Project[] = [
  {
    slug: 'chigwell-marquees',
    name: 'The Chigwell Marquees',
    domain: 'thechigwellmarquees.com',
    url: 'https://thechigwellmarquees.com/',
    sector: 'Weddings and events, Essex',
    summary:
      'Forty-two acres sold the way the place is actually experienced — wide, quiet, and photographed in good light.',
    disciplines: ['web'],
    challenge:
      'Chigwell Hall holds weddings and corporate events across forty-two acres of grounds. A venue is chosen on a feeling and only then checked against a capacity table, so the site had to carry the setting before it carried any information.',
    solution:
      'We built the site around the photography rather than around a menu. Venues and occasions share one template, so the team adds a new space without a developer, and a viewing enquiry sits at the end of every route through the site.',
    outcome:
      'The home page opens on the grounds at full width and reaches a viewing enquiry in one tap from any screen. Estate photography is served at the size each device can actually use, so the opening frame arrives quickly on a phone on a train.',
    build: [
      'Site design and build',
      'Venue and occasion templates',
      'Gallery and viewing enquiries',
      'An image pipeline that keeps estate photography sharp without stalling the page',
    ],
    mobile:
      'Viewing enquiries mostly arrive from a phone in the evening. The small layout leads on the photograph and keeps the enquiry within thumb reach the whole way down.',
    phoneSlices: [0.021, 0.468, 0.958],
    desktop: chigwellDesktop,
    phone: chigwellPhone,
    card: chigwellCard,
    atmos: chigwellAtmos,
    craft: chigwellCraft,
    scene: chigwellScene,
    line: 'A remarkable setting for unforgettable occasions.',
  },
  {
    slug: 'pink-tree-media',
    name: 'Pink Tree Media',
    domain: 'pinktreemedia.com',
    url: 'https://pinktreemedia.com/',
    sector: 'Marketing consultancy',
    summary:
      'A consultancy with nothing to photograph, so the typography does the arguing.',
    disciplines: ['web'],
    challenge:
      'A marketing consultancy sells judgement, not a product. There was no catalogue to shoot and no premises to show, which left type, pace and restraint to carry the credibility.',
    solution:
      'An editorial type system doing the job photography usually does: a Didone display face set large enough to show its contrast, measures held under seventy characters, and a case study framework the team extends on their own.',
    outcome:
      'The site reads as a point of view rather than a service list. Adding a case study is a content job, not a build, so the work on show stays current.',
    build: [
      'Site design and build',
      'A case study framework the team can extend',
      'Service architecture',
      'An editorial type system',
    ],
    mobile:
      'A text-led site is where mobile usually falls apart. The measure tightens and the scale steps down so the display face keeps its contrast instead of turning into grey mass.',
    phoneSlices: [0.019, 0.571, 0.714] /* pink-tree: 0.388 was unloaded image placeholders; 0.857 is a client logo wall */,
    desktop: pinktreeDesktop,
    phone: pinktreePhone,
    card: pinktreeCard,
    atmos: pinktreeAtmos,
    craft: pinktreeCraft,
    scene: pinktreeScene,
    line: 'One partner. Every part of your marketing.',
  },
  {
    slug: 'swifty-beats',
    name: 'Swifty Beats',
    domain: 'swiftybeats.com',
    url: 'https://www.swiftybeats.com/',
    sector: 'Music — producer and DJ',
    summary:
      'One enormous word, a fabric texture behind it, and somewhere to press play.',
    disciplines: ['web'],
    challenge:
      'An Asian house producer and DJ needed a single place for bookings and press to land — one that sounded like the music rather than reading like a profile page.',
    solution:
      'One display word at viewport scale over a fabric texture, with listening links and booking enquiries never more than a tap from wherever you are on the page.',
    outcome:
      'The page is short on purpose. Promoters and press reach a booking enquiry without scrolling past a biography first.',
    build: [
      'Site design and build',
      'Release and listening links',
      'Press and booking enquiries',
      'Display type and motion',
    ],
    mobile:
      'The display word is set in viewport units, so it stays edge to edge on a phone instead of shrinking into the middle of the screen.',
    phoneSlices: [0.021, 0.59, 0.808],
    desktop: swiftyDesktop,
    phone: swiftyPhone,
    card: swiftyCard,
    atmos: swiftyAtmos,
    craft: swiftyCraft,
    scene: swiftyScene,
    line: 'Turn it up a little.',
  },
  {
    slug: 'beam-global',
    name: 'Beam Global Services',
    domain: 'beamglobalservices.com',
    url: 'https://www.beamglobalservices.com/',
    sector: 'Governance, risk and compliance',
    summary:
      'A compliance consultancy made legible, then made findable — by search engines and by the models people now ask instead.',
    disciplines: ['web', 'seo'],
    challenge:
      'In governance, risk and compliance the buyer researches for weeks before making contact. The site had to answer questions at depth, and be the source that answers them when the question is put to an AI assistant rather than a search box.',
    solution:
      'A site architecture built for research rather than for a brochure: an insights hub, case studies, and a service page for each discipline, written to be the source that answers a question whether it is typed into a search box or put to an assistant. Structured data and entity definition throughout.',
    outcome:
      'Governance, risk and compliance questions each have a page, cross-linked and marked up so they can be quoted directly. The insights hub is extendable by the team without a developer.',
    build: [
      'Site design and build',
      'An insights hub and case study system',
      'Technical SEO and site architecture',
      'AEO and GEO: structured data, entity definition and citable source pages',
    ],
    mobile:
      'Long-form compliance writing has to stay readable on a commute. Headings carry the structure so the page can be skimmed at arm’s length and still make sense.',
    phoneSlices: [0.021, 0.223, 0.46],
    desktop: beamDesktop,
    phone: beamPhone,
    card: beamCard,
    atmos: beamAtmos,
    craft: beamCraft,
    scene: beamScene,
    line: 'Empowering your GRC investments.',
  },
  {
    slug: 'neo-eco-cleaning',
    name: 'Neo Eco Cleaning',
    domain: 'neoecocleaning.co.uk',
    url: 'https://neoecocleaning.co.uk/',
    sector: 'Block and communal cleaning, London',
    summary:
      'Identity, site and search for a block cleaning firm whose buyer is a property manager with a complaint already in their inbox.',
    disciplines: ['web', 'brand', 'seo'],
    challenge:
      'Neo Eco cleans communal areas for managing agents and freeholders across North and Central London. The person buying is mid-problem and wants a quote, not a brochure, so every route through the site is short.',
    solution:
      'Identity first, then a site where every route is short. Services and service areas are separate cross-linked pages, so a search for one borough lands on something written for that borough. Technical SEO, AEO and GEO throughout, with digital marketing run month to month.',
    outcome:
      'A property manager can reach a quote or a phone call from any screen. Each area has its own page rather than a line in a dropdown, and the eco credentials are stated where the buyer is already looking.',
    build: [
      'Brand identity and guidelines',
      'Site design and build',
      'Service and service-area architecture',
      'Technical SEO, AEO and GEO',
      'Digital marketing, run month to month',
    ],
    mobile:
      'Property managers call rather than fill in forms. The phone number is a tap target from the first screen onward, not something kept for the contact page.',
    phoneSlices: [0.180, 0.460, 0.578] /* neo-eco: the capture has a mega-menu stuck open over the first 12% */,
    desktop: neoecoDesktop,
    phone: neoecoPhone,
    card: neoecoCard,
    atmos: neoecoAtmos,
    craft: neoecoCraft,
    scene: neoecoScene,
    line: 'Communal areas that make your block shine.',
  },
  {
    slug: 'bassi-clothing',
    name: 'Bassi Clothing',
    domain: 'bassiclothing.in',
    url: 'https://www.bassiclothing.in/',
    sector: 'Knitwear manufacturing, Ludhiana',
    summary:
      'Three decades of knitwear repositioned from supplier to manufacturing partner.',
    disciplines: ['web', 'brand'],
    challenge:
      'A knitwear manufacturer working since 1992, selling to apparel brands who were buying on price alone. The work was to move the conversation onto capability, material and quality control.',
    solution:
      'A reposition from supplier to manufacturing partner: an identity with three decades in it, and a site that leads on capability, material and quality control rather than on price.',
    outcome:
      'The site opens on the cloth. Capability and process have pages of their own, so a buyer can judge the mill before making contact.',
    build: [
      'Brand identity and positioning',
      'Site design and build',
      'Capability and process storytelling',
      'Digital marketing, run month to month',
    ],
    mobile:
      'Buyers browse mills from the factory floor. Material photography is served at a size a phone can actually load, so the cloth still reads as cloth.',
    phoneSlices: [0.021, 0.172, 0.316],
    desktop: bassiDesktop,
    phone: bassiPhone,
    card: bassiCard,
    atmos: bassiAtmos,
    craft: bassiCraft,
    scene: bassiScene,
    line: 'Partners in apparel, leaders in quality.',
  },
];

export const bySlug = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug);
