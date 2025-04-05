"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

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
