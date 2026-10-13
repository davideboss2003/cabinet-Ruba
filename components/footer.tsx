import { SpeechStar } from "./site-decorations"

export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-grid-paper">
      <div className="container mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <SpeechStar size={36} />
          <span className="font-serif text-xl font-semibold text-foreground">
            Cartonaș Magic
          </span>
          <SpeechStar size={36} />
        </div>
        <p className="font-sans text-sm text-muted-foreground max-w-md mx-auto">
          Făcut cu drag pentru cea mai răbdătoare terapeută
        </p>
      </div>
    </footer>
  )
}
