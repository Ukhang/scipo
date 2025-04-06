"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ChevronDown, ChevronUp, Pause, Play, RotateCcw } from "lucide-react";

interface WeatherEffectsProps {
  atmosphereDensity: number;
  waterLevel: number;
  temperature: number;
}

interface VegetationGrowthProps {
  vegetation: number;
  waterLevel: number;
  temperature: number;
}

interface AtmosphericEffectsProps {
  atmosphereDensity: number;
  temperature: number;
  waterLevel: number;
}

interface TerraformingStageInfoProps {
  currentStage: number;
}

interface ParameterDisplayProps {
  atmosphereDensity: number;
  waterLevel: number;
  temperature: number;
  vegetation: number;
  oxygenLevel: number;
}

interface ControlsPanelProps {
  terraformingStage: number;
  atmosphereDensity: number;
  waterLevel: number;
  temperature: number;
  vegetation: number;
  oxygenLevel: number;
  isSimulationActive: boolean;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  toggleSimulation: () => void;
  resetSimulation: () => void;
  isControlsOpen: boolean;
  setIsControlsOpen: (isOpen: boolean) => void;
}

interface TerraformingInfoProps {}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({
  atmosphereDensity,
  waterLevel,
  temperature,
}) => {
  const rainRef = useRef<THREE.Points>(null);
  const showRain =
    atmosphereDensity > 0.5 &&
    waterLevel > 0.3 &&
    temperature > 0.3 &&
    temperature < 0.8;

  const { positions, velocities } = useMemo(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      velocities[i] = 0.1 + Math.random() * 0.2;
    }

    return { positions, velocities };
  }, []);

  useFrame((state, delta) => {
    if (!rainRef.current || !showRain) return;

    const positions = rainRef.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];
      const length = Math.sqrt(x * x + y * y + z * z);
      const normalizedX = x / length;
      const normalizedY = y / length;
      const normalizedZ = z / length;

      positions[i3] -= normalizedX * velocities[i] * delta * 10;
      positions[i3 + 1] -= normalizedY * velocities[i] * delta * 10;
      positions[i3 + 2] -= normalizedZ * velocities[i] * delta * 10;

      if (
        Math.sqrt(
          positions[i3] * positions[i3] +
            positions[i3 + 1] * positions[i3 + 1] +
            positions[i3 + 2] * positions[i3 + 2]
        ) < 10.5
      ) {
        const radius = 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
      }
    }

    rainRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!showRain) return null;

  return (
    <points ref={rainRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#8CBED6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

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

const TerraformingStageInfo: React.FC<TerraformingStageInfoProps> = ({
  currentStage,
}) => {
  const stages = [
    {
      name: "Barren Planet",
      description:
        "A lifeless, rocky world with no atmosphere or water. Extreme temperature variations and radiation make it inhospitable to life.",
      requirements:
        "Initial assessment of mineral resources and potential for terraforming.",
    },
    {
      name: "Atmosphere Generation",
      description:
        "Creating a basic atmosphere by releasing greenhouse gases from the planet's surface or importing gases from elsewhere.",
      requirements:
        "Factories to produce gases, orbital mirrors to increase temperature.",
    },
    {
      name: "Water Introduction",
      description:
        "Melting ice caps or redirecting comets to bring water to the planet's surface, forming the first oceans.",
      requirements:
        "Sufficient atmospheric pressure and temperature regulation.",
    },
    {
      name: "Temperature Regulation",
      description:
        "Stabilizing the planet's temperature through greenhouse gas management and orbital mirrors.",
      requirements:
        "Atmospheric composition monitoring and adjustment systems.",
    },
    {
      name: "Oxygen Generation",
      description:
        "Introducing algae and plants to begin producing oxygen through photosynthesis.",
      requirements:
        "Stable water cycle and protected habitats for initial plant life.",
    },
    {
      name: "Ecosystem Development",
      description:
        "Establishing diverse plant and animal life to create self-sustaining ecosystems.",
      requirements:
        "Oxygen-rich atmosphere, stable climate, and genetic engineering facilities.",
    },
    {
      name: "Human Habitation",
      description:
        "The planet is now ready for human settlement with breathable air, moderate temperatures, and sustainable ecosystems.",
      requirements:
        "Infrastructure for human colonies, agriculture, and resource management.",
    },
  ];

  const stageIndex = Math.min(Math.floor(currentStage * 6), 6);
  const stage = stages[stageIndex];
  const stageProgress = (currentStage * 6) % 1;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{stage.name}</h3>
        <span className="text-sm bg-blue-600 px-2 py-1 rounded">
          Stage {stageIndex + 1}/7
        </span>
      </div>
      <p className="text-gray-300 mb-3">{stage.description}</p>
      <div className="mb-2">
        <div className="text-sm text-gray-400 mb-1">Stage Progress</div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${stageProgress * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="text-sm bg-gray-700 p-2 rounded">
        <span className="font-semibold text-gray-300">Requirements:</span>{" "}
        {stage.requirements}
      </div>
    </div>
  );
};

const ParameterDisplay: React.FC<ParameterDisplayProps> = ({
  atmosphereDensity,
  waterLevel,
  temperature,
  vegetation,
  oxygenLevel,
}) => {
  const isHabitable =
    atmosphereDensity > 0.7 &&
    waterLevel > 0.6 &&
    temperature > 0.4 &&
    temperature < 0.7 &&
    vegetation > 0.6 &&
    oxygenLevel > 0.7;

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="text-sm text-gray-400 mb-1">Atmosphere</div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${atmosphereDensity * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs">
          <span>Thin</span>
          <span>Dense</span>
        </div>
      </div>
      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="text-sm text-gray-400 mb-1">Water</div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${waterLevel * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs">
          <span>Dry</span>
          <span>Oceans</span>
        </div>
      </div>
      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="text-sm text-gray-400 mb-1">Temperature</div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
          <div
            className={`h-2.5 rounded-full ${
              temperature < 0.4
                ? "bg-blue-600"
                : temperature > 0.7
                ? "bg-red-600"
                : "bg-green-600"
            }`}
            style={{ width: `${temperature * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs">
          <span>Cold</span>
          <span>Hot</span>
        </div>
      </div>
      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="text-sm text-gray-400 mb-1">Vegetation</div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
          <div
            className="bg-green-600 h-2.5 rounded-full"
            style={{ width: `${vegetation * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs">
          <span>Barren</span>
          <span>Lush</span>
        </div>
      </div>
      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="text-sm text-gray-400 mb-1">Oxygen</div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
          <div
            className="bg-cyan-500 h-2.5 rounded-full"
            style={{ width: `${oxygenLevel * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs">
          <span>None</span>
          <span>Breathable</span>
        </div>
      </div>
      <div className="bg-gray-800 p-3 rounded-lg">
        <div className="text-sm text-gray-400 mb-1">Habitability</div>
        <div
          className={`text-center font-bold mt-1 ${
            isHabitable ? "text-green-500" : "text-yellow-500"
          }`}
        >
          {isHabitable ? "HABITABLE" : "IN PROGRESS"}
        </div>
      </div>
    </div>
  );
};

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  terraformingStage,
  atmosphereDensity,
  waterLevel,
  temperature,
  vegetation,
  oxygenLevel,
  isSimulationActive,
  simulationSpeed,
  setSimulationSpeed,
  toggleSimulation,
  resetSimulation,
  isControlsOpen,
  setIsControlsOpen,
}) => {
  return (
    <div
      className={`absolute z-30 transition-all duration-300 ease-in-out left-0
        ${
          isControlsOpen
            ? "top-0 w-full md:w-96 bg-black/90 p-4 rounded-br-lg max-h-[80vh] overflow-y-auto"
            : "top-0 w-full md:w-96 bg-black/70 p-2 rounded-br-lg"
        }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-lg font-bold text-white">Terraforming Simulator</h1>
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
            Watch the transformation of a barren planet into a habitable world
            through terraforming.
          </p>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={toggleSimulation}
                className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSimulationActive ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={resetSimulation}
                className="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-700 text-white"
              >
                <RotateCcw size={18} />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white">Speed:</span>
              <div className="flex space-x-1">
                {[1, 2, 5, 10].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setSimulationSpeed(speed)}
                    className={`px-2 py-1 text-xs rounded-md ${
                      simulationSpeed === speed ? "bg-blue-600" : "bg-gray-700"
                    } text-white`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
          <TerraformingStageInfo currentStage={terraformingStage} />
          <ParameterDisplay
            atmosphereDensity={atmosphereDensity}
            waterLevel={waterLevel}
            temperature={temperature}
            vegetation={vegetation}
            oxygenLevel={oxygenLevel}
          />
          <p className="text-xs opacity-70 text-white mt-4">
            Use mouse to orbit, scroll to zoom
          </p>
        </div>
      )}
    </div>
  );
};
