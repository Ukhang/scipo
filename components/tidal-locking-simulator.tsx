"use client"

import { useEffect, useRef, useState } from "react"

export default function TidalLockingSimulator() {
  const [orbitSpeed, setOrbitSpeed] = useState(5)
  const [showFeatures, setShowFeatures] = useState(true)
  const [showOrbitalPath, setShowOrbitalPath] = useState(true)
  const [showTidalForces, setShowTidalForces] = useState(false)
  const [viewMode, setViewMode] = useState<"topDown" | "side">("topDown")
  const [rotationMode, setRotationMode] = useState<"locked" | "free" | "compare">("locked")

  const orbitRef = useRef<number | null>(null)
  const orbitAngleRef = useRef(0)

  // Handle animation
  useEffect(() => {
    if (orbitRef.current) {
      clearInterval(orbitRef.current)
    }

    orbitRef.current = window.setInterval(() => {
      orbitAngleRef.current = (orbitAngleRef.current + orbitSpeed / 100) % (Math.PI * 2)

      // Update locked planet position
      const lockedPlanet = document.getElementById("locked-planet")
      if (lockedPlanet) {
        const x = Math.cos(orbitAngleRef.current) * 150
        const y = Math.sin(orbitAngleRef.current) * 150
        lockedPlanet.style.transform = `translate(${x}px, ${y}px) rotate(${orbitAngleRef.current}rad)`
      }

      // Update free rotating planet position (if in compare mode)
      const freePlanet = document.getElementById("free-planet")
      if (freePlanet && rotationMode === "compare") {
        const x = Math.cos(orbitAngleRef.current) * 150
        const y = Math.sin(orbitAngleRef.current) * 150
        // Free rotation is 3x faster than orbital period
        freePlanet.style.transform = `translate(${x}px, ${y}px) rotate(${orbitAngleRef.current * 3}rad)`
      }

      // Update free rotation planet (if in free mode)
      if (rotationMode === "free") {
        const freePlanet = document.getElementById("locked-planet")
        if (freePlanet) {
          const x = Math.cos(orbitAngleRef.current) * 150
          const y = Math.sin(orbitAngleRef.current) * 150
          // Free rotation is 3x faster than orbital period
          freePlanet.style.transform = `translate(${x}px, ${y}px) rotate(${orbitAngleRef.current * 3}rad)`
        }
      }

      // Update tidal force arrows if enabled
      if (showTidalForces) {
        updateTidalForces()
      }
    }, 16)

    return () => {
      if (orbitRef.current) {
        clearInterval(orbitRef.current)
      }
    }
  }, [orbitSpeed, rotationMode, showTidalForces])

  // Update tidal force arrows
  const updateTidalForces = () => {
    const arrowsContainer = document.getElementById("tidal-arrows")
    if (!arrowsContainer) return

    // Position arrows to point toward/away from star
    const arrows = arrowsContainer.querySelectorAll(".tidal-arrow")
    arrows.forEach((arrow, index) => {
      const arrowElement = arrow as HTMLElement
      // Calculate angle based on position around the planet
      const arrowAngle = (index * Math.PI) / 2 + orbitAngleRef.current

      // Position the arrow
      const arrowX = Math.cos(arrowAngle) * 25
      const arrowY = Math.sin(arrowAngle) * 25

      // Calculate the direction (toward or away from star)
      const towardStar = index === 0 || index === 2 // arrows at 0 and 180 degrees point toward/away from star
      const rotationAngle = towardStar ? arrowAngle : arrowAngle + Math.PI

      arrowElement.style.transform = `translate(${arrowX}px, ${arrowY}px) rotate(${rotationAngle}rad)`

      // Make arrows pointing toward/away from star larger to show stronger tidal force
      if (index === 0 || index === 2) {
        arrowElement.style.width = "20px"
        arrowElement.style.opacity = "1"
      } else {
        arrowElement.style.width = "10px"
        arrowElement.style.opacity = "0.6"
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Tidal Locking Simulator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualization panel */}
          <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Star-Planet System</h2>

            <div className="relative h-[500px] flex items-center justify-center mb-6 overflow-hidden">
              {/* Star */}
              <div
                className="absolute w-[80px] h-[80px] rounded-full bg-yellow-300 z-10"
                style={{
                  boxShadow: "0 0 30px 10px rgba(253, 224, 71, 0.8)",
                }}
              ></div>

              {/* Orbital path */}
              {showOrbitalPath && (
                <div
                  className={`absolute ${viewMode === "topDown" ? "w-[300px] h-[300px] rounded-full" : "w-[300px] h-[100px] rounded-full"} border border-gray-700 border-dashed`}
                ></div>
              )}

              {/* Tidally locked planet */}
              {rotationMode !== "compare" && (
                <div
                  id="locked-planet"
                  className="absolute w-[50px] h-[50px] rounded-full bg-blue-800 border border-blue-500"
                  style={{
                    transform: "translate(150px, 0) rotate(0rad)",
                  }}
                >
                  {/* Planet features to show rotation */}
                  {showFeatures && (
                    <>
                      <div className="absolute top-[10px] left-[10px] w-[10px] h-[10px] rounded-full bg-blue-300"></div>
                      <div className="absolute bottom-[15px] right-[5px] w-[15px] h-[8px] rounded-full bg-green-600"></div>
                    </>
                  )}

                  {/* Tidal force arrows */}
                  {showTidalForces && rotationMode === "locked" && (
                    <div id="tidal-arrows" className="absolute inset-0">
                      <div className="tidal-arrow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-20 bg-red-500"></div>
                      <div className="tidal-arrow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-10 bg-red-500"></div>
                      <div className="tidal-arrow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-20 bg-red-500"></div>
                      <div className="tidal-arrow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-10 bg-red-500"></div>
                    </div>
                  )}
                </div>
              )}

              {/* Comparison planets (if in compare mode) */}
              {rotationMode === "compare" && (
                <>
                  {/* Tidally locked planet */}
                  <div
                    id="locked-planet"
                    className="absolute w-[50px] h-[50px] rounded-full bg-blue-800 border border-blue-500"
                    style={{
                      transform: "translate(150px, 0) rotate(0rad)",
                    }}
                  >
                    {showFeatures && (
                      <>
                        <div className="absolute top-[10px] left-[10px] w-[10px] h-[10px] rounded-full bg-blue-300"></div>
                        <div className="absolute bottom-[15px] right-[5px] w-[15px] h-[8px] rounded-full bg-green-600"></div>
                      </>
                    )}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-blue-300 whitespace-nowrap">
                      Tidally Locked
                    </div>
                  </div>

                  {/* Freely rotating planet */}
                  <div
                    id="free-planet"
                    className="absolute w-[50px] h-[50px] rounded-full bg-purple-800 border border-purple-500"
                    style={{
                      transform: "translate(-150px, 0) rotate(0rad)",
                    }}
                  >
                    {showFeatures && (
                      <>
                        <div className="absolute top-[10px] left-[10px] w-[10px] h-[10px] rounded-full bg-purple-300"></div>
                        <div className="absolute bottom-[15px] right-[5px] w-[15px] h-[8px] rounded-full bg-green-600"></div>
                      </>
                    )}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-purple-300 whitespace-nowrap">
                      Free Rotation
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="orbit-speed" className="block mb-1">
                    Orbit Speed: {orbitSpeed}x
                  </label>
                  <input
                    id="orbit-speed"
                    type="range"
                    min="1"
                    max="10"
                    value={orbitSpeed}
                    onChange={(e) => setOrbitSpeed(Number.parseInt(e.target.value))}
                    className="w-full bg-gray-700 rounded-lg appearance-none h-2"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-medium">View Options:</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setViewMode("topDown")}
                      className={`px-3 py-1 rounded-md ${viewMode === "topDown" ? "bg-blue-600" : "bg-gray-700"}`}
                    >
                      Top-Down View
                    </button>
                    <button
                      onClick={() => setViewMode("side")}
                      className={`px-3 py-1 rounded-md ${viewMode === "side" ? "bg-blue-600" : "bg-gray-700"}`}
                    >
                      Side View
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="font-medium">Rotation Mode:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setRotationMode("locked")}
                      className={`px-3 py-1 rounded-md ${rotationMode === "locked" ? "bg-blue-600" : "bg-gray-700"}`}
                    >
                      Tidally Locked
                    </button>
                    <button
                      onClick={() => setRotationMode("free")}
                      className={`px-3 py-1 rounded-md ${rotationMode === "free" ? "bg-blue-600" : "bg-gray-700"}`}
                    >
                      Free Rotation
                    </button>
                    <button
                      onClick={() => setRotationMode("compare")}
                      className={`px-3 py-1 rounded-md ${rotationMode === "compare" ? "bg-blue-600" : "bg-gray-700"}`}
                    >
                      Compare Both
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-medium">Display Options:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowFeatures(!showFeatures)}
                      className={`px-3 py-1 rounded-md ${showFeatures ? "bg-blue-600" : "bg-gray-700"}`}
                    >
                      {showFeatures ? "Hide" : "Show"} Surface Features
                    </button>
                    <button
                      onClick={() => setShowOrbitalPath(!showOrbitalPath)}
                      className={`px-3 py-1 rounded-md ${showOrbitalPath ? "bg-blue-600" : "bg-gray-700"}`}
                    >
                      {showOrbitalPath ? "Hide" : "Show"} Orbital Path
                    </button>
                    <button
                      onClick={() => setShowTidalForces(!showTidalForces)}
                      className={`px-3 py-1 rounded-md ${showTidalForces ? "bg-blue-600" : "bg-gray-700"}`}
                      disabled={rotationMode !== "locked"}
                    >
                      {showTidalForces ? "Hide" : "Show"} Tidal Forces
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Information panel */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">About Tidal Locking</h2>

            <div className="space-y-4 text-gray-300">
              <p>
                <span className="font-semibold text-white">Tidal locking</span> is a gravitational effect where a
                celestial body's orbital period matches its rotational period, causing the same side to always face the
                object it orbits.
              </p>

              <div className="bg-gray-800 p-3 rounded-lg">
                <h3 className="font-medium text-white mb-1">How It Works</h3>
                <p className="text-sm">
                  Tidal forces from the star stretch the planet slightly, creating bulges on opposite sides. These
                  bulges create a torque that gradually slows the planet's rotation until one side permanently faces the
                  star.
                </p>
              </div>

              <div className="bg-gray-800 p-3 rounded-lg">
                <h3 className="font-medium text-white mb-1">Examples in Our Solar System</h3>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>The Moon is tidally locked to Earth</li>
                  <li>Mercury is in a 3:2 resonance with the Sun</li>
                  <li>Many of Jupiter's and Saturn's moons are tidally locked</li>
                </ul>
              </div>

              <div className="bg-gray-800 p-3 rounded-lg">
                <h3 className="font-medium text-white mb-1">Consequences for Exoplanets</h3>
                <p className="text-sm">
                  Tidally locked exoplanets have extreme temperature differences between their day and night sides. The
                  dayside may be scorching hot while the nightside remains freezing cold. This creates strong winds as
                  air flows from the hot side to the cold side.
                </p>
              </div>

              <div className="bg-gray-800 p-3 rounded-lg">
                <h3 className="font-medium text-white mb-1">Habitable Zone Implications</h3>
                <p className="text-sm">
                  Planets in the habitable zone of red dwarf stars are likely to be tidally locked due to their close
                  orbits. This doesn't necessarily make them uninhabitable—the boundary between day and night (the
                  "terminator line") could maintain moderate temperatures suitable for life.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Educational content */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">The Science of Tidal Locking</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Mathematical Description</h3>
              <p className="text-gray-300 mb-3">
                Tidal locking occurs when a body's rotation period equals its orbital period:
              </p>
              <div className="bg-gray-800 p-4 rounded-lg text-center mb-3">
                <p className="font-mono">
                  T<sub>rotation</sub> = T<sub>orbit</sub>
                </p>
              </div>
              <p className="text-gray-300">
                The time it takes for a body to become tidally locked depends on several factors including its distance
                from the primary body, its size, density, and initial rotation rate.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Synchronous Rotation</h3>
              <p className="text-gray-300 mb-3">
                Tidal locking results in synchronous rotation, where the same hemisphere always faces the primary body.
                This creates three distinct zones on the locked body:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li>
                  <span className="font-medium text-white">Dayside</span>: Permanently facing the star, experiencing
                  constant heat and radiation
                </li>
                <li>
                  <span className="font-medium text-white">Nightside</span>: Permanently facing away from the star, in
                  perpetual darkness
                </li>
                <li>
                  <span className="font-medium text-white">Terminator zone</span>: The boundary between day and night
                  sides, experiencing eternal sunset/sunrise
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Notable Tidally Locked Exoplanets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-1">TRAPPIST-1 System</h4>
                <p className="text-sm text-gray-300">
                  All seven planets in this system are likely tidally locked to their red dwarf star. Several are in the
                  habitable zone, making them interesting targets for studying potential life on tidally locked worlds.
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-1">Proxima Centauri b</h4>
                <p className="text-sm text-gray-300">
                  The closest known exoplanet to our solar system is likely tidally locked to Proxima Centauri. It
                  orbits in the habitable zone of its red dwarf star.
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-1">HD 189733b</h4>
                <p className="text-sm text-gray-300">
                  A tidally locked "hot Jupiter" with extreme temperature differences between its day and night sides.
                  Scientists have created temperature maps of its surface using infrared observations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

