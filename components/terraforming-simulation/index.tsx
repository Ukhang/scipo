"use client";

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";
import Planet from "./Planet";
import WeatherEffects from "./WeatherEffects";
import VegetationGrowth from "./VegetationGrowth";
import AtmosphericEffects from "./AtmosphericEffects";
import ControlsPanel from "./ControlsPanel";
import TerraformingInfo from "./TerraformingInfo";

const TerraformingSimulator: React.FC = () => {
  const [terraformingStage, setTerraformingStage] = useState<number>(0);
  const [atmosphereDensity, setAtmosphereDensity] = useState<number>(0);
  const [waterLevel, setWaterLevel] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0.2);
  const [vegetation, setVegetation] = useState<number>(0);
  const [oxygenLevel, setOxygenLevel] = useState<number>(0);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isSimulationActive) return;

    const interval = setInterval(() => {
      setTerraformingStage((prev) =>
        Math.min(prev + 0.0001 * simulationSpeed, 1)
      );
      setAtmosphereDensity((prev) => {
        const target = Math.min(terraformingStage * 1.2, 1);
        return prev + (target - prev) * 0.01 * simulationSpeed;
      });
      setTemperature((prev) => {
        const target = 0.2 + atmosphereDensity * 0.8;
        const adjustedTarget =
          terraformingStage > 0.5
            ? 0.4 + (target - 0.4) * (1 - (terraformingStage - 0.5) * 2)
            : target;
        return prev + (adjustedTarget - prev) * 0.01 * simulationSpeed;
      });
      setWaterLevel((prev) => {
        const canHaveWater =
          atmosphereDensity > 0.2 && temperature > 0.3 && temperature < 0.9;
        const target = canHaveWater ? Math.min(terraformingStage * 1.3, 1) : 0;
        return prev + (target - prev) * 0.005 * simulationSpeed;
      });
      setVegetation((prev) => {
        const canHaveVegetation =
          waterLevel > 0.2 &&
          temperature > 0.3 &&
          temperature < 0.8 &&
          atmosphereDensity > 0.4;
        const target = canHaveVegetation
          ? Math.min((terraformingStage - 0.3) * 2, 1)
          : 0;
        return prev + (Math.max(0, target) - prev) * 0.005 * simulationSpeed;
      });
      setOxygenLevel((prev) => {
        const target = Math.max(0, vegetation - 0.1) * 1.2;
        return prev + (Math.min(target, 1) - prev) * 0.005 * simulationSpeed;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [
    isSimulationActive,
    simulationSpeed,
    terraformingStage,
    atmosphereDensity,
    temperature,
    waterLevel,
    vegetation,
  ]);

  const toggleSimulation = () => setIsSimulationActive((prev) => !prev);

  const resetSimulation = () => {
    setIsSimulationActive(false);
    setTerraformingStage(0);
    setAtmosphereDensity(0);
    setWaterLevel(0);
    setTemperature(0.2);
    setVegetation(0);
    setOxygenLevel(0);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsControlsOpen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full min-h-screen bg-black flex flex-col">
      <div className="h-[80vh] md:h-[70vh] relative">
        <ControlsPanel
          terraformingStage={terraformingStage}
          atmosphereDensity={atmosphereDensity}
          waterLevel={waterLevel}
          temperature={temperature}
          vegetation={vegetation}
          oxygenLevel={oxygenLevel}
          isSimulationActive={isSimulationActive}
          simulationSpeed={simulationSpeed}
          setSimulationSpeed={setSimulationSpeed}
          toggleSimulation={toggleSimulation}
          resetSimulation={resetSimulation}
          isControlsOpen={isControlsOpen}
          setIsControlsOpen={setIsControlsOpen}
        />
        <div id="canvas-container" className="h-full w-full">
          <Canvas camera={{ position: [0, 20, 40], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[50, 50, 25]} intensity={1} />
            <Stars
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade
            />
            <Planet
              terraformingStage={terraformingStage}
              atmosphereDensity={atmosphereDensity}
              waterLevel={waterLevel}
              temperature={temperature}
              vegetation={vegetation}
            />
            <WeatherEffects
              atmosphereDensity={atmosphereDensity}
              waterLevel={waterLevel}
              temperature={temperature}
            />
            <VegetationGrowth
              vegetation={vegetation}
              waterLevel={waterLevel}
              temperature={temperature}
            />
            <AtmosphericEffects
              atmosphereDensity={atmosphereDensity}
              temperature={temperature}
              waterLevel={waterLevel}
            />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={15}
              maxDistance={100}
            />
          </Canvas>
        </div>
      </div>
      <div className="h-4 bg-gradient-to-r from-red-900 via-green-900 to-blue-900"></div>
      <div className="overflow-y-auto bg-black py-8 px-4">
        <TerraformingInfo />
      </div>
    </div>
  );
};

export default TerraformingSimulator;
