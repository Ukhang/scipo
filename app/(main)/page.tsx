import Link from "next/link";
import { simulations } from "@/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Space Phenomena Simulations
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Interactive visualizations of astronomical phenomena to help
            understand the physics of our universe.
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
