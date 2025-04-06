import Link from "next/link";

export default function Home() {
  const simulations = [
    {
      title: "Asteroid Belt Simulation",
      description: "Explore a simulated asteroid belt around a central star.",
      image: "/placeholder.svg?height=200&width=400",
      href: "/asteroid-belt",
      color: "from-purple-500 to-indigo-700",
      icon: "🪨",
    },
    {
      title: "Exoplanet Transit Visualization",
      description:
        "See how astronomers detect planets by measuring star brightness dips.",
      image: "/placeholder.svg?height=200&width=400",
      href: "/exoplanet-transit",
      color: "from-blue-500 to-cyan-700",
      icon: "🔭",
    },
    {
      title: "Tidal Locking Simulator",
      description: "Visualize how one side of a planet always faces its star.",
      image: "/placeholder.svg?height=200&width=400",
      href: "/tidal-locking",
      color: "from-orange-500 to-red-700",
      icon: "🌓",
    },
    {
      title: "Solar Eclipse Animation",
      description: "Simulate the movement of the Moon blocking the Sun.",
      image: "/placeholder.svg?height=200&width=400",
      href: "/solar-eclipse",
      color: "from-gray-800 to-gray-900",
      icon: "🌑",
    },
    {
      title: "Pulsar Star Effect",
      description:
        "Animate a rapidly spinning neutron star emitting pulses of light.",
      image: "/placeholder.svg?height=200&width=400",
      href: "/pulsar-star",
      color: "from-blue-900 to-indigo-900",
      icon: "⭐",
    },
    {
      title: "Cosmic Background Radiation",
      description:
        "Generate noise patterns resembling the universe's background radiation.",
      image: "/placeholder.svg?height=200&width=400",
      href: "/cosmic-background",
      color: "from-red-900 to-purple-900",
      icon: "🌌",
    },
    {
      title: "3D Milky Way Map",
      description: "A starfield representation of our galaxy using particle physics.",
      image: "/placeholder.svg?height=200&width=400",
      href: "/milky-way",
      color: "from-indigo-800 to-blue-600",
      icon: "🌀",
    },
    {
      title: "Planetary Collision Simulator",
      description: "Show what happens when two planets crash into each other.",
      image: "/placeholder.svg?height=200&width=400",
      href: "/planetary-collision",
      color: "from-red-700 to-orange-600",
      icon: "💥",
    },
    {
      title: "Terraforming Simulation",
      description: "Watch a barren planet transform into a habitable world over time.",
      image: "/placeholder.svg?height=200&width=400",
      href: "/terraforming",
      color: "from-red-700 to-green-600",
      icon: "🌍",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Interactive Science Simulations
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore the physics of our universe through interactive
            visualizations and simulations.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {simulations.map((sim) => (
            <Link href={sim.href} key={sim.title} className="group block">
              <div className="bg-gray-900 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-900/20 h-full flex flex-col">
                <div
                  className={`h-48 bg-gradient-to-br ${sim.color} flex items-center justify-center`}
                >
                  <div className="text-6xl opacity-70">{sim.icon}</div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-2xl font-bold mb-2">{sim.title}</h2>
                  <p className="text-gray-300 flex-grow">{sim.description}</p>
                  <div className="mt-4 inline-flex items-center text-blue-400 group-hover:text-blue-300">
                    Explore simulation
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
