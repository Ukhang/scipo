import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// Moon component
interface MoonProps {
  position: [number, number, number];
  size?: number;
  eclipseProgress: number;
}

export function Moon({ position, size = 6.8, eclipseProgress }: MoonProps) {
  const moonRef = useRef<THREE.Mesh>(null);
  const moonTexture = useTexture("/placeholder.svg?height=512&width=512");

  // Update moon position based on eclipse progress
  useFrame(() => {
    if (moonRef.current) {
      // Calculate position based on eclipse progress (0-1)
      const x = 100 - eclipseProgress * 200; // Move from right to left
      moonRef.current.position.set(x, 0, position[2]);
    }
  });

  return (
    <mesh ref={moonRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        map={moonTexture}
        color="#AAAAAA"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
