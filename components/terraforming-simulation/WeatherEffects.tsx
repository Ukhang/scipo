import { useRef, useMemo } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

interface WeatherEffectsProps {
  atmosphereDensity: number
  waterLevel: number
  temperature: number
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ atmosphereDensity, waterLevel, temperature }) => {
  const rainRef = useRef<THREE.Points>(null)
  const showRain = atmosphereDensity > 0.5 && waterLevel > 0.3 && temperature > 0.3 && temperature < 0.8

  const { positions, velocities } = useMemo(() => {
    const count = 1000
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

  useFrame((state, delta) => {
    if (!rainRef.current || !showRain) return

    const positions = rainRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3
      const x = positions[i3]
      const y = positions[i3 + 1]
      const z = positions[i3 + 2]
      const length = Math.sqrt(x * x + y * y + z * z)
      const normalizedX = x / length
      const normalizedY = y / length
      const normalizedZ = z / length

      positions[i3] -= normalizedX * velocities[i] * delta * 10
      positions[i3 + 1] -= normalizedY * velocities[i] * delta * 10
      positions[i3 + 2] -= normalizedZ * velocities[i] * delta * 10

      if (
        Math.sqrt(
          positions[i3] * positions[i3] + positions[i3 + 1] * positions[i3 + 1] + positions[i3 + 2] * positions[i3 + 2],
        ) < 10.5
      ) {
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