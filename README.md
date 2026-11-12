# RadLabs Design

Marketing site for the design arm of RadLabs — website development, AI-powered
growth marketing, branding, and luxury merchandising.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript (strict) · plain CSS.
No CSS framework and no UI library — the design system is about 900 lines of
hand-written CSS in `app/globals.css`, driven by custom properties.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | **Not configured.** `eslint-config-next` 15.5 ships only a legacy eslintrc config, and ESLint 9 wants flat config — bridging them needs `@eslint/eslintrc` added as a dev dependency. `npm run typecheck` and `npm run build` both run full type checking in the meantime. |

Deploy to Vercel with no configuration. Anywhere else, run `npm run build &&
npm start` behind a reverse proxy — the enquiry API route needs a Node runtime,
so this is not a static export.

---

## Layout

```
app/
  layout.tsx            Fonts, metadata, nav, footer, <ScrollReveal />
  page.tsx              Home
  work/page.tsx         Work index
  work/[slug]/page.tsx  Case study (statically generated, one per project)
  services/page.tsx     The four disciplines in depth
  studio/page.tsx       Studio, process, sectors
  contact/page.tsx      Enquiry form
  globals.css           Design tokens + all styling
  icon.svg              Favicon (placeholder monogram)
  api/enquiry/route.ts  Enquiry endpoint
components/
  Nav.tsx               Sticky nav + mobile drawer        (client)
  Hero.tsx              Video hero + load sequence        (client)
  ServicesRail.tsx      Editorial 4-up grid               (server)
  ProjectCard.tsx       One tile in the work mosaic       (server)
  Logo.tsx              Signature wordmark                (server)
  ScreenDeck.tsx        Steppable browser mockup          (client)
  EnquiryForm.tsx       Contact form                      (client)
  BackgroundVideo.tsx   Viewport-gated looping video      (client)
  ScrollReveal.tsx      Section reveal observer           (client)
  DeviceFrame.tsx       MacFrame + PhoneTrio, live site screens (server)
  Logo.tsx              The ember mark and wordmark          (server)
  ProjectCard / PageIntro / CTABand                       (server)
  Manifesto / Studio / Contact / SiteFooter               (server)
lib/
  content.ts            Services, sectors, process, nav
  projects.ts           The six client projects + their screens
  enquiry.ts            Enquiry type + validation, shared client and server
public/video, public/img, public/img/work
tools/generate-hero-veo.sh, tools/cut-hero.sh, tools/generate-work-veo.sh
```

Nav and footer live in the layout, so a new route is one file. Every page is
statically prerendered except `/api/enquiry`, which needs a Node runtime.

### Editing content

Copy that repeats lives in `lib/content.ts` and `lib/projects.ts`, not in
markup. Adding a service is one object in `SERVICES`; adding a project is one
object in `PROJECTS`, which generates its own route, its card on two pages,
its footer link and the previous/next links either side of it.

One-off prose (the hero headline, the manifesto, the contact heading) sits in
its own component, since extracting single-use strings into a data file makes
them harder to find, not easier.

---

## The enquiry form

`lib/enquiry.ts` holds the enquiry type and its validation rules, and **both**
the form and the API route import it. Client-side checks are a courtesy; the
server repeats them because anything arriving over the wire is untrusted.

The route also has a honeypot field, and a rate limit of 5 submissions per
minute per IP.

### Wiring up delivery

Copy `.env.example` to `.env.local` and set **one** of:

```bash
# Option A — POST the enquiry as JSON (Zapier, Make, n8n, a CRM)
ENQUIRY_WEBHOOK_URL=https://...

# Option B — send email via Resend
RESEND_API_KEY=re_...
ENQUIRY_TO=design@radlabs.com
ENQUIRY_FROM=website@radlabs.com
```

With neither set, `/api/enquiry` answers `501` and the form falls back to
opening the visitor's mail client. That is deliberate: an unconfigured
deployment still reaches a human instead of silently dropping enquiries.

---

