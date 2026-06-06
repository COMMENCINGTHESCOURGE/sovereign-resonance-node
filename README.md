# sovereign-resonance-node

> The telemetry HUD and planetary avatar for the MANIFOLD ecosystem.

[![WebGL](https://img.shields.io/badge/WebGL-enabled-blue)](https://www.khronos.org/webgl/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Swarm-black.svg)](https://webrtc.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**sovereign-resonance-node** serves as the omniscient telemetry layer for the MANIFOLD continuity engine. While `hyperpoly-terrain` calculates the field physics and `trench-builder` streams the open world, this node projects the ecosystem's health, Swarm coordination, and planetary-scale topological shifts (like Thermodynamic Subduction) onto a high-fidelity WebGL interface.

---

## 🌍 The Observer Philosophy

A living simulation requires a living interface. Traditional diagnostic tools are sterile graphs. The `sovereign-resonance-node` acts as an orbital surveyor. It connects to the MANIFOLD signaling server, pulling real-time metadata from distributed Swarm meshes, and projects that data over a WebGL planetary avatar.

When two Swarm grids collide and merge in the physics layer, this node visualizes the tectonic shockwaves. 

---

## 🖼️ Visual Onboarding

*(Placeholders — replace with actual assets)*

| Visual | Purpose | Status |
|--------|---------|--------|
| ![Planet Avatar](./docs/assets/planet-avatar.gif) | Real-time WebGL rendering of the global mesh | 🟡 TODO |
| ![Telemetry HUD](./docs/assets/telemetry-hud.png) | Floating UI logging Swarm trust scores and worker counts | 🟡 TODO |
| ![Subduction Metrics](./docs/assets/subduction-metrics.svg) | Thermodynamic Subduction CRDT conflict graph | 🟡 TODO |

> 💡 **Contributor opportunity**: Help capture these! See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## 🚀 Quickstart

**Requirements**:
- WebGL 2.0 / WebGPU capable browser
- Node.js 18+

```bash
git clone https://github.com/COMMENCINGTHESCOURGE/sovereign-resonance-node.git
cd sovereign-resonance-node
npm install && npm run dev
```

Open `http://localhost:8080`.

### 🔧 Quick Controls
- `T` — Toggle telemetry overlay
- `M` — Show global mesh topology
- `Mouse drag` — Rotate orbital avatar

---

## 🧠 Core Concepts

### The Planetary Avatar
Instead of standard charts, simulation mass and trust variables are mapped to the visual properties (glow, displacement, chromatic aberration) of a central 3D planetary mesh.

### Thermodynamic Subduction
When isolated terrains (`hyperpoly-terrain` instances) discover each other via WebRTC, they merge. If bounding boxes overlap, the system triggers "Subduction"—crushing excess mass into the Z-axis to form mountains. This node visualizes and audits those CRDT collisions to ensure perfect mass conservation.

### Swarm Orchestration
Hooks into `SwarmOrchestrator.ts` to log parallel inference rates of the `VoidWalkerAI`.

---

## 🤝 Contribute

Are you a UI engineer who prefers cyberpunk telemetry over standard React dashboards? See [`CONTRIBUTING.md`](CONTRIBUTING.md).

**Good first issues**:
- [ ] Render Thermodynamic Subduction events in the HUD
- [ ] Connect WebRTC lag-compensation metrics to UI latency alerts
- [ ] Migrate planet rendering from WebGL to WebGPU to match the engine

---

## 📜 License & Ecosystem

MIT © 2026 DaShawn McLaughlin / Guinea Pig Trench LLC  
Part of the **MANIFOLD** ecosystem.
