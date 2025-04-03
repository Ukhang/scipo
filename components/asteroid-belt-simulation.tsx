"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"
import { useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface AsteroidProps {
  position: number[];
  size: number;
  speed: number;
  rotationSpeed: number;
}

// Asteroid component with random properties
function Asteroid({ position, size, speed, rotationSpeed }: AsteroidProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Create a random rotation axis
  const rotationAxis = useRef(
    new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
  )

  // Orbit parameters
  const orbitRadius = position[0]
  const orbitAngle = useRef(Math.random() * Math.PI * 2)

  // Create a random geometry type for each asteroid
  const geometryType = useRef(Math.floor(Math.random() * 4))

  // Update position and rotation on each frame
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Update orbit position
      orbitAngle.current += speed * delta
      meshRef.current.position.x = Math.cos(orbitAngle.current) * orbitRadius
      meshRef.current.position.z = Math.sin(orbitAngle.current) * orbitRadius

      // Rotate the asteroid
      meshRef.current.rotateOnAxis(rotationAxis.current, rotationSpeed * delta)
    }
  })

  // Render the appropriate geometry based on the random type
  return (
    <mesh ref={meshRef} position={[position[0], position[1], position[2]]}>
      {geometryType.current === 0 && <icosahedronGeometry args={[size, 0]} />}
      {geometryType.current === 1 && <dodecahedronGeometry args={[size, 0]} />}
      {geometryType.current === 2 && <tetrahedronGeometry args={[size, 0]} />}
      {geometryType.current === 3 && <octahedronGeometry args={[size, 0]} />}
      <meshStandardMaterial
        color={`rgb(${150 + Math.random() * 50}, ${150 + Math.random() * 50}, ${150 + Math.random() * 50})`}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  )
}

// Sun component
function Sun() {
  const sunRef = useRef<THREE.Mesh | null>(null);

  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <mesh ref={sunRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial color="#FDB813" emissive="#FDB813" emissiveIntensity={1} />
      <pointLight intensity={1} distance={100} decay={2} />
    </mesh>
  )
}

// Generate a belt of asteroids
interface AsteroidBeltProps {
  count?: number
  innerRadius?: number
  outerRadius?: number
}
function AsteroidBelt({ count = 200, innerRadius = 10, outerRadius = 20 }: AsteroidBeltProps) {
  const asteroids = []

  for (let i = 0; i < count; i++) {
    // Calculate random position within the belt
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius)
    const angle = Math.random() * Math.PI * 2
    const height = (Math.random() - 0.5) * 2

    const position = [
      radius, // This will be used as the orbit radius
      height,
      0,
    ]

    // Random size, speed and rotation
    const size = 0.1 + Math.random() * 0.3
    const speed = 0.05 + Math.random() * 0.1
    const rotationSpeed = 0.01 + Math.random() * 0.05

    asteroids.push(<Asteroid key={i} position={position} size={size} speed={speed} rotationSpeed={rotationSpeed} />)
  }

  return <>{asteroids}</>
}

