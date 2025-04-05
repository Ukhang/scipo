"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

interface PlanetProps {
  position: [number, number, number];
  radius: number;
  texture: THREE.Texture;
  atmosphereColor: string;
  atmosphereThickness: number;
  velocity: [number, number, number];
  onPositionUpdate: (position: [number, number, number]) => void;
  isColliding: boolean;
  deformationFactor?: number;
  rotationSpeed?: number;
  planetType?: "earth" | "mars" | "default";
}

interface DebrisParticlesProps {
  active: boolean;
  position: [number, number, number];
  count: number;
  spread: number;
  speed: number;
  planetType: "earth" | "mars" | "default";
}

interface ExplosionEffectProps {
  active: boolean;
  position: [number, number, number];
  size: number;
}

interface ShockwaveEffectProps {
  active: boolean;
  position: [number, number, number];
  speed: number;
}

interface ResultPlanetProps {
  active: boolean;
  position: [number, number, number];
  radius: number;
  texture: THREE.Texture;
  rotationSpeed?: number;
}

interface CollisionSceneProps {
  planet1Size: number;
  planet2Size: number;
  impactAngle: number;
  impactVelocity: number;
  collisionScenario: "merger" | "partial" | "destruction";
  resetSimulation: boolean;
  isSimulationActive: boolean;
  setIsColliding: (isColliding: boolean) => void;
  setCollisionComplete: (collisionComplete: boolean) => void;
}

interface ControlsPanelProps {
  planet1Size: number;
  setPlanet1Size: (size: number) => void;
  planet2Size: number;
  setPlanet2Size: (size: number) => void;
  impactAngle: number;
  setImpactAngle: (angle: number) => void;
  impactVelocity: number;
  setImpactVelocity: (velocity: number) => void;
  collisionScenario: "merger" | "partial" | "destruction";
  setCollisionScenario: (
    scenario: "merger" | "partial" | "destruction"
  ) => void;
  isSimulationActive: boolean;
  setIsSimulationActive: (active: boolean) => void;
  resetSimulation: () => void;
  isColliding: boolean;
  collisionComplete: boolean;
  isControlsOpen: boolean;
  setIsControlsOpen: (isOpen: boolean) => void;
}

