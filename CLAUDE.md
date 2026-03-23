> **Version 5 — authoritative spec, clean rewrite**
> Ports: 3003 (frontend) and 8003 (backend)
> Use this file as CLAUDE.md in a fresh repo or for targeted fixes to an existing build.

# Vanguard Sell & Rebalance Tool — Developer Handoff

This is a self-initiated portfolio project by Michael Casey (Principal Product Designer).
It is a hypothetical tool — not affiliated with Vanguard Financial Services.

The tool addresses a real gap in Vanguard's product: when investors need to sell mutual
fund holdings, Vanguard provides no guidance on which funds or lots to sell to minimise
tax impact. This tool fills that gap with a tax-aware sell and rebalance workflow.

---

## Design Artifacts — Read These First

Before writing any code, fetch and read all of these. They are the authoritative
specification for this project. Claude Code must read them, not just acknowledge them.

### Figma files (use Figma MCP tool)
- **Wireframes (refactored, one screen per page):**
  `https://www.figma.com/design/UA2yNiAlfMaG8y3Os1egAg/`
  File key: `UA2yNiAlfMaG8y3Os1egAg`

- **Components page** (global nav, hero banner, account rows, section nav):
  node-id: `26-2` — read this before building any navigation or layout components

- **Design System file:**
  `https://www.figma.com/design/73FYMDHMtNt9ED2QWVi6Om/`
  File key: `73FYMDHMtNt9ED2QWVi6Om` — read this before building any components

### Screen frames (fetch each by node-id for full fidelity)
| Screen | Page name | node-id |
|---|---|---|
| S0 — Portfolio / Balances | S0 - Portfolio / Balances | 2001-6423 |
| S1 — Fund List Auto | S1 - Transact / Sell & Rebalance / Fund List (Auto) | 2001-10663 |
| S2 — Fund List Manual Table | S2 - Transact / Sell & Rebalance / Fund List (Manual-Table) | 2001-14754 |
| S3 — Fund List Manual Cards | S3 - Transact / Sell & Rebalance / Fund List (Manual-Cards) | 2001-18950 |
| S4 — Scenario Analysis WF-A | S4 - Transact / Sell & Rebalance / Scenario Analysis Workflow-A | 2001-22935 |
| S5 — Scenario Analysis WF-B | S5 - Transact / Sell & Rebalance / Scenario Analysis Workflow-B | 2001-26920 |
| S6 — Scenario Analysis Comparison | S6 - Transact / Sell & Rebalance / Scenario Analysis Comparison | 2001-30911 |
| S7 — Modal Warning (Table overlay) | S7 - Transact / Sell & Rebalance / Modal warning | 2001-34935 |
| S7 — Modal Warning (Cards overlay) | S7 - Transact / Sell & Rebalance / Modal warning | 2001-34622 |
| S8 — Order Confirmation WF-A | S8 - Transact / Sell & Rebalance / Order Confirmation Workflow-A | 2001-38879 |
| S9 — Order Confirmation WF-B | S9 - Transact / Sell & Rebalance / Order Confirmation Workflow-B | 2001-43131 |

**User Flows (FigJam):**
`https://www.figma.com/design/iYeoPfUDAiMGfMUx0gfEmG/User-Flows?node-id=0-1`

### Published artifacts (web_fetch each URL)
- Data model: `https://mcasey10.github.io/vanguard-ai-design-project/withdrawal-tool-data-model.html`
- User flows: `https://mcasey10.github.io/vanguard-ai-design-project/sell-rebalance-flow-diagram.html`
- Design system reference: `https://mcasey10.github.io/vanguard-ai-design-project/vanguard-design-system.html`
- Prototype wiring map: `https://mcasey10.github.io/vanguard-ai-design-project/prototype-wiring-map.html`
- Scenario interactions: `https://github.com/mcasey10/vanguard-ai-design-project/blob/main/scenario-analysis-interactions.md`

---

## Design System — Vanguard Standards

These values are confirmed from Vanguard portal DevTools inspection. They are
authoritative — do not substitute or approximate.

### Hero Banner
The hero banner uses an inline SVG combined with a linear gradient as background-image.
The SVG creates the characteristic curved swoosh dividing dark and bright red.

```css
.hero-banner {
  background-color: #660026;
  background-image:
    url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2560' height='1440' fill-rule='evenodd'%3E%3Cpath fill='%23c20029' d='M0 0h2560v1440H0z'/%3E%3Cpath d='M0 1440V0h975.0068c41.879 6.147 78.247 21.823 109.055 47.018 30.766 25.195 59.764 64.246 86.84 117.051L1858.593 1440H0z' fill='%23660026'/%3E%3C/svg%3E"),
    linear-gradient(60deg, rgb(102,0,38) 50%, rgb(194,0,41) 50%);
  background-repeat: no-repeat;
  background-size: cover;
  height: 132px;
  color: white;
  font-family: "Inter", Arial, sans-serif;
}
```