## Before launch

1. **Check the case copy with each client.** The six projects in `PROJECTS`
   are real and the screens are captures of the live sites, but the brief and
   build descriptions were written from the outside. There is no fake logo
   wall and there are no invented statistics or testimonials anywhere on the
   site, deliberately — if you want outcome numbers, get them from the client
   and add them, do not estimate them.
2. **Set a delivery provider** (above), or enquiries only reach you via the
   visitor's mail client.
3. **Change the email address.** `CONTACT_EMAIL` in `lib/content.ts` is the
   single source — it feeds the form, the footer and the mailto fallback.
4. **Replace `app/icon.svg`** with the real brand mark, and add a purpose-built
   1200×630 Open Graph image (`metadata.openGraph.images` in `app/layout.tsx`
   currently points at the hero poster).
5. **Set `NEXT_PUBLIC_SITE_URL`** so canonical and OG URLs are absolute.

---

## Selected work

Six projects, in `lib/projects.ts`. Each one generates `/work/<slug>` at build
time, plus its cards, its footer link and the previous/next pair around it.

Each page follows the Challenge / Solution / Result shape, with the media
blocks between them:

```
title + summary + meta
desktop machine          <- the site running, on the warm ground
The challenge            <- label left, argument right
The solution  + pills    <- disciplines as pills, deliverables beneath
three phones             <- three places in the mobile page, middle raised
The result               <- what the finished thing does
[atmosphere band]        <- only if a Veo clip exists for this project
closing CTA
More work                <- two more projects
```

**There are no statistics.** The reference case study leads on `1.67X` and
`87%`. Those are LUUX's numbers, measured by LUUX. `Project.metrics` is an
optional field and the results band renders without it — drop real,
client-supplied figures in and they appear. Do not estimate them.

### The screens are the hero

A case page for a web studio opens on the client's actual site, running,
inside a drawn desktop machine — not a headline over a stock photograph. The
work is the argument.

The machine and the phones are **drawn in CSS**, not photographed mockups: a
mockup image would be another megabyte, would not take the page's colours, and
could not hold a live screen.

The three phones each hold a different slice of the *same* mobile capture —
`translateY(calc(var(--slice) * (100cqh - 100%)))`. Three real screens of the
live site without taking three more screenshots.

**The offsets are measured, not guessed.** Fixed fractions (4%/40%/72%) put two
of Bassi's three phones on blank page, because that site's lower half is mostly
whitespace. Scoring regions by pixel variance was worse — it rewarded the
*boundary* where content stops. And variance alone marks a dark site as blank:
Swifty's dark-on-dark pages scored 0.18 when they are full of content. The
detector compares each row against the page's own background colour, whatever
that is, and `phoneSlices` in `lib/projects.ts` holds the result per project.
The first is always the hero, since that is the screen that identifies the
site. Re-capture a site and re-measure rather than inheriting old offsets.

The case page hero follows the Relevance pattern: full-bleed with an angled
foot (`clip-path`), a phone tilted 19° bleeding off the bottom edge, and the
client's own home page as the background rather than a stock texture.

**It is a screenshot, not a video.** `public/img/work/<slug>-desktop.jpg` is a
tall capture of the live home page, translated upward by CSS inside a clipped
frame. Over a video this keeps the type crisp at any size, costs roughly
250KB instead of several megabytes, and loops without a seam because the
animation alternates direction rather than cutting back to the start.

The travel is `translateY(calc(100cqh - 100%))` — the frame's height minus the
image's own height — which works out to exactly flush with the bottom edge
whatever the capture's length. That is what `container-type: size` on
`.device__screen` is for. There are no per-project pixel values to keep in
sync, and the duration is derived in `DeviceFrame` from how many screenfuls
the capture is, so a short site drifts and a long one does not blur past.

Hovering pauses it, so people can actually read the page.

### Re-capturing a site

The captures are static imports, so Next reads each one's size at build time
and the scroll re-times itself. Replace the file and rebuild — there is no
dimension to update by hand.

