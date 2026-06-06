// sovereign-resonance-node/src/sync/EpochManager.ts
import * as Automerge from 'automerge';
import { MaterialTensorCRDT } from './CrdtTensorSync';

export interface EpochState {
    epochId: number;
    genesisSnapshot: any; // Raw JSON representation of the MaterialTensor
}

export class EpochManager {
    public currentEpochId: number = 1;
    public activeCRDT: MaterialTensorCRDT;

    constructor() {
        this.activeCRDT = new MaterialTensorCRDT();
    }

    /**
     * Triggered when the CRDT history becomes too large (e.g., > 50MB).
     * Extracts the pure state, drops the history, and initializes a new Epoch.
     */
    public initiateEpochTransition(): EpochState {
        console.log(`[EpochManager] Triggering Epoch Transition from ${this.currentEpochId} to ${this.currentEpochId + 1}...`);
        
        // 1. Extract pure state (no history/tombstones)
        const pureState = this.activeCRDT.toSnapshot();

        // 2. Advance Epoch
        this.currentEpochId++;

        // 3. Drop old CRDT and initialize new one with pure state
        this.activeCRDT = new MaterialTensorCRDT();
        
        // In a real system, we'd inject pureState into activeCRDT safely.
        // For scaffolding, we just mark it.
        
        return {
            epochId: this.currentEpochId,
            genesisSnapshot: pureState
        };
    }

    /**
     * Handles an incoming Epoch Transition broadcast from another peer.
     */
    public handleEpochAdvance(newState: EpochState): void {
        if (newState.epochId > this.currentEpochId) {
            console.log(`[EpochManager] Peer broadcasted Epoch ${newState.epochId}. Synchronizing...`);
            this.currentEpochId = newState.epochId;
            this.activeCRDT = new MaterialTensorCRDT();
            // Reinitialize from newState.genesisSnapshot
        }
    }

    /**
     * If an offline peer attempts to sync an old Epoch, we reject it and force a hard reset.
     */
    public validatePeerEpoch(peerEpochId: number): boolean {
        if (peerEpochId < this.currentEpochId) {
            console.warn(`[EpochManager] Peer is on Epoch ${peerEpochId}, but we are on ${this.currentEpochId}. Forcing hard reset.`);
            return false;
        }
        return true;
    }
}