// Planet component with texture and atmosphere
const Planet: React.FC<PlanetProps> = ({
  position,
  radius,
  texture,
  atmosphereColor,
  atmosphereThickness,
  velocity,
  onPositionUpdate,
  isColliding,
  deformationFactor = 0,
  rotationSpeed = 0.2,
  planetType = "earth",
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const positionRef = useRef(new THREE.Vector3(...position));
  const velocityRef = useRef(new THREE.Vector3(...velocity));

  useFrame((state, delta) => {
    if (meshRef.current && !isColliding) {
      positionRef.current.add(
        velocityRef.current.clone().multiplyScalar(delta)
      );
      meshRef.current.position.copy(positionRef.current);
      meshRef.current.rotation.y += delta * rotationSpeed;

      if (atmosphereRef.current) {
        atmosphereRef.current.position.copy(positionRef.current);
      }

      if (cloudsRef.current) {
        cloudsRef.current.position.copy(positionRef.current);
        cloudsRef.current.rotation.y += delta * (rotationSpeed * 1.2);
      }

      onPositionUpdate(positionRef.current.toArray());
    }
  });

  useEffect(() => {
    if (meshRef.current && isColliding) {
      meshRef.current.scale.set(
        1 - deformationFactor * 0.3,
        1 + deformationFactor * 0.2,
        1 + deformationFactor * 0.2
      );
      if (atmosphereRef.current) {
        atmosphereRef.current.scale.set(
          1 - deformationFactor * 0.3,
          1 + deformationFactor * 0.2,
          1 + deformationFactor * 0.2
        );
      }
      if (cloudsRef.current) {
        cloudsRef.current.scale.set(
          1 - deformationFactor * 0.3,
          1 + deformationFactor * 0.2,
          1 + deformationFactor * 0.2
        );
      }
    } else if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1);
      if (atmosphereRef.current) atmosphereRef.current.scale.set(1, 1, 1);
      if (cloudsRef.current) cloudsRef.current.scale.set(1, 1, 1);
    }
  }, [isColliding, deformationFactor]);

  const planetColor =
    planetType === "earth"
      ? "#1E88E5"
      : planetType === "mars"
      ? "#D84315"
      : "#A1887F";

  return (
    <group>
      <mesh ref={meshRef} position={positionRef.current.toArray()}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhongMaterial map={texture} color={planetColor} shininess={10} />
      </mesh>

      {planetType === "earth" && (
        <mesh ref={cloudsRef} position={positionRef.current.toArray()}>
          <sphereGeometry args={[radius * 1.01, 64, 64]} />
          <meshPhongMaterial
            color="#FFFFFF"
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}

      {atmosphereThickness > 0 && (
        <mesh ref={atmosphereRef} position={positionRef.current.toArray()}>
          <sphereGeometry args={[radius * (1 + atmosphereThickness), 64, 64]} />
          <meshBasicMaterial
            color={atmosphereColor}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
};

// Debris particle system for collision effects
const DebrisParticles: React.FC<DebrisParticlesProps> = ({
  active,
  position,
  count,
  spread,
  speed,
  planetType,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3] = position[0] + (Math.random() - 0.5) * 2;
      positions[i3 + 1] = position[1] + (Math.random() - 0.5) * 2;
      positions[i3 + 2] = position[2] + (Math.random() - 0.5) * 2;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * spread;

      velocities[i3] = r * Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i3 + 2] = r * Math.cos(phi) * speed;

      if (planetType === "earth") {
        const colorType = Math.random();
        if (colorType < 0.4) {
          colors[i3] = 0.1 + Math.random() * 0.2;
          colors[i3 + 1] = 0.3 + Math.random() * 0.3;
          colors[i3 + 2] = 0.6 + Math.random() * 0.4;
        } else if (colorType < 0.8) {
          colors[i3] = 0.2 + Math.random() * 0.3;
          colors[i3 + 1] = 0.5 + Math.random() * 0.5;
          colors[i3 + 2] = 0.1 + Math.random() * 0.2;
        } else {
          colors[i3] = 0.5 + Math.random() * 0.3;
          colors[i3 + 1] = 0.4 + Math.random() * 0.3;
          colors[i3 + 2] = 0.3 + Math.random() * 0.2;
        }
      } else if (planetType === "mars") {
        colors[i3] = 0.7 + Math.random() * 0.3;
        colors[i3 + 1] = 0.3 + Math.random() * 0.3;
        colors[i3 + 2] = 0.1 + Math.random() * 0.2;
      } else {
        colors[i3] = 0.8 + Math.random() * 0.2;
        colors[i3 + 1] = 0.3 + Math.random() * 0.5;
        colors[i3 + 2] = Math.random() * 0.2;
      }

      sizes[i] =
        Math.random() < 0.1 ? 2.5 + Math.random() * 3 : 0.5 + Math.random() * 2;
    }

    return { positions, velocities, colors, sizes };
  }, [count, position, spread, speed, planetType]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !active) return;

    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;

      velocities[i3] *= 0.99;
      velocities[i3 + 1] *= 0.99 - 0.01 * delta;
      velocities[i3 + 2] *= 0.99;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