Capture at 1440×900 for desktop and 390×844 for the phone, scroll the whole
page first so lazy images load, demote `position: fixed` elements to
`absolute` so headers do not repeat down the shot, then:

```bash
ffmpeg -i shot.jpeg -vf "crop=iw:min(ih\,6000):0:0,scale=1280:-2" -q:v 3 \
  public/img/work/<slug>-desktop.jpg
ffmpeg -i shot.jpeg -vf "crop=390:min(ih\,7000):0:0" -q:v 3 \
  public/img/work/<slug>-phone.jpg
ffmpeg -i shot.jpeg -vf "crop=iw:min(ih\,900):0:0,scale=1280:-2" -q:v 4 \
  public/img/work/<slug>-card.jpg
```

Phone captures must all be the same width or the frames stop matching. Check
it — a site with horizontal overflow screenshots wider than the viewport you
set, which is how `neoecocleaning.co.uk` first came back at 544px.

Cookie banners: hide the element for the shot, do not click Accept. Clicking
records a consent decision on someone's behalf that nobody asked you to make.

### Atmosphere clips

`tools/generate-work-veo.sh` generates one original Veo clip per project and
writes `public/video/work-<slug>.mp4`. The case pages check for that file at
build time and render the atmosphere band for any project that has one, so
there is nothing to wire up afterwards — generate, rebuild, done.

It needs working credentials, which the build machine does not currently have
(see the hero video section below for the same problem). Until then the motion
on a case page is the two scrolling device frames, which is the footage that
actually shows the work.

## The hero video

`public/video/hero.mp4` is a **35.00-second cut, 39 hard cuts, 0.88s average
shot** — measured on the shipped file, not intended. **All 23 atmosphere shots are
Veo originals at 1080p**, intercut with the client sites presented as studio
device mockups. The licensed stock it was first built from is kept in
`.veo/stock` as a fallback.

### What the reference films actually do

All three were measured, not eyeballed:

| | Length | Hard cuts | Average shot | Opens on |
|---|---|---|---|---|
| Hudson Wright Easton | 35s | 45 | 0.8s | black |
| Luxury Marketing House | 56s | 64 | 0.9s | Monaco aerial |
| LUUX Media | 30s | 42 | 0.7s | black |
| The old RadLabs hero | 19.8s | **0** | 2.4s, all dissolves | estate aerial |

They cut roughly once a second, hard, with occasional 0.2s bursts and
occasional holds past two seconds. The old hero dissolved every 2.4s and
registered *zero* hard cuts to scene detection. That is the whole difference
between a showreel and a screensaver.

Two of the three open on black, which is also how they hide the loop seam:
whatever the last frame is, it cuts into darkness. That is cheaper and better
than crossfading the tail back onto the head.

### The new edit

38 beats over 35 seconds — a 0.92s average — in five blocks:

| Block | Time | Content |
|---|---|---|
| A | 0:00–0:03 | London, daylight |
| B | 0:03–0:06 | underwater couture |
| C | 0:06–0:16 | watches, jewellery, presentation boxes |
| D | 0:16–0:21 | yachts |
| E/F/W | 0:21–0:35 | merchandising, aviation, automotive, and the work |

Block C carries a deliberate four-shot burst at 0.25s each, which is the
punctuation all three references use.

A and B were cut back — London from 5s to 3s, underwater from 5s to 2.5s — and
the 4.5s that freed went to the closing block, which now runs 14.1s and
alternates three sources so a site never sits next to another site:

    E merchandising → W the work → F aviation/automotive → repeat

**The sites are mockups, not pans.** The first cut scrolled each capture
full-bleed, which read as a screenshot. `tools/make-site-mockups.py` instead
composites the same captures into drawn phone frames on a lit studio sweep —
the trio the reference films use. The footage is still the real site; only the
presentation is staged. Nothing about a client's site is generated: a
model-invented Bassi Clothing page would be fabricated client work.

