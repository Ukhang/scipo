import { ChevronUp, ChevronDown, Pause, Play, RotateCcw } from "lucide-react";

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

export default ControlsPanel;
