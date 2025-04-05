import BackToHome from "@/components/back-to-home";
import MilkyWaySimulator from "@/components/milky-way-simulator";

export default function MilkyWayPage() {
  return (
    <div className="min-h-screen bg-black">
      <BackToHome/>
      <MilkyWaySimulator />
    </div>
  )
}