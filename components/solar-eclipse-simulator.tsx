"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Stars, useTexture } from "@react-three/drei"
import * as THREE from "three"
import { ChevronDown, ChevronUp, Pause, Play } from "lucide-react"

function Sun({ size = 25 }) {
  const sunRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)

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
      <mesh ref={sunRef}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshBasicMaterial color="#FDB813" />
        <pointLight intensity={1.5} distance={1000} decay={2} />
      </mesh>

      <mesh ref={coronaRef} scale={1.2}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshBasicMaterial color="#FDB813" transparent={true} opacity={0.2} side={THREE.BackSide} />
      </mesh>

      <mesh scale={1.5}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color="#FFF4E0" transparent={true} opacity={0.1} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

interface MoonProps {
  position: [number, number, number];
  size?: number;
  eclipseProgress: number;
}

function Moon({ position, size = 6.8, eclipseProgress }: MoonProps) {
  const moonRef = useRef<THREE.Mesh>(null)
  const moonTexture = useTexture("/placeholder.svg?height=512&width=512")

  useFrame(() => {
    if (moonRef.current) {
      const x = 100 - eclipseProgress * 200
      moonRef.current.position.set(x, 0, position[2])
    }
  })

  return (
    <mesh ref={moonRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial map={moonTexture} color="#AAAAAA" roughness={1} metalness={0} />
    </mesh>
  )
}

interface EclipseSceneProps {
  eclipseProgress: number
  eclipseType: 'total' | 'annular' | 'partial'
  decrementEclipse?: () => void
}
function EclipseScene({ eclipseProgress, eclipseType }: EclipseSceneProps) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, 150)
  }, [camera])

  const getMoonZPosition = () => {
    switch (eclipseType) {
      case "total":
        return 50
      case "annular":
        return 60
      case "partial":
        return 55
      default:
        return 50
    }
  }

  const getMoonYOffset = () => {
    return eclipseType === "partial" ? 4 : 0
  }

  return (
    <>
      <ambientLight intensity={0.1} />
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade />

      <Sun size={25} />

      <Moon position={[100, getMoonYOffset(), getMoonZPosition()]} size={6.8} eclipseProgress={eclipseProgress} />
    </>
  )
}

interface EclipseShadowProps {
  eclipseProgress: number
  eclipseType: 'total' | 'annular' | 'partial'
}
function EclipseShadow({ eclipseProgress, eclipseType }: EclipseShadowProps) {
  const brightness = useMemo(() => {
    let newBrightness = 1

    const normalizedProgress = Math.abs(eclipseProgress - 0.5) * 2
    if (eclipseType === "total") {
      newBrightness = normalizedProgress < 0.2 ? 0.05 : 0.3 + normalizedProgress * 0.7
    } else if (eclipseType === "annular") {
      newBrightness = normalizedProgress < 0.2 ? 0.3 : 0.5 + normalizedProgress * 0.5
    } else {
      newBrightness = normalizedProgress < 0.2 ? 0.2 : 0.4 + normalizedProgress * 0.6
    }

    return newBrightness
  }, [eclipseProgress, eclipseType])

  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
      style={{
        backgroundColor: "black",
        opacity: 1 - brightness,
        zIndex: 10,
      }}
    />
  )
}

interface CoronaEffectProps {
  eclipseProgress: number
  eclipseType: 'total' | 'annular' | 'partial'
}

function CoronaEffect({ eclipseProgress, eclipseType }: CoronaEffectProps) {
  const visible = useMemo(() => {
    const normalizedProgress = Math.abs(eclipseProgress - 0.5) * 2 // 0 at middle, 1 at start/end
    return eclipseType === "total" && normalizedProgress < 0.1
  }, [eclipseProgress, eclipseType])

  if (!visible) return null

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
      <div
        className="w-64 h-64 rounded-full bg-gradient-to-r from-transparent via-yellow-100/10 to-transparent animate-pulse"
        style={{
          boxShadow: "0 0 100px 60px rgba(253, 184, 19, 0.2), 0 0 160px 100px rgba(255, 244, 224, 0.1)",
          filter: "blur(8px)",
        }}
      />
    </div>
  )
}

interface DiamondRingEffectProps {
  eclipseProgress: number
  eclipseType: 'total' | 'annular' | 'partial'
}

function DiamondRingEffect({ eclipseProgress, eclipseType }: DiamondRingEffectProps) {
  const { visible, position } = useMemo(() => {
    const normalizedProgress = Math.abs(eclipseProgress - 0.5) * 2 // 0 at middle, 1 at start/end
    const showEffect = eclipseType === "total" && normalizedProgress > 0.1 && normalizedProgress < 0.15

    let pos = { x: 0, y: 0 }
    if (showEffect) {
      const angle = (eclipseProgress * 10) % (Math.PI * 2)
      const radius = 120
      pos = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      }
    }

    return { visible: showEffect, position: pos }
  }, [eclipseProgress, eclipseType])

  if (!visible) return null

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
      <div
        className="absolute w-4 h-4 bg-white rounded-full animate-pulse"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          boxShadow: "0 0 20px 10px rgba(255, 255, 255, 0.8)",
          filter: "blur(1px)",
        }}
      />
    </div>
  )
}

