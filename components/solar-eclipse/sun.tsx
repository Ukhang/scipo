import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export function Sun({ size = 25 }) {
    const sunRef = useRef<THREE.Mesh>(null)
    const coronaRef = useRef<THREE.Mesh>(null)
  
    // Rotate the sun slowly
    useFrame((state, delta) => {
      if (sunRef.current) {
        sunRef.current.rotation.y += delta * 0.05
      }
      if (coronaRef.current) {
        coronaRef.current.rotation.z += delta * 0.01
      }
    })
  
    return (
      <group>
        {/* Main sun sphere */}
        <mesh ref={sunRef}>
          <sphereGeometry args={[size, 64, 64]} />
          <meshBasicMaterial color="#FDB813" />
          <pointLight intensity={1.5} distance={1000} decay={2} />
        </mesh>
  
        {/* Corona effect */}
        <mesh ref={coronaRef} scale={1.2}>
          <sphereGeometry args={[size, 64, 64]} />
          <meshBasicMaterial color="#FDB813" transparent={true} opacity={0.2} side={THREE.BackSide} />
        </mesh>
  
        {/* Outer glow */}
        <mesh scale={1.5}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshBasicMaterial color="#FFF4E0" transparent={true} opacity={0.1} side={THREE.BackSide} />
        </mesh>
      </group>
    )
  }