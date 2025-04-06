"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface WeatherEffectsProps {
  atmosphereDensity: number
  waterLevel: number
  temperature: number
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({ atmosphereDensity, waterLevel, temperature }) => {
  const rainRef = useRef<THREE.Points>(null)
  const showRain = atmosphereDensity > 0.5 && waterLevel > 0.3 && temperature > 0.3 && temperature < 0.8

  const { positions, velocities } = useMemo(() => {
    const count = 500 // Reduced from 1000 for performance
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const radius = 15
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      velocities[i] = 0.1 + Math.random() * 0.2
    }

    return { positions, velocities }
  }, [])

  useFrame((_, delta) => {
    if (!rainRef.current || !showRain) return

    const positions = rainRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3
      const length = Math.hypot(positions[i3], positions[i3 + 1], positions[i3 + 2])
      const norm = [positions[i3] / length, positions[i3 + 1] / length, positions[i3 + 2] / length]

      positions[i3] -= norm[0] * velocities[i] * delta * 10
      positions[i3 + 1] -= norm[1] * velocities[i] * delta * 10
      positions[i3 + 2] -= norm[2] * velocities[i] * delta * 10

      if (length < 10.5) {
        const radius = 15
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i3 + 2] = radius * Math.cos(phi)
      }
    }
    rainRef.current.geometry.attributes.position.needsUpdate = true
  })

  if (!showRain) return null

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#8CBED6" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}