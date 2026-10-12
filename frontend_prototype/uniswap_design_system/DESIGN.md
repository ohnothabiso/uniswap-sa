---
name: UniSwap Design System
colors:
  surface: '#f7faf6'
  surface-dim: '#d8dbd7'
  surface-bright: '#f7faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f1'
  surface-container: '#ecefeb'
  surface-container-high: '#e6e9e5'
  surface-container-highest: '#e0e3e0'
  on-surface: '#181c1a'
  on-surface-variant: '#404943'
  inverse-surface: '#2d312f'
  inverse-on-surface: '#eef1ee'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#006c48'
  on-secondary: '#ffffff'
  secondary-container: '#92f7c3'
  on-secondary-container: '#00734d'
  tertiary: '#7c2e19'
  on-tertiary: '#ffffff'
  tertiary-container: '#9b452e'
  on-tertiary-container: '#ffcfc3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#92f7c3'
  secondary-fixed-dim: '#75daa8'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005235'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#7c2e19'
  background: '#f7faf6'
  on-background: '#181c1a'
  surface-variant: '#e0e3e0'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 44px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system expresses a sustainable, campus-rooted circular fashion economy. Built specifically for collegiate peer-to-peer exchanges, it bridges eco-consciousness with the vibrant self-expression of student style. The aesthetic avoids cold corporate commerce and unrefined student bulletin boards, leaning instead into an editorial, nature-infused tactile minimalism. 

The mood is welcoming, grounded, and unmistakably authentic. Deep forest tones evoke environmental stewardship and campus greens, while warm oat backdrops provide a gentle, non-glare surface suited to frequent browsing between lectures. Every interface element is structured to foster immediate trust, mutual safety, and fluid interactions across mobile-first campus lifestyles.

## Colors

The palette draws direct inspiration from botanical landscapes and raw, unbleached textiles.

- **Primary (`#2D6A4F`)**: Forest green anchored by deep foliage undertones. Used for primary calls-to-action, key state indicators, verified identity accents, and high-emphasis brand elements. A darker variant (`#1B4332`) provides rich contrast for headers, top app bars, and high-prominence banners.
- **Secondary (`#52B788`)**: Vibrant leaf green. Applied to successful transaction badges, active toggle states, eco-saving counters (e.g., kilograms of textile waste diverted), and live interactive highlights.
- **Tertiary (`#E07A5F`)**: Warm terracotta. Deployed intentionally for alerts, urgent swap requests, limited-time campus drop-offs, and critical notifications without relying on hostile, anxiety-inducing crimson reds. Complemented by warm ochre (`#D97706`) for cautionary states.
- **Neutrals (`#1A1E1C`, `#F9F8F3`, `#EFECE3`)**: Text is rendered in crisp dark charcoal slate (`#1A1E1C`) to maintain softer eye strain than stark `#000000`. Backgrounds rely on rich oat cream (`#F9F8F3`) with secondary surface container tiers set in textured linen neutrals (`#EFECE3`).

## Typography

The typographic system utilizes Plus Jakarta Sans across all display, body, and label roles. Its wide geometric stance, friendly curves, and clean apertures echo both modern editorial lookbooks and warm community communication.

- **Headlines & Display**: Set with tight negative letter tracking to create punchy, structured titles for item listings, collection drops, and campus swap drives.
- **Body Hierarchy**: Tuned for effortless scanning of apparel condition notes, sizing guides, and safe meetup instructions. The optical weight stays balanced against warm oat surfaces.
- **Labels & Microcopy**: Compact, semi-bold and bold weights ensure student verification tags, sizing pills, price chips, and transaction statuses remain crisp even at micro scales on handheld screens.

## Layout & Spacing

The grid system accommodates dynamic student usage, prioritizing one-handed mobile interactions while cleanly scaling to desktop viewports.

