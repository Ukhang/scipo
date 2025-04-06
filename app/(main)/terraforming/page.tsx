import BackToHome from "@/components/back-to-home";
import TerraformingSimulator from "@/components/terraforming-simulation";

export default function TerraformingPage() {
  return (
    <div className="min-h-screen bg-black">
      <BackToHome/>
      <TerraformingSimulator />
    </div>
  )
}