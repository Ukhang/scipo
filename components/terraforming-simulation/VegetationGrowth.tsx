import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface VegetationGrowthProps {
  vegetation: number;
  waterLevel: number;
  temperature: number;
}

const VegetationGrowth: React.FC<VegetationGrowthProps> = ({
  vegetation,
  waterLevel,
  temperature,
}) => {
  const vegetationRef = useRef<THREE.InstancedMesh>(null);
  const forestsRef = useRef<THREE.InstancedMesh>(null);
  const count = 1000;
  const forestCount = 500;
  const showVegetation =
    vegetation > 0.3 &&
    waterLevel > 0.2 &&
    temperature > 0.3 &&
    temperature < 0.8;

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!vegetationRef.current || !showVegetation) return;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const polarExclusion = Math.abs(Math.cos(phi));
      if (polarExclusion > 0.8 && temperature < 0.5) continue;

      const heightVariation = (Math.random() - 0.5) * 0.1;
      const radius = 10.2 + waterLevel * 0.3 + heightVariation;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      dummy.position.set(x, y, z);
      dummy.lookAt(0, 0, 0);
      dummy.rotateX(Math.PI / 2);
      dummy.rotateZ(Math.random() * Math.PI * 2);
      const scale = 0.05 + vegetation * 0.2 * Math.random();
      dummy.scale.set(scale, scale * (0.5 + Math.random() * 1.5), scale);
      dummy.updateMatrix();
      vegetationRef.current.setMatrixAt(i, dummy.matrix);
    }

    vegetationRef.current.instanceMatrix.needsUpdate = true;

    if (forestsRef.current && vegetation > 0.6) {
      for (let i = 0; i < forestCount; i++) {
        const patchCenterTheta = ((i % 10) * Math.PI) / 5;
        const patchCenterPhi =
          ((Math.floor(i / 10) % 10) * Math.PI) / 10 + Math.PI / 4;
        const theta = patchCenterTheta + (Math.random() - 0.5) * 0.3;
        const phi = patchCenterPhi + (Math.random() - 0.5) * 0.3;
        const polarExclusion = Math.abs(Math.cos(phi));
        if (polarExclusion > 0.7 && temperature < 0.5) continue;

        const radius = 10.25 + waterLevel * 0.3;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        dummy.position.set(x, y, z);
        dummy.lookAt(0, 0, 0);
        dummy.rotateX(Math.PI / 2);
        dummy.rotateZ(Math.random() * Math.PI * 2);
        const scale = 0.1 + (vegetation - 0.6) * 0.4 * Math.random();
        dummy.scale.set(scale, scale * (1 + Math.random()), scale);
        dummy.updateMatrix();
        forestsRef.current.setMatrixAt(i, dummy.matrix);
      }

      forestsRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [vegetation, waterLevel, temperature, dummy, showVegetation]);

  if (!showVegetation) return null;

  return (
    <>
      <instancedMesh ref={vegetationRef} args={[null, null, count]}>
        <coneGeometry args={[1, 3, 5]} />
        <meshStandardMaterial
          color={new THREE.Color().setHSL(0.3, 0.8, 0.3 + vegetation * 0.2)}
          roughness={0.8}
        />
      </instancedMesh>
      {vegetation > 0.6 && (
        <instancedMesh ref={forestsRef} args={[null, null, forestCount]}>
          <cylinderGeometry args={[0.2, 0.5, 1, 6]} />
          <meshStandardMaterial
            color={new THREE.Color().setHSL(0.35, 0.7, 0.25)}
            roughness={0.9}
          />
        </instancedMesh>
      )}
    </>
  );
};
