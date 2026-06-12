// sovereign-resonance-node/test/CrdtTensorSync.spec.ts
import { expect } from 'chai';
import * as Automerge from 'automerge';
import { MaterialTensorCRDT } from '../src/sync/CrdtTensorSync';

describe('MaterialTensorCRDT Mass Conservation', () => {
    it('should perfectly conserve mass when concurrent erosion fluxes are merged', () => {
        // Init Node A (Client 1)
        const nodeA = new MaterialTensorCRDT();
        
        // Node B (Client 2) forks state from Node A
        const nodeB = new MaterialTensorCRDT(Automerge.clone(nodeA['doc']));

        // Client 1 erodes 100 units of rock
        nodeA.applyFlux('rock', -100);
        nodeA.applyFlux('sand', 100);

        // Client 2 (concurrently, unaware of Client 1) erodes 50 units of rock
        nodeB.applyFlux('rock', -50);
        nodeB.applyFlux('sand', 50);

        // CRDT Sync Event!
        nodeA.merge(nodeB['doc']);

        const snapshot = nodeA.toSnapshot();

        // Mass Conservation check: -150 rock, +150 sand
        expect(snapshot.rock).to.equal(-150);
        expect(snapshot.sand).to.equal(150);
        expect(snapshot.rock + snapshot.sand).to.equal(0); // Net mass delta is exactly 0
    });

    it('should compact document history without losing the current counter values', () => {
        const node = new MaterialTensorCRDT();
        node.applyFlux('rock', -100);
        node.applyFlux('sand', 100);
        
        // Ensure state before compaction is correct
        expect(node.toSnapshot().rock).to.equal(-100);
        
        // Execute compaction
        node.compact();
        
        // Ensure values are fully preserved post-compaction
        const snapshot = node.toSnapshot();
        expect(snapshot.rock).to.equal(-100);
        expect(snapshot.sand).to.equal(100);
        expect(snapshot.rock + snapshot.sand).to.equal(0);
    });
});