Do NOT use clip-path, flat fills, or CSS gradient approximations for the hero banner.
Use the exact SVG data URI above.

### Hero Banner Content — STATIC, does not change between screens

The hero banner content is IDENTICAL on every screen. It does NOT change as the
user navigates. Do NOT update the title, sub-line, or right-side content based
on the current route.

**Left side (all screens):**
- `Welcome back, Michael` (regular weight, white, ~18px)
- `$580,745.29` (large, bold, white, ~32px) — portfolio total value, always shown
- No sub-line. No screen name. No breadcrumb.

**Right side (all screens):**
- `Value as of: March 13, 2026, 4:15 p.m. ET` (underlined link style, rgba(255,255,255,0.85))
- `Last login: March 13, 2026, 4:38 p.m. ET` (plain white, second line below)

Do NOT show a breadcrumb trail anywhere on the page — it is not part of the design.
Do NOT change the title or portfolio value based on the current route.
Do NOT show the Total Portfolio Value heading and amount again on the Balances screen
content area — it already appears in the hero banner.

### Global Navigation

**Top-level nav (matches actual Vanguard portal exactly):**
`Advice services | Dashboard | Portfolio ▾ | Transact ▾ | Products & services ▾ | Resources & education ▾`

- Active tab on all `/portfolio/*` routes: **Portfolio** (bold, 2px `#C8102E` underline)
- Two-row layout: top row = icon strip (Search, Support, Messages, Documents, Profile, Log off)
- Bottom row: Vanguard V logo + "Personal investors" + main nav tabs
- Icons: 18px, monochrome black, label below at 11px — do NOT colorise icons
- Active tab: bold, 2px red bottom border `#C8102E`, `margin-bottom: -2px`
- Hover: text turns `#1255CC`
- Font: Inter

**Secondary nav (Portfolio section tabs):**
`Dashboard | Balances | Holdings | Sell & Rebalance | Activity | Performance | Portfolio Watch`

- Active on `/portfolio/balances`: **Balances**
- Active on all `/portfolio/sell-rebalance/*` routes: **Sell & Rebalance**

**Mode tabs (Fund List / Scenario Analysis only):**
`Auto | Manual | Scenarios`
- These appear below the secondary nav, above page content
- Active state: bold text, 2px `#C8102E` underline

### Design Tokens
```css
--hero-dark:   #660026;
--hero-red:    #C20029;
--brand-red:   #C8102E;   /* active tab underline, negative values */
--interactive: #1255CC;   /* links, input focus border */
--text:        #040505;
--text-mid:    #555555;
--text-muted:  #767676;
--positive:    #007A00;
--negative:    #C8102E;
--warning:     #E07000;
--bg:          #F2F2F2;
--paper:       #FFFFFF;
--border:      #E0E0E0;
--border-dark: #767676;
```

**Primary CTA:** `background: #040505`, `border-radius: 100px` pill. Never red.
**Typography:** Inter throughout.
**Content width:** max-width ~1280px, centred. Do NOT use full-width layout.

### Input Fields
- Dollar amount inputs: fixed `$` prefix element positioned outside the input,
  with sufficient `padding-left` on the input to clear the prefix. Never overlap.
- Use `type="text"` with numeric validation — do NOT use `type="number"` (shows spinner).
- Placeholder: `e.g. $10,000` for withdrawal amount field
- Focus state: `2px solid var(--interactive)` border
- Display-only amounts (Auto mode recommended sell): formatted text (`$6,000`),
  not input fields — no border, no background, no input chrome

### Gain/Loss Colour Coding — REQUIRED, apply to every instance
This rule must be applied to every gain/loss and tax value in the entire application.
There are no exceptions. If a value is not coloured correctly it is a bug.

- Positive values (+$X): `color: #007A00` (green)
- Negative values (−$X): `color: #C8102E` (red)
- Zero ($0) or dash (—): `color: inherit` (neutral, no colour)

Apply to ALL of: ST G/L, LT G/L, Est. Tax, Losses Harvested, any gain/loss field
in Fund List Auto, Fund List Manual, Scenario Analysis, Confirmation Tax Summary.

Implementation note: create a single `formatCurrency(value)` utility that returns
both the formatted string and the correct CSS colour class. Use it everywhere.

### Currency Formatting
All currency values must be formatted to exactly 2 decimal places.
Use `toLocaleString('en-US', { style: 'currency', currency: 'USD' })` or equivalent.
Never display raw floating point (e.g. `$149.169999...` is wrong — must be `$149.17`).

### Annotation Icons
- Remove all orange/amber circled "A" annotation badges (wireframe artefacts)
- Add ⓘ icons (`color: var(--interactive)`, 14px) only where listed:
  - Next to "LT G/L" column header in Scenario Analysis (tooltip on hover)
  - Next to "Automated" mode label
- Do not add ⓘ icons speculatively

---

