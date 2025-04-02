import AsteroidBeltSimulation from "@/components/asteroid-belt-simulation";
import BackToHome from "@/components/back-to-home"

export default function AsteroidBeltPage() {
  return (
    <div className="min-h-screen bg-black">
      <BackToHome />
      <AsteroidBeltSimulation />
    </div>
  )
}