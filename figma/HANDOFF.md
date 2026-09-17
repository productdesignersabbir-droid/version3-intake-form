# Braevon checkout — Figma + developer handoff

Everything here describes **screen 34, the checkout** (`Intake form 1/braevon-screen-34-checkout.html`).

- `index.html` — contact sheet: links to the four frames plus these notes.
- `frames/01-6-pack.html` … `frames/04-discount-applied.html` — the four states.
- `assets/` — exports of the renders, chart, wordmark and research logos.

## What the frames are

Each frame **is the production page** (`Intake form 1/braevon-screen-34-checkout.html`) with:

- its own CSS untouched — nothing redrawn, so the design that imports is the real one;
- the scripts removed, so the file is static;
- the DOM set to the state the script would have produced (selection, prices, popup, open hold note);
- the assessment's masthead, nav row, progress bar and back button hidden, exactly as the script hides
  them on this `data-bare` step;
- the onset chart's animations set to land immediately, so an importer cannot catch them mid-run.

## Importing into Figma

Use the **html.to.design** plugin (Figma Community → install → Plugins menu). Its free plan allows
10 imports every 30 days, so four frames fit comfortably.

**By URL** — open the plugin, paste one frame URL, choose the viewport, Import. Repeat for the other
three. The URLs are public, so the plugin can reach them.

**By file** — download `braevon-checkout-frames.zip` (in this folder) and drop it on the plugin's file
import. It holds the four frames plus the research logos, so nothing is missing offline.

**Set the viewport to 390 px wide** (Mobile preset or a custom width). The page is mobile-first and its
phone rules live in `@media (max-width:480px)` and `(max-width:420px)`, so the import width decides which
layout you get; the content column caps at 432 px. Import all four at the same width so they line up.

The production CSS positions a few things absolutely by design — the SAVE 33% disc over the render, the
badge on a pack card, the ready-block arrow. Those arrive as positioned layers rather than auto-layout
children. That is how the page is actually built, not an import artefact.

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

Inside the frames these images stay embedded exactly as production serves them; the files in `assets/`
are there for building the Figma library.
