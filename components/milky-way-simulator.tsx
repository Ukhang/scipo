"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { ChevronDown, ChevronUp, Maximize, Minimize } from "lucide-react";

// Define prop types for each component
interface GalaxyParticlesProps {
  starCount: number;
  showArms: boolean;
  showDust: boolean;
  showBulge: boolean;
  showHalo: boolean;
  colorIntensity: number;
  rotationSpeed: number;
}

interface CameraControllerProps {
  viewMode: string;
  setViewMode: (mode: string) => void;
}

interface ControlsPanelProps {
  starCount: number;
  setStarCount: (count: number) => void;
  showArms: boolean;
  setShowArms: (show: boolean) => void;
  showDust: boolean;
  setShowDust: (show: boolean) => void;
  showBulge: boolean;
  setShowBulge: (show: boolean) => void;
  showHalo: boolean;
  setShowHalo: (show: boolean) => void;
  colorIntensity: number;
  setColorIntensity: (intensity: number) => void;
  rotationSpeed: number;
  setRotationSpeed: (speed: number) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  isControlsOpen: boolean;
  setIsControlsOpen: (isOpen: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
}

// Galaxy parameters
const GALAXY_RADIUS = 100;
const GALAXY_THICKNESS = 15;
const SPIRAL_ARMS = 5;
const SPIRAL_REVOLUTIONS = 2.3;
const SPIRAL_THICKNESS = 0.5;

// Star particle system component
const GalaxyParticles: React.FC<GalaxyParticlesProps> = ({
  starCount,
  showArms,
  showDust,
  showBulge,
  showHalo,
  colorIntensity,
  rotationSpeed,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  const { positions, colors, dustPositions, dustColors } = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const dustPositions = new Float32Array(starCount * 0.3 * 3);
    const dustColors = new Float32Array(starCount * 0.3 * 3);

    let dustIndex = 0;

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;

      const randVal = Math.random();
      let x: number, y: number, z: number, r: number, theta: number;

      if (randVal < 0.25 && showBulge) {
        r = Math.pow(Math.random(), 2) * GALAXY_RADIUS * 0.15;
        theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi) * 0.5;

        colors[i3] = 1.0;
        colors[i3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i3 + 2] = 0.5 * Math.random();
      } else if ((randVal < 0.85 || !showHalo) && showArms) {
        r = Math.pow(Math.random(), 2) * GALAXY_RADIUS;
        const armAngle = (Math.floor(Math.random() * SPIRAL_ARMS) / SPIRAL_ARMS) * Math.PI * 2;
        theta = armAngle + (r / GALAXY_RADIUS) * SPIRAL_REVOLUTIONS * Math.PI * 2;
        theta += (Math.random() - 0.5) * SPIRAL_THICKNESS * (1 - r / GALAXY_RADIUS);

        x = r * Math.cos(theta);
        y = r * Math.sin(theta);
        const thickness = GALAXY_THICKNESS * (1 - (r / GALAXY_RADIUS) * 0.8);
        z = (Math.random() - 0.5) * thickness;

        const distanceRatio = r / GALAXY_RADIUS;
        if (distanceRatio > 0.8) {
          colors[i3] = 0.7 * Math.random();
          colors[i3 + 1] = 0.7 * Math.random();
          colors[i3 + 2] = 0.9 + Math.random() * 0.1;
        } else if (distanceRatio > 0.5) {
          colors[i3] = 0.9 + Math.random() * 0.1;
          colors[i3 + 1] = 0.9 + Math.random() * 0.1;
          colors[i3 + 2] = 0.7 * Math.random();
        } else {
          colors[i3] = 0.9 + Math.random() * 0.1;
          colors[i3 + 1] = 0.7 * Math.random();
          colors[i3 + 2] = 0.4 * Math.random();
        }

        if (Math.random() < 0.1 && dustIndex < dustPositions.length / 3 && showDust) {
          const di3 = dustIndex * 3;
          dustPositions[di3] = x;
          dustPositions[di3 + 1] = y;
          dustPositions[di3 + 2] = z;

          dustColors[di3] = 0.5 + Math.random() * 0.2;
          dustColors[di3 + 1] = 0.3 + Math.random() * 0.1;
          dustColors[di3 + 2] = 0.2 + Math.random() * 0.1;

          dustIndex++;
        }
      } else if (showHalo) {
        r = GALAXY_RADIUS * (0.5 + Math.random() * 0.5);
        theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);

        colors[i3] = 0.8 + Math.random() * 0.2;
        colors[i3 + 1] = 0.6 + Math.random() * 0.3;
        colors[i3 + 2] = 0.6 + Math.random() * 0.3;
      } else {
        x = (Math.random() - 0.5) * GALAXY_RADIUS * 2;
        y = (Math.random() - 0.5) * GALAXY_RADIUS * 2;
        z = (Math.random() - 0.5) * GALAXY_THICKNESS;

        colors[i3] = Math.random();
        colors[i3 + 1] = Math.random();
        colors[i3 + 2] = Math.random();
      }

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      colors[i3] *= colorIntensity;
      colors[i3 + 1] *= colorIntensity;
      colors[i3 + 2] *= colorIntensity;
    }

    return { positions, colors, dustPositions, dustColors };
  }, [starCount, showArms, showDust, showBulge, showHalo, colorIntensity]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05 * rotationSpeed;
    }
    if (dustRef.current) {
      dustRef.current.rotation.y += delta * 0.05 * rotationSpeed;
    }
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.5} vertexColors transparent opacity={0.8} sizeAttenuation />
      </points>

      {showDust && (
        <points ref={dustRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dustPositions, 3]} />
            <bufferAttribute attach="attributes-color" args={[dustColors, 3]} />
          </bufferGeometry>
          <pointsMaterial size={1.5} vertexColors transparent opacity={0.3} sizeAttenuation />
        </points>
      )}
    </group>
  );
};

