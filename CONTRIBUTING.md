# Contributing to sovereign-resonance-node

> *"Observe the continuity."*

Welcome to the telemetry and observation layer of the MANIFOLD ecosystem. We use this node to audit the underlying physics of `hyperpoly-terrain` and the distributed Swarm infrastructure of `trench-builder` through high-fidelity visual feedback.

## 🧭 Philosophy First
- **No sterile UI**: All data visualization must feel diegetic or deeply integrated into the "pipeline HUD" aesthetic. Think orbital surveyor, not corporate dashboard.
- **Performance**: The HUD cannot bottleneck the simulation. Keep DOM updates lean or use Three.js CSS2D/CSS3D renderers.

## 🚦 Getting Started
1. `git clone https://github.com/COMMENCINGTHESCOURGE/sovereign-resonance-node.git`
2. `cd sovereign-resonance-node && npm install`
3. `npm run dev`

## 🎯 Good First Issues

- **[UI/HUD] Render Thermodynamic Subduction events:** Create a fleeting UI toast or visual flare when a CRDT merge conflict is resolved via mountain generation.
- **[Network] Add WebRTC latency alerts:** Track the ping to the signaling server and tint the HUD orange/red if latency spikes above 150ms.
- **[Graphics] Optimize planet avatar shaders:** Refactor the WebGL fragment shader to reduce overdraw on the atmospheric glow.

## 🔄 Pull Request Guidelines
1. Does this UI change fit the deep-tech / cyberpunk observer aesthetic?
2. Does the telemetry polling loop block the main thread? (Use Web Workers if crunching heavy mesh metrics).

We review PRs within 72 hours.
