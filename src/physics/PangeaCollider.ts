// sovereign-resonance-node/src/physics/PangeaCollider.ts

export class PangeaCollider {
    /**
     * Executes Thermodynamic Subduction when two distinct WebRTC meshes collide.
     * Conserves mass by stacking overlapping density upwards (simulating mountain creation).
     * 
     * @param localTensor The Material Tensor of the current Swarm
     * @param remoteTensor The Material Tensor of the incoming Swarm
     * @returns The resolved, collided tensor
     */
    public executeSubduction(localTensor: Map<string, number>, remoteTensor: Map<string, number>): Map<string, number> {
        console.log(`[PangeaCollider] Continental collision detected. Initiating Thermodynamic Subduction...`);
        
        const mergedTensor = new Map<string, number>();

        // 1. Copy local tensor baseline
        for (const [coord, density] of localTensor.entries()) {
            mergedTensor.set(coord, density);
        }

        // 2. Process the incoming remote tensor
        for (const [coord, remoteDensity] of remoteTensor.entries()) {
            if (mergedTensor.has(coord)) {
                // COLLISION DETECTED AT THIS VOXEL
                const localDensity = mergedTensor.get(coord)!;
                const totalDensity = localDensity + remoteDensity;
                
                // If voxel cannot hold both masses (max 1.0), we subduct the excess upwards
                if (totalDensity > 1.0) {
                    mergedTensor.set(coord, 1.0);
                    const excessMass = totalDensity - 1.0;
                    this.pushMassUpwards(mergedTensor, coord, excessMass);
                } else {
                    mergedTensor.set(coord, totalDensity);
                }
            } else {
                // No collision, just map the new terrain
                mergedTensor.set(coord, remoteDensity);
            }
        }

        console.log(`[PangeaCollider] Subduction complete. Meshes merged with absolute mass conservation.`);
        return mergedTensor;
    }

    private pushMassUpwards(tensor: Map<string, number>, originCoord: string, mass: number): void {
        // Parse coordinate string "x,y,z"
        const parts = originCoord.split(',');
        const x = parseInt(parts[0]);
        let y = parseInt(parts[1]);
        const z = parseInt(parts[2]);

        let remainingMass = mass;

        // Iteratively push mass upwards into the sky (y-axis)
        while (remainingMass > 0) {
            y += 1; // Move up one voxel
            const nextCoord = `${x},${y},${z}`;
            
            const currentDensity = tensor.get(nextCoord) || 0;
            const newDensity = currentDensity + remainingMass;

            if (newDensity > 1.0) {
                tensor.set(nextCoord, 1.0);
                remainingMass = newDensity - 1.0;
            } else {
                tensor.set(nextCoord, newDensity);
                remainingMass = 0;
            }
        }
    }
}
