// sovereign-resonance-node/test/EpochManager.spec.ts
import { expect } from 'chai';
import { EpochManager } from '../src/sync/EpochManager';

describe('Epoch Transition Protocol', () => {
    it('should successfully transition to a new epoch and drop history', () => {
        const manager = new EpochManager();
        expect(manager.currentEpochId).to.equal(1);

        // Simulate massive history accumulation...
        manager.activeCRDT.applyFlux('rock', -1000);

        // Trigger transition
        const newState = manager.initiateEpochTransition();

        expect(newState.epochId).to.equal(2);
        expect(manager.currentEpochId).to.equal(2);
        
        // The genesis snapshot must contain the accumulated state, 
        // but the internal CRDT history array will be empty.
        expect(newState.genesisSnapshot.rock).to.equal(-1000);
    });

    it('should reject synchronization from offline peers stuck on an old Epoch', () => {
        const manager = new EpochManager();
        manager.initiateEpochTransition(); // Advances to Epoch 2

        const offlinePeerEpoch = 1;
        const isValid = manager.validatePeerEpoch(offlinePeerEpoch);

        expect(isValid).to.be.false;
    });
});
