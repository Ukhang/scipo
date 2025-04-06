import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface AtmosphericEffectsProps {
  atmosphereDensity: number;
  temperature: number;
  waterLevel: number;
}

const AtmosphericEffects: React.FC<AtmosphericEffectsProps> = ({
  atmosphereDensity,
  temperature,
  waterLevel,
}) => {
  const auroraRef = useRef<THREE.Mesh>(null);
  const lightningRef = useRef<THREE.PointLight>(null);
  const lightningTimeRef = useRef(0);
  const nextLightningRef = useRef(Math.random() * 5 + 5);

  const showAurora = atmosphereDensity > 0.5 && temperature < 0.5;
  const showLightning =
    atmosphereDensity > 0.6 && waterLevel > 0.4 && temperature > 0.4;

  useFrame((state, delta) => {
    if (auroraRef.current && showAurora) {
      auroraRef.current.rotation.y += delta * 0.05;
      const time = state.clock.getElapsedTime();
      auroraRef.current.material.opacity = 0.3 + Math.sin(time * 0.5) * 0.1;
    }

    if (lightningRef.current && showLightning) {
      lightningTimeRef.current += delta;

      if (lightningTimeRef.current > nextLightningRef.current) {
        lightningRef.current.intensity = 2 + Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = 11;
        lightningRef.current.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        );
        setTimeout(() => {
          if (lightningRef.current) lightningRef.current.intensity = 0;
        }, 100);
        lightningTimeRef.current = 0;
        nextLightningRef.current = Math.random() * 5 + 5;
      }
    }
  });

  return (
    <>
      {showAurora && (
        <mesh ref={auroraRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[15, 2, 16, 100]} />
          <meshBasicMaterial
            color={new THREE.Color().setHSL(0.5, 0.8, 0.5)}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {showLightning && (
        <pointLight
          ref={lightningRef}
          intensity={0}
          distance={20}
          decay={2}
          color="#FFFFFF"
        />
      )}
    </>
  );
};
