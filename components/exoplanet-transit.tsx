"use client"

import { useEffect, useRef, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function ExoplanetTransit() {
  const [isTransiting, setIsTransiting] = useState(false)
  const [transitProgress, setTransitProgress] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [lightCurveData, setLightCurveData] = useState<number[]>([])
  const [planetSize, setPlanetSize] = useState(15)
  const [orbitSpeed, setOrbitSpeed] = useState(10)
  const [transitDepth, setTransitDepth] = useState(5)
  const animationRef = useRef<number | null>(null)
  const orbitRef = useRef<number | null>(null)
  const dataPointsRef = useRef<number>(0)

  // Initialize light curve data
  useEffect(() => {
    const initialData = Array(100).fill(100)
    setLightCurveData(initialData)
  }, [])

  // Handle planet orbit and transit
  useEffect(() => {
    const startOrbit = () => {
      if (orbitRef.current) return

      let angle = 0
      let inTransit = false
      let transitStart = 0
      let transitEnd = 0

      // Calculate transit angles based on star and planet size
      const calculateTransitAngles = () => {
        const starRadius = 50
        const planetRadius = planetSize / 2
        const orbitRadius = 150

        // Calculate the angle at which transit begins and ends
        const transitAngle = Math.asin((starRadius + planetRadius) / orbitRadius)
        transitStart = Math.PI - transitAngle
        transitEnd = Math.PI + transitAngle
      }

      calculateTransitAngles()

      orbitRef.current = window.setInterval(() => {
        // Update angle based on orbit speed
        angle = (angle + orbitSpeed / 1000) % (Math.PI * 2)

        // Check if planet is entering transit
        if (angle >= transitStart && angle <= transitEnd && !inTransit) {
          inTransit = true
          setIsTransiting(true)
          startTransitAnimation()
        }

        // Check if planet is exiting transit
        if ((angle < transitStart || angle > transitEnd) && inTransit) {
          inTransit = false
          setIsTransiting(false)
          stopTransitAnimation()
        }

        // Update planet position
        const x = 150 * Math.cos(angle)
        const y = 50 * Math.sin(angle)

        const planetElement = document.getElementById("planet")
        if (planetElement) {
          planetElement.style.transform = `translate(${x}px, ${y}px)`
        }
      }, 16)

      return () => {
        if (orbitRef.current) {
          clearInterval(orbitRef.current)
          orbitRef.current = null
        }
      }
    }

    startOrbit()

    return () => {
      if (orbitRef.current) {
        clearInterval(orbitRef.current)
        orbitRef.current = null
      }
    }
  }, [planetSize, orbitSpeed])

  // Handle transit animation and light curve updates
  const startTransitAnimation = () => {
    if (animationRef.current) return

    let progress = 0
    const duration = 3000 / orbitSpeed // Adjust duration based on orbit speed
    const startTime = performance.now()

    const animate = (time: number) => {
      const elapsed = time - startTime
      progress = Math.min(elapsed / duration, 1)
      setTransitProgress(progress)

      // Calculate brightness dip during transit
      // Create a smooth curve with deeper dip in the middle
      let currentBrightness
      if (progress < 0.5) {
        currentBrightness = 100 - transitDepth * (progress / 0.5)
      } else {
        currentBrightness = 100 - transitDepth * ((1 - progress) / 0.5)
      }

      setBrightness(currentBrightness)

      // Update light curve data
      setLightCurveData((prev) => {
        const newData = [...prev]
        newData.shift()
        newData.push(currentBrightness)
        return newData
      })

      dataPointsRef.current += 1

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        animationRef.current = null
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const stopTransitAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Reset brightness to normal
    setBrightness(100)
  }

  // Update transit depth when planet size changes
  useEffect(() => {
    // Calculate transit depth based on planet size
    // Transit depth is proportional to the ratio of planet area to star area
    const starArea = Math.PI * 50 * 50
    const planetArea = Math.PI * (planetSize / 2) * (planetSize / 2)
    const calculatedDepth = (planetArea / starArea) * 100

    // Limit the depth for visualization purposes
    setTransitDepth(Math.min(calculatedDepth, 10))
  }, [planetSize])

  // Chart options and data
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // Disable animations for performance
    },
    scales: {
      y: {
        min: 89,
        max: 101,
        title: {
          display: true,
          text: "Relative Brightness (%)",
          color: "#fff",
        },
        ticks: {
          color: "#fff",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
          color: "#fff",
        },
        ticks: {
          display: false,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
      },
    },
  }

  const chartData = {
    labels: Array(100).fill(""),
    datasets: [
      {
        data: lightCurveData,
        borderColor: "#4ade80",
        backgroundColor: "rgba(74, 222, 128, 0.2)",
        fill: true,
        borderWidth: 2,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Exoplanet Transit Method Visualization</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Visualization panel */}
          <div className="bg-gray-900 rounded-xl p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Star-Planet System</h2>

            <div className="relative h-80 flex items-center justify-center mb-6">
              {/* Star */}
              <div
                className="absolute w-[100px] h-[100px] rounded-full bg-yellow-300"
                style={{
                  boxShadow: `0 0 ${30 + brightness / 10}px ${10 + brightness / 20}px rgba(253, 224, 71, 0.8)`,
                  transition: "box-shadow 0.3s ease",
                }}
              ></div>

              {/* Planet */}
              <div
                id="planet"
                className="absolute w-[30px] h-[30px] rounded-full bg-blue-800 border border-blue-500"
                style={{
                  width: `${planetSize}px`,
                  height: `${planetSize}px`,
                  transform: "translate(150px, 0)",
                }}
              ></div>

              {/* Orbit path */}
              <div className="absolute w-[300px] h-[100px] rounded-full border border-gray-700 border-dashed"></div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="text-lg">
                Star Brightness: <span className="font-mono">{brightness.toFixed(2)}%</span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${isTransiting ? "bg-green-800 text-green-200" : "bg-gray-800 text-gray-400"}`}
              >
                {isTransiting ? "Transit in Progress" : "No Transit"}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="planet-size" className="block mb-1">
                  Planet Size: {planetSize}px
                </label>
                <input
                  id="planet-size"
                  type="range"
                  min="5"
                  max="30"
                  value={planetSize}
                  onChange={(e) => setPlanetSize(Number.parseInt(e.target.value))}
                  className="w-full bg-gray-700 rounded-lg appearance-none h-2"
                />
              </div>

              <div>
                <label htmlFor="orbit-speed" className="block mb-1">
                  Orbit Speed: {orbitSpeed}x
                </label>
                <input
                  id="orbit-speed"
                  type="range"
                  min="1"
                  max="20"
                  value={orbitSpeed}
                  onChange={(e) => setOrbitSpeed(Number.parseInt(e.target.value))}
                  className="w-full bg-gray-700 rounded-lg appearance-none h-2"
                />
              </div>
            </div>
          </div>

          {/* Light curve panel */}
          <div className="bg-gray-900 rounded-xl p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Light Curve</h2>

            <div className="h-80 mb-4">
              <Line options={chartOptions} data={chartData} />
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">
                The light curve shows the star's brightness over time. When the planet transits in front of the star, it
                blocks a small portion of the star's light, creating a characteristic dip in the light curve.
              </p>

              <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">Transit Depth:</span> {transitDepth.toFixed(2)}%
                  <span className="text-gray-400 ml-2">
                    (Proportional to (R<sub>planet</sub>/R<sub>star</sub>)<sup>2</sup>)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Educational content */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">About the Transit Method</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">How It Works</h3>
              <p className="text-gray-300 mb-3">
                The transit method detects exoplanets by measuring the periodic dimming of a star's light as a planet
                passes in front of it. This technique has been used by NASA's Kepler and TESS missions to discover
                thousands of exoplanets.
              </p>
              <p className="text-gray-300">
                The amount of dimming (transit depth) tells us about the planet's size relative to its star. The time
                between transits reveals the planet's orbital period, while the transit duration provides information
                about the orbit's shape.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Key Discoveries</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>
                  <span className="font-medium">TRAPPIST-1 System</span>: Seven Earth-sized planets orbiting a cool
                  dwarf star, with several in the habitable zone.
                </li>
                <li>
                  <span className="font-medium">Kepler-452b</span>: Often called "Earth's cousin," this planet orbits in
                  the habitable zone of a Sun-like star.
                </li>
                <li>
                  <span className="font-medium">HD 189733b</span>: A "hot Jupiter" with detailed atmospheric studies
                  revealing water vapor, carbon dioxide, and methane.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Limitations and Challenges</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-1">Geometric Probability</h4>
                <p className="text-sm text-gray-300">
                  Transits can only be detected when the planet's orbit is aligned with our line of sight to the star,
                  which means we miss many planetary systems.
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-1">Signal Detection</h4>
                <p className="text-sm text-gray-300">
                  The dimming effect is very small—typically less than 1% for a Jupiter-sized planet orbiting a Sun-like
                  star, and only 0.01% for an Earth-sized planet.
                </p>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-1">Stellar Variability</h4>
                <p className="text-sm text-gray-300">
                  Stars naturally vary in brightness due to starspots and flares, which can mask or mimic transit
                  signals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

