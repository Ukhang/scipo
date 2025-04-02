import BackToHome from "@/components/back-to-home";
import TidalLockingSimulator from "@/components/tidal-locking-simulator";

export default function TidalLockingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <BackToHome/>
      <TidalLockingSimulator />
    </div>
  )
}

