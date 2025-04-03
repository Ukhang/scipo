"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ChevronDown, ChevronUp } from "lucide-react";
import { createNoise3D } from "simplex-noise";

type TemperatureFluctuationGraphProps = {
  colorScheme: "thermal" | "planck" | "default";
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