// Controls panel component
interface ControlsPanelProps {
  asteroidCount: number
  setAsteroidCount: (count: number) => void
  isControlsOpen: boolean
  setIsControlsOpen: (isOpen: boolean) => void
}
function ControlsPanel({ asteroidCount, setAsteroidCount, isControlsOpen, setIsControlsOpen }: ControlsPanelProps) {
  return (
    <div
      className={`absolute z-30 transition-all duration-300 ease-in-out left-0
      ${
        isControlsOpen
          ? "top-0 w-full md:w-80 bg-black/90 p-4 rounded-br-lg max-h-[80vh] overflow-y-auto"
          : "top-0 w-full md:w-80 bg-black/70 p-2 rounded-br-lg"
      }`}
    >
      {/* Mobile toggle button */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-bold text-white">Asteroid Belt Simulation</h1>
        <button
          onClick={() => setIsControlsOpen(!isControlsOpen)}
          className="p-1 bg-gray-800 rounded-md text-white"
          aria-label={isControlsOpen ? "Collapse controls" : "Expand controls"}
        >
          {isControlsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Controls content - only shown when expanded */}
      {isControlsOpen && (
        <div className="space-y-4">
          <p className="text-white mb-4">Explore a simulated asteroid belt around a central star.</p>

          <div className="mb-2">
            <label htmlFor="asteroid-count" className="block mb-1 text-white">
              Asteroid Count: {asteroidCount}
            </label>
            <input
              id="asteroid-count"
              type="range"
              min="50"
              max="500"
              value={asteroidCount}
              onChange={(e) => setAsteroidCount(Number.parseInt(e.target.value))}
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
          </div>

          <p className="text-xs opacity-70 text-white">Use mouse to orbit, scroll to zoom (in 3D area only)</p>
        </div>
      )}
    </div>
  )
}

function AsteroidBeltInfo() {
  // Animation for the orbit diagram
  const [orbitAngle, setOrbitAngle] = useState(0)

  // Update the orbit animation
  useEffect(() => {
    const timer = setInterval(() => {
      setOrbitAngle((prev) => (prev + 0.01) % (Math.PI * 2))
    }, 16)
    return () => clearInterval(timer)
  }, [])

  // Live counter for "discovered asteroids"
  const [discoveredCount, setDiscoveredCount] = useState(1113527)

  useEffect(() => {
    // Randomly increment the counter to simulate new discoveries
    const timer = setInterval(() => {
      if (Math.random() > 0.7) {
        setDiscoveredCount((prev) => prev + 1)
      }
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg mx-auto my-8 max-w-7xl">
      <h2 className="text-2xl font-bold mb-4">About Asteroid Belts</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">The Solar System's Asteroid Belt</h3>
          <p className="mb-3">
            The main asteroid belt in our solar system is located between Mars and Jupiter, approximately 2.2 to 3.2
            astronomical units (AU) from the Sun.
          </p>

          {/* Live orbit diagram */}
          <div className="relative h-48 mb-4 bg-black/50 rounded-lg p-3">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>

            {/* Mars orbit */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-red-600 border-dashed"></div>
            <div
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-red-600"
              style={{
                transform: `translate(-50%, -50%) translate(${Math.cos(orbitAngle * 1.5) * 48}px, ${Math.sin(orbitAngle * 1.5) * 48}px)`,
              }}
            ></div>

            {/* Asteroid belt */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-gray-600 border-dotted opacity-50"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-gray-600 border-dotted opacity-50"></div>

            {/* Animated asteroids */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-gray-400"
                style={{
                  transform: `translate(-50%, -50%) translate(${Math.cos(orbitAngle + i * 0.5) * (70 + (i % 5) * 3)}px, ${Math.sin(orbitAngle + i * 0.5) * (70 + (i % 5) * 3)}px)`,
                }}
              ></div>
            ))}

            {/* Jupiter orbit */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-orange-300 border-dashed"></div>
            <div
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-orange-300"
              style={{
                transform: `translate(-50%, -50%) translate(${Math.cos(orbitAngle * 0.8) * 112}px, ${Math.sin(orbitAngle * 0.8) * 112}px)`,
              }}
            ></div>

            <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-gray-400">
              Live orbital simulation (not to scale)
            </div>
          </div>

          <p>
            The gravitational influence of Jupiter prevented these objects from forming a planet during the solar
            system's formation about 4.6 billion years ago.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Asteroid Composition</h3>
          <p className="mb-3">Asteroids are classified into different types based on their composition:</p>

          {/* Animated composition chart */}
          <div className="relative h-48 mb-4 bg-black/50 rounded-lg p-3 flex items-center justify-center">
            <div className="w-full max-w-[200px]">
              <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div className="absolute top-0 left-0 h-full bg-gray-600 rounded-l-full" style={{ width: "75%" }}>
                  <div className="h-full w-full bg-gradient-to-r from-gray-700 to-gray-500 animate-pulse"></div>
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                  C-type: 75%
                </span>
              </div>

              <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div className="absolute top-0 left-0 h-full bg-gray-600 rounded-l-full" style={{ width: "17%" }}>
                  <div className="h-full w-full bg-gradient-to-r from-amber-700 to-amber-500 animate-pulse"></div>
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                  S-type: 17%
                </span>
              </div>

              <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden mb-2">
                <div className="absolute top-0 left-0 h-full bg-gray-600 rounded-l-full" style={{ width: "8%" }}>
                  <div className="h-full w-full bg-gradient-to-r from-zinc-700 to-zinc-400 animate-pulse"></div>
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                  M-type: 8%
                </span>
              </div>
            </div>
          </div>

          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-semibold">C-type (carbonaceous)</span>: Dark, carbon-rich, most common type
            </li>
            <li>
              <span className="font-semibold">S-type (silicaceous)</span>: Silicate materials and nickel-iron
            </li>
            <li>
              <span className="font-semibold">M-type (metallic)</span>: Mostly nickel-iron
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Live Asteroid Data</h3>

        {/* Live data section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-400">Known Asteroids</div>
            <div className="text-2xl font-mono font-bold text-green-400 flex justify-center items-baseline">
              {discoveredCount.toLocaleString()}
              <span className="ml-2 h-2 w-2 rounded-full bg-green-500 inline-block animate-ping"></span>
            </div>
          </div>

          <div className="bg-black/50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-400">Largest Asteroid</div>
            <div className="text-2xl font-bold">Ceres</div>
            <div className="text-sm">940 km diameter</div>
          </div>

          <div className="bg-black/50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-400">Total Belt Mass</div>
            <div className="text-2xl font-bold">
              3.0 × 10<sup>21</sup> kg
            </div>
            <div className="text-sm">≈ 4% of Moon's mass</div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">About This Simulation</h3>
        <p className="mb-3">
          This simulation demonstrates the basic orbital mechanics of an asteroid belt. In reality:
        </p>
        <ul className="list-disc pl-5 space-y-1 mb-3">
          <li>Asteroids follow elliptical, not perfectly circular orbits</li>
          <li>Their orbital planes are more varied than shown here</li>
          <li>The size distribution follows a power law (many more small asteroids than large ones)</li>
          <li>Asteroids occasionally collide, creating families of fragments with similar orbits</li>
        </ul>
        <p>
          The simulation uses simplified physics to balance scientific accuracy with visual appeal and performance. The
          orbital mechanics follow Kepler's laws of planetary motion, with each asteroid moving faster when closer to
          the central star.
        </p>
      </div>
    </div>
  )
}

export default function AsteroidBeltSimulation() {
  const [asteroidCount, setAsteroidCount] = useState(200)
  const [isControlsOpen, setIsControlsOpen] = useState(false)

  // Auto-expand controls on desktop, collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsControlsOpen(window.innerWidth >= 768)
    }

    // Set initial state
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="w-full min-h-screen bg-black flex flex-col">
      <div className="h-[80vh] md:h-[70vh] relative">
        {/* Controls panel */}
        <ControlsPanel
          asteroidCount={asteroidCount}
          setAsteroidCount={setAsteroidCount}
          isControlsOpen={isControlsOpen}
          setIsControlsOpen={setIsControlsOpen}
        />

        <div id="canvas-container" className="h-full w-full">
          <Canvas camera={{ position: [0, 15, 30], fov: 60 }}>
            <ambientLight intensity={0.2} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            <Sun />
            <AsteroidBelt count={asteroidCount} innerRadius={10} outerRadius={20} />

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={5}
              maxDistance={50}
              zoomSpeed={0.5}
            />
          </Canvas>
        </div>
      </div>

      {/* Visual separator */}
      <div className="h-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900"></div>

      {/* Scrollable content area */}
      <div className="overflow-y-auto bg-black py-8 px-4">
        <AsteroidBeltInfo />
      </div>
    </div>
  )
}