## Navigation Rules

### Balances screen — account table
Column order: **ACCOUNT | ACCOUNT NUMBER | ACTION | BALANCE**

- ACCOUNT: account name as blue hyperlink (`color: var(--interactive)`), non-navigating
- ACCOUNT NUMBER: masked (e.g. `72981482*`)
- ACTION:
  - Brokerage Account: active "Sell from this account" outline pill button
    (`border: 1px solid var(--interactive)`, `color: var(--interactive)`)
  - Cash Plus Account: em dash `—`, no button
  - All IRA and 529 accounts: disabled grey button (`opacity: 0.4`, not clickable)
- BALANCE: right-aligned dollar amount

Pulse animation: "Sell from this account" on Brokerage Account row pulses on first
load (CSS keyframe, 3 cycles then stop). "Sell & Rebalance" secondary tab also pulses.

### Fund List — mode tabs
Auto and Manual are two modes of the same screen, not separate pages.
The mode tab strip (`Auto | Manual | Scenarios`) appears below the secondary nav.
Switching mode preserves entered amounts — pass via URL params.

### Navigation — active tab state

**Secondary nav tab underline must persist on all sub-routes:**
The "Sell & Rebalance" secondary nav tab must show its active 2px red underline
on ALL of these routes:
- `/portfolio/sell-rebalance`
- `/portfolio/sell-rebalance/manual`
- `/portfolio/sell-rebalance/scenarios`
- `/portfolio/sell-rebalance/confirmation`

Use `pathname.startsWith('/portfolio/sell-rebalance')` to determine active state —
do NOT use exact path matching, which causes the underline to disappear on sub-routes.

### Amount persistence across navigation

The sell amount is entered once and never lost until an order is executed.
Store it in a single shared React context (`SellContext`) that persists across all routes.
URL params are a secondary mechanism for deep links — the context is the primary store.

**Auto mode total amount:**
- User types `$10,000`. Stored in SellContext and persists across all navigation.
- When switching Auto → Manual: SellContext must carry the full recommendation
  object (per-fund amounts) into Manual mode. Manual mode reads from SellContext
  on mount and pre-populates each fund's sell input with the recommended amount.
  VTSAX → $6,000, VBTLX → $4,000, all others → $0.
  This is the ONLY correct default for Manual mode when arriving from Auto.
  Do NOT use any hardcoded default amounts in Manual mode.
  Do NOT initialise Manual mode inputs to $0 when a recommendation exists in context.
- When switching Manual → Auto: sum all fund amounts, store as total in SellContext.

**Implementation note — Manual mode state initialisation:**
Manual mode component state must be seeded from SellContext at initialisation,
not via useEffect after mount (which causes a flash of $0 values):
```typescript
const { recommendation } = useSellContext();
const [amounts, setAmounts] = useState({
  VTSAX: recommendation?.funds?.VTSAX?.sellAmount ?? 0,
  VBTLX: recommendation?.funds?.VBTLX?.sellAmount ?? 0,
  VFIAX: recommendation?.funds?.VFIAX?.sellAmount ?? 0,
  VIGAX: recommendation?.funds?.VIGAX?.sellAmount ?? 0,
  VXUS:  recommendation?.funds?.VXUS?.sellAmount  ?? 0,
});
```
Check the actual shape of the recommendation object in context and adjust the
property path accordingly — but the pattern must be useState initialiser,
not useEffect setter.

**Manual mode individual amounts:**
- Stored in SellContext as a per-fund map keyed by symbol, values from recommendation
- If no recommendation exists, all amounts default to $0
- Persist when navigating to Scenarios and back
- Pass as URL params for deep links using actual current amounts

**Lot expansion — always available, never gated:**
Available before and after entering amounts. See Fund List spec above.

**Only reset amounts after order execution:**
After Confirmation screen loads following "Execute", clear SellContext so the
next transaction starts fresh. Do NOT reset on any other navigation event.

### CTA labels (consistent across both modes)
- Primary action after recommendation/amounts entered: **"Execute this recommendation"**
- Secondary: **"Adjust Manually"** (Auto) / **"Compare in Scenarios"** (Manual) — wait, see below
- Scenario Analysis entry link: **"Scenario Analysis"** (NOT "Compare Scenarios" or
  "Compare in Scenarios" — the starting state is always a single scenario, not a comparison)
- "← Switch to Auto mode" / "← Switch to Manual mode" text links for mode switching

### Scenario Analysis — footer
- Remove the "← Back to Auto Mode" link from the bottom-right footer entirely.
  Users navigate back via the Auto/Manual/Scenarios tab strip above.
  This link incorrectly assumes the user always arrived from Auto mode.

---

## Screen Specifications

### Balances Screen

Promotional onboarding banner (dismissable, below secondary nav, above accounts):
- Headline: "Optimize your next withdrawal with Sell & Rebalance"
- Body: "Our tool analyzes your holdings to minimize taxes while keeping your portfolio balanced."
- CTA: "Review sell & rebalance options →" → navigates to Fund List Auto
- Dismiss × button top-right