Phones are drawn with PIL, proportional to frame width, at the slices measured
in `lib/projects.ts`. Motion is one oversized stage panned by a 1920×1080
window — one expensive composition, sixty cheap crops.

The edit lives as a flat `source | in-point | duration` table in
`tools/cut-hero.sh`, so re-timing it is editing a list, not rewriting a filter
graph.

```bash
./tools/cut-hero.sh            # re-cut from whatever is in .veo/clips (free)
./tools/generate-hero-veo.sh   # replace those clips with Veo originals, then cut
```

`.veo/` is a scratch directory, not part of the build. `.veo/clips/A1.mp4`
… `E4.mp4` are the sources; the Veo script writes to the same names, so
generating originals later swaps them in with no edit changes. Delete the
folder to reclaim the space — the cut is already encoded.

### The shipped footage

| | Shot | Source |
|---|---|---|
| A1 | London aerial, Thames and Tower Bridge | Pexels 11977876 |
| A2 | City of London from the river | Pexels 2880731 |
| A3 | Canary Wharf towers | Pexels 29715622 |
| B1 | Figure and red ribbons underwater | Pexels 9635217 |
| B2 | Flowing fabric underwater | Pexels 9635209 |
| B3 | Sun flare through water | Pexels 8686153 |
| C1 | Skeleton watch movement | re-cut from the previous hero |
| C2 | Gold and diamonds on black | Pexels 855854 |
| C3 | Loose cut stones on black | Pexels 8971890 |
| C4 | Burgundy presentation box and ribbon | Pexels 6848809 |
| C5 | Diamond ring, macro | Pexels 6263177 |
| D1 | Tender and wake, top-down | Pexels 4385165 |
| D2 | Superyacht on open sea | Pexels 37524015 |
| D3 | Yacht from directly above | Pexels 12270866 |
| E1 | Tying a ribbon | Pexels 6275420 |
| E2 | Tissue and box | Pexels 9862355 |
| E3 | Gold foil in hand | Pexels 6275429 |
| E4 | Wrapping materials, flatlay | Pexels 3927676 |
| W1–W5 | The client sites as studio device mockups | ours |
| F1 | Private jet on wet tarmac at dusk | Veo only |
| F2 | Private jet cabin interior | Veo only |
| F3 | Supercar through a lit tunnel | Veo only |
| F4 | Forged wheel, macro | Veo only |
| F5 | Supercar on a coast road, aerial | Veo only |

The F shots have no stock fallback — they were written straight to Veo, so a
re-cut needs `.veo/clips/F*.mp4` present or those five beats drop and the film
comes up ~5s short. W1–W5 rebuild themselves: `cut-hero.sh` runs
`make-site-mockups.py` when `.veo/stock/W1.mp4` is missing.

**Every beat duration is a multiple of 0.04s — one frame at 25fps.** This is
the single most important rule in the table, and breaking it is subtle. A 0.9s
beat is 22.5 frames; the concat demuxer stitches by container duration, so the
half-frames accumulate until frames get dropped or held at a boundary.

The symptom was the loop seam. The film opens on 0.4s of black and closes on
0.24s of black, but the closing black kept coming out as one held fade frame at
YAVG 30. Three re-cuts went into the fade arithmetic — `d=0.28`, then `d=0.24`,
then a real black tail clip — and none of them worked, because none of them was
the bug. The old table had `0.9`, `1.1`, `0.25` and `0.7` in it.

Beats are cut with **`-frames:v`, not `-t`**, for the same reason. `-ss` to an
in-point that is not frame-aligned makes the first output frame land late, and
`-t` then cuts a frame early — eight of the 39 beats came out one frame short
that way and the film lost a third of a second. An explicit frame count is
exact wherever the seek lands. The final encode carries `-fps_mode cfr -r 25`.

