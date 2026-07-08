/**
 * BRIDGE CLIENT — Zero-Dependency Vinculum Consumer
 * System Anchor: Ghost Braid / Pangea Principle
 * 
 * Fetches vinculum state from the bridge-synthesizer's file-based
 * event bus and exposes it as live-updating channel tensors.
 * 
 * Works in three modes:
 *   1. LOCAL FILE: Reads from /.bridge/topics/vinculum/*.json (dev server)
 *   2. INLINE SEED: Computes channels from a deterministic seed (offline/demo)
 *   3. FIREBASE:    Reads from Firestore vinculum collection (production)
 * 
 * Usage:
 *   import { BridgeClient } from './bridge-client.js';
 *   const bridge = new BridgeClient();
 *   bridge.onUpdate((channels, metrics, substrate) => {
 *     // channels = { density, cohesion, permeability, water, sediment, oxidation }
 *     // metrics  = { vinculum_ratio, bound_ratio, mass_drift, ... }
 *     // substrate = "terrain" | "integer" | "infrastructure"
 *   });
 *   bridge.start();
 * 
 * Guinea Pig Trench LLC — May 2026
 */

// ═══════════════════════════════════════════════════════
// WORLD TENSOR MAP — 6-channel substrate configs per world
// Each world in the portal is a substrate configuration.
// The same modular sieve that verified Erdős-Straus seeds
// game balance, shapes terrain, and curves EQ on every beat.
// ═══════════════════════════════════════════════════════

export const WORLD_TENSOR_MAP = {
  pink_hour:   { density: 0.9, cohesion: 0.7, permeability: 0.3, water: 0.1, sediment: 0.0, oxidation: 0.2 },
  the_block:   { density: 0.6, cohesion: 0.9, permeability: 0.8, water: 0.4, sediment: 0.2, oxidation: 0.1 },
  threshold:   { density: 0.4, cohesion: 0.5, permeability: 0.9, water: 0.7, sediment: 0.5, oxidation: 0.4 },
  vault_7:     { density: 0.8, cohesion: 0.3, permeability: 0.2, water: 0.2, sediment: 0.8, oxidation: 0.7 },
  the_between: { density: 0.5, cohesion: 0.5, permeability: 0.5, water: 0.5, sediment: 0.5, oxidation: 0.5 },
};

// ═══════════════════════════════════════════════════════
// DETERMINISTIC BIND — Pure JS port of vinculum.py bind()
// Same algebraic skeleton, same results. No Python needed.
// ═══════════════════════════════════════════════════════

/**
 * Client-side vinculum binding operator.
 * Mirrors vinculum.py:bind() exactly.
 */
export function vinculumBind(channels, substrate, seed) {
  const c = channels;
  const eps = 1e-6;
  const raw = (c.cohesion * c.permeability) / (c.density + c.oxidation + eps);

  let boundRatio = 0;
  let ratioLabel = 'undetermined';

  if (substrate === 'terrain') {
    boundRatio = raw * (1.0 - c.sediment);
    ratioLabel = 'wet_front/darcy';
  } else if (substrate === 'integer') {
    boundRatio = raw * ((seed % 24) / 24.0);
    ratioLabel = 'survivors/mod24';
  } else if (substrate === 'infrastructure') {
    boundRatio = raw * c.water;
    ratioLabel = 'saturation/exhaustion';
  }

  return {
    vinculum_ratio: ratioLabel,
    bound_ratio: boundRatio,
    mass_drift: 0.000005,
    partition_completeness: 1.0,
    knowledge_density: c.cohesion * c.density,
  };
}

// ═══════════════════════════════════════════════════════
// BRIDGE CLIENT
// ═══════════════════════════════════════════════════════

export class BridgeClient {
  constructor(opts = {}) {
    this.pollInterval = opts.pollInterval || 5000;
    this.bridgeBase   = opts.bridgeBase || '/.bridge/topics/vinculum';
    this.substrates   = opts.substrates || ['terrain', 'integer', 'infrastructure'];
    this.fallbackSeed = opts.seed || 113;
    this.mode         = opts.mode || 'seed'; // 'local' | 'seed' | 'firebase'
    this._callbacks   = [];
    this._timer       = null;
    this._state       = {};
    this._activeWorld = opts.world || 'the_between';
    this._firestoreUnsubscribe = null;
  }