Content below banner:
1. Total Portfolio Value: `$580,745.29` / `As of March 13, 2026, 4:15 p.m. ET`
2. "Your Accounts" table (columns as specified in Navigation Rules above)
3. No Holdings section — that belongs on a separate `/portfolio/holdings` route

### Fund List — Auto Mode

**Entry state (no recommendation yet):**
- Withdrawal amount field empty, placeholder `e.g. $10,000`
- Button: "Get Recommendation"
- "Switch to Manual mode →" text link below field
- "Scenario Analysis" link hidden until recommendation is obtained
- Stats bar, fund table: hidden

**Post-recommendation state:**
- Button changes to "Recalculate"
- "Switch to Manual mode →" and "Scenario Analysis" links appear
- Dark stats bar appears above fund table
- Fund table appears with Table/Cards toggle (top-right of table area)
- Wait & Save banner appears if applicable
- Bottom CTAs: "Execute this recommendation" (primary pill) · "Adjust Manually"
  (outline pill) · "Scenario Analysis" (text link)

**Table columns:** Fund | Method | Current Value | Recommended Sell |
ST Gain/Loss | LT Gain/Loss | Est. Tax | Rebalancing | Rationale

**Cards view:** Same data as table but displayed as cards. Recommended sell amount
shown as read-only formatted text (not an input field). Table/Cards toggle must work
in Auto mode — it is not exclusive to Manual mode.

### Fund List — Manual Mode

**Entry state:**
- All sell amount inputs default to $0
- If arriving from Auto mode with recommendation, pre-populate amounts from recommendation
- Stats bar shows immediately (call /scenario on load with initial amounts)
- Table/Cards toggle available

**Table columns:** Fund | Method | Current Value | ST Gain/Loss | LT Gain/Loss | Sell ($) | ≈ Shares

**Bottom CTAs:** "Execute this recommendation" (primary) · "Scenario Analysis" (outline)
· "← Switch to Auto mode" (text link)

### Fund List — Both Modes

**Fund display order — fixed, do not sort or reorder:**
1. VTSAX — Vanguard Total Stock Market Index Fund
2. VFIAX — Vanguard 500 Index Fund
3. VBTLX — Vanguard Total Bond Market Index Fund
4. VIGAX — Vanguard Growth Index Fund
5. VXUS — Vanguard Total International Stock Index Fund

This order is intentional and tells a narrative: VTSAX (sell — LT gain) →
VFIAX (skip — highlighted because of ST lots) → VBTLX (sell — harvests loss).
Do NOT alphabetise or reorder by any other criteria.

**VFIAX row — special treatment (Auto mode):**
When the recommendation sells $0 from VFIAX, the VFIAX row must be visually
distinguished to explain why it was skipped:
- Row background: light amber/yellow tint (`background: #FFFBF0`, `border-left: 3px solid var(--warning)`)
- Fund name badge: amber "WAIT & SAVE $228" pill badge next to "VFIAX" label
- Below the fund name: small muted text "2 lots convert to long-term on April 4 and May 1, 2026
  — waiting could save ~$228 in taxes"
- Recommended Sell: $0 displayed as `$0 (consider waiting)` in muted text
This treatment makes the Wait & Save logic visible at the fund level without requiring
the user to open the modal.

**Stats bar (dark, above fund table):**
Sale Amount · ST Capital Gains · LT Capital Gains · Losses Harvested · Est. Total Tax · Eff. Tax Rate

**Lot expansion — always available, never gated:**
- Lots are expandable on every fund row at all times — before and after entering amounts
- Do NOT require a sell amount to be entered before lots can be expanded
- **Lot rows must span the full width of the parent table** — use the same grid/table
  layout as the parent, not a nested sub-table or fixed-width container.
- **All lots must render on first mount** — lots come from `lib/data.ts` directly,
  never gated behind async state or sell amount state.
- **Auto mode must show all lots**, not just the recommended/selected lot.
- Funds with more than 4 lots: scrollable section (max-height 160px, overflow-y auto, width 100%)
- Acquisition date must NOT wrap — use `white-space: nowrap` on the date cell,
  or format as `2019-06-01` in a fixed-width element to prevent column compression.