interface ControlsPanelProps {
  eclipseType: 'total' | 'annular' | 'partial'
  setEclipseType: (type: 'total' | 'annular' | 'partial') => void
  animationSpeed: number
  setAnimationSpeed: (speed: number) => void
  eclipseProgress: number
  setEclipseProgress: (progress: number) => void
  isPlaying: boolean
  setIsPlaying: (isPlaying: boolean) => void
  getEclipsePhase: () => string
  isControlsOpen: boolean
  setIsControlsOpen: (isOpen: boolean) => void
}

function ControlsPanel({
  eclipseType,
  setEclipseType,
  animationSpeed,
  setAnimationSpeed,
  eclipseProgress,
  setEclipseProgress,
  isPlaying,
  setIsPlaying,
  getEclipsePhase,
  isControlsOpen,
  setIsControlsOpen,
}: ControlsPanelProps) {
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
        <h1 className="text-lg font-bold text-white">Solar Eclipse Simulator</h1>
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
          <p className="text-white mb-4">
            Watch as the Moon passes in front of the Sun, creating different types of eclipses.
          </p>

          <div>
            <label htmlFor="eclipse-type" className="block mb-1 text-white">
              Eclipse Type:
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setEclipseType("total")}
                className={`px-2 py-1 rounded-md text-sm ${eclipseType === "total" ? "bg-blue-600" : "bg-gray-700"} text-white`}
              >
                Total
              </button>
              <button
                onClick={() => setEclipseType("annular")}
                className={`px-2 py-1 rounded-md text-sm ${eclipseType === "annular" ? "bg-blue-600" : "bg-gray-700"} text-white`}
              >
                Annular
              </button>
              <button
                onClick={() => setEclipseType("partial")}
                className={`px-2 py-1 rounded-md text-sm ${eclipseType === "partial" ? "bg-blue-600" : "bg-gray-700"} text-white`}
              >
                Partial
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="animation-speed" className="block mb-1 text-white">
              Animation Speed: {animationSpeed.toFixed(1)}x
            </label>
            <input
              id="animation-speed"
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number.parseFloat(e.target.value))}
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
          </div>

          <div>
            <label htmlFor="eclipse-progress" className="block mb-1 text-white">
              Eclipse Progress:
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-md hover:bg-gray-600 text-white"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <input
                id="eclipse-progress"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={eclipseProgress}
                onChange={(e) => {
                  setEclipseProgress(Number.parseFloat(e.target.value))
                  setIsPlaying(false)
                }}
                className="flex-1 bg-gray-700 rounded-lg appearance-none h-2"
              />
            </div>
          </div>

          <div className="bg-black/50 p-2 rounded-lg text-center">
            <div className="text-sm text-gray-400">Current Phase</div>
            <div className="text-lg font-semibold text-white">{getEclipsePhase()}</div>
          </div>

          <p className="text-xs opacity-70 mt-4 text-white">Use mouse to orbit, scroll to zoom (in 3D area only)</p>
        </div>
      )}
    </div>
  )
}

interface EclipseInfoProps {
  eclipseType: 'total' | 'annular' | 'partial';
}

