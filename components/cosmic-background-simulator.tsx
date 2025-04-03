"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ChevronDown, ChevronUp } from "lucide-react";
import { createNoise3D } from "simplex-noise";

type CMBSphereProps = {
  resolution?: number;
  contrast?: number;
  colorScheme?: "thermal" | "planck" | "grayscale";
  seed?: number;
};

function CMBSphere({
  resolution = 512,
  contrast = 1,
  colorScheme = "thermal",
  seed = 1,
}: CMBSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(
    () =>
      generateCMBTexture({
        resolution,
        contrast,
        colorScheme,
        seed,
      }), // Pass the parameters as an object here
    [resolution, contrast, colorScheme, seed]
  );

  // Slow rotation for visual interest
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[10, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

type CMBTextureProps = {
  resolution?: number;
  contrast?: number;
  colorScheme?: "thermal" | "planck" | "grayscale";
  seed?: number;
};

function generateCMBTexture({
  resolution = 512,
  contrast = 1,
  colorScheme = "thermal",
  seed = 1,
}: CMBTextureProps) {
  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution / 2; // For equirectangular mapping

  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const noise3D = createNoise3D();

  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const u = x / canvas.width;
      const v = y / canvas.height;
      const theta = u * Math.PI * 2;
      const phi = v * Math.PI;

      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.sin(phi) * Math.sin(theta);
      const nz = Math.cos(phi);

      let noiseValue = 0;
      noiseValue += noise3D(nx * 1 * seed, ny * 1 * seed, nz * 1 * seed) * 0.5;
      noiseValue += noise3D(nx * 2 * seed, ny * 2 * seed, nz * 2 * seed) * 0.25;
      noiseValue +=
        noise3D(nx * 4 * seed, ny * 4 * seed, nz * 4 * seed) * 0.125;
      noiseValue +=
        noise3D(nx * 8 * seed, ny * 8 * seed, nz * 8 * seed) * 0.0625;

      noiseValue = noiseValue * 0.5 + 0.5;
      noiseValue = Math.pow(noiseValue, 1 / contrast);

      const color = getCMBColor(noiseValue, colorScheme);

      const index = (y * canvas.width + x) * 4;
      data[index] = color.r;
      data[index + 1] = color.g;
      data[index + 2] = color.b;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

type CMBColorScheme = "thermal" | "planck" | "grayscale";

function getCMBColor(value: number, scheme: CMBColorScheme) {
  switch (scheme) {
    case "thermal":
      return {
        r: Math.floor(value * 255 * 2 > 255 ? 255 : value * 255 * 2),
        g: Math.floor(value < 0.5 ? value * 255 * 2 : (1 - value) * 255 * 2),
        b: Math.floor(value < 0.5 ? 255 : 255 - (value - 0.5) * 255 * 2),
      };
    case "planck":
      return {
        r: Math.floor(value * 255),
        g: Math.floor(
          value < 0.5 ? value * 255 * 2 : 255 - (value - 0.5) * 255 * 2
        ),
        b: Math.floor(value < 0.3 ? value * 255 * 3 : 0),
      };
    case "grayscale":
      const gray = Math.floor(value * 255);
      return { r: gray, g: gray, b: gray };
    default:
      return { r: 0, g: 0, b: 0 };
  }
}

type ControlsPanelProps = {
  resolution: number;
  setResolution: (value: number) => void;
  contrast: number;
  setContrast: (value: number) => void;
  colorScheme: "thermal" | "planck" | "grayscale";
  setColorScheme: (value: "thermal" | "planck" | "grayscale") => void;
  seed: number;
  setSeed: (value: number) => void;
  isControlsOpen: boolean;
  setIsControlsOpen: (value: boolean) => void;
};

function ControlsPanel({
  resolution,
  setResolution,
  contrast,
  setContrast,
  colorScheme,
  setColorScheme,
  seed,
  setSeed,
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
        <h1 className="text-lg font-bold text-white">
          Cosmic Background Radiation
        </h1>
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
            Explore a visualization of the Cosmic Microwave Background (CMB)
            radiation, the oldest light in the universe.
          </p>

          <div>
            <label htmlFor="resolution" className="block mb-1 text-white">
              Resolution: {resolution}px
            </label>
            <input
              id="resolution"
              type="range"
              min="128"
              max="1024"
              step="128"
              value={resolution}
              onChange={(e) => setResolution(Number.parseInt(e.target.value))}
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
            <p className="text-xs text-gray-400 mt-1">
              Higher values may affect performance
            </p>
          </div>

          <div>
            <label htmlFor="contrast" className="block mb-1 text-white">
              Contrast: {contrast.toFixed(1)}
            </label>
            <input
              id="contrast"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={contrast}
              onChange={(e) => setContrast(Number.parseFloat(e.target.value))}
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-white">Color Scheme:</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setColorScheme("thermal")}
                className={`px-2 py-1 rounded-md text-sm ${
                  colorScheme === "thermal" ? "bg-blue-600" : "bg-gray-700"
                } text-white`}
              >
                Thermal
              </button>
              <button
                onClick={() => setColorScheme("planck")}
                className={`px-2 py-1 rounded-md text-sm ${
                  colorScheme === "planck" ? "bg-blue-600" : "bg-gray-700"
                } text-white`}
              >
                Planck
              </button>
              <button
                onClick={() => setColorScheme("grayscale")}
                className={`px-2 py-1 rounded-md text-sm ${
                  colorScheme === "grayscale" ? "bg-blue-600" : "bg-gray-700"
                } text-white`}
              >
                Grayscale
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="seed" className="block mb-1 text-white">
              Random Seed: {seed.toFixed(2)}
            </label>
            <input
              id="seed"
              type="range"
              min="0.5"
              max="5"
              step="0.01"
              value={seed}
              onChange={(e) => setSeed(Number.parseFloat(e.target.value))}
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
            <button
              onClick={() => setSeed(Math.random() * 4.5 + 0.5)}
              className="mt-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-white"
            >
              Randomize
            </button>
          </div>

          <p className="text-xs opacity-70 text-white">
            Use mouse to orbit, scroll to zoom
          </p>
        </div>
      )}
    </div>
  );
}

type TemperatureFluctuationGraphProps = {
    colorScheme: "thermal" | "planck" | "grayscale" | "default";
};

function TemperatureFluctuationGraph({
  colorScheme,
}: TemperatureFluctuationGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

    if (colorScheme === "thermal") {
      gradient.addColorStop(0, "blue");
      gradient.addColorStop(0.5, "green");
      gradient.addColorStop(1, "red");
    } else if (colorScheme === "planck") {
      gradient.addColorStop(0, "darkblue");
      gradient.addColorStop(0.3, "green");
      gradient.addColorStop(0.7, "yellow");
      gradient.addColorStop(1, "red");
    } else {
      gradient.addColorStop(0, "black");
      gradient.addColorStop(1, "white");
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 20, canvas.width, 30);

    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Colder (-200 μK)", 0, 15);
    ctx.textAlign = "right";
    ctx.fillText("Hotter (+200 μK)", canvas.width, 15);
  }, [colorScheme]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={70}
      className="w-full max-w-md mx-auto"
    />
  );
}

