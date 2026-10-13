import type { CSSProperties } from "react"
import { AlphabetBlock, PuzzlePiece, SoundWaves, SpeechStar, WaveLine } from "./site-decorations"

export function HeroSection() {
  return (
    <header className="relative overflow-hidden py-16 md:py-24 bg-grid-paper">
      {/* Background decorations */}
      <div className="absolute top-10 left-6 md:left-16 opacity-70 animate-tool-float" style={{ "--tilt": "-12deg" } as CSSProperties}>
        <PuzzlePiece size={100} />
      </div>
      <div className="absolute bottom-8 right-6 md:right-20 opacity-60 animate-tool-float" style={{ "--tilt": "10deg", animationDelay: "1.5s" } as CSSProperties}>
        <AlphabetBlock size={84} letter="A" />
      </div>
      <div className="absolute top-14 right-4 md:right-1/4 opacity-40 animate-tool-float" style={{ "--tilt": "-8deg", animationDelay: "3s" } as CSSProperties}>
        <SoundWaves size={90} />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <SpeechStar size={96} />
        </div>

        <p className="text-muted-foreground font-sans uppercase tracking-[0.3em] text-xs md:text-sm mb-6 text-balance">
          Dedicat Antoniei Ariadna Ruba, psihopedagog și viitoare specialistă în terapia limbajului
        </p>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold text-foreground mb-4 text-balance">
          Cartonaș Magic
        </h1>

        <WaveLine label="ședința nr. 01 · durata: cât vrei tu" className="max-w-md mx-auto text-primary mb-8" />

        <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          O ședință pregătită cu răbdare, joacă și mult drag, pentru cineva care îi învață pe alții să vorbească,
          să asculte și să se descurce singuri.
        </p>
      </div>
    </header>
  )
}