Lot row column alignment:

  **Manual mode** (columns: FUND | METHOD | CURRENT VALUE | ST GAIN/LOSS | LT GAIN/LOSS | SELL ($) | ≈ SHARES):
  - FUND column: ST/LT term label + acquisition date (nowrap)
  - METHOD column: empty
  - CURRENT VALUE column: cost/share (e.g. "$101.31")
  - ST GAIN/LOSS column: G/L value if ST lot, "—" if LT lot
  - LT GAIN/LOSS column: G/L value if LT lot, "—" if ST lot
  - SELL ($) column: empty
  - ≈ SHARES column: lot share count (e.g. "100 sh")

  **Auto mode** (columns: FUND | METHOD | CURRENT VALUE | RECOMMENDED SELL | ST GAIN/LOSS | LT GAIN/LOSS | EST. TAX | REBALANCING | RATIONALE):
  - FUND column: ST/LT term label + acquisition date (nowrap)
  - METHOD column: lot share count (e.g. "100 sh")
  - CURRENT VALUE column: cost/share (e.g. "$48.20")
  - ST GAIN/LOSS column: G/L value if ST lot, "—" if LT lot
  - LT GAIN/LOSS column: G/L value if LT lot, "—" if ST lot
  - All other columns: empty

- ST lots: amber "ST" pill label · LT lots: green "LT" pill label

**Lot G/L column displays G/L only on the shares being sold from that lot:**
- When sell amount > $0 for a fund, show the G/L attributable to the shares
  selected from each lot under the algorithm (MinTax or FIFO)
- When sell amount = $0, show "—" for all lots of that fund
- This means lot G/L values sum to the fund summary row G/L — they must be additive
- Do NOT show total unrealised G/L for all shares in the lot
- Example: VTSAX sells 7.64 shares from the 2019-06-01 lot at $101.31 cost,
  current NAV $785.34 → G/L = 7.64 × ($785.34 − $101.31) = +$5,226 shown on that lot row.
  All other VTSAX lot rows show "—" because no shares are sold from them.

**Wait & Save banner:**
- Appears below stats bar when recommendation is displayed
- Text: "Wait & Save Opportunity: VFIAX lots convert to long-term soon.
  Waiting could save you up to **$228** in taxes." [View Details →]
- Only appears when the recommendation sells $0 from VFIAX (always true with current data)

### Scenario Analysis

**Layout — single scenario (no scrolling required):**
Fund rows use a compact horizontal table layout within the scenario column:

| FUND | SELL AMOUNT | ST G/L | LT G/L ⓘ | EST. TAX |
|---|---|---|---|---|
| VTSAX / Total Stock Market | `$ [input]` | +$0 | +$5,226 | $784 |

- One row per fund, horizontally laid out — do NOT stack fund data vertically
- Compact row height: 40px per fund row, 8px gap between rows
- Tax Summary: ALWAYS fully visible — do NOT collapse it. Show all rows:
  ST Capital Gains · LT Capital Gains · Losses Harvested · Net Taxable Gain ·
  Federal Tax · State Tax · Est. Total Tax (bold) · Effective Rate
- Asset Mix Impact: displayed as a compact table with inline bar charts (see below)
- With these layout choices, 1–2 scenario view must fit within viewport without scrolling
- 3-scenario view may require scrolling — acceptable

**Asset Mix Impact — 3 stacked bars + pivoted table:**

Use Vanguard's actual asset class terminology: **Stocks**, **Bonds**, **Short term reserves**.
- Stocks = VTSAX + VFIAX + VIGAX combined
- Bonds = VBTLX
- Short term reserves = Cash/Other (held outside brokerage, not in fund list)

**Three stacked horizontal bars** (one per row), each bar divided into coloured segments
by asset class, scaled to 100% total width:
- Stocks segment: teal/green (`#00857D`)
- Bonds segment: amber/gold (`#C8960C`)
- Short term reserves segment: dark grey (`#555555`)

**Bar styling by row:**
- **Current** bar: solid filled segments using the colours above
- **Target** bar: diagonal stripe pattern overlaid on the same colours —
  use a repeating CSS linear-gradient at 45° to create evenly-spaced white diagonal
  lines over the coloured background. Each segment retains its colour but appears
  hatched/striped to visually distinguish Target from Current:
  ```css
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    rgba(255,255,255,0.5) 4px,
    rgba(255,255,255,0.5) 6px
  );
  ```
  Apply this as a background-image on top of the segment background-color.
- **After Sale** bar: solid filled segments, same colours as Current —
  this bar shows the projected state after the scenario is executed

Each bar is labelled on the left (Current / Target / After Sale).
A legend above the bars shows: ● Stocks  ● Bonds  ● Short term reserves

**Pivoted summary table** — aligned directly below the bars, columns match asset classes:

| | STOCKS | BONDS | SHORT TERM RESERVES |
|---|---|---|---|
| Current | 54.5% | 20.3% | 25.2% |
| Target | 65.0% | 30.0% | 5.0% |
| After Sale | 54.4% | 20.0% | 25.6% |
| Diff (After vs Target) | −10.6% | −10.0% | +20.6% |

- Diff row: positive in red (`#C8102E`), negative in green (`#007A00`), zero neutral
- Column widths match the proportional segment widths in the bars above them,
  so the table values visually align with their corresponding bar segments
- Table is always visible — not collapsible
- Section header: "Asset Mix Impact" with ⓘ tooltip: "Shows how this sale affects
  your portfolio allocation across asset classes"

