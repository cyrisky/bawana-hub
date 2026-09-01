# Bawana Color Foundation v0.1

Status: approved direction; production proofing still required.

## 1. Scope

This foundation defines Bawana's primitive branch palettes, cross-medium color grammar, contrast-safe pairings, and reproduction rules.

It does **not** assign semantic meanings such as primary action, success, warning, error, blocked, or selected. Those mappings belong to the later semantic layer.

## 2. Universal grammar

Every Bawana branch palette follows the same relationship:

1. **Ground** — the dominant atmosphere.
2. **Ink** — the primary structural and text color.
3. **Signal** — the decisive moment of focus.
4. **Refraction** — a companion color that reveals a shifted layer or alternate perspective.
5. **Extension** — an optional branch-specific supporting color.

Recommended composition range:

| Role | Typical share |
|---|---:|
| Ground | 65–85% |
| Ink and structure | 10–25% |
| Signal | 3–8% |
| Refraction | 1–6% |
| Extension | 0–5% |

The ratios are guidance, not a formula. A poster may invert ground and ink; a dense interface will use more structural ink. The hierarchy must remain legible.

## 3. Branch palettes

### 3.1 Tools & Systems — Quiet Current

Atmosphere: calm ground with human, surprising moments.

| Primitive token | Working name | HEX | RGB | Generic CMYK start* |
|---|---|---|---|---|
| `systems.ground` | Cool Mist | `#E9EEF0` | 233, 238, 240 | 3, 1, 0, 6 |
| `systems.ink` | Deep Frame | `#172126` | 23, 33, 38 | 39, 13, 0, 85 |
| `systems.signal` | Raspberry Pulse | `#B63D81` | 182, 61, 129 | 0, 66, 29, 29 |
| `systems.refraction` | Muted Gold | `#D0B24B` | 208, 178, 75 | 0, 14, 64, 18 |
| `systems.trace` | Soft Current | `#B8D4D1` | 184, 212, 209 | 13, 0, 1, 17 |

Usage note: Raspberry Pulse marks initiation, selection, discovery, or meaningful change. It is not automatically an error color. Muted Gold is a refracted companion, not automatically a warning.

### 3.2 Research & Editorial — Layered Field

Atmosphere: warm editorial ground with layered discovery.

| Primitive token | Working name | HEX | RGB | Generic CMYK start* |
|---|---|---|---|---|
| `research.ground` | Archive Paper | `#F0E5CB` | 240, 229, 203 | 0, 5, 15, 6 |
| `research.ink` | Night Plum | `#2B2433` | 43, 36, 51 | 16, 29, 0, 80 |
| `research.signal` | Field Green | `#3C7A57` | 60, 122, 87 | 51, 0, 29, 52 |
| `research.refraction` | Refracted Violet | `#7D5BC7` | 125, 91, 199 | 37, 54, 0, 22 |
| `research.discovery` | Discovery Gold | `#E3A72F` | 227, 167, 47 | 0, 26, 79, 11 |

Usage note: warm ground is part of this branch's editorial atmosphere, but it may be reinterpreted through the actual paper stock. Do not force a printed cream simulation onto naturally warm paper.

### 3.3 Advisory & Client Work — Clear Edge

Atmosphere: clear confidence with personal edge supplied by composition and refraction, not louder color.

| Primitive token | Working name | HEX | RGB | Generic CMYK start* |
|---|---|---|---|---|
| `advisory.ground` | Soft Stone | `#EEE8DF` | 238, 232, 223 | 0, 3, 6, 7 |
| `advisory.ink` | Decision Ink | `#1D2933` | 29, 41, 51 | 43, 20, 0, 80 |
| `advisory.signal` | Argument Rust | `#B84A38` | 184, 74, 56 | 0, 60, 70, 28 |
| `advisory.refraction` | Perspective Teal | `#62A6AD` | 98, 166, 173 | 43, 4, 0, 32 |
| `advisory.edge` | Warm Edge | `#D59B6A` | 213, 155, 106 | 0, 27, 50, 16 |