**The black tail is encoded separately and stream-copied on.** Encoding the
whole film in one pass lifts its final flat-black frames from Y=16 to Y=30.
That is an end-of-stream artefact, not quantisation — forcing a keyframe there,
`no-mbtree=1`, `-qmax 36` and dropping CRF from 28 to 18 all produced *exactly*
30. So `encode_film()` encodes the body and a black clip as two files and joins
them with `-c copy`, and nothing ever re-encodes the black. **Both outputs need
this**, desktop and mobile; the mobile file is built from the same body rather
than by re-encoding the finished desktop file.

Verify with **YAVG, not an RGB decode**: first and last frame should both read
16, correct limited-range black. An RGB decode of the same frames reports 0 and
16 and sends you chasing a colour-range problem that isn't there — the numbers
even fit a full→limited lift exactly, which is a coincidence. Check the frame
count too, 875 at 25fps, because a short film still reports a clean-looking
duration.

Pexels licence: free for commercial use, no attribution required, **not
exclusive**. Any competitor can use the same clips — which is the argument for
running the Veo script when credentials allow.

**Two clips were rejected during vetting for the same reason the Richard Mille
was**: a ring box in robin's-egg blue (Tiffany's trade dress) and a box with
legible "CLOTH" branding. Check any replacement the same way — the brand does
not have to be a logo to be a brand.

**No branded products.** Every prompt carries `no text, no logos`; the watch
prompts additionally carry `no maker name, no lettering on the dial`. Using a
trademarked product to illustrate your own branding service implies a client
relationship you do not have. The old cut had this problem repeatedly — an
actual Richard Mille was rejected because the name is on the dial, the
caseback *and* the case flank, and the shipped watch shot had to be cropped
away from an `ORIS CAL. 115` engraving. (LUUX, for what it is worth, shows an
unmistakable Richard Mille in theirs.)

### Credentials

The scripts use **Application Default Credentials**, not the active gcloud
account. The service account this project was set up with
(`radlabs-vertex@radlabs-497004`) returns `invalid_grant: Invalid JWT
Signature` — its key was rotated or deleted — and `gcloud auth
print-access-token` uses *that* account, so the original scripts could never
have worked. ADC is both the correct credential for an application and the one
that works here.

Requests also carry `x-goog-user-project`, which ADC needs for quota
attribution. Model is `veo-3.1-generate-001`; Veo 3.0 and 2.0 carried
retirement dates of 30 June 2026 and are not safe fallbacks.

`resolution` must be set explicitly or the API returns **720p** into a 1080p
edit. `VEO_RES` defaults to `1080p`.

Veo bills per second generated — 23 clips at 8 seconds is 184 seconds a full
run. Already-generated clips are skipped, and `VEO_ONLY=C2` regenerates a
single shot, so iterating on one bad clip is cheap.

### Veo will brand your product shots

The necklace shot took three attempts:

| | Prompt | Result |
|---|---|---|
| 1 | `no text, no logos` | script logo on the box lid from t=5 |
| 2 | named the surface — *no monogram, script, engraving or embossing on the lid or lining* | logo from t=1, worse |
| 3 | **removed the box from the shot** | clean |

Negative prompting does not override the model's prior that a jewellery box
carries a maker's mark. The fix is changing what is in frame, not asking
harder. Seventeen of eighteen clips honoured `no logos` without trouble — it is
specifically product packaging that drifts.

The F shots are built on that lesson rather than relearning it. A badge is part
of what the model thinks "supercar" means, so none of them frame a badge: the
tunnel shot is tight on the rear haunch with the plate out of frame, the wheel
shot is macro, the coast road is aerial distance, and the jet keeps its tail —
where registration and livery live — outside the frame. The silhouette is
described (angular wedge, mid-engine, wide rear haunches) rather than the
marque named; naming a marque summons its badge along with its shape. **Check every regenerated product
shot at several timestamps before shipping it**; a frame at t=0 proves
nothing.

`tools/generate-work-veo.sh` does the same for per-project atmosphere clips;
the case pages pick those up by file existence, so no wiring is needed after.

### What will not be generated