**Responsive stacking:**
When viewport is too narrow for side-by-side scenario columns, stack fund data
vertically within each column (Fund → Sell Amount → G/L → Tax on separate lines).
Single-scenario view always uses horizontal row layout.

**Scenario header — compact layout:**
Each scenario column header contains:
- Row 1: `SCENARIO A` label (small caps, muted, 11px) + kebab menu ⋮ (right-aligned)
- Row 2: Scenario name (bold, editable inline, 16px)
- Row 3: Sub-text + Reset link on the SAME LINE:
  `Pre-filled from Recommendation · Reset to Recommendation`
  Sub-text in muted colour, "Reset to Recommendation" as a blue link immediately after,
  separated by ` · `. Do NOT put Reset on its own row.
  Hide "Reset to Recommendation" when source=manual or when unmodified.

No extra padding between the mode tab strip and the scenario header area — use 8px gap maximum.

All scenario header blocks must be equal height (`align-items: stretch`) so fund rows align horizontally across columns when multiple scenarios are shown.

**ⓘ tooltip on LT G/L column header:**
Custom dark CSS tooltip (NOT native `title` attribute) on hover:
"Estimated gain or loss based on selected tax lots. Long-term gains taxed at 0%,
15%, or 20% depending on income bracket."

**Scenario B / C entry state:**
All fund amounts start at $0. Tax recalculates live as user types.

**Footer:** Dark pinned bar at viewport bottom.
- Single scenario: "Execute Scenario A" button
- Two scenarios: "Execute Scenario A" · "Execute Scenario B" · savings callout between
- Three scenarios: "Execute Scenario A" · "Execute Scenario B" · "Execute Scenario C"
- No "Back to Auto Mode" link

**Arriving from Manual mode:**
- Pass amounts via URL: `?source=manual&VTSAX=6000&VBTLX=4000&VFIAX=0&VIGAX=0&VXUS=0`
- Sub-heading: "Based on your manual entries"
- Do NOT call `/recommend` — use passed amounts directly
- "Reset to Recommendation" link hidden

### Wait & Save Modal

Triggered by clicking Wait & Save banner or "View Details" link.

**Explanation text (above table):**
"Two VFIAX lots are close to converting from short-term to long-term status.
Short-term gains are taxed at your ordinary income rate (22% federal + 3.07% state).
Long-term gains are taxed at a lower rate (15% federal + 3.07% state). Waiting a
short time before selling VFIAX could reduce your tax bill by $228. Note: the current
recommendation does not sell VFIAX — this opportunity applies if you add VFIAX to
your sale manually."

**Table columns:** Fund | Lot Date | Converts LT | Days | Tax Now | Tax If Wait | Savings

| VFIAX | 2025-04-04 | 2026-04-04 | 14 | $619 | $493 | $173 |
| VFIAX | 2025-05-01 | 2026-05-01 | 41 | $197 | $157 | $55  |
| **Total Potential Savings** | | | | | | **$228** |

- Converts LT date: amber/orange when ≤ 30 days away, green when > 30 days
- Total savings row: bold green
- Actions: "Remind me in 40 days" (outline pill) ·
  "Adjust sale to avoid these lots" (filled dark pill) ·
  "Proceed with today's recommendation" (text link)
- Backdrop click dismisses modal

### Order Confirmation

Must fit within a single 1440×900 viewport without scrolling.

**Section order (compact spacing, 12–16px between sections):**
1. Green success banner: `background: #E8F5E9`, `border: 1px solid #007A00`
   "Order Submitted Successfully" · "Your sell order has been placed and is being processed."
2. Orders Placed table + Tax Summary card (side by side, ~160px tall)
3. Portfolio Rebalancing Impact tiles (~100px)
4. What Happens Next — horizontal 4-step stepper (~80px):
   ① Order Submitted → ② Execution at NAV → ③ Settlement → ④ Tax Lot Update
   Each step: numbered green circle + bold title + 1-line description
5. Action buttons: "← Return to Portfolio" (primary) · "Download Confirmation PDF" ·
   "View Order Status" · "Start another transaction" (text link)

**WF-A Tax Summary header:** "Tax Summary — Optimized"
**WF-B Tax Summary header:** "Tax Summary — Manual Entry" (grey, no AI badge)
- WF-B callout: "Automated optimisation would have reduced your tax to $532
  (5.32% effective rate) — saving you $149.17. Consider using the engine next time."
  (Note: $681 − $532 = $149 rounded to 2 decimal places)

---

## Data Model

### Tax Rate Constants (hardcode — do not derive from brackets)
```python
FEDERAL_LT_RATE = 0.15      # Long-term capital gains
FEDERAL_ST_RATE = 0.22      # Short-term / ordinary income
STATE_RATE = 0.0307         # Pennsylvania flat rate
```
These must be constants in BOTH `api/main.py` AND `lib/data.ts`.
State tax = 3.07%, NOT 5%. Using 5% produces $170 state tax — wrong.
Correct state tax on $3,406 net taxable = ~$105.

