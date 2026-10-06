# KisanSetu AI

**An AI-Powered Farm-to-Profit Decision & Support Platform**

> From "What should I grow?" to "Where, when, and how should I sell?" — one intelligent system connecting the entire agricultural value chain to maximize farmer profit and prevent post-harvest loss.

---

## The Problem

Farmers today navigate 10+ disconnected tools and information silos to make decisions that are actually all connected:

- What crop suits my soil and budget?
- How much irrigation do I need today?
- When should I harvest, and what yield can I expect?
- Should I sell today or hold in cold storage?
- Which mandi actually gives me the best *net* return?
- Which government subsidies am I eligible for?

Because these decisions are made in isolation, farmers face poor decision timing, 25-30% post-harvest spoilage, avoidable logistics waste, and lost revenue.

## Our Solution

KisanSetu AI replaces these fragmented tools with **one central AI decision engine** that reasons over all variables holistically and answers a single question for every farmer:

> **"What is the single best, risk-adjusted action for my farm right now to maximize net profit?"**

It converts static agricultural data into a clear "Next Best Action" tailored to each farmer's profile — not just the theoretical highest revenue, but the risk-adjusted, cost-adjusted, logistics-adjusted profit.

## How It Works

The system is built around three layers:

1. **Farmer Digital Profile** — stores verified farmer ID, soil parameters, land size, location, water access, and capital budget.
2. **LangGraph Orchestrator** — routes each query through specialized AI agents (Crop, Risk, Yield, Post-Harvest, Mandi, Scheme).
3. **Profit Optimization Engine** — combines ML predictive models with deterministic rule engines for eligibility checks and profit-maximization math.

**Deterministic reliability pipeline:** ML models predict yields and price trends → rule engines compute exact transport/storage math and scheme eligibility → an LLM synthesizes a natural, multilingual explanation for the farmer, without hallucinating numbers.

## MVP Scope (SIH Submission)

For the hackathon prototype, we are building 6 core modules:

| # | Module | What it does |
|---|--------|---------------|
| 1 | **AI Crop Planner** | Recommends the crop with the best risk-adjusted return for the farmer's land, soil, and budget (not just highest theoretical revenue). |
| 2 | **Yield & Profit Predictor** | Pre-harvest estimate of total output, confidence interval, and expected revenue. |
| 3 | **Post-Harvest Risk Engine (ColdGuard)** | Decides sell-now vs. cold-storage by weighing storage fees and spoilage risk against expected price appreciation. |
| 4 | **Mandi & Logistics Optimizer** | Ranks mandis by **Net Realized Return** (price minus transport, fees, and perishability loss) instead of raw listed price. |
| 5 | **Sell/Hold Advisor & Profit Simulator** | Simulates "sell today" vs. "store N days" scenarios and recommends the higher-net-profit option. |
| 6 | **SchemeMatch AI** | Matches the farmer against a verified government scheme database (e.g. PM-KUSUM, PMFBY) with zero-hallucination eligibility matching. |

### Post-MVP / Full Vision (roadmap, not in scope for tomorrow)

- Actionable Irrigation Advisory (weather → operational instructions)
- Equipment Sharing (hyperlocal farmer-to-farmer rental marketplace)
- Full Voice-First AI via telephony for feature phones
- Vision/Camera OCR for soil cards, receipts, and diseased-leaf detection

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React, Tailwind CSS, Web Speech API |
| Backend & Agents | Python, FastAPI, PostgreSQL, LangGraph (multi-agent orchestration) |
| ML & Forecasting | XGBoost / Prophet (yield & mandi price forecasting), anomaly detection for storage spoilage |

## Repository Structure

```
SIH-KisanSetu/
├── frontend/          # React app — one folder per module/route
│   ├── src/
│   │   ├── components/   # Shared UI (Card, Table, Badge, Button, theme)
│   │   ├── modules/
│   │   │   ├── crop-planner/
│   │   │   ├── yield-predictor/
│   │   │   ├── coldguard/
│   │   │   ├── mandi-optimizer/
│   │   │   ├── sell-hold-advisor/
│   │   │   └── schemematch/
│   │   └── dashboard/    # Nav, layout, farmer profile/onboarding
├── backend/           # FastAPI app + mock/real endpoints per module
└── docs/              # API contracts, architecture notes
```

## Branching & Contribution Workflow

We keep this lightweight since we're moving fast — the goal is to avoid collisions, not add process.

- **`main`** is always demo-able. No direct commits — only merges via PR (or fast merge, given the timeline).
- Each module gets its own branch, owned by one person:
  - `feature/dashboard-shell`
  - `feature/crop-planner`
  - `feature/yield-predictor`
  - `feature/coldguard-postharvest`
  - `feature/mandi-optimizer`
  - `feature/schemematch`
  - `backend/api`
- Merge into `main` frequently (every 30-45 min) rather than all at once at the end — this keeps conflicts small and `main` always in a working state.
- **API contract first:** before splitting up, backend and frontend agree on the exact JSON shape each module expects/returns. Backend serves that shape from mock/stub endpoints; frontend builds against it. This makes swapping mock data for real endpoints later a one-line change.
- Shared UI components and Tailwind theme live in `frontend/src/components` — build these first so all modules look like one product, not five.

## Getting Started

*(Setup instructions to be filled in once the initial scaffolding is pushed.)*

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
*"Converting agricultural information into the next best action."*