Images of client collateral — packaging, social posts, printed pieces for
these six clients — are deliberately **not** in any script. Generating those
would be inventing deliverables these clients never received and presenting
them as work. The case pages show the real sites instead, which is both honest
and more useful.

## Design notes

**Palette.** Light. Three warm grounds — white, `#F4F2ED`, `#EAE5DC` — with
near-black ink `#16120F` and a single deep ember accent `#8C2318` taken from
the mark. The hero and the footer stay dark so the page opens and closes on
weight.

Those dark bands re-declare the *same* tokens locally rather than running a
second set of rules:

```css
.hero, .foot, .contact, .atmos, .panel, .nav:not(.is-stuck), .drawer {
  --ground: #14110F;
  --ink:    #F5F2ED;
  --rule:   rgba(245, 242, 237, .18);
  color: var(--ink);          /* see below */
}
```

**That `color` line is not redundant.** `body` has already resolved
`var(--ink)` to the dark value, and descendants inherit the *computed* colour,
not the token. Re-declaring the token alone leaves anything that does not set
its own colour — the hero headline, for one — dark on bright video. Every
colour in the stylesheet is a token for this reason; there are no hardcoded
hex text colours left.

The ember is reserved for hairlines, rules, the mark and small accents — never
a filled button. That restraint is what stops a strong red from shouting.

**The mark.** One ember, drawn as a single closed path with one negative cut,
in `components/Logo.tsx`. It takes `currentColor`, so the nav, the footer and
the dark bands all use the one asset. The cut is filled with `var(--ground)`
rather than white, which is what lets it sit on either ground. `app/icon.svg`
is the same path at favicon size.

**Type.** Bodoni Moda for display, Hanken Grotesk for everything else, both
self-hosted through `next/font`. The Didone's thick–thin contrast is the luxury
signal; it needs tight tracking and large sizes to work, so it is never used
below ~1.1rem.

**Motion.** One orchestrated sequence on load — video fade, champagne rules
drawing outward, headline lines rising from behind a mask. After that, motion is
restrained: section-level reveals only, never per-card. All of it is disabled
under `prefers-reduced-motion`, which also stops background video autoplaying.

**The hero lockup** is deliberately quiet. The headline — *Growth partners for
ultra luxury brands* — is set in the grotesque at weight 200, uppercase, tracked
`.14em`, not in the Didone. It reads as a statement line rather than a slab, and
tracked capitals need a much looser line-height (1.3) than the display face did.

Under it sit the studios — Delhi, London, Bangalore — where a strapline used to
be. They are **one link to `/contact`, not three**, so a screen reader is not
read the same destination three times.

There is a single action. It is a ghost button so the footage reads through it,
and it fills with `--accent` on hover, which is the same ember the solid button
already used. Two dead anchors went with the redesign: the old buttons pointed
at `#contact` and `#work`, and the home page renders neither — `Contact` lives
on `/contact` and the work section has no `id`.

**Selected work** is a centred display line over an asymmetric mosaic, built
against charleysignature.com. The numbers came off the live site rather than
off a screenshot: the headline is a hairline serif at `.075em` tracking with
italic lowercase connectors, the eyebrow sits under it at `.4em` / weight 500,
and the tiles run 2.0, 1.58 and 0.78.

That hairline is why there is now a **third face**. Bodoni Moda's weight axis
starts at 400, so Cormorant Garamond 300 was added for display lines that want
to be read as a whisper — and it is the only font given explicit weights,
because Google serves it as statics rather than a variable axis.

Three tile shapes tile a 12-column grid exactly, and the first three tile it
exactly too, which is what the home page shows. Only the full and eight spans
carry an `aspect-ratio`; the four-span stretches to its grid row, because
deriving its ratio by hand left a 2px lip where a pair met.

**The tiles are atmosphere, not screenshots.** Each one is generated at the
exact aspect its slot needs (16:9 for full and eight spans, 4:5 for four
spans), which is why there is no crop logic left in `ProjectCard` — an earlier
pass cropped the real captures and sliced a client's headline into "Y PART OF
YOUR MARKET".