// Explosion effect at collision point
const ExplosionEffect: React.FC<ExplosionEffectProps> = ({
  active,
  position,
  size,
}) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!active) return;

    timeRef.current += delta;

    if (lightRef.current) {
      const intensity = 5 + Math.sin(timeRef.current * 10) * 2;
      lightRef.current.intensity = intensity;
    }

    if (glowRef.current) {
      const scale = 1 + Math.sin(timeRef.current * 5) * 0.2;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  if (!active) return null;

  return (
    <group position={position}>
      <pointLight ref={lightRef} distance={50} intensity={5} color="#FFCC88" />
      <mesh ref={glowRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color="#FFCC88" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

// Shockwave effect that expands from collision point
const ShockwaveEffect: React.FC<ShockwaveEffectProps> = ({
  active,
  position,
  speed,
}) => {
  const waveRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const maxSize = 30;

  useFrame((state, delta) => {
    if (!active || !waveRef.current) return;

    timeRef.current += delta;

    const size = Math.min(timeRef.current * speed, maxSize);
    waveRef.current.scale.set(size, size, size);

    const opacity = Math.max(0, 1 - size / maxSize);
    (waveRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
  });

  useEffect(() => {
    if (active) {
      timeRef.current = 0;
    }
  }, [active]);

  if (!active) return null;

  return (
    <mesh ref={waveRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color="#FFFFFF"
        transparent
        opacity={1}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

// Result planet after collision (if merger scenario)
const ResultPlanet: React.FC<ResultPlanetProps> = ({
  active,
  position,
  radius,
  texture,
  rotationSpeed = 0.1,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || !active) return;

    timeRef.current += delta;

    meshRef.current.rotation.y += delta * rotationSpeed;

    const wobble = Math.sin(timeRef.current * 2) * 0.05;
    meshRef.current.rotation.x = wobble;
    meshRef.current.rotation.z = wobble * 0.7;
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

// Main simulation scene
const CollisionScene: React.FC<CollisionSceneProps> = ({
  planet1Size,
  planet2Size,
  impactAngle,
  impactVelocity,
  collisionScenario,
  resetSimulation,
  isSimulationActive,
  setIsColliding,
  setCollisionComplete,
}) => {
  const earthTexture = useTexture("/placeholder.svg?height=512&width=512");
  const marsTexture = useTexture("/placeholder.svg?height=512&width=512");
  const resultTexture = useTexture("/placeholder.svg?height=512&width=512");

  const [planet1Position, setPlanet1Position] = useState<
    [number, number, number]
  >([-15, 0, 0]);
  const [planet2Position, setPlanet2Position] = useState<
    [number, number, number]
  >([15, impactAngle * 10, 0]);
  const [collisionPosition, setCollisionPosition] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [showDebris, setShowDebris] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const [showResultPlanet, setShowResultPlanet] = useState(false);
  const [deformationFactor, setDeformationFactor] = useState(0);

  const planet1Velocity = useMemo(
    () => [impactVelocity * 0.5, 0, 0] as [number, number, number],
    [impactVelocity]
  );
  const planet2Velocity = useMemo(
    () =>
      [-impactVelocity * 0.5, -impactAngle * impactVelocity * 0.2, 0] as [
        number,
        number,
        number
      ],
    [impactVelocity, impactAngle]
  );

  const isCollisionDetected = useRef(false);
  const collisionTimeRef = useRef(0);

  useEffect(() => {
    if (resetSimulation) {
      setPlanet1Position([-15, 0, 0]);
      setPlanet2Position([15, impactAngle * 10, 0]);
      setShowDebris(false);
      setShowExplosion(false);
      setShowShockwave(false);
      setShowResultPlanet(false);
      setDeformationFactor(0);
      isCollisionDetected.current = false;
      collisionTimeRef.current = 0;
      setIsColliding(false);
      setCollisionComplete(false);
    }
  }, [resetSimulation, impactAngle, setIsColliding, setCollisionComplete]);

  useFrame((state, delta) => {
    if (!isSimulationActive || isCollisionDetected.current) return;

    const p1 = new THREE.Vector3(...planet1Position);
    const p2 = new THREE.Vector3(...planet2Position);
    const distance = p1.distanceTo(p2);

    if (distance < (planet1Size + planet2Size) * 0.8) {
      isCollisionDetected.current = true;
      setIsColliding(true);

      const collisionPoint = p1
        .clone()
        .lerp(p2, planet1Size / (planet1Size + planet2Size));
      setCollisionPosition(collisionPoint.toArray());

      setShowExplosion(true);
      setShowShockwave(true);

      setTimeout(() => {
        setShowDebris(true);
      }, 300);

      if (collisionScenario === "merger") {
        setTimeout(() => {
          setShowResultPlanet(true);
          setCollisionComplete(true);
        }, 3000);
      } else if (collisionScenario === "partial") {
        setDeformationFactor(0.8);
        setTimeout(() => {
          setCollisionComplete(true);
        }, 3000);
      } else {
        setTimeout(() => {
          setCollisionComplete(true);
        }, 3000);
      }
    }
  });

  return (
    <>
      <Stars
        radius={300}
        depth={100}
        count={5000}
        factor={4}
        saturation={0}
        fade
      />
      <ambientLight intensity={0.2} />
      <directionalLight position={[50, 30, 50]} intensity={1} />

      {(!isCollisionDetected.current ||
        collisionScenario !== "destruction") && (
        <Planet
          position={planet1Position}
          radius={planet1Size}
          texture={earthTexture}
          atmosphereColor="#4488FF"
          atmosphereThickness={0.05}
          velocity={planet1Velocity}
          onPositionUpdate={setPlanet1Position}
          isColliding={isCollisionDetected.current}
          deformationFactor={deformationFactor}
          planetType="earth"
        />
      )}

      {(!isCollisionDetected.current ||
        collisionScenario !== "destruction") && (
        <Planet
          position={planet2Position}
          radius={planet2Size}
          texture={marsTexture}
          atmosphereColor="#FF8866"
          atmosphereThickness={0.02}
          velocity={planet2Velocity}
          onPositionUpdate={setPlanet2Position}
          isColliding={isCollisionDetected.current}
          deformationFactor={deformationFactor}
          planetType="mars"
        />
      )}

      <DebrisParticles
        active={showDebris}
        position={collisionPosition}
        count={3000}
        spread={1.5}
        speed={10}
        planetType={collisionPosition[0] < 0 ? "earth" : "mars"}
      />

      <ExplosionEffect
        active={showExplosion}
        position={collisionPosition}
        size={Math.max(planet1Size, planet2Size) * 0.8}
      />

      <ShockwaveEffect
        active={showShockwave}
        position={collisionPosition}
        speed={20}
      />

      {showResultPlanet && collisionScenario === "merger" && (
        <ResultPlanet
          active={true}
          position={collisionPosition}
          radius={Math.sqrt(
            planet1Size * planet1Size + planet2Size * planet2Size
          )}
          texture={resultTexture}
        />
      )}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={100}
      />
    </>
  );
};

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  planet1Size,
  setPlanet1Size,
  planet2Size,
  setPlanet2Size,
  impactAngle,
  setImpactAngle,
  impactVelocity,
  setImpactVelocity,
  collisionScenario,
  setCollisionScenario,
  isSimulationActive,
  setIsSimulationActive,
  resetSimulation,
  isColliding,
  collisionComplete,
  isControlsOpen,
  setIsControlsOpen,
}) => {
  return (
    <div
      className={`absolute z-30 transition-all duration-300 ease-in-out left-0
        ${
          isControlsOpen
            ? "top-0 w-full md:w-80 bg-black/90 p-4 rounded-br-lg max-h-[80vh] overflow-y-auto"
            : "top-0 w-full md:w-80 bg-black/70 p-2 rounded-br-lg"
        }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-bold text-white">
          Planetary Collision Simulator
        </h1>
        <button
          onClick={() => setIsControlsOpen(!isControlsOpen)}
          className="p-1 bg-gray-800 rounded-md text-white"
          aria-label={isControlsOpen ? "Collapse controls" : "Expand controls"}
        >
          {isControlsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isControlsOpen && (
        <div className="space-y-4">
          <p className="text-white mb-4">
            Simulate what happens when two planets collide with different
            parameters and scenarios.
          </p>

          <div className="flex justify-between items-center">
            <div className="text-white font-medium">
              {!isSimulationActive
                ? "Configure Parameters"
                : isColliding
                ? "Collision in Progress"
                : "Planets Approaching"}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (isSimulationActive) {
                    resetSimulation();
                    setIsSimulationActive(false);
                  } else {
                    setIsSimulationActive(true);
                  }
                }}
                disabled={isColliding && !collisionComplete}
                className={`px-3 py-1 rounded-md text-sm ${
                  isSimulationActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSimulationActive ? "Reset" : "Start Simulation"}
              </button>

              {isSimulationActive && collisionComplete && (
                <button
                  onClick={resetSimulation}
                  className="p-1 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
                  aria-label="Restart simulation"
                >
                  <RotateCcw size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-700 my-2 pt-2">
            <h3 className="text-white font-medium mb-2">Planet Parameters</h3>

            <div>
              <label htmlFor="planet1-size" className="block mb-1 text-white">
                Planet 1 Size: {planet1Size.toFixed(1)} Earth Radii
              </label>
              <input
                id="planet1-size"
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={planet1Size}
                onChange={(e) =>
                  setPlanet1Size(Number.parseFloat(e.target.value))
                }
                disabled={isSimulationActive}
                className="w-full bg-gray-700 rounded-lg appearance-none h-2 disabled:opacity-50"
              />
            </div>

            <div className="mt-2">
              <label htmlFor="planet2-size" className="block mb-1 text-white">
                Planet 2 Size: {planet2Size.toFixed(1)} Earth Radii
              </label>
              <input
                id="planet2-size"
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={planet2Size}
                onChange={(e) =>
                  setPlanet2Size(Number.parseFloat(e.target.value))
                }
                disabled={isSimulationActive}
                className="w-full bg-gray-700 rounded-lg appearance-none h-2 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="border-t border-gray-700 my-2 pt-2">
            <h3 className="text-white font-medium mb-2">
              Collision Parameters
            </h3>

            <div>
              <label htmlFor="impact-angle" className="block mb-1 text-white">
                Impact Angle: {(impactAngle * 90).toFixed(0)}°
              </label>
              <input
                id="impact-angle"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={impactAngle}
                onChange={(e) =>
                  setImpactAngle(Number.parseFloat(e.target.value))
                }
                disabled={isSimulationActive}
                className="w-full bg-gray-700 rounded-lg appearance-none h-2 disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Direct Hit</span>
                <span>Glancing</span>
              </div>
            </div>

            <div className="mt-2">
              <label
                htmlFor="impact-velocity"
                className="block mb-1 text-white"
              >
                Impact Velocity: {impactVelocity.toFixed(1)}x
              </label>
              <input
                id="impact-velocity"
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={impactVelocity}
                onChange={(e) =>
                  setImpactVelocity(Number.parseFloat(e.target.value))
                }
                disabled={isSimulationActive}
                className="w-full bg-gray-700 rounded-lg appearance-none h-2 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="border-t border-gray-700 my-2 pt-2">
            <h3 className="text-white font-medium mb-2">Collision Scenario</h3>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCollisionScenario("merger")}
                disabled={isSimulationActive}
                className={`px-2 py-1 rounded-md text-sm ${
                  collisionScenario === "merger" ? "bg-blue-600" : "bg-gray-700"
                } text-white disabled:opacity-50`}
              >
                Merger
              </button>
              <button
                onClick={() => setCollisionScenario("partial")}
                disabled={isSimulationActive}
                className={`px-2 py-1 rounded-md text-sm ${
                  collisionScenario === "partial"
                    ? "bg-blue-600"
                    : "bg-gray-700"
                } text-white disabled:opacity-50`}
              >
                Partial Destruction
              </button>
              <button
                onClick={() => setCollisionScenario("destruction")}
                disabled={isSimulationActive}
                className={`px-2 py-1 rounded-md text-sm ${
                  collisionScenario === "destruction"
                    ? "bg-blue-600"
                    : "bg-gray-700"
                } text-white disabled:opacity-50`}
              >
                Complete Destruction
              </button>
            </div>

            <div className="mt-2 bg-gray-800 p-2 rounded text-sm text-gray-300">
              {collisionScenario === "merger" &&
                "Planets merge to form a larger body, like the Moon-forming impact."}
              {collisionScenario === "partial" &&
                "Smaller chunks break off, but main bodies remain intact, like Uranus's tilt."}
              {collisionScenario === "destruction" &&
                "Catastrophic disruption creates debris field, like asteroid belt formation."}
            </div>
          </div>

          <p className="text-xs opacity-70 text-white">
            Use mouse to orbit, scroll to zoom
          </p>
        </div>
      )}
    </div>
  );
};

function CollisionInfo() {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg mx-auto my-8 max-w-7xl">
      <h2 className="text-2xl font-bold mb-4">
        Planetary Collisions in Our Solar System
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">
            The Giant Impact Hypothesis
          </h3>
          <p className="mb-3">
            The most famous planetary collision in our solar system likely
            created Earth's Moon. According to the Giant Impact Hypothesis,
            about 4.5 billion years ago, a Mars-sized body called Theia collided
            with the proto-Earth. The impact ejected material that eventually
            coalesced to form the Moon.
          </p>

          <div className="bg-black/50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">
              Evidence for the Moon-Forming Impact
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
              <li>
                The Moon's composition is similar to Earth's mantle, suggesting
                it formed from Earth material
              </li>
              <li>
                The Earth-Moon system has a high angular momentum, consistent
                with a glancing impact
              </li>
              <li>
                Lunar samples show isotopic similarities with Earth rocks,
                indicating a common origin
              </li>
              <li>
                Computer simulations show that such an impact could create a
                system like Earth-Moon
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Other Collision Events</h3>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">Uranus's Extreme Tilt</h4>
            <p className="text-sm text-gray-300">
              Uranus rotates on its side, with an axial tilt of about 98
              degrees. Scientists believe this unusual orientation was caused by
              a collision with an Earth-sized object early in the solar system's
              history. The impact was powerful enough to dramatically change
              Uranus's rotation but not enough to disrupt the planet completely.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">Mercury's Iron Core</h4>
            <p className="text-sm text-gray-300">
              Mercury has an unusually large iron core relative to its size. One
              explanation is that Mercury was once a larger planet that suffered
              a giant impact, stripping away much of its outer silicate layers
              and leaving behind a planet dominated by its core.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">The Asteroid Belt</h4>
            <p className="text-sm text-gray-300">
              The asteroid belt between Mars and Jupiter may be the remnants of
              a planet that never fully formed due to Jupiter's gravitational
              influence, or possibly the debris from a catastrophic collision
              between planetesimals early in the solar system's history.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">
          Physics of Planetary Collisions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Impact Parameters</h4>
            <p className="text-sm text-gray-300">
              The outcome of a planetary collision depends on several key
              factors: the relative sizes of the bodies, their impact velocity,
              the angle of impact, and their compositions. Direct head-on
              collisions tend to be more destructive, while glancing impacts can
              lead to partial disruption or even capture scenarios.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Energy Release</h4>
            <p className="text-sm text-gray-300">
              Planetary collisions release enormous amounts of energy, primarily
              as heat. This energy can melt or vaporize rock and metal, creating
              magma oceans on the resulting bodies. The Earth was likely
              completely molten after the Moon-forming impact, taking millions
              of years to cool and solidify.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Debris Dynamics</h4>
            <p className="text-sm text-gray-300">
              Material ejected during a collision can follow several paths: some
              falls back to the larger body, some escapes the system entirely,
              and some may form a disk that can eventually coalesce into
              satellites. The size distribution of debris follows power laws
              that can be observed in asteroid families today.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">
          Exoplanet Collision Evidence
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Debris Disks</h4>
            <p className="text-sm text-gray-300">
              Astronomers have observed unusual debris disks around some stars
              that may be the aftermath of recent planetary collisions. For
              example, the star HD 172555 shows evidence of a massive collision
              that occurred within the last few thousand years, with silica dust
              and gas suggesting high-velocity impacts between rocky bodies.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Unusual Exoplanets</h4>
            <p className="text-sm text-gray-300">
              Some exoplanets have properties that might be explained by giant
              impacts. These include planets with extreme densities, unusual
              compositions, or highly eccentric orbits. For instance, the
              "super-Mercury" exoplanet K2-229b has an unusually high iron
              content that might result from a collision that stripped away its
              outer layers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanetaryCollisionSimulator() {
  // Simulation parameters
  const [planet1Size, setPlanet1Size] = useState(2.0);
  const [planet2Size, setPlanet2Size] = useState(1.5);
  const [impactAngle, setImpactAngle] = useState(0.2);
  const [impactVelocity, setImpactVelocity] = useState(1.5);
  const [collisionScenario, setCollisionScenario] = useState<
    "merger" | "partial" | "destruction"
  >("merger");

  // Simulation state
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [isColliding, setIsColliding] = useState(false);
  const [collisionComplete, setCollisionComplete] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  // Reset simulation function
  const resetSimulation = () => {
    setResetTrigger(!resetTrigger);
  };

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-expand controls on desktop, collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsControlsOpen(window.innerWidth >= 768);
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full min-h-screen bg-black flex flex-col">
      <div className="h-[80vh] md:h-[70vh] relative">
        {/* Controls panel */}
        <ControlsPanel
          planet1Size={planet1Size}
          setPlanet1Size={setPlanet1Size}
          planet2Size={planet2Size}
          setPlanet2Size={setPlanet2Size}
          impactAngle={impactAngle}
          setImpactAngle={setImpactAngle}
          impactVelocity={impactVelocity}
          setImpactVelocity={setImpactVelocity}
          collisionScenario={collisionScenario}
          setCollisionScenario={setCollisionScenario}
          isSimulationActive={isSimulationActive}
          setIsSimulationActive={setIsSimulationActive}
          resetSimulation={resetSimulation}
          isColliding={isColliding}
          collisionComplete={collisionComplete}
          isControlsOpen={isControlsOpen}
          setIsControlsOpen={setIsControlsOpen}
        />

        <div id="canvas-container" className="h-full w-full">
          <Canvas camera={{ position: [0, 20, 40], fov: 60 }}>
            <CollisionScene
              planet1Size={planet1Size}
              planet2Size={planet2Size}
              impactAngle={impactAngle}
              impactVelocity={impactVelocity}
              collisionScenario={collisionScenario}
              resetSimulation={resetTrigger}
              isSimulationActive={isSimulationActive}
              setIsColliding={setIsColliding}
              setCollisionComplete={setCollisionComplete}
            />
          </Canvas>
        </div>
      </div>

      {/* Visual separator */}
      <div className="h-4 bg-gradient-to-r from-red-900 via-orange-900 to-yellow-900"></div>

      {/* Scrollable content area */}
      <div className="overflow-y-auto bg-black py-8 px-4">
        <CollisionInfo />
      </div>
    </div>
  );
}
