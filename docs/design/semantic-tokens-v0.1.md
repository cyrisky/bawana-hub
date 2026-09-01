# Bawana Semantic Tokens v0.1 — bawana-hub

Status: provisional, implemented in `src/app/globals.css`. Light mode only.

Branch: Tools & Systems — "Quiet Current" (see
`bawana-color-foundation-v0.1.md` §3.1).

Per foundation §7, this semantic mapping is a separate layer from the
primitives and may change without touching primitive values.

## 1. Token map

| Semantic token | CSS var | Primitive | Value | Used for |
|---|---|---|---|---|
| `ground` | `--color-ground` | systems.ground (Cool Mist) | `#E9EEF0` | App background |
| `surface` | `--color-surface` | — (new, white) | `#FFFFFF` | Cards, sidebar, inputs |
| `ink` | `--color-ink` | systems.ink (Deep Frame) | `#172126` | Primary text |
| `ink-muted` | `--color-ink-muted` | — (tint of Deep Frame) | `#4D5A60` | Secondary text, labels |
| `edge` | `--color-edge` | — (alpha of Deep Frame) | `rgba(23,33,38,0.12)` | Borders, dividers, tinted fills |
| `signal` | `--color-signal` | systems.signal (Raspberry Pulse) | `#B63D81` | Primary actions, active nav, focus rings, links-on-hover |
| `refraction` | `--color-refraction` | systems.refraction (Muted Gold) | `#D0B24B` | "In progress" / highlight accents |
| `trace` | `--color-trace` | systems.trace (Soft Current) | `#B8D4D1` | Soft positive fills ("done" chips) |

## 2. Approved contrast pairings used (foundation §4)

| Foreground | Background | Ratio | Where used |
|---|---|---:|---|
| Deep Frame (`ink`) | Cool Mist (`ground`) | 14.00 | Body text on app background |
| White | Raspberry Pulse (`signal`) | 5.29 | Button primary fill |
| Deep Frame (`ink`) | Muted Gold (`refraction`) | 7.92 | "In progress" plan/status chips |

`trace` and `edge` fills are always paired with `ink` or `ink-muted` text,
consistent with the branch's calm, low-saturation companions; they were not
separately contrast-table entries in the foundation and should be verified
against WCAG AA before this moves past v0.1.

## 3. Component mapping highlights

- **Button** — primary: `signal` bg, white text, `hover:brightness-95`.
  Secondary: `surface` bg, `ink` text, `edge` border. Danger: no red — `edge`
  border, `ink-muted` text darkening to `ink` on hover; destructive intent is
  carried by label/icon, not color (foundation §4).
- **Inputs/selects** — `surface` bg, `edge` border, `ink` text, `signal`
  focus border/ring.
- **Sidebar** — `surface` bg, `edge` border. Active nav item: `signal` text
  on `signal/10` tinted background (not a filled block), keeping signal's
  footprint inside the foundation's 3–8% composition guidance.
- **Finance amounts** — income: `signal` + `+` prefix; expense: `ink` + `−`
  prefix; transfer: `ink-muted`. The +/− prefixes carry the state, not color
  alone.
- **Finance category chips** — income: `trace` bg + `ink` text; expense:
  `edge` bg + `ink-muted` text.
- **Stat tone** — positive: `signal`; negative: `ink` (bold); default:
  `ink`.
- **Plan status** — done: `trace` bg + `ink` text; in-progress: `refraction`
  bg + `ink` text; planned: `edge` bg + `ink-muted` text. Item dots mirror
  the same three colors.

## 4. Provisional decisions awaiting Cris's review

- **income-amounts-use-signal** — Raspberry Pulse marks money coming in.
  The foundation notes signal is "not automatically" tied to any one
  meaning; here it's used to make the rare decisive moment (income) stand
  out against otherwise calm ink-colored rows.
- **danger-without-red** — destructive actions (e.g. delete transaction)
  use `ink-muted` → `ink` on hover with an `edge` border instead of a red.
  Distinguished by label/icon only, per foundation §4 ("color must never
  carry state alone").
- **dark-mode-dropped** — all `dark:` variants and the `prefers-color-scheme`
  block were removed; the app ships light-mode only for this pass.
- **edge-as-alpha-ink** — `edge` is not a separate primitive; it's Deep
  Frame at 12% alpha (`rgba(23,33,38,0.12)`), and doubles as a tinted fill
  (e.g. "planned" status, expense category chips) as well as a border/divider
  color.
