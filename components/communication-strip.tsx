"use client"

import { useState, type ReactNode } from "react"
import { SoundWaves, StarShape } from "./site-decorations"

interface Picto {
  id: string
  label: string
  color: string
  icon: ReactNode
}

function Person({ letter, fill }: { letter: string; fill: string }) {
  return (
    <>
      <circle cx="40" cy="22" r="12" fill={fill} stroke="var(--foreground)" strokeWidth="2.500" />
      <path d="M16 68a24 24 0 0 1 48 0z" fill={fill} stroke="var(--foreground)" strokeWidth="2.500" strokeLinejoin="round" />
      <text x="40" y="63" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff" className="font-sans">
        {letter}
      </text>
    </>
  )
}

// Propozitia, in ordinea corecta
const sentence: Picto[] = [
  {
    id: "eu",
    label: "Eu",
    color: "#f2c230",
    icon: (
      <>
        <Person letter="D" fill="var(--primary)" />
        <path d="M66 30 54 40m0 0 1-8m-1 8 8-1" fill="none" stroke="var(--foreground)" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: "am",
    label: "am",
    color: "#4fb58f",
    icon: (
      <g stroke="var(--foreground)" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 52q8-6 18-2l10 4h12q5 0 5 5t-5 5H40l-10-2-6 6H12z" fill="#ffd9b8" />
        <path d="M28 20h24v20a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6z" fill="var(--mint)" />
        <path d="M24 26h32M40 20v-6m0 0q-6-6-9 0 3 5 9 0zm0 0q6-6 9 0-3 5-9 0z" fill="var(--rose)" />
      </g>
    ),
  },
  {
    id: "intrebare",
    label: "o întrebare",
    color: "#f08a3c",
    icon: (
      <>
        <path
          d="M16 10h48a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8H42L28 70V56H16a8 8 0 0 1-8-8V18a8 8 0 0 1 8-8z"
          fill="var(--accent)"
          stroke="var(--foreground)"
          strokeWidth="2.500"
          strokeLinejoin="round"
        />
        <text x="40" y="46" textAnchor="middle" fontSize="36" fontWeight="700" fill="var(--foreground)" className="font-sans">
          ?
        </text>
      </>
    ),
  },
  {
    id: "tine",
    label: "pentru tine",
    color: "#f2c230",
    icon: (
      <>
        <Person letter="A" fill="var(--rose)" />
        <path d="M8 34h14m0 0-6-5m6 5-6 5" fill="none" stroke="var(--foreground)" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
]

// Ordinea in care stau amestecate pe masa (fixa, ca sa arate la fel la fiecare incarcare)
const tableOrder = ["intrebare", "tine", "eu", "am"]
const tilts = [-5, 4, -3, 6]

function PictoCard({ picto }: { picto: Picto }) {
  return (
    <div
      className="w-full aspect-[4/5] rounded-xl bg-white flex flex-col items-center justify-between p-1.5 sm:p-2 shadow-lg"
      style={{ border: `4px solid ${picto.color}` }}
    >
      <svg viewBox="0 0 80 80" className="w-full flex-1 min-h-0" aria-hidden="true">
        {picto.icon}
      </svg>
      <span className="font-sans font-bold text-[11px] sm:text-base text-[#2a2440] leading-tight whitespace-nowrap">
        {picto.label}
      </span>
    </div>
  )
}

export function CommunicationStrip() {
  const [placed, setPlaced] = useState(0)
  const [wrong, setWrong] = useState<string | null>(null)
  const [mistakes, setMistakes] = useState(0)

  const done = placed === sentence.length
  const expected = sentence[placed]

  const pick = (id: string) => {
    if (done) return
    if (id === expected.id) {
      setPlaced(placed + 1)
      setMistakes(0)
      setWrong(null)
      return
    }
    setMistakes(mistakes + 1)
    setWrong(id)
    setTimeout(() => setWrong((w) => (w === id ? null : w)), 500)
  }

  // Dupa doua greseli vine promptul vizual: cartonasul potrivit incepe sa pulseze
  const prompted = mistakes >= 2 ? expected?.id : null

  return (
    <section id="banda" className="py-12 md:py-20 relative scroll-mt-4">
      <div className="absolute top-16 right-6 opacity-40 rotate-[10deg]">
        <SoundWaves size={64} />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="font-hand text-xl text-primary mb-1">Exercițiul de final</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">Banda de comunicare</h2>
          <p className="font-sans text-muted-foreground max-w-lg mx-auto text-balance">
            Davide are ceva de spus, dar se cam încurcă în cuvinte. Ajută-l ca la PECS: atinge pictogramele în ordinea
            potrivită și formează propoziția pe bandă.
          </p>
        </div>

        <div className="max-w-2xl mx-auto perspective-1000">
          {/* Banda */}
          <div
            className={`relative rounded-2xl bg-primary p-2.5 sm:p-4 shadow-2xl transition-shadow duration-700 ${done ? "animate-strip-glow" : ""}`}
            style={{ transform: "rotateX(8deg)" }}
          >
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {sentence.map((p, i) => (
                <div
                  key={p.id}
                  className="aspect-[4/5] rounded-xl border-2 border-dashed border-white/50 bg-white/10 flex items-center justify-center"
                >
                  {i < placed ? (
                    <div className="w-full animate-picto-drop">
                      <PictoCard picto={p} />
                    </div>
                  ) : (
                    <span className="font-hand text-2xl text-white/50">{i + 1}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Banda adeziva */}
            <div className="mt-2.5 h-2 rounded-full bg-white/25" />
          </div>

          {/* Masa cu pictograme sau propozitia gata */}
          {done ? (
            <div aria-live="polite" className="text-center mt-10">
              <p className="font-serif text-2xl md:text-4xl text-foreground font-semibold mb-3 text-balance">
                „Eu am o întrebare pentru tine.”
              </p>
              <p className="font-sans text-muted-foreground max-w-md mx-auto mb-6 text-balance">
                Propoziție corectă, formată fără niciun prompt verbal. Întrebarea te așteaptă pe spatele cartonașului de mai jos.
              </p>
              <a
                href="#cartonas"
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose text-white font-sans font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <svg width="22" viewBox="-12 -12 24 24" aria-hidden="true">
                  <StarShape x={0} y={0} />
                </svg>
                Mergi la cartonaș
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2 sm:gap-4 mt-10 px-1">
                {tableOrder.map((id, i) => {
                  const p = sentence.find((s) => s.id === id)!
                  const used = sentence.findIndex((s) => s.id === id) < placed
                  return (
                    <button
                      key={id}
                      onClick={() => pick(id)}
                      disabled={used}
                      aria-label={`Pictograma: ${p.label}`}
                      className={`transition-all duration-300 ${
                        used
                          ? "opacity-0 scale-50 pointer-events-none"
                          : "cursor-pointer hover:-translate-y-2 hover:scale-105 active:scale-95"
                      } ${wrong === id ? "animate-picto-shake" : ""} ${prompted === id ? "animate-picto-prompt" : ""}`}
                      style={{ rotate: used ? undefined : `${tilts[i]}deg` }}
                    >
                      <PictoCard picto={p} />
                    </button>
                  )
                })}
              </div>
              <p aria-live="polite" className="text-center font-hand text-lg text-muted-foreground mt-6 min-h-7">
                {wrong
                  ? "Aproape. Mai încercăm o dată."
                  : prompted
                    ? "Un mic prompt vizual: uită-te la cea care pulsează."
                    : placed === 0
                      ? "Cu ce începe o propoziție?"
                      : `${placed} din ${sentence.length}. Foarte bine, continuă!`}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