### Data Integrity — treat as hardcoded fixture, do not invent values

All values in this Data Model section are the single source of truth.
Do NOT generate, approximate, or recalculate sample data from scratch.
If the API returns values that differ from the canonical recommendation,
the algorithm is wrong — fix the algorithm, not the display values.

VBTLX must show a loss on every screen without exception.
Lot expansion rows must always be available — do NOT gate them behind amount entry.
The VTSAX ST lot (2 shares) must always appear in lot expansion.

### Fund Holdings (taxable brokerage account)

| Symbol | NAV | Shares | Value | Asset Class | Target % | Current % |
|---|---|---|---|---|---|---|
| VTSAX | $785.34 | 255 | $200,212 | US Equity | 32% | 34.4% |
| VFIAX | $519.37 | 168 | $87,254 | US Equity | 15% | 15.0% |
| VIGAX | $188.42 | 156 | $29,394 | US Equity | 5% | 5.1% |
| VBTLX | $92.85 | 1,271 | $117,963 | US Bond | 20% | 20.3% |
| VXUS | $63.48 | 292 | $18,536 | Intl Equity | 3% | 3.2% |

**Asset class targets — must sum to 100%:**
| Asset Class | Target % | Current % | Funds included |
|---|---|---|---|
| Stocks | 65% | 54.5% | VTSAX + VFIAX + VIGAX |
| Bonds | 30% | 20.3% | VBTLX |
| Short term reserves | 5% | 25.2% | Cash accounts (not in brokerage fund list) |

Note: "Short term reserves" is Vanguard's terminology for cash and money market holdings.
The 25.2% current allocation reflects the cash accounts shown on the Balances screen
(Cash Plus, IRAs, 529) relative to total portfolio value.
Use these consolidated buckets for all asset mix calculations and display.

### Tax Lots (complete — all lots required in lib/data.ts)

Lot data must sum correctly: total shares × NAV = fund Current Value.
All lots for a fund are always expandable regardless of sell amount entered.
If a fund has more than 4 lots, show the expanded lot section with a vertical
scrollbar (max-height ~160px, overflow-y: auto) — do not truncate or paginate.

**VTSAX — 5 lots (255 shares total = $200,212 at $785.34 NAV):**

| Acq. Date | Term | Shares | Cost/Share | Mkt Value | Unrealised G/L |
|---|---|---|---|---|---|
| 2014-06-15 | LT | 100 | $48.20 | $78,534 | +$73,714 |
| 2016-11-30 | LT | 80 | $62.45 | $62,827 | +$57,831 |
| 2018-03-22 | LT | 50 | $84.10 | $39,267 | +$35,062 |
| 2019-06-01 | LT | 23 | $101.31 | $18,063 | +$15,731 |
| 2025-06-01 | ST | 2 | $764.34 | $1,571 | +$42 |

MinTax sells from the 2019-06-01 lot first (lowest gain per share among LT lots).
7.640 shares × ($785.34 − $101.31) = **+$5,226 LT gain** for $6,000 sold. ✓
The ST lot (2 shares) is visible but not selected.

**VBTLX — 2 lots (1,271 shares total = $117,963 at $92.85 NAV):**

| Acq. Date | Term | Shares | Cost/Share | Mkt Value | Unrealised G/L |
|---|---|---|---|---|---|
| 2022-03-15 | LT | 1,000 | $135.10 | $92,850 | −$42,250 |
| 2023-08-20 | LT | 271 | $108.50 | $25,152 | −$4,228 |

FIFO sells from 2022-03-15 lot first.
43.080 shares × ($92.85 − $135.10) = **−$1,820 LT loss** for $4,000 sold. ✓

**VFIAX — 2 lots (168 shares total = $87,254 at $519.37 NAV):**

| Acq. Date | Term | Shares | Cost/Share | Mkt Value | Unrealised G/L |
|---|---|---|---|---|---|
| 2025-04-04 | ST | 84 | $490.00 | $43,627 | +$2,467 |
| 2025-05-01 | ST | 84 | $510.00 | $43,627 | +$787 |

Both lots convert to LT soon — drives Wait & Save opportunity.
Recommendation sells $0 from VFIAX.

**VIGAX — 1 lot (156 shares total = $29,394 at $188.42 NAV):**

| Acq. Date | Term | Shares | Cost/Share | Mkt Value | Unrealised G/L |
|---|---|---|---|---|---|
| 2020-09-01 | LT | 156 | $130.00 | $29,394 | +$9,114 |

**VXUS — 1 lot (292 shares total = $18,536 at $63.48 NAV):**

| Acq. Date | Term | Shares | Cost/Share | Mkt Value | Unrealised G/L |
|---|---|---|---|---|---|
| 2021-11-15 | LT | 292 | $55.20 | $18,536 | +$2,418 |

