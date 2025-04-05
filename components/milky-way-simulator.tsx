import React, { useEffect } from "react";
import { Minimize, Maximize, ChevronUp, ChevronDown } from "lucide-react";

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

export default function ControlsPanel({
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
