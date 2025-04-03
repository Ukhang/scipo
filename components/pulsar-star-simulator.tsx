"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Trail } from "@react-three/drei";
import * as THREE from "three";
import { ChevronDown, ChevronUp } from "lucide-react";

type EmissionBeamProps = {
  direction: [number, number, number];
  pulseFrequency: number;
  pulseIntensity: number;
  color: THREE.ColorRepresentation;
};

function EmissionBeam({
  direction,
  pulseFrequency,
  pulseIntensity,
  color,
}: EmissionBeamProps) {
  const beamRef = useRef<THREE.Mesh>(null);
  const pulseTimerRef = useRef(0);
  const [pulse, setPulse] = useState(false);

  // Update pulse state
  useFrame((state, delta) => {
    pulseTimerRef.current += delta;

    // Trigger pulse based on frequency
    if (pulseTimerRef.current > 1 / pulseFrequency) {
      setPulse(true);
      setTimeout(() => setPulse(false), 150); // Pulse duration
      pulseTimerRef.current = 0;
    }

    // Update beam scale based on pulse state
    if (beamRef.current) {
      const targetScale = pulse ? pulseIntensity : 0.2;
      beamRef.current.scale.x = THREE.MathUtils.lerp(
        beamRef.current.scale.x,
        targetScale,
        delta * 10
      );
      beamRef.current.scale.z = beamRef.current.scale.z =
        beamRef.current.scale.x;
    }
  });

  // Calculate position and rotation based on direction
  const position: [number, number, number] = [
    direction[0] * 1,
    direction[1] * 1,
    direction[2] * 1,
  ];
  const lookAt = new THREE.Vector3(...direction).multiplyScalar(10);

  return (
    <group position={position} lookAt={lookAt}>
      {/* Main beam */}
      <mesh ref={beamRef}>
        <cylinderGeometry args={[0.3, 0.8, 15, 16, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Beam trail effect */}
      <Trail
        width={1}
        length={5}
        color={color}
        attenuation={(width) => width * 0.5}
      >
        <mesh position={[0, 7, 0]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </Trail>
    </group>
  );
}

type ControlsPanelProps = {
  rotationSpeed: number;
  setRotationSpeed: (value: number) => void;
  magneticFieldAngle: number;
  setMagneticFieldAngle: (value: number) => void;
  pulseFrequency: number;
  setPulseFrequency: (value: number) => void;
  pulseIntensity: number;
  setPulseIntensity: (value: number) => void;
  isControlsOpen: boolean;
  setIsControlsOpen: (value: boolean) => void;
};

function ControlsPanel({
  rotationSpeed,
  setRotationSpeed,
  magneticFieldAngle,
  setMagneticFieldAngle,
  pulseFrequency,
  setPulseFrequency,
  pulseIntensity,
  setPulseIntensity,
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
        <h1 className="text-lg font-bold text-white">Pulsar Star Simulator</h1>
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
            Observe a rapidly spinning neutron star emitting pulses of radiation
            from its magnetic poles.
          </p>

          <div>
            <label htmlFor="rotation-speed" className="block mb-1 text-white">
              Rotation Speed: {rotationSpeed.toFixed(1)}x
            </label>
            <input
              id="rotation-speed"
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={rotationSpeed}
              onChange={(e) =>
                setRotationSpeed(Number.parseFloat(e.target.value))
              }
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
          </div>

          <div>
            <label htmlFor="magnetic-angle" className="block mb-1 text-white">
              Magnetic Field Angle:{" "}
              {((magneticFieldAngle * 180) / Math.PI).toFixed(0)}°
            </label>
            <input
              id="magnetic-angle"
              type="range"
              min="0"
              max={Math.PI / 2}
              step="0.01"
              value={magneticFieldAngle}
              onChange={(e) =>
                setMagneticFieldAngle(Number.parseFloat(e.target.value))
              }
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
          </div>

          <div>
            <label htmlFor="pulse-frequency" className="block mb-1 text-white">
              Pulse Frequency: {pulseFrequency.toFixed(1)} Hz
            </label>
            <input
              id="pulse-frequency"
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={pulseFrequency}
              onChange={(e) =>
                setPulseFrequency(Number.parseFloat(e.target.value))
              }
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
          </div>

          <div>
            <label htmlFor="pulse-intensity" className="block mb-1 text-white">
              Pulse Intensity: {pulseIntensity.toFixed(1)}
            </label>
            <input
              id="pulse-intensity"
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={pulseIntensity}
              onChange={(e) =>
                setPulseIntensity(Number.parseFloat(e.target.value))
              }
              className="w-full bg-gray-700 rounded-lg appearance-none h-2"
            />
          </div>

          <p className="text-xs opacity-70 text-white">
            Use mouse to orbit, scroll to zoom (in 3D area only)
          </p>
        </div>
      )}
    </div>
  );
}

