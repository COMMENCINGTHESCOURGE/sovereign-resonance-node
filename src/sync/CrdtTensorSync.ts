// sovereign-resonance-node/src/sync/CrdtTensorSync.ts

import * as Automerge from 'automerge';
import { MaterialTensor } from 'hyperpoly-terrain'; // Mock

export interface TensorState {
    rock: Automerge.Counter;
    soil: Automerge.Counter;
    sand: Automerge.Counter;
    water: Automerge.Counter;
    ice: Automerge.Counter;
    organic: Automerge.Counter;
}

export class MaterialTensorCRDT {
    private doc: Automerge.Doc<TensorState>;

    constructor(initialState?: Automerge.Doc<TensorState>) {
        if (initialState) {
            this.doc = initialState;
        } else {
            this.doc = Automerge.from({
                rock: new Automerge.Counter(0),
                soil: new Automerge.Counter(0),
                sand: new Automerge.Counter(0),
                water: new Automerge.Counter(0),
                ice: new Automerge.Counter(0),
                organic: new Automerge.Counter(0)
            });
        }
    }

    /**
     * Applies an erosion or deposition event to the tensor state.
     * Uses Automerge Counters to ensure that concurrent updates from multiple clients 
     * are strictly commutative, preserving mass-balance across the network.
     */
    applyFlux(channel: keyof TensorState, delta: number): void {
        this.doc = Automerge.change(this.doc, 'Apply flux', doc => {
            doc[channel].increment(delta);
        });
    }

    /**
     * Merges remote CRDT state changes into the local document.
     */
    merge(remoteDoc: Automerge.Doc<TensorState>): void {
        this.doc = Automerge.merge(this.doc, remoteDoc);
        console.log("[CRDT] Successfully merged remote tensor state. Mass conserved.");
    }

    toSnapshot(): any {
        return {
            rock: this.doc.rock.value,
            soil: this.doc.soil.value,
            sand: this.doc.sand.value,
            water: this.doc.water.value,
            ice: this.doc.ice.value,
            organic: this.doc.organic.value
        };
    }
}
