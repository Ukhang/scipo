interface ParameterDisplayProps {
  atmosphereDensity: number;
  waterLevel: number;
  temperature: number;
  vegetation: number;
  oxygenLevel: number;
}

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