### Reference Date
Use **March 21, 2026** as today's date for all day-count calculations.
- VFIAX Lot 1 → 14 days to LT conversion
- VFIAX Lot 2 → 41 days to LT conversion

### Canonical Recommendation ($10,000 withdrawal)
These exact values must be produced by the API and displayed in the UI.

| Fund | Sell | Method | ST G/L | LT G/L | Est. Tax |
|---|---|---|---|---|---|
| VTSAX | $6,000 | MinTax | +$0 | +$5,226 | $784 |
| VBTLX | $4,000 | FIFO | +$0 | −$1,820 | −$273 |
| VFIAX | $0 | — | — | — | — |
| VIGAX | $0 | — | — | — | — |
| VXUS | $0 | — | — | — | — |

**Stats bar summary (must match exactly):**
- Sale Amount: $10,000
- ST Capital Gains: +$0
- LT Capital Gains: +$3,406
- Losses Harvested: **−$1,684** (NOT $0 — this is the net after offset)
- Est. Total Tax: **$532**
- Eff. Tax Rate: **5.32%**

MinTax selects VTSAX LT lot (253 shares) for selling — not the ST lot (2 shares).
The ST lot is visible in lot expansion but $0 is sold from it.

### Investor Context
- User: Michael · Portfolio: $580,745.29
- Value as of: March 13, 2026, 4:15 p.m. ET
- Last login: March 13, 2026, 4:38 p.m. ET

---

## API Specification

Use **Pydantic v2** throughout — `model_config = ConfigDict(extra="ignore")`.
Use Python 3.10+ built-in generics (`dict[str, float]` not `Dict[str, float]`).

### POST /recommend
Input: `{ "account_id": str, "withdrawal_amount": float }`
Output: SellRecommendation with per-fund breakdown, lot selection, gain/loss by term,
estimated tax, rebalancing rationale, wait_and_save field.

**Algorithm — Phase 1 (fund allocation):**
REBALANCE over-allocated funds → HARVEST loss lots → FILL from LT gain funds →
LAST RESORT ST gain funds. Cap any single fund at 60% of withdrawal. Ignore funds
within 0.5% of target.

**Algorithm — Phase 2 (lot selection per fund):**
ST loss → LT loss → LT gain → ST gain.

### POST /scenario
Input: `{ "account_id": str, "fund_amounts": { "VTSAX": float, ... } }`
All 5 funds must always be sent, including zeros.
Output: ScenarioTaxImpact with total sale, gains/losses by term, losses harvested,
net taxable gain, federal/state tax, effective rate, per-fund breakdown,
portfolio_drift_after.

### POST /explain
Input: `{ "recommendation_id": str }`
Output: AI-generated plain-English explanation of the recommendation.

### GET /
Health check — returns `{ "status": "ok", "date": "YYYY-MM-DD" }`

---

## How to Run

### API warmup
On Balances page mount, fire a silent GET to the root endpoint with 30-second timeout,
swallowed with `.catch(() => {})`. No state update, no error display.
Use `process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8003'` as base URL.

### Backend (FastAPI)
```bash
cd api
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8003
```

### Frontend (Next.js)
```bash
npm run dev   # Runs on http://localhost:3003
```
Configure `next.config.js` to use port 3003. (Use `.js` not `.ts` — older Next.js versions
do not support `next.config.ts`.)

### Environment
Create `.env.local` in project root:
```
NEXT_PUBLIC_API_URL=http://localhost:8003
```

### CORS
Backend must allow `http://localhost:3003`. Use `CORSMiddleware` in `api/main.py`.

### Startup order
1. `cd api && python -m uvicorn main:app --reload --port 8003`
2. Create `.env.local`
3. `npm run dev` (project root)
4. Open `http://localhost:3003/portfolio/balances`

---

## Deployment Reference

### Frontend → Vercel
1. Import `vanguard-rebalance-cc-v4` from GitHub at vercel.com
2. Framework: Next.js (auto-detected)
3. Add env var: `NEXT_PUBLIC_API_URL` = `https://mcasey10-vanguard-rebalance-api-v4.hf.space`
4. Deploy

### Backend → Hugging Face Spaces

`api/Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
```

HF Space setup: Name `vanguard-rebalance-api-v4` · SDK: Docker · Hardware: CPU Basic ·
Add Secret: `ANTHROPIC_API_KEY`.

### After deployment
Update CORS in `api/main.py` to include Vercel URL:
```python
allow_origins=["http://localhost:3003", "https://vanguard-rebalance-cc-v4.vercel.app"]
```

### Production URLs
- Frontend: `https://vanguard-rebalance-cc-v4.vercel.app`
- Backend: `https://mcasey10-vanguard-rebalance-api-v4.hf.space`

---

## Scope Notes

Functional prototype — real computation, real API calls, no persistence or auth.
Out of scope: authentication, data persistence, wash sale enforcement, RMD, tax advice.