const EclipseInfo: React.FC<EclipseInfoProps> = ({ eclipseType }) => {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg mx-auto my-8 max-w-7xl">
      <h2 className="text-2xl font-bold mb-4">About Solar Eclipses</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">What Causes a Solar Eclipse?</h3>
          <p className="mb-3">
            A solar eclipse occurs when the Moon passes between Earth and the Sun, blocking the Sun's light either
            partially or completely. This can only happen during a new moon phase when the Moon is directly between the
            Earth and Sun.
          </p>

          <div className="bg-black/50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Eclipse Alignment</h4>
            <p className="text-sm text-gray-300">
              For an eclipse to occur, the Moon must cross the ecliptic plane (the plane of Earth's orbit) at the same
              time it is in the new moon phase. This alignment happens only a few times per year, making eclipses
              relatively rare events.
            </p>
          </div>

          <p>
            The Moon's orbit is tilted about 5° relative to Earth's orbit around the Sun, which is why we don't see
            eclipses every month during the new moon.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Types of Solar Eclipses</h3>

          <div
            className={`p-3 rounded-lg mb-3 ${eclipseType === "total" ? "bg-blue-900/50 border border-blue-700" : "bg-gray-800"}`}
          >
            <h4 className="font-medium">Total Eclipse</h4>
            <p className="text-sm text-gray-300">
              The Moon completely covers the Sun's disk, revealing the solar corona. This happens when the Moon is at
              its closest point to Earth (perigee). Total eclipses can turn day into night briefly and allow stars to be
              visible.
            </p>
          </div>

          <div
            className={`p-3 rounded-lg mb-3 ${eclipseType === "annular" ? "bg-blue-900/50 border border-blue-700" : "bg-gray-800"}`}
          >
            <h4 className="font-medium">Annular Eclipse</h4>
            <p className="text-sm text-gray-300">
              The Moon appears smaller than the Sun, creating a "ring of fire" effect. This occurs when the Moon is at
              its furthest point from Earth (apogee). The Moon's apparent size is too small to completely cover the Sun.
            </p>
          </div>

          <div
            className={`p-3 rounded-lg mb-3 ${eclipseType === "partial" ? "bg-blue-900/50 border border-blue-700" : "bg-gray-800"}`}
          >
            <h4 className="font-medium">Partial Eclipse</h4>
            <p className="text-sm text-gray-300">
              Only part of the Sun is covered by the Moon. This can occur on its own, or as part of a total or annular
              eclipse for viewers outside the path of totality. The Sun appears as if a "bite" has been taken out of it.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Eclipse Phenomena</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Solar Corona</h4>
            <p className="text-sm text-gray-300">
              The Sun's outer atmosphere becomes visible during a total eclipse. This pearly white crown extends
              millions of kilometers into space and is normally hidden by the Sun's bright surface.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Diamond Ring Effect</h4>
            <p className="text-sm text-gray-300">
              Just before and after totality, a bright point of sunlight shines through a valley on the Moon's limb,
              creating a spectacular effect resembling a diamond ring.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Baily's Beads</h4>
            <p className="text-sm text-gray-300">
              Points of light that appear around the Moon's edge due to sunlight shining through lunar valleys. Named
              after astronomer Francis Baily who explained the phenomenon in 1836.
            </p>
          </div>
        </div>

        <div className="bg-black/50 p-4 rounded-lg">
          <h4 className="font-medium mb-1">Safety Warning</h4>
          <p className="text-sm text-red-300">
            <strong>Never look directly at the Sun during an eclipse without proper eye protection!</strong>
            Special eclipse glasses or solar filters are required to safely view a solar eclipse. Regular sunglasses do
            NOT provide adequate protection and can result in permanent eye damage.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SolarEclipseSimulator() {
  const [eclipseProgress, setEclipseProgress] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [isPlaying, setIsPlaying] = useState(true)
  const [eclipseType, setEclipseType] = useState<"total" | "annular" | "partial">("total")
  const [isControlsOpen, setIsControlsOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setEclipseProgress((prev) => {
        const newProgress = prev + 0.002 * animationSpeed
        return newProgress > 1 ? 0 : newProgress
      })
    }, 16)

    return () => clearInterval(interval)
  }, [isPlaying, animationSpeed])

  const getEclipsePhase = () => {
    if (eclipseProgress < 0.4) return "Approaching"
    if (eclipseProgress < 0.45) return "Partial Phase"
    if (eclipseProgress < 0.55) {
      if (eclipseType === "total") return "Totality"
      if (eclipseType === "annular") return "Annularity"
      return "Maximum Coverage"
    }
    if (eclipseProgress < 0.6) return "Partial Phase"
    return "Departing"
  }

  useEffect(() => {
    const handleResize = () => {
      setIsControlsOpen(window.innerWidth >= 768)
    }

    handleResize()

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="w-full min-h-screen bg-black flex flex-col">
      <div className="h-[80vh] md:h-[70vh] relative">
        <EclipseShadow eclipseProgress={eclipseProgress} eclipseType={eclipseType} />

        <CoronaEffect eclipseProgress={eclipseProgress} eclipseType={eclipseType} />
        <DiamondRingEffect eclipseProgress={eclipseProgress} eclipseType={eclipseType} />

        <ControlsPanel
          eclipseType={eclipseType}
          setEclipseType={setEclipseType}
          animationSpeed={animationSpeed}
          setAnimationSpeed={setAnimationSpeed}
          eclipseProgress={eclipseProgress}
          setEclipseProgress={setEclipseProgress}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          getEclipsePhase={getEclipsePhase}
          isControlsOpen={isControlsOpen}
          setIsControlsOpen={setIsControlsOpen}
        />

        <div id="canvas-container" className="h-full w-full">
          <Canvas camera={{ position: [0, 0, 150], fov: 45 }}>
            <EclipseScene eclipseProgress={eclipseProgress} eclipseType={eclipseType} />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={50}
              maxDistance={300}
              zoomSpeed={0.5}
            />
          </Canvas>
        </div>
      </div>

      <div className="h-4 bg-gradient-to-r from-blue-900 via-purple-900 to-red-900"></div>

      <div className="overflow-y-auto bg-gray-950 py-8 px-4">
        <EclipseInfo eclipseType={eclipseType} />
      </div>
    </div>
  )
}