Usage note: Advisory should not become louder to appear personal. Use offset layers, alternate framing, and selective refraction while keeping the palette controlled.

\* Generic CMYK values are unprofiled process starting recipes, not production masters. A printer, ICC profile, substrate, ink set, and approved proof can change them materially.

## 4. Contrast-safe screen pairings

Target: WCAG AA for normal text (`4.5:1`) and large text (`3:1`).

| Branch | Foreground | Background | Ratio | Allowed use |
|---|---|---|---:|---|
| Systems | Deep Frame | Cool Mist | 14.00 | Any text and UI structure |
| Systems | White | Raspberry Pulse | 5.29 | Normal and large text |
| Systems | Deep Frame | Muted Gold | 7.92 | Any text |
| Research | Night Plum | Archive Paper | 11.96 | Any text and editorial body copy |
| Research | White | Field Green | 5.11 | Normal and large text |
| Research | White | Refracted Violet | 5.01 | Normal and large text |
| Research | Night Plum | Discovery Gold | 7.01 | Any text |
| Advisory | Decision Ink | Soft Stone | 12.17 | Any text and document body copy |
| Advisory | White | Argument Rust | 5.15 | Normal and large text |
| Advisory | Decision Ink | Perspective Teal | 5.35 | Normal and large text |
| Advisory | Decision Ink | Warm Edge | 6.16 | Any text |

Signal-on-ground ratios are not universal text pairings: Systems 4.52, Research 4.08, Advisory 4.23. Use the approved foreground pair instead of assuming a branch signal can serve as body text on its ground.

Color must never carry state or relationship alone. Preserve meaning through labels, shape, position, icons, patterns, or other non-color cues.

## 5. Cross-medium reproduction

Preserve **hierarchy and mood**, not identical numeric swatches.

### Screen

- Master working space: sRGB.
- Use the HEX/RGB values above as primitive digital references.
- Wide-gamut Display-P3 variants may be added only with sRGB fallbacks.
- Recheck contrast after blending, transparency, or refraction effects.

### Commercial print

- Agree on the printer's ICC profile before conversion.
- Build separate coated and uncoated recipes; never reuse one CMYK formula blindly.
- A common profile may be proposed by the vendor, but Bawana does not lock one global profile across all printers and regions.
- Use a contract or physical proof for important color-critical runs.
- On colored or naturally warm paper, treat the substrate as part of the ground.
- Define rich black per printer. Small text and fine rules use 100% K unless the printer specifies otherwise.

### Apparel and physical goods

- Screen printing: match approved physical ink drawdowns; use spot inks where practical.
- DTG/DTF: use the vendor's garment/profile workflow and approve a fabric sample.
- Embroidery: select thread from a physical chart and test minimum detail.
- Garment color is part of the palette ground, not a neutral canvas to ignore.
- Durability, wash, opacity, and underbase tests override monitor appearance.

No Pantone, ink, or thread reference becomes authoritative until matched against a physical swatch under agreed lighting.

## 6. One-color and grayscale behavior

- Every branch must work with one dark ink on a light ground and one light ink on a dark ground.
- Refraction becomes overlap, crop, offset, line density, halftone, varnish, embossing, or material contrast.
- Do not represent refraction only through a second hue.
- Essential hierarchy must survive grayscale conversion.

## 7. Boundary with the semantic layer

Primitive tokens describe color identity. They do not describe interface meaning.

Example later mapping:

```text
Primitive: systems.signal = #B63D81
Semantic:  color.action.primary = systems.signal
Component: button.primary.background = color.action.primary
```

The semantic mapping may differ by branch and mode. Error, success, warning, information, selection, and focus tokens will be designed and contrast-tested separately.

## 8. Validation still required

- Verify screen values on representative displays.
- Test color-vision deficiency simulations.
- Build dark-mode or inverted-mode primitives when an application requires them.
- Produce coated and uncoated proofs before locking production CMYK.
- Produce fabric/ink/thread samples before locking apparel references.
- Test branch palettes together in master-brand contexts.
- Replace provisional functional branch names when brand architecture is finalized.