- **Mobile Viewports (<640px)**: 4-column fluid layout with a `0.75rem` gutter and `1rem` safe page margins. Feed listings display as a 2-column masonry or card grid.
- **Tablet Viewports (640px - 1024px)**: 8-column layout with `1rem` gutters and `1.5rem` margins. Introduces persistent side-sheet filtering and segmented category selectors.
- **Desktop Viewports (>1024px)**: 12-column layout capped at a maximum width of `1280px` with `2rem` outer margins. Content utilizes asymmetric splits: 3 columns for persistent navigation and campus community filters, 9 columns for listing discovery and student lookbooks.
- **Rhythm**: Element padding and margins adhere strictly to an 8pt base grid with a 4pt sub-step (`space-xs` through `space-xl`) to preserve clean visual pacing across feed items.

## Elevation & Depth

This system avoids cold synthetic box-shadows in favor of grounded tonal elevation and organic warmth.

- **Tonal Layering**: Depth is created primarily through surface tiers. The primary canvas rests on `#F9F8F3`. Level 1 elements (cards, bottom sheets) sit on pure `#FFFFFF`. Level 2 elements (flyouts, filter drawers, floating action controls) leverage `#EFECE3` borders or subtle contrast shifts.
- **Tactile Outlines**: Interactive containers use subtle, low-opacity tactile borders (`1px solid rgba(27, 67, 50, 0.08)`) instead of heavy dropshadows, referencing stitched garment tags and natural paper labels.
- **Ambient Green Diffusion**: When floating elements require optical elevation (e.g., sticky exchange actions, active floating filters, or student safety sheets), an ultra-diffused shadow is applied: `0 8px 24px -4px rgba(27, 67, 50, 0.08)`. The slight forest green tint anchors the shadow naturally into the oat background.

## Shapes

With a roundedness value of 2, the shape language communicates friendliness, ease of touch, and contemporary sustainable fashion styling:

- **Base Corner Radius (0.5rem / 8px)**: Standard buttons, text inputs, item thumbnails, and metadata chips.
- **Large Corner Radius (1rem / 16px)**: Product listing cards, student safety alerts, seller review summaries, and modal dialogs.
- **Extra-Large Corner Radius (1.5rem / 24px)**: Campus drop-off bottom sheets, floating navigation bars, and category hero banners.
- **Full Radius (Pill / 9999px)**: Student verification badges, condition pills (e.g., "Thrifted", "Like New", "Custom"), and floating action buttons.

## Components

### Buttons
- **Primary**: Rich forest green (`#2D6A4F`) background, pure white text, 8px radius, `space-sm` vertical by `space-lg` horizontal padding. Hover deepens to `#1B4332`. Active scales slightly to 98% for physical tactile feedback.
- **Secondary / Swap Action**: Leaf green tint background (`rgba(82, 183, 136, 0.15)`), dark forest text (`#1B4332`), tactile border (`1px solid rgba(45, 106, 79, 0.2)`).
- **Tertiary / Danger**: Muted terracotta wash (`rgba(224, 122, 95, 0.12)`), terracotta text (`#E07A5F`), seamless border.

### Filter & Category Chips
- Pill-shaped (`rounded-full`), padded `space-xs` vertically by `space-md` horizontally.
- Inactive: Background `#EFECE3`, text `#1A1E1C`, no border.
- Active: Background `#2D6A4F`, text `#FFFFFF`, with checkmark or count badge.

### Marketplace Listing Cards
- Built on `#FFFFFF` with 16px radius and a 1px border of `rgba(27, 67, 50, 0.06)`.
- Image aspect ratio 4:5 to suit vertical garment photography.
- Bottom container nests student badges, item name (`headline-sm`), price/trade symbol, and campus meeting zone pill.

### Student Safety Badges
- Verified SPU Student indicator uses a subtle green badge (`#D8F3DC` background with `#1B4332` label and shield icon).
- Campus Safe Exchange Zone tag pairs an icon with micro-labeling in 11px semi-bold.

### Input Fields
- Enclosed with warm neutral background `#FFFFFF`, bordered with `1px solid rgba(26, 30, 28, 0.16)`.
- Focus state activates a 2px outline in primary green (`#2D6A4F`) without jarring glow effects.
- Placeholder text sits in muted slate (`rgba(26, 30, 28, 0.45)`).

### Checkboxes & Radios
- 20px squared controls with 4px radius for checkboxes; full circles for radios.
- Inactive state features an oat surface with a tactile slate border. Active state fills with `#2D6A4F` and an off-white icon.