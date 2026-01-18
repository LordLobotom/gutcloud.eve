# Roadmap: Opportunity-Finding Algorithm

This roadmap focuses on improving the quality, reliability, and usefulness of the market
opportunity results (buy low in start system, sell high in nearby systems).

## Current behavior (baseline)
- Sample a subset of region types, scan a limited number of order pages.
- Use home-system lowest sell as buy price.
- Use best nearby buy (instant) or best nearby sell target (list) for spread.
- Filter by margin, budget, and security; return top results by profit.

## Phase 1: Data coverage and correctness
- Add per-system lowest-sell map to avoid cross-system price outliers.
- Exclude same-system routes and invalid orders (0 volume, price anomalies).
- Increase ESI page coverage with adaptive paging for hot items.
- Add explicit order age / issued time filtering (stale order protection).
- Validate margin math and include taxes/broker fees consistently per mode.

## Phase 2: Signal quality
- Add liquidity filters (min volume, min order count).
- Add price stability checks (spread vs median/mean to avoid spikes).
- Add route feasibility constraints (cargo size, mass, isk risk, jump count).
- Introduce confidence score using volume, depth, spread, and age.
- Distinguish "good for instant flip" vs "good for hauling" categories.

## Phase 3: Search and sampling strategy
- Replace fixed random sampling with weighted sampling:
  - Higher weight for high trade volume types.
  - Higher weight for items with strong recent spread history.
- Add multi-pass scanning: quick pass -> focused deep pass.
- Cache type and order snapshots with partial refresh to reduce API load.

## Phase 4: Regional and multi-hop logic
- Expand beyond start region when jumps cross region borders.
- Support multi-stop routes (buy in A, sell in B, resupply in C).
- Optional "route chain" optimizer for 2-3 hops with best net profit.

## Phase 5: Real-world constraints and UX
- Add hauling time estimates using known gate jumps + ship speed.
- Add risk model (sec status, kill stats, lowsec fraction).
- Add configurable strategy presets (safe, fast, max profit).
- Expose "why this route" explanation per result.

## Diagnostics and validation
- Add a debug mode to return near-miss opportunities (margin below threshold).
- Track recall rate: how often a suggested opportunity disappears within N minutes.
- Persist per-run metrics in history (types scanned, pages, errors, outcomes).
- Add A/B experiments for sampling and thresholds.
