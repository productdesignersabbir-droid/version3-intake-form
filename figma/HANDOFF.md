# Braevon checkout — Figma + developer handoff

Everything here describes **screen 34, the checkout** (`Intake form 1/braevon-screen-34-checkout.html`).

- `braevon-checkout-figma.html` — the import file: a spec column plus four phone frames.
- `assets/` — every image the frames use (PNG renders, chart SVG, wordmark, research logos).

## Importing into Figma

1. Open the published URL of `braevon-checkout-figma.html` (see the repo's GitHub Pages link).
2. In Figma, run **html.to.design** and paste that URL.
3. Each `<section class="frame">` arrives as one Figma frame, named by its id:
   `checkout-6-pack`, `checkout-12-pack`, `offer-popup`, `checkout-discount-applied`.

The markup was written for a clean import:

- **Auto layout everywhere.** Every container is a flex row or column with an explicit `gap`.
  No margins are used between siblings, so Figma reads the spacing as auto-layout gaps.
- **No absolute positioning.** The SAVE 33% disc, the pack badges and the ready-block rail all sit
  in the flow, so nothing arrives as a free-floating layer.
- **No filler layers.** No wrapper holds a single child, so the Figma layer tree matches the design.
- **Fluid inside a fixed frame.** Frames are 390 px wide; children use `width:100%` or `flex:1`.
  Stretching a frame in Figma reflows the layout instead of scaling it.
- **Real image files**, not embedded data, so each render lands as one placed image.

## Frames

| Frame | What it shows |
|---|---|
| 01 — 6 Pack (default) | How the page loads. 6 Pack is pre-selected; all prices read $99.00. |
| 02 — 12 Pack selected | The other selection: pack tag, render, SAVE 33% disc and prices switch to $132.00. |
| 03 — Offer popup | The 25% off dialog on its scrim. It is an overlay above frame 01, not a separate page. |
| 04 — Discount applied | After claiming: original price struck through, new price beside it. The hold note is shown open. |

## Colour tokens

| Token | Hex | Used for |
|---|---|---|
| Ink | `#171D2C` | All primary text |
| Muted | `#4B5568` | Body copy, captions |
| Accent | `#E6430D` | CTAs, pack names, step numbers, eyebrow text |
| Page | `#FFFFFF` | Page and card background |
| Wash | `#F2F4F7` | Product shot background, icon circles, FAQ panel |
| Border | `#DEE2EA` | Input outlines, dividers |
| Countdown gradient | `#171D2C` → `#5A6275` | Top bar, reserved pill, ready strip |
| Countdown time | `#4ADE80` | The ticking figure inside those three |
| MOST POPULAR badge | `#59AC77` | 6 Pack badge, white text |
| BEST VALUE badge | `#66BB6A` | 12 Pack badge, white text |
| SAVE fill / text | `#C8E6C9` / `#1B5E20` | SAVE 33% disc on the product render |
| Ready rail | `#F97316` | The vertical rule and arrow above "What's included?" |

## Type

Plus Jakarta Sans, weights 400–800.

| Role | Size / weight |
|---|---|
| H1 | 26 px / 800, centred |
| Section H2 | 22 px / 800, centred |
| Body | 15 px / 1.6, muted |
| Small print, captions | 13 px |
| Pack name | 22 px / 700, accent |
| Price | 24 px / 800, underlined |
| Badges, tags | 11–12 px / 700–800, letter-spacing .03em |

## Spacing and shape

- Page column: 16 px side padding, **32 px between blocks**.
- Cards: 20 px padding, 16 px radius, shadow `0 6px 24px rgba(16,20,34,.08)`.
- Buttons and inputs: 10 px radius, 48–52 px tall. Pack cards: 8 px radius.
- Rows inside a card: 16 px gap. List items: 10–12 px gap.

## States and behaviour

**Pack selection.** 6 Pack is selected on load. The selected card takes a `#F3A184` border with a
3 px `rgba(230,67,13,.15)` glow. Selecting a pack updates, in one pass: the pack tag, the product
render, the SAVE 33% disc (12 Pack only), and every price on the page including the order summary
and the ready strip.

**Countdown.** Starts at **15:00** and counts down once per second. The same value appears in the
top bar, the "reserved for" pill and the ready block — they must never drift apart.

**Offer popup.** Appears **10 seconds** after the page loads, once per visit, and never again once
claimed. Dismiss with the X, the scrim or Esc. Claiming applies −25% to every price and **leaves the
reader exactly where they were** — no scrolling and no navigation. Discounted prices show the
original struck through in grey beside the new figure in green.

**Authorization hold note.** Sits under Continue, centred. The first sentence is always visible; the
rest opens behind Read more / Read less (frame 04 shows it open). This replaced the older
"By subscribing…" line, which is gone.

**Name.** The first name captured in the intake form is echoed in the top bar and the H1. Trim it
before adding "'s", otherwise a stored trailing space renders as "Sabbir 's".

## Assets

| File | Notes |
|---|---|
| `assets/pack-6.png`, `assets/pack-12.png` | Product renders, transparent PNG. Drop-shadow is a filter, never a box-shadow. |
| `assets/tablets.png` | Three-tablet render in the programme card. |
| `assets/onset-chart.svg` | Static export of the animated onset chart, frozen on its finished frame. |
| `assets/braevon-wordmark.svg` | Masthead and footer wordmark. |
| `assets/logos/*.svg` | Mayo Clinic, Stanford, WebMD, Harvard, NIH. |

Stars, ticks and small glyphs are text characters in this file so the layer count stays low — swap
them for the production icon set when building the Figma library.
