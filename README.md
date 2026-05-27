# sovereign-resonance-node

**Part of the MANIFOLD field computation system.**
**Copyright (c) 2026 Guinea Pig Trench LLC**

---

**Integration surface for the MANIFOLD architecture.**
WebGL planet avatar with live pipeline HUD, Firestore-backed pipeline status, and non-Euclidean visualization projections.

The sovereign resonance node is the **aesthetic layer** — it renders what the field computes. It reads pipeline status from Firestore and displays adversarial development progress in real time.

## Contents

| File | Purpose |
|------|---------|
| `index.html` | **Default landing page** — System operations dashboard with terrain strata visualization, resonance node network, and live console log |
| `planet_avatar.html` | Three.js WebGL globe with HUD panels — ARC solver metrics, system telemetry, pipeline timeline, event log |
| `firebase.json` | Firebase Hosting + Firestore deployment config |
| `firestore.rules` | Security rules (public read, admin write for pipeline data) |
| `firestore.indexes.json` | Firestore index config |
| `trenchOS_engine.py` | TrenchOS v2.5 core — Levenshtein cache + typing engine with history persistence |
| `SOVEREIGN_BATCH_SOLVER.py` | ARC-AGI batch solver — Gemma 4 via Ollama, program synthesis + exec verification |
| `batch_excavator_v4.py` | ARC task classifier — routes puzzles to TILING / RECOLORING / OBJECT_MOVE |
| `ARC_ONNX_GENERATOR.py` | ONNX model export for ARC task submission |
| `ARC_ONNX_GENERATOR_V3.py` | Scaled ONNX generator — 400 model artifacts |
| `HERO_SEQUENCE.fb.json` | Frame-by-frame flipbook — 5-panel statutory breach detection narrative |
| `task_00dbd492.json` | Sample ARC puzzle (004 page — object isolation) |
| `test_trenchOS_engine.py` | Pytest suite for engine history and case insensitivity |
| `FINAL_WRITEUP_SUBMISSION.md` | Gemma 4 Good hackathon writeup — track: Digital Equity & Inclusivity |
| `GEMMA_4_GOOD_WRITEUP.md` | Abridged hackathon narrative |

## Quick Start

```bash
# Clone and open the visualization
git clone https://github.com/COMMENCINGTHESCOURGE/sovereign-resonance-node.git
cd sovereign-resonance-node
# Open planet_avatar.html in a browser with WebGPU support
# Or deploy to Firebase:
#   firebase login
#   firebase deploy --only hosting
```

The planet avatar runs in two modes:
- **Demo mode** (default) — simulated ARC solver metrics with live drift, timeline progression, and random events
- **Live mode** — connects to Firestore (`pipeline_status/current`, `goal_status/*`, `events/*`) for real pipeline telemetry

To enable live mode, update the `FIREBASE_CONFIG` in `planet_avatar.html` with your Firebase project credentials.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SOVEREIGN RESONANCE NODE                  │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │ ARC      │   │ System   │   │ Pipeline │   │ Event    │ │
│  │ Solver   │   │ Telemetry│   │ Timeline │   │ Log      │ │
│  │ HUD      │   │ HUD      │   │ HUD      │   │ HUD      │ │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘ │
│       └──────────────┼──────────────┼──────────────┘       │
│                      ▼              ▼                       │
│              ┌────────────────────────────┐                 │
│              │     Three.js WebGL Globe    │                 │
│              │  (orbit nodes, connections, │                 │
│              │   particle field, rings)    │                 │
│              └────────────┬───────────────┘                 │
│                           │                                 │
│              ┌────────────▼───────────────┐                 │
│              │      Firestore / Demo       │                 │
│              │    (pipeline_status,        │                 │
│              │     goal_status, events)    │                 │
│              └────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## Entity

| Field | Value |
|-------|-------|
| Copyright | Guinea Pig Trench LLC |
| R&D Entity | Guinea Pig Trench LLC (PA, #13674084) |
| Credit Facility | Truth Holds Enterprise (PA, #7049023) |