Read `tools/generate-work-images.sh` before regenerating them. **Each image
evokes the client's sector, never the client's premises, product or
collateral** — no marquee claiming to be Chigwell Hall, no knitwear carrying a
Bassi label. The real sites remain the whole of the case pages, in device
frames, captured live. That line is the difference between mood photography,
which every agency uses, and inventing a deliverable the client never
received.

**The scrim is weighted hard at the foot** so the white label holds over a
pale image.

**The case studies** follow cohort-creative.com's Ker & Downey page: hero
photograph alone, then name and summary, then an outcome band against a detail
shot with a CTA, then the approach against a pull-quote, then a scene and the
mobile view, then the desktop deck and a second CTA, then the footer. The old
page — angled hero with a tilted phone, challenge/solution chapters, an
atmosphere band and a "More work" grid — is gone.

**The nav is transparent over any hero** (`/` and `/work/<slug>`, not the
`/work` index) and the wordmark is absolutely centred on the page rather than
sitting in the flex flow. Case heroes are not all dark — the mansion-block hall
is nearly white — so `.casehero::after` lays a gradient under the bar.

**The deck steps rather than scrolls.** The reference pages through designed
screens; we have one capture per project, so `ScreenDeck` steps down the real
page in thirds. Same affordance, and every frame is the site as it runs. The
travel is the same `100cqh - 100%` the device frames use.

**`PhoneSolo` has a status bar.** Without one the top of the screen reads as a
crop rather than a device. The figure is an `inline-size` container so the bar
scales in `cqw` instead of needing a font size per breakpoint.

**What is NOT on these pages:** invented metrics and invented testimonials.
The brief asked for outcomes and client satisfaction; `project.outcome`
describes what was built and what it enables, which is checkable, and the
pull-quote is **the client's own headline, quoted from their live site** — not
copy we wrote and not a testimonial. `metrics` still renders the moment real
figures exist. The footer's newsletter band from the reference is also absent:
a form that posts nowhere is worse than no form.

**The manifesto** is a centred statement with the argument stacked beneath it.
It used to be a two-column split — lead left, body right — which read as two
thoughts rather than one.

A note on the headline's measure: `ch` is derived from the width of the "0"
glyph and knows nothing about letter-spacing, so a tracked uppercase line holds
far fewer characters than the number suggests. `24ch` ran to six lines here;
`38ch` lands on three.

**The wordmark** is the name written as a signature, in Mr Dafoe — one span,
one face, no symbol, where the old lockup had an ember plus `RADLABS` plus
`Design`. The lowercase spelling is deliberate: a hand does not write an
internal capital. `app/icon.svg` still carries the ember, because a script
hairline is unreadable at 16px and that is the one size where a mark does more
work than a name.

**The services grid** is four cards — image, name, one paragraph — 4-up above
1100px, 2-up to 620px, then single column. It replaced a film-strip accordion
of four dark video panels that opened one at a time.

The accordion needed client state, a media-query effect, and conditional ARIA
so a phone user was never told a static panel was a button. The grid needs none
of that: nothing is interactive, so `ServicesRail` is a **server component** and
the section ships no JavaScript. Showing all four at full weight also reads
better than hiding three behind a click.

The capability lists stayed behind on `/services`. Repeating them in the grid
crowded it, and the section already links through.

Images come from `tools/generate-service-images.sh`. **Imagen is not enabled on
this project** — every `imagen-*` and `imagegeneration@*` id returns 404 — so it
uses `gemini-2.5-flash-image` through `:generateContent` with
`responseModalities: ["IMAGE"]`, not Imagen's `:predict`. Probe before assuming
a model exists here.

**Video weight.** `BackgroundVideo` ships with no `src` at all; an
IntersectionObserver attaches it on approach and pauses playback once it leaves
the viewport. With six clips on one page this is the difference between a
reasonable site and a 20MB one. The hero is the exception — it loads
immediately, behind a preloaded poster that carries the LCP.
