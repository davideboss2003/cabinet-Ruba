import { HeroSection } from "@/components/hero-section"
import { RoomExplorer } from "@/components/room-explorer"
import { Footer } from "@/components/footer"
import { FlowerSection } from "@/components/flower-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <RoomExplorer />
      <FlowerSection />
      <Footer />
    </main>
  )
}