// Central black hole effect
const CentralBlackHole: React.FC = () => {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 5, 64]} />
        <meshBasicMaterial
          color="#FF8060"
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
          map={createAccretionDiskTexture()}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#FFCC88" transparent opacity={0.8} />
      </mesh>

      <pointLight position={[0, 0, 0]} intensity={2} distance={50} decay={2} color="#FFCC88" />
    </group>
  );
};

// Create a texture for the accretion disk
function createAccretionDiskTexture(): THREE.Texture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) return new THREE.Texture();

  const gradient = context.createRadialGradient(size / 2, size / 2, size / 8, size / 2, size / 2, size / 2);

  gradient.addColorStop(0, "rgba(255, 220, 180, 0.8)");
  gradient.addColorStop(0.4, "rgba(255, 160, 120, 0.6)");
  gradient.addColorStop(0.8, "rgba(200, 80, 80, 0.3)");
  gradient.addColorStop(1, "rgba(100, 30, 30, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  for (let i = 0; i < 100; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = ((Math.random() * 0.3 + 0.2) * size) / 2;
    const x = size / 2 + Math.cos(angle) * radius;
    const y = size / 2 + Math.sin(angle) * radius;
    const brightness = Math.random() * 100 + 155;

    context.fillStyle = `rgba(${brightness}, ${brightness * 0.8}, ${brightness * 0.6}, 0.8)`;
    context.beginPath();
    context.arc(x, y, Math.random() * 2 + 1, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

// Camera controller
const CameraController: React.FC<CameraControllerProps> = ({ viewMode, setViewMode }) => {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const startPosition = useRef(new THREE.Vector3());
  const transitionStartTime = useRef(0);
  const isTransitioning = useRef(false);
  const TRANSITION_DURATION = 1000;

  useEffect(() => {
    startPosition.current.copy(camera.position);
    transitionStartTime.current = Date.now();
    isTransitioning.current = true;

    switch (viewMode) {
      case "top":
        targetPosition.current.set(0, 150, 0);
        break;
      case "side":
        targetPosition.current.set(150, 20, 0);
        break;
      case "inside":
        targetPosition.current.set(70, 5, 0);
        break;
      default:
        targetPosition.current.set(120, 80, 80);
    }
  }, [viewMode, camera]);

  useFrame(() => {
    if (isTransitioning.current) {
      const elapsed = Date.now() - transitionStartTime.current;
      const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
      const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      camera.position.lerpVectors(startPosition.current, targetPosition.current, easeProgress);

      if (progress >= 1) {
        isTransitioning.current = false;
      }
    }

    camera.lookAt(0, 0, 0);
  });

  return null;
};

// Controls panel component
const ControlsPanel: React.FC<ControlsPanelProps> = ({
  starCount,
  setStarCount,
  showArms,
  setShowArms,
  showDust,
  setShowDust,
  showBulge,
  setShowBulge,
  showHalo,
  setShowHalo,
  colorIntensity,
  setColorIntensity,
  rotationSpeed,
  setRotationSpeed,
  viewMode,
  setViewMode,
  isControlsOpen,
  setIsControlsOpen,
  isFullscreen,
  setIsFullscreen,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

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
        <h1 className="text-lg font-bold text-white">Milky Way Galaxy Simulator</h1>
        <div className="flex space-x-2">
          <button
            onClick={toggleFullscreen}
            className="p-1 bg-gray-800 rounded-md text-white"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <button
            onClick={() => setIsControlsOpen(!isControlsOpen)}
            className="p-1 bg-gray-800 rounded-md text-white"
            aria-label={isControlsOpen ? "Collapse controls" : "Expand controls"}
          >
            {isControlsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isControlsOpen && (
        <div className="space-y-4">
          <p className="text-white mb-4">
            Explore a 3D model of our Milky Way galaxy with its spiral arms, central bulge, and stellar halo.
          </p>

          <div>
            <label htmlFor="view-mode" className="block mb-1 text-white">
              View Mode:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewMode("default")}
                className={`px-2 py-1 rounded-md text-sm ${viewMode === "default" ? "bg-blue-600" : "bg-gray-700"} text-white`}
              >
                Default
              </button>
              <button
                onClick={() => setViewMode("top")}
                className={`px-2 py-1 rounded-md text-sm ${viewMode === "top" ? "bg-blue-600" : "bg-gray-700"} text-white`}
              >
                Top Down
              </button>
              <button
                onClick={() => setViewMode("side")}
                className={`px-2 py-1 rounded-md text-sm ${viewMode === "side" ? "bg-blue-600" : "bg-gray-700"} text-white`}
              >
                Edge On
              </button>
              <button
                onClick={() => setViewMode("inside")}
                className={`px-2 py-1 rounded-md text-sm ${viewMode === "inside" ? "bg-blue-600" : "bg-gray-700"} text-white`}
              >
                Inside Arm
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="star-count" className="block mb-1 text-white">
              Star Count: {starCount.toLocaleString()}
            </label>
            <input
              id="star-count"
              type="range"
              min="10000"
              max="100000"
              step="5000"
              value={starCount}
              onChange={(e) => setStarCount(Number.parseInt(e.target.value))}
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
            <p className="text-xs text-gray-400 mt-1">Higher values may affect performance</p>
          </div>

          <div>
            <label htmlFor="rotation-speed" className="block mb-1 text-white">
              Rotation Speed: {rotationSpeed.toFixed(1)}x
            </label>
            <input
              id="rotation-speed"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(Number.parseFloat(e.target.value))}
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
          </div>

          <div>
            <label htmlFor="color-intensity" className="block mb-1 text-white">
              Star Brightness: {colorIntensity.toFixed(1)}
            </label>
            <input
              id="color-intensity"
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={colorIntensity}
              onChange={(e) => setColorIntensity(Number.parseFloat(e.target.value))}
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-white">Galaxy Components:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowArms(!showArms)}
                className={`px-2 py-1 rounded-md text-sm ${showArms ? "bg-blue-600" : "bg-gray-700"} text-white`}
              >
                {showArms ? "Hide Spiral Arms" : "Show Spiral Arms"}
              </button>
              <button
                onClick={() => setShowBulge(!showBulge)}
                className={`px-2 py-1 rounded-md text-sm ${showBulge ? "bg-blue-600" : "bg-gray-700"} text-white`}
              >
                {showBulge ? "Hide Central Bulge" : "Show Central Bulge"}
              </button>
              <button
                onClick={() => setShowHalo(!showHalo)}
                className={`px-2 py-1 rounded-md text-sm ${showHalo ? "bg-blue-600" : "bg-gray-700"} text-white`}
              >
                {showHalo ? "Hide Stellar Halo" : "Show Stellar Halo"}
              </button>
              <button
                onClick={() => setShowDust(!showDust)}
                className={`px-2 py-1 rounded-md text-sm ${showDust ? "bg-blue-600" : "bg-gray-700"} text-white`}
              >
                {showDust ? "Hide Dust Lanes" : "Show Dust Lanes"}
              </button>
            </div>
          </div>

          <p className="text-xs opacity-70 text-white">Use mouse to orbit, scroll to zoom</p>
        </div>
      )}
    </div>
  );
};

