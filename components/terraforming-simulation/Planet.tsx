import { useRef, useMemo } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"

interface PlanetProps {
  terraformingStage: number
  atmosphereDensity: number
  waterLevel: number
  temperature: number
  vegetation: number
  rotationSpeed?: number
}

const Planet: React.FC<PlanetProps> = ({
  terraformingStage,
  atmosphereDensity,
  waterLevel,
  temperature,
  vegetation,
  rotationSpeed = 0.2,
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const waterRef = useRef<THREE.Mesh>(null)
  const iceCapsRef = useRef<THREE.Mesh>(null)

  // Load textures
  const [baseTexture, normalMap, roughnessMap, cloudTexture, waterNormalMap] = useTexture([
    "/placeholder.svg?height=1024&width=2048",
    "/placeholder.svg?height=1024&width=2048",
    "/placeholder.svg?height=1024&width=2048",
    "/placeholder.svg?height=512&width=1024",
    "/placeholder.svg?height=512&width=1024",
  ])

  // Create dynamic colors based on terraforming parameters
  const colors = useMemo(() => {
    const baseColor = new THREE.Color().setHSL(
      0.05 + vegetation * 0.25,
      0.6 - vegetation * 0.2,
      0.3 + vegetation * 0.2,
    )

    const waterColor = new THREE.Color().setHSL(0.6, 0.7, 0.3 + waterLevel * 0.3)

    const atmosphereColor = new THREE.Color().setHSL(0.05 + atmosphereDensity * 0.55, 0.7, 0.5)

    const cloudOpacity = Math.min(atmosphereDensity * 0.8, 0.7)

    const iceColor = new THREE.Color(0xffffff)

    return { baseColor, waterColor, atmosphereColor, cloudOpacity, iceColor }
  }, [atmosphereDensity, waterLevel, vegetation])

  // Rotate the planet
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * (rotationSpeed * 1.2)
    }
    if (waterRef.current) {
      waterRef.current.rotation.y += delta * (rotationSpeed * 0.8)
    }
    if (iceCapsRef.current) {
      iceCapsRef.current.rotation.y += delta * rotationSpeed
    }
  })

  // Generate terrain with bumps and craters
  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(10, 128, 128)
    const positions = geometry.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]
      const vertex = new THREE.Vector3(x, y, z).normalize()

      const mountainNoise =
        Math.sin(vertex.x * 10) * Math.sin(vertex.z * 10) * 0.2 +
        Math.sin(vertex.x * 20 + 5) * Math.sin(vertex.z * 20 + 3) * 0.1

      const craterFactor = Math.max(0, 1 - terraformingStage * 2)
      let craterNoise = 0

      for (let c = 0; c < 8; c++) {
        const craterCenter = new THREE.Vector3(
          Math.sin(c * 1.1) * Math.cos(c * 0.7),
          Math.sin(c * 0.8) * Math.sin(c * 1.2),
          Math.cos(c * 0.9),
        ).normalize()

        const distToCrater = vertex.distanceTo(craterCenter)
        const craterSize = 0.2 + Math.random() * 0.3

        if (distToCrater < craterSize) {
          const depth = (craterSize - distToCrater) * 0.5
          craterNoise -= depth * craterFactor
        }
      }

      const roughnessFactor = Math.max(1 - terraformingStage * 0.7, 0.3)
      const noise = mountainNoise + craterNoise
      const scale = 10 * (1 + noise * roughnessFactor)
      positions[i] = vertex.x * scale
      positions[i + 1] = vertex.y * scale
      positions[i + 2] = vertex.z * scale
    }

    geometry.computeVertexNormals()
    return geometry
  }, [terraformingStage])

  // Generate ice caps geometry
  const iceCapsGeometry = useMemo(() => {
    const iceFactor = Math.max(0, 1 - temperature * 2)
    if (iceFactor <= 0) return null

    const geometry = new THREE.SphereGeometry(10.15, 128, 128)
    const positions = geometry.attributes.position.array as Float32Array
    const northPole = new THREE.Vector3(0, 1, 0)
    const southPole = new THREE.Vector3(0, -1, 0)
    const polarMask = new Float32Array(positions.length / 3)

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]
      const vertex = new THREE.Vector3(x, y, z).normalize()

      const distToNorth = vertex.distanceTo(northPole)
      const distToSouth = vertex.distanceTo(southPole)
      const minDist = Math.min(distToNorth, distToSouth)

      const iceThreshold = 0.7 - iceFactor * 0.5
      const iceValue = minDist < iceThreshold ? 1 - minDist / iceThreshold : 0
      const noiseEdge = Math.sin(vertex.x * 30) * Math.sin(vertex.z * 30) * 0.1
      const finalIceValue = Math.max(0, Math.min(1, iceValue + noiseEdge))

      polarMask[i / 3] = finalIceValue

      if (finalIceValue > 0) {
        const raiseFactor = 1 + finalIceValue * 0.05
        positions[i] = x * raiseFactor
        positions[i + 1] = y * raiseFactor
        positions[i + 2] = z * raiseFactor
      }
    }

    geometry.setAttribute("iceMask", new THREE.BufferAttribute(polarMask, 1))
    return geometry
  }, [temperature])

  // Custom shader for ice caps
  const iceShader = useMemo(() => ({
    uniforms: {
      iceCapsColor: { value: colors.iceColor },
      iceFactor: { value: Math.max(0, 1 - temperature * 2) },
    },
    vertexShader: `
      attribute float iceMask;
      varying float vIceMask;
      void main() {
        vIceMask = iceMask;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 iceCapsColor;
      uniform float iceFactor;
      varying float vIceMask;
      void main() {
        if (vIceMask < 0.01) discard;
        gl_FragColor = vec4(iceCapsColor, vIceMask * iceFactor);
      }
    `,
  }), [colors.iceColor, temperature])

  return (
    <group>
      <mesh ref={meshRef} geometry={terrainGeometry}>
        <meshStandardMaterial
          map={baseTexture}
          normalMap={normalMap}
          roughnessMap={roughnessMap}
          color={colors.baseColor}
          roughness={0.8 - vegetation * 0.3}
          metalness={0.1}
          normalScale={new THREE.Vector2(1, 1)}
        />
      </mesh>
      {waterLevel > 0 && (
        <mesh ref={waterRef}>
          <sphereGeometry args={[10.1 + waterLevel * 0.3, 64, 64]} />
          <meshPhysicalMaterial
            color={colors.waterColor}
            roughness={0.1}
            metalness={0.1}
            transmission={0.6}
            thickness={1.5}
            normalMap={waterNormalMap}
            normalScale={new THREE.Vector2(0.1, 0.1)}
            transparent
            opacity={Math.min(0.8, waterLevel * 1.2)}
          />
        </mesh>
      )}
      {iceCapsGeometry && (
        <mesh ref={iceCapsRef} geometry={iceCapsGeometry}>
          <shaderMaterial
            uniforms={iceShader.uniforms}
            vertexShader={iceShader.vertexShader}
            fragmentShader={iceShader.fragmentShader}
            transparent
            depthWrite={false}
          />
        </mesh>
      )}
      {atmosphereDensity > 0.2 && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[10.5 + atmosphereDensity * 0.5, 64, 64]} />
          <meshStandardMaterial
            map={cloudTexture}
            color="white"
            transparent
            opacity={colors.cloudOpacity}
            alphaTest={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {atmosphereDensity > 0 && (
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[11 + atmosphereDensity * 1.5, 64, 64]} />
          <meshBasicMaterial
            color={colors.atmosphereColor}
            transparent
            opacity={atmosphereDensity * 0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  )
}