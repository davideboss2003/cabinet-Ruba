import { HeroSection } from "@/components/hero-section"
import { RoomExplorer } from "@/components/room-explorer"
import { CommunicationStrip } from "@/components/communication-strip"
import { Footer } from "@/components/footer"
import { FlowerSection } from "@/components/flower-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <RoomExplorer />
      <CommunicationStrip />
      <FlowerSection />
      <Footer />
    </main>
  )
}
