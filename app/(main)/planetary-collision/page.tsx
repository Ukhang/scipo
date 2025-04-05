import BackToHome from "@/components/back-to-home";
import PlanetaryCollisionSimulator from "@/components/planetary-collision-simulator";

export default function PlanetaryCollisionPage() {
  return (
    <div className="min-h-screen bg-black">
      <BackToHome/>
      <PlanetaryCollisionSimulator />
    </div>
  )
}