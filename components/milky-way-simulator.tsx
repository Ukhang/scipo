"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { ChevronDown, ChevronUp, Maximize, Minimize } from "lucide-react";

type GalaxyParticlesProps = {
  starCount: number;
  showArms: boolean;
  showDust: boolean;
  showBulge: boolean;
  showHalo: boolean;
  colorIntensity: number;
  rotationSpeed: number;
};

const GALAXY_RADIUS = 100;
const GALAXY_THICKNESS = 15;
const SPIRAL_ARMS = 5;
const SPIRAL_REVOLUTIONS = 2.3;
const SPIRAL_THICKNESS = 0.5;

function GalaxyParticles({
  starCount,
  showArms,
  showDust,
  showBulge,
  showHalo,
  colorIntensity,
  rotationSpeed,
}: GalaxyParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  // Generate galaxy geometry
  const { positions, colors, dustPositions, dustColors } = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const dustPositions = new Float32Array(starCount * 0.3 * 3); // 30% of stars are dust
    const dustColors = new Float32Array(starCount * 0.3 * 3);

    let dustIndex = 0;

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;

      // Determine if this star is in the bulge, arms, or halo
      const randVal = Math.random();
      let x, y, z, r, theta;

      // Central bulge (25% of stars)
      if (randVal < 0.25 && showBulge) {
        r = Math.pow(Math.random(), 2) * GALAXY_RADIUS * 0.15;
        theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi) * 0.5; // Flatten slightly

        // Bulge stars are more yellow/red
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i3 + 2] = 0.5 * Math.random();
      }
      // Spiral arms (60% of stars)
      else if ((randVal < 0.85 || !showHalo) && showArms) {
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
      }
      // Halo stars (15% of stars)
      else if (showHalo) {
        r = GALAXY_RADIUS * (0.5 + Math.random() * 0.5);
        theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);

        colors[i3] = 0.8 + Math.random() * 0.2;
        colors[i3 + 1] = 0.6 + Math.random() * 0.3;
        colors[i3 + 2] = 0.6 + Math.random() * 0.3;
      }
      // Fallback (should rarely happen)
      else {
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
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.5} vertexColors transparent opacity={0.8} sizeAttenuation />
      </points>

      {showDust && (
        <points ref={dustRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={dustPositions.length / 3}
              array={dustPositions}
              itemSize={3}
            />
            <bufferAttribute attach="attributes-color" count={dustColors.length / 3} array={dustColors} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={1.5} vertexColors transparent opacity={0.3} sizeAttenuation />
        </points>
      )}
    </group>
  );
}

function CentralBlackHole() {
  return (
    <group>
      {/* Accretion disk */}
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

      {/* Central glow */}
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#FFCC88" transparent opacity={0.8} />
      </mesh>

      {/* Light source */}
      <pointLight position={[0, 0, 0]} intensity={2} distance={50} decay={2} color="#FFCC88" />
    </group>
  )
}

function createAccretionDiskTexture() {
  const size = 512
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext("2d")
  if (!context) return new THREE.Texture()

  // Create radial gradient
  const gradient = context.createRadialGradient(size / 2, size / 2, size / 8, size / 2, size / 2, size / 2)

  gradient.addColorStop(0, "rgba(255, 220, 180, 0.8)")
  gradient.addColorStop(0.4, "rgba(255, 160, 120, 0.6)")
  gradient.addColorStop(0.8, "rgba(200, 80, 80, 0.3)")
  gradient.addColorStop(1, "rgba(100, 30, 30, 0)")

  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  // Add some random bright spots
  for (let i = 0; i < 100; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = ((Math.random() * 0.3 + 0.2) * size) / 2
    const x = size / 2 + Math.cos(angle) * radius
    const y = size / 2 + Math.sin(angle) * radius
    const brightness = Math.random() * 100 + 155

    context.fillStyle = `rgba(${brightness}, ${brightness * 0.8}, ${brightness * 0.6}, 0.8)`
    context.beginPath()
    context.arc(x, y, Math.random() * 2 + 1, 0, Math.PI * 2)
    context.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true

  return texture
}

type CameraControllerProps = {
  viewMode: "top" | "side" | "inside" | "default";
  setViewMode: (mode: string) => void;
};

function CameraController({
  viewMode,
  setViewMode,
}: CameraControllerProps) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const startPosition = useRef(new THREE.Vector3());
  const transitionStartTime = useRef(0);
  const isTransitioning = useRef(false);
  const TRANSITION_DURATION = 1000; // ms

  // Update target position on viewMode change
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

  // Animate camera movement
  useFrame(() => {
    if (isTransitioning.current) {
      const elapsed = Date.now() - transitionStartTime.current;
      const progress = Math.min(elapsed / TRANSITION_DURATION, 1);

      // Smooth ease in-out
      const easeProgress =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      camera.position.lerpVectors(
        startPosition.current,
        targetPosition.current,
        easeProgress
      );

      if (progress >= 1) {
        isTransitioning.current = false;
      }
    }

    // Keep camera looking at scene center
    camera.lookAt(0, 0, 0);
  });

  return null;
}

type ControlsPanelProps = {
  starCount: number;
  setStarCount: (value: number) => void;
  showArms: boolean;
  setShowArms: (value: boolean) => void;
  showDust: boolean;
  setShowDust: (value: boolean) => void;
  showBulge: boolean;
  setShowBulge: (value: boolean) => void;
  showHalo: boolean;
  setShowHalo: (value: boolean) => void;
  colorIntensity: number;
  setColorIntensity: (value: number) => void;
  rotationSpeed: number;
  setRotationSpeed: (value: number) => void;
  viewMode: string;
  setViewMode: (value: string) => void;
  isControlsOpen: boolean;
  setIsControlsOpen: (value: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
};

function ControlsPanel({
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
}: ControlsPanelProps) {
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Detect exiting fullscreen via ESC key or browser controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [setIsFullscreen]);

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
        <h1 className="text-lg font-bold text-white">
          Milky Way Galaxy Simulator
        </h1>
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
            aria-label={
              isControlsOpen ? "Collapse controls" : "Expand controls"
            }
          >
            {isControlsOpen ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Controls content */}
      {isControlsOpen && (
        <div className="space-y-4">
          {/* Example control: Star Count */}
          <div className="flex flex-col">
            <label className="text-white mb-1">Star Count</label>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={10000}
              value={starCount}
              onChange={(e) => setStarCount(Number(e.target.value))}
            />
            <span className="text-white">{starCount.toLocaleString()}</span>
          </div>

          {/* Add more controls as needed */}
          {/* Show Spiral Arms */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showArms}
              onChange={(e) => setShowArms(e.target.checked)}
            />
            <label className="text-white">Show Spiral Arms</label>
          </div>

          {/* Show Dust */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showDust}
              onChange={(e) => setShowDust(e.target.checked)}
            />
            <label className="text-white">Show Dust</label>
          </div>

          {/* Show Bulge */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showBulge}
              onChange={(e) => setShowBulge(e.target.checked)}
            />
            <label className="text-white">Show Bulge</label>
          </div>

          {/* Show Halo */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showHalo}
              onChange={(e) => setShowHalo(e.target.checked)}
            />
            <label className="text-white">Show Halo</label>
          </div>

          {/* Color Intensity */}
          <div className="flex flex-col">
            <label className="text-white mb-1">Color Intensity</label>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={colorIntensity}
              onChange={(e) => setColorIntensity(Number(e.target.value))}
            />
            <span className="text-white">{colorIntensity.toFixed(1)}</span>
          </div>

          {/* Rotation Speed */}
          <div className="flex flex-col">
            <label className="text-white mb-1">Rotation Speed</label>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(Number(e.target.value))}
            />
            <span className="text-white">{rotationSpeed.toFixed(1)}</span>
          </div>

          {/* View Mode */}
          <div className="flex flex-col">
            <label className="text-white mb-1">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="bg-gray-800 text-white rounded-md p-1"
            >
              <option value="galactic">Galactic</option>
              <option value="edge">Edge-on</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
