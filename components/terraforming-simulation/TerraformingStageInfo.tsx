interface TerraformingStageInfoProps {
  currentStage: number;
}

const TerraformingStageInfo: React.FC<TerraformingStageInfoProps> = ({
  currentStage,
}) => {
  const stages = [
    {
      name: "Barren Planet",
      description:
        "A lifeless, rocky world with no atmosphere or water. Extreme temperature variations and radiation make it inhospitable to life.",
      requirements:
        "Initial assessment of mineral resources and potential for terraforming.",
    },
    {
      name: "Atmosphere Generation",
      description:
        "Creating a basic atmosphere by releasing greenhouse gases from the planet's surface or importing gases from elsewhere.",
      requirements:
        "Factories to produce gases, orbital mirrors to increase temperature.",
    },
    {
      name: "Water Introduction",
      description:
        "Melting ice caps or redirecting comets to bring water to the planet's surface, forming the first oceans.",
      requirements:
        "Sufficient atmospheric pressure and temperature regulation.",
    },
    {
      name: "Temperature Regulation",
      description:
        "Stabilizing the planet's temperature through greenhouse gas management and orbital mirrors.",
      requirements:
        "Atmospheric composition monitoring and adjustment systems.",
    },
    {
      name: "Oxygen Generation",
      description:
        "Introducing algae and plants to begin producing oxygen through photosynthesis.",
      requirements:
        "Stable water cycle and protected habitats for initial plant life.",
    },
    {
      name: "Ecosystem Development",
      description:
        "Establishing diverse plant and animal life to create self-sustaining ecosystems.",
      requirements:
        "Oxygen-rich atmosphere, stable climate, and genetic engineering facilities.",
    },
    {
      name: "Human Habitation",
      description:
        "The planet is now ready for human settlement with breathable air, moderate temperatures, and sustainable ecosystems.",
      requirements:
        "Infrastructure for human colonies, agriculture, and resource management.",
    },
  ];

  const stageIndex = Math.min(Math.floor(currentStage * 6), 6);
  const stage = stages[stageIndex];
  const stageProgress = (currentStage * 6) % 1;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{stage.name}</h3>
        <span className="text-sm bg-blue-600 px-2 py-1 rounded">
          Stage {stageIndex + 1}/7
        </span>
      </div>
      <p className="text-gray-300 mb-3">{stage.description}</p>
      <div className="mb-2">
        <div className="text-sm text-gray-400 mb-1">Stage Progress</div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${stageProgress * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="text-sm bg-gray-700 p-2 rounded">
        <span className="font-semibold text-gray-300">Requirements:</span>{" "}
        {stage.requirements}
      </div>
    </div>
  );
};

export default TerraformingStageInfo;