  /** Register a callback: fn(channels, metrics, substrate) */
  onUpdate(fn) {
    this._callbacks.push(fn);
  }

  /** Get current state for a substrate */
  getState(substrate) {
    return this._state[substrate] || null;
  }

  /** Get all current states */
  getAllStates() {
    return { ...this._state };
  }

  /** Switch active world (updates terrain channels) */
  setWorld(worldId) {
    if (WORLD_TENSOR_MAP[worldId]) {
      this._activeWorld = worldId;
      this._seedUpdate('terrain', WORLD_TENSOR_MAP[worldId]);
    }
  }

  /** Start polling / seeding / Firebase subscription */
  async start() {
    if (this.mode === 'firebase') {
      const fbInitialized = await this._initFirebase();
      if (fbInitialized) {
        console.log('[BRIDGE] Mode: FIREBASE — Listening to Firestore pipeline_status/current');
        return;
      } else {
        console.warn('[BRIDGE] Firebase initialization failed. Falling back to local/seed...');
      }
    }

    // Try local bridge first, fall back to seed mode
    this._tryLocalBridge().then(available => {
      if (available) {
        this.mode = 'local';
        console.log('[BRIDGE] Mode: LOCAL FILE — reading from bridge-synthesizer');
        this._pollLoop();
      } else {
        this.mode = 'seed';
        console.log('[BRIDGE] Mode: SEED — deterministic channel generation');
        this._seedAll();
        this._timer = setInterval(() => this._seedAll(), this.pollInterval);
      }
    });
  }

  /** Stop active polling/listeners */
  stop() {
    if (this._timer) {
      clearTimeout(this._timer);
      clearInterval(this._timer);
    }
    this._timer = null;
    if (this._firestoreUnsubscribe) {
      this._firestoreUnsubscribe();
      this._firestoreUnsubscribe = null;
      console.log('[BRIDGE] Firestore listener unsubscribed.');
    }
  }

  /** Dynamically switch operational mode */
  async setMode(newMode) {
    if (this.mode === newMode) return;
    console.log(`[BRIDGE] Switching mode: ${this.mode.toUpperCase()} ➔ ${newMode.toUpperCase()}`);
    this.stop();
    this.mode = newMode;
    await this.start();
  }