function PulsarInfo() {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg mx-auto my-8 max-w-7xl">
      <h2 className="text-2xl font-bold mb-4">About Pulsar Stars</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">What is a Pulsar?</h3>
          <p className="mb-3">
            A pulsar is a highly magnetized, rotating neutron star that emits
            beams of electromagnetic radiation from its magnetic poles. These
            beams sweep across the sky like a lighthouse as the star rotates,
            which can be detected as regular pulses of radiation when they point
            toward Earth.
          </p>

          <div className="bg-black/50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Formation</h4>
            <p className="text-sm text-gray-300">
              Pulsars form when massive stars (8-20 solar masses) explode as
              supernovae. The core collapses under gravity, compressing protons
              and electrons into neutrons. This creates an incredibly dense
              neutron star, where a teaspoon of material would weigh billions of
              tons on Earth.
            </p>
          </div>

          <p>
            The first pulsar was discovered in 1967 by Jocelyn Bell Burnell and
            Antony Hewish. Initially, the regular pulses were so precise that
            they were nicknamed "LGM-1" (Little Green Men) as scientists briefly
            considered they might be signals from an alien civilization.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">
            Physical Characteristics
          </h3>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">Rapid Rotation</h4>
            <p className="text-sm text-gray-300">
              Pulsars rotate extremely rapidly, with periods ranging from
              milliseconds to seconds. This rapid rotation comes from the
              conservation of angular momentum during the collapse of the
              progenitor star. The fastest known pulsar, PSR J1748-2446ad,
              rotates at 716 times per second!
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">Strong Magnetic Fields</h4>
            <p className="text-sm text-gray-300">
              Pulsars have incredibly strong magnetic fields, typically around
              10⁸ to 10¹⁵ times stronger than Earth's. The magnetic field is not
              aligned with the rotation axis, which is why the radiation beams
              sweep through space as the star rotates.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg mb-3">
            <h4 className="font-medium">Size and Density</h4>
            <p className="text-sm text-gray-300">
              Despite having masses of about 1.4 solar masses, pulsars are only
              about 20 kilometers in diameter. Their density is comparable to
              that of an atomic nucleus, making them among the densest objects
              known in the universe.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Types of Pulsars</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Rotation-Powered Pulsars</h4>
            <p className="text-sm text-gray-300">
              The most common type, powered by the loss of rotational energy.
              They gradually slow down over time as they convert rotational
              energy into radiation. The Crab Pulsar is a famous example, formed
              in a supernova observed in 1054 CE.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Millisecond Pulsars</h4>
            <p className="text-sm text-gray-300">
              These pulsars rotate hundreds of times per second. They are
              thought to be "recycled" pulsars that have been spun up by
              accreting matter from a companion star. They are extremely stable
              rotators, making them excellent cosmic clocks.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Magnetars</h4>
            <p className="text-sm text-gray-300">
              Pulsars with extraordinarily strong magnetic fields, up to 1000
              times stronger than ordinary pulsars. They can produce powerful
              gamma-ray flares and are associated with soft gamma repeaters and
              anomalous X-ray pulsars.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">Scientific Importance</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Tests of General Relativity</h4>
            <p className="text-sm text-gray-300">
              The binary pulsar system PSR B1913+16 (Hulse-Taylor binary)
              provided the first indirect evidence for gravitational waves, as
              predicted by Einstein's theory of general relativity. The
              discoverers, Russell Hulse and Joseph Taylor, were awarded the
              Nobel Prize in Physics in 1993 for this work.
            </p>
          </div>

          <div className="bg-black/50 p-4 rounded-lg">
            <h4 className="font-medium mb-1">Interstellar Navigation</h4>
            <p className="text-sm text-gray-300">
              Pulsars can serve as cosmic lighthouses for spacecraft navigation.
              NASA's NICER mission is developing a pulsar-based navigation
              system that could one day guide spacecraft through the solar
              system with unprecedented accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
