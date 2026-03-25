# Vanguard Sell & Rebalance Tool — Autonomous Build v4

A self-initiated portfolio project by [Michael Casey](https://github.com/mcasey10), Principal Product Designer. This is the v4 autonomous build of a hypothetical Vanguard Sell & Rebalance Tool — built entirely by Claude Code from a structured handoff specification, with no manual code authoring.

**This project is not affiliated with Vanguard.** It is a portfolio piece demonstrating AI-assisted development, autonomous code generation, and the use of design artifacts as machine-readable specifications.

---

## What it is

A fully interactive proof-of-concept — a working application with real API-backed tax calculations, live scenario comparison, and an end-to-end workflow from account selection through order confirmation. It represents a vertical slice of the Vanguard personal investor portal, covering the full depth of the Sell & Rebalance workflow.

This version is one of two parallel implementations of the same specification:

| Version | Approach | Repo |
|---|---|---|
| v1 — Directed build | Human-directed, Claude.ai chat, step-by-step | [vanguard-rebalance-ui](https://github.com/mcasey10/vanguard-rebalance-ui) |
| v4 — Autonomous build | Claude Code + CLAUDE.md spec, minimal human direction | This repo |

The comparison between the two approaches is documented in the [AI-Assisted Development case study](https://etch-chief-15924551.figma.site/ai-project-dev).

**Workflow A — Automated mode**
Enter a target sell amount. The backend analyzes cost basis lots and recommends which funds to sell to raise that amount while minimizing capital gains tax and improving portfolio balance. Results appear in the Scenario Analysis screen where sell amounts can be adjusted and compared side by side.

**Workflow B — Manual mode**
Enter sell amounts per fund manually. The sticky footer updates in real time with estimated tax impact using a lot-level MinTax calculation. Switch to Scenario Analysis to run a full comparison.

---

## How it was built

This application was built autonomously by [Claude Code](https://www.anthropic.com/claude-code) from a single handoff document — `CLAUDE.md` — with no manual code authoring. The spec covers the design system, screen specifications, data model, tax lot data, algorithm logic, API contract, and known implementation pitfalls.

The build process is documented in the [case study](https://etch-chief-15924551.figma.site/ai-project-dev). Key findings:

- Claude Code produced the full application structure, routing, and core logic in a single pass
- Visual fidelity required iterative prompt corrections across approximately 18 Claude Code sessions
- The Figma design file was refactored to one screen per page to resolve Figma MCP token overflow failures that affected earlier autonomous build attempts (v2, v3)
- CLAUDE.md evolved from ~400 to ~734 lines across the project — each addition corresponding to a gap discovered in an earlier build

---

## Stack

- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS
- **API:** FastAPI backend — [`vanguard-rebalance-api-v4`](https://huggingface.co/spaces/mcasey10/vanguard-rebalance-api-v4)
- **AI tools:** Claude Code (build), Claude.ai (spec authoring + gap diagnosis), Figma MCP (design reference)
- **Design reference:** Vanguard design tokens sourced from live site analysis, hosted at [GitHub Pages](https://mcasey10.github.io/vanguard-ai-design-project/vanguard-design-system.html)

---

## Running locally

The frontend requires the FastAPI backend. The backend lives in the `/api` subdirectory of this repo as a separate git repository.

**1. Start the backend**
```bash
cd api
uvicorn main:app --reload --port 8003
```

**2. Start the frontend**
```bash
npm install
npm run dev
```

Open [http://localhost:3003/portfolio/balances](http://localhost:3003/portfolio/balances).

---

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL. Defaults to `http://localhost:8003` if not set. |

For deployment, set `NEXT_PUBLIC_API_URL` to the hosted backend URL (Hugging Face Spaces endpoint).

---

## Live deployment

| Service | URL |
|---|---|
| Frontend | [vanguard-rebalance-cc-v4.vercel.app](https://vanguard-rebalance-cc-v4.vercel.app/portfolio/balances) |
| Backend | [mcasey10-vanguard-rebalance-api-v4.hf.space](https://mcasey10-vanguard-rebalance-api-v4.hf.space) |

> **Note:** The backend runs on Hugging Face Spaces free tier and has a 30–60 second cold start after inactivity. Visit the backend URL directly before demoing to pre-warm it.

---

## Related

- **v1 directed build:** [vanguard-rebalance-ui](https://github.com/mcasey10/vanguard-rebalance-ui) — same spec, human-directed Claude.ai build
- **Backend (v1):** [vanguard-rebalance-api](https://github.com/mcasey10/vanguard-rebalance-api) — FastAPI, Python, lot-level tax calculation engine
- **Design artifacts:** [vanguard-ai-design-project](https://github.com/mcasey10/vanguard-ai-design-project) — Figma prototypes, wireframes, design tokens
- **Case study:** [AI-Assisted Development](https://etch-chief-15924551.figma.site/ai-project-dev) — full documentation of both build approaches