// Educational content about the Milky Way
const MilkyWayInfo: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg mx-auto my-8 max-w-7xl">
      <h2 className="text-2xl font-bold mb-4">About the Milky Way Galaxy</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Structure of Our Galaxy</h3>
          <p className="mb-3">
            The Milky Way is a barred spiral galaxy with a diameter of about 100,000-200,000 light-years. It contains
            between 100-400 billion stars and at least that many planets. The Solar System is located about 27,000
            light-years from the Galactic Center, on the inner edge of the Orion Arm.
          </p>

          <div className="bg-black/50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Major Components</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
              <li>
                <span className="font-semibold text-white">Spiral Arms</span>: The disk contains most of the galaxy's
                stars, organized into spiral arms. These arms are regions of higher density where star formation is
                active.
              </li>
              <li>
                <span className="font-semibold text-white">Central Bulge</span>: A dense, spherical concentration of
                stars at the center of the galaxy, containing mostly older stars.
              </li>
              <li>
                <span className="font-semibold text-white">Galactic Bar</span>: An elongated structure of stars that
                extends from the central bulge and connects to the spiral arms.
              </li>
              <li>
                <span className="font-semibold text-white">Stellar Halo</span>: A sparse, roughly spherical population
                of stars and globular clusters that surrounds the disk.
              </li>
              <li>
                <span className="font-semibold text-white">Dark Matter Halo</span>: An invisible component that extends
                well beyond the visible galaxy and makes up most of its mass.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">The Galactic Center</h3>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">Supermassive Black Hole</h4>
            <p className="text-sm text-gray-300">
              At the very center of our galaxy lies Sagittarius A*, a supermassive black hole with a mass of about 4
              million times that of our Sun. It's surrounded by a dense cluster of stars and gas clouds. The first image
              of Sagittarius A* was captured by the Event Horizon Telescope and released in 2022.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">Central Molecular Zone</h4>
            <p className="text-sm text-gray-300">
              The inner few hundred light-years of the galaxy contain a dense concentration of molecular gas, with
              active star formation and numerous massive stars. This region is obscured at visible wavelengths by
              interstellar dust but can be observed in infrared and radio wavelengths.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">Fermi Bubbles</h4>
            <p className="text-sm text-gray-300">
              Extending above and below the galactic center are two enormous bubbles of high-energy gamma-ray emission,
              discovered by the Fermi Gamma-ray Space Telescope. These "Fermi Bubbles" extend about 25,000 light-years
              from the center and may be the result of past activity from the central black hole.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Star Types and Distribution</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Population I Stars</h4>
            <p className="text-sm text-gray-300">
              Young, metal-rich stars found primarily in the spiral arms. These include hot, blue O and B stars that
              illuminate the spiral arms, making them visible. These stars formed relatively recently from gas enriched
              by previous generations of stars.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Population II Stars</h4>
            <p className="text-sm text-gray-300">
              Older, metal-poor stars found mainly in the galactic bulge and halo. These stars formed early in the
              galaxy's history when the interstellar medium contained fewer heavy elements. Globular clusters are
              collections of these ancient stars.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Interstellar Medium</h4>
            <p className="text-sm text-gray-300">
              The space between stars is not empty but filled with gas and dust. Dense regions of this material form
              dark dust lanes visible along the spiral arms. These dust clouds are the birthplaces of new stars,
              continuing the cycle of stellar evolution.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">Our Place in the Galaxy</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">The Solar System's Location</h4>
            <p className="text-sm text-gray-300">
              Our Solar System is located about 27,000 light-years from the galactic center, in what's called the Orion
              Arm or Local Spur. This is a relatively minor spiral arm between the larger Perseus and Sagittarius Arms.
              We're slightly above the galactic plane, in a relatively quiet neighborhood with a moderate density of
              stars.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Galactic Motion</h4>
            <p className="text-sm text-gray-300">
              The Sun orbits the center of the galaxy at a speed of about 220 km/s (490,000 mph), taking approximately
              225-250 million years to complete one orbit. This period is known as a "galactic year." Since the
              formation of the Solar System about 4.6 billion years ago, we've completed about 20 galactic orbits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MilkyWaySimulator: React.FC = () => {
  const [starCount, setStarCount] = useState<number>(50000);
  const [showArms, setShowArms] = useState<boolean>(true);
  const [showDust, setShowDust] = useState<boolean>(true);
  const [showBulge, setShowBulge] = useState<boolean>(true);
  const [showHalo, setShowHalo] = useState<boolean>(true);
  const [colorIntensity, setColorIntensity] = useState<number>(1.0);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<string>("default");
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsControlsOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className="w-full min-h-screen bg-black flex flex-col">
      <div className="h-[80vh] md:h-[70vh] relative">
        <ControlsPanel
          starCount={starCount}
          setStarCount={setStarCount}
          showArms={showArms}
          setShowArms={setShowArms}
          showDust={showDust}
          setShowDust={setShowDust}
          showBulge={showBulge}
          setShowBulge={setShowBulge}
          showHalo={showHalo}
          setShowHalo={setShowHalo}
          colorIntensity={colorIntensity}
          setColorIntensity={setColorIntensity}
          rotationSpeed={rotationSpeed}
          setRotationSpeed={setRotationSpeed}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isControlsOpen={isControlsOpen}
          setIsControlsOpen={setIsControlsOpen}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
        />

        <div id="canvas-container" className="h-full w-full">
          <Canvas camera={{ position: [120, 80, 80], fov: 60 }}>
            <CameraController viewMode={viewMode} setViewMode={setViewMode} />
            <ambientLight intensity={0.1} />
            <Stars radius={300} depth={100} count={2000} factor={4} saturation={0} fade speed={1} />
            <GalaxyParticles
              starCount={starCount}
              showArms={showArms}
              showDust={showDust}
              showBulge={showBulge}
              showHalo={showHalo}
              colorIntensity={colorIntensity}
              rotationSpeed={rotationSpeed}
            />
            <CentralBlackHole />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={10}
              maxDistance={300}
              zoomSpeed={0.5}
            />
          </Canvas>
        </div>
      </div>

      <div className="h-4 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900"></div>
      <div className="overflow-y-auto bg-black py-8 px-4">
        <MilkyWayInfo />
      </div>
    </div>
  );
};

export default MilkyWaySimulator;