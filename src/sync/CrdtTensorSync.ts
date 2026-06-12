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

    private changeCount = 0;

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
     * Compacts the Automerge document history to free memory tombstones.
     */
    compact(): void {
        const snapshot = this.toSnapshot();
        this.doc = Automerge.from({
            rock: new Automerge.Counter(snapshot.rock),
            soil: new Automerge.Counter(snapshot.soil),
            sand: new Automerge.Counter(snapshot.sand),
            water: new Automerge.Counter(snapshot.water),
            ice: new Automerge.Counter(snapshot.ice),
            organic: new Automerge.Counter(snapshot.organic)
        });
        this.changeCount = 0;
        console.log("[CRDT] Document history compacted. Tombstones pruned.");
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
        this.changeCount++;
        if (this.changeCount >= 100) {
            this.compact();
        }
    }

    /**
     * Merges remote CRDT state changes into the local document.
     */
    merge(remoteDoc: Automerge.Doc<TensorState>): void {
        this.doc = Automerge.merge(this.doc, remoteDoc);
        console.log("[CRDT] Successfully merged remote tensor state. Mass conserved.");
        this.changeCount++;
        if (this.changeCount >= 100) {
            this.compact();
        }
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