  /** Dynamically import Firebase SDK and listen for real-time changes */
  async _initFirebase() {
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const { getFirestore, doc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      
      const config = {
        apiKey: "AIzaSyAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        authDomain: "project-1bd6ead8-e0a2-4ecd-96d.firebaseapp.com",
        projectId: "project-1bd6ead8-e0a2-4ecd-96d",
        storageBucket: "project-1bd6ead8-e0a2-4ecd-96d.firebasestorage.app",
        messagingSenderId: "446688573178",
        appId: "1:446688573178:web:0000000000000000"
      };

      const app = initializeApp(config);
      const db = getFirestore(app);
      const pipeRef = doc(db, 'pipeline_status', 'current');
      
      this._firestoreUnsubscribe = onSnapshot(pipeRef, (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          if (d.vinculum) {
            const v = d.vinculum;
            const sub = v.substrate;
            // Parse Firestore fields appropriately
            this._state[sub] = v;
            this._emit(v.channels, v.metrics, sub);
          }
        }
      }, (err) => {
        console.warn('[BRIDGE] Firestore listener failed:', err);
      });
      return true;
    } catch (e) {
      console.warn('[BRIDGE] Failed to initialize Firebase connection:', e);
      return false;
    }
  }

  // ── Internal ──

  async _tryLocalBridge() {
    try {
      const res = await fetch(`${this.bridgeBase}/integer.json`, { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async _pollLoop() {
    for (const sub of this.substrates) {
      try {
        const res = await fetch(`${this.bridgeBase}/${sub}.json`);
        if (!res.ok) continue;
        const data = await res.json();
        this._state[sub] = data;
        this._emit(data.channels, data.metrics, sub);
      } catch {
        // Bridge file not found for this substrate — skip
      }
    }
    this._timer = setTimeout(() => this._pollLoop(), this.pollInterval);
  }

  _seedAll() {
    // Terrain from active world
    this._seedUpdate('terrain', WORLD_TENSOR_MAP[this._activeWorld]);

    // Integer from erdos sieve seed
    const intChannels = {
      density: 0.361,    // 361 solutions / 1M range
      cohesion: 0.169,   // stable ratio from manifest
      permeability: 0.9, // 90% of range uncovered
      water: 0.133,      // breach ratio
      sediment: 0.698,   // neutral fraction
      oxidation: 0.1,    // nominal staleness
    };
    this._seedUpdate('integer', intChannels);

    // Infrastructure from system state
    const infChannels = {
      density: 0.5,
      cohesion: 0.85,
      permeability: 0.5,
      water: 0.4,
      sediment: 0.1,
      oxidation: 0.05,
    };
    this._seedUpdate('infrastructure', infChannels);
  }

  _seedUpdate(substrate, channels) {
    const metrics = vinculumBind(channels, substrate, this.fallbackSeed);
    this._state[substrate] = { channels, metrics, substrate };
    this._emit(channels, metrics, substrate);
  }

  _emit(channels, metrics, substrate) {
    for (const fn of this._callbacks) {
      try {
        fn(channels, metrics, substrate);
      } catch (e) {
        console.warn('[BRIDGE] Callback error:', e);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════
// EQ MAPPER — Maps vinculum ratio to 5-band EQ gains
// ═══════════════════════════════════════════════════════

/**
 * Convert a bound_ratio to 5-band EQ gains.
 * Ratio near 0 → warm/bass-heavy
 * Ratio near 1 → bright/treble-heavy
 * Ratio at 0.5 → flat
 */
export function ratioToEQ(boundRatio) {
  const r = Math.max(0, Math.min(1, boundRatio));
  return [
    (1.0 - r) * 0.8 + 0.2,   // 60Hz   (sub bass)
    (1.0 - r) * 0.6 + 0.4,   // 250Hz  (low mid)
    0.7 + r * 0.2,            // 1kHz   (mid — always present)
    r * 0.8 + 0.2,            // 4kHz   (presence)
    r * 0.6 + 0.3,            // 12kHz  (air)
  ];
}

// ═══════════════════════════════════════════════════════
// TERRAIN MODULATOR — Maps channels to procedural params
// ═══════════════════════════════════════════════════════

/**
 * Convert vinculum channels to terrain rendering parameters.
 * Used by Canvas2D strata renderer and Three.js globe shader.
 */
export function channelsToTerrainParams(channels) {
  return {
    numStrata:    Math.max(3, Math.round(channels.density * 10)),
    amplitude:    15 + channels.permeability * 40,
    frequency:    0.003 + channels.cohesion * 0.006,
    erosionRate:  channels.water * 0.05,
    sedimentDamp: channels.sediment * 0.8,
    oxidationHue: channels.oxidation * 30, // hue shift in degrees
  };
}

// ═══════════════════════════════════════════════════════
// GAME BALANCE SCALER — Stride-24 efficiency
// ═══════════════════════════════════════════════════════

/**
 * Scale game difficulty parameters using vinculum binding.
 * cohesion → structural integrity (higher = easier)
 * oxidation → chaos/entropy (higher = harder)
 */
export function scaleGameDifficulty(cohesion, oxidation, baseDifficulty = 1.0) {
  const stability = cohesion / (cohesion + oxidation + 1e-6);
  return {
    difficulty:    baseDifficulty * (1.0 + (1.0 - stability) * 0.5),
    spawnRate:     1.0 + oxidation * 2.0,
    rewardScale:   0.8 + stability * 0.4,
    decayRate:     0.01 + (1.0 - cohesion) * 0.05,
    chaosModifier: oxidation * 0.3,
  };
}