function CMBInfo() {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg mx-auto my-8 max-w-7xl">
      <h2 className="text-2xl font-bold mb-4">
        About the Cosmic Microwave Background
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is the CMB?</h3>
          <p className="mb-3">
            The Cosmic Microwave Background (CMB) is electromagnetic radiation
            that fills the universe, dating back to about 380,000 years after
            the Big Bang. It represents the oldest light in the universe that we
            can observe.
          </p>

          <div className="bg-black/50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Origin</h4>
            <p className="text-sm text-gray-300">
              In the early universe, everything was so hot and dense that
              photons (light particles) couldn't travel freely. As the universe
              expanded and cooled, protons and electrons combined to form
              neutral hydrogen atoms. This allowed photons to travel freely for
              the first time, creating the CMB that we observe today.
            </p>
          </div>

          <p>
            The CMB was accidentally discovered in 1965 by Arno Penzias and
            Robert Wilson, who detected unexpected microwave radiation that
            seemed to come from all directions in space. They were awarded the
            Nobel Prize in Physics in 1978 for this discovery, which provided
            strong evidence for the Big Bang theory.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">
            Temperature and Fluctuations
          </h3>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">Uniform Temperature</h4>
            <p className="text-sm text-gray-300">
              The CMB has an almost perfectly uniform temperature of 2.725
              Kelvin (-270.425°C), just slightly above absolute zero. This
              uniformity is remarkable, with variations of only about 1 part in
              100,000.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">Tiny Fluctuations</h4>
            <p className="text-sm text-gray-300">
              The tiny temperature fluctuations in the CMB (shown as different
              colors in the visualization) are incredibly important. They
              represent regions of slightly different density in the early
              universe, which eventually grew into the galaxies and large-scale
              structures we see today.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">The Horizon Problem</h4>
            <p className="text-sm text-gray-300">
              The remarkable uniformity of the CMB across the entire sky poses a
              puzzle: regions on opposite sides of the observable universe
              couldn't have been in causal contact with each other given the age
              of the universe. This "horizon problem" is one of the reasons
              scientists developed the theory of cosmic inflation.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Scientific Importance</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Evidence for the Big Bang</h4>
            <p className="text-sm text-gray-300">
              The CMB is often described as the "echo" or "afterglow" of the Big
              Bang. Its existence and properties provide strong evidence that
              the universe began in an extremely hot, dense state and has been
              expanding ever since.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Cosmic Parameters</h4>
            <p className="text-sm text-gray-300">
              Detailed measurements of the CMB allow scientists to determine
              fundamental properties of the universe, including its age (13.8
              billion years), geometry (flat), and composition (5% ordinary
              matter, 27% dark matter, 68% dark energy).
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Structure Formation</h4>
            <p className="text-sm text-gray-300">
              The pattern of temperature fluctuations in the CMB reveals the
              seeds of cosmic structure. These tiny variations in density
              eventually grew through gravitational attraction to form galaxies,
              galaxy clusters, and the cosmic web.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">CMB Observations</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">COBE Satellite (1989-1993)</h4>
            <p className="text-sm text-gray-300">
              The Cosmic Background Explorer was the first satellite to detect
              the tiny temperature fluctuations in the CMB. This discovery
              earned George Smoot and John Mather the 2006 Nobel Prize in
              Physics. COBE provided the first evidence that the early universe
              contained the seeds that would grow into the structures we see
              today.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Planck Satellite (2009-2013)</h4>
            <p className="text-sm text-gray-300">
              The Planck satellite provided the most detailed map of the CMB to
              date, with unprecedented precision. Its measurements refined our
              understanding of the universe's composition and supported the
              standard model of cosmology, including the existence of dark
              matter and dark energy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CosmicBackgroundSimulator() {
  // Simulation parameters
  const [resolution, setResolution] = useState(512);
  const [contrast, setContrast] = useState(1.0);
  const [colorScheme, setColorScheme] = useState<
    "thermal" | "planck" | "grayscale"
  >("thermal");
  const [seed, setSeed] = useState(1.0);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

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
          resolution={resolution}
          setResolution={setResolution}
          contrast={contrast}
          setContrast={setContrast}
          colorScheme={colorScheme}
          setColorScheme={setColorScheme}
          seed={seed}
          setSeed={setSeed}
          isControlsOpen={isControlsOpen}
          setIsControlsOpen={setIsControlsOpen}
        />

        <div id="canvas-container" className="h-full w-full">
          <Canvas camera={{ position: [0, 0, 0.1], fov: 70 }}>
            <CMBSphere
              resolution={resolution}
              contrast={contrast}
              colorScheme={colorScheme}
              seed={seed}
            />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              zoomSpeed={0.5}
              autoRotate={false}
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>
      </div>

      {/* Temperature scale */}
      <div className="bg-black py-4 px-6">
        <h3 className="text-white text-center mb-2">
          Temperature Fluctuations
        </h3>
        <TemperatureFluctuationGraph colorScheme={colorScheme} />
      </div>

      {/* Visual separator */}
      <div className="h-4 bg-gradient-to-r from-blue-900 via-purple-900 to-red-900"></div>

      {/* Scrollable content area */}
      <div className="overflow-y-auto bg-black py-8 px-4">
        <CMBInfo />
      </div>
    </div>
  );
}
