// sovereign-resonance-node/test/PangeaCollider.spec.ts
import { expect } from 'chai';
import { PangeaCollider } from '../src/physics/PangeaCollider';

describe('Pangea Principle (Thermodynamic Subduction)', () => {
    it('should perfectly conserve mass by pushing excess density upwards when meshes collide', () => {
        const collider = new PangeaCollider();

        const localTensor = new Map<string, number>();
        localTensor.set('10,0,10', 0.8);

        const remoteTensor = new Map<string, number>();
        remoteTensor.set('10,0,10', 0.6); // 0.8 + 0.6 = 1.4

        const merged = collider.executeSubduction(localTensor, remoteTensor);

        // The base voxel maxes out at 1.0
        expect(merged.get('10,0,10')).to.equal(1.0);
        
        // The remaining 0.4 mass MUST be pushed exactly one voxel up (y=1)
        expect(merged.get('10,1,10')).to.be.closeTo(0.4, 0.0001);
    });
});
