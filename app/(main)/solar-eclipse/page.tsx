import BackToHome from "@/components/back-to-home";
import SolarEclipseSimulator from "@/components/solar-eclipse-simulator";

export default function SolarEclipsePage() {
  return (
    <div className="min-h-screen bg-black">
      <BackToHome/>
      <SolarEclipseSimulator/>
    </div>
  )
}

