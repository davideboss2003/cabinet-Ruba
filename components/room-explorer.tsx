"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { RoomPictograms } from "./room-pictograms"
import { AlphabetBlock, PuzzlePiece } from "./site-decorations"

interface Stage {
  id: string
  name: string
  tech: string
  funFact: string
  note: string
}

const stages: Stage[] = [
  {
    id: "cognitive",
    name: "Stimulare cognitivă",
    tech: "Stimularea cognitivă antrenează atenția, memoria, percepția și funcțiile executive prin sarcini gradate ca dificultate: sortări, serieri, incastre, puzzle-uri. Totul se sprijină pe neuroplasticitate, adică pe felul în care creierul își reorganizează conexiunile prin exercițiu.",
    funFact: "În 1956, George Miller a descris „cifra magică 7, plus sau minus 2”: cam atâtea elemente poate ține odată memoria de scurtă durată.",
    note: "Eu am reținut din prima un singur lucru: numele tău.",
  },
  {
    id: "occupational",
    name: "Terapie ocupațională",
    tech: "Terapia ocupațională construiește abilitățile de care ai nevoie în activitățile de zi cu zi: motricitate fină, coordonare oculo-manuală, prehensiune, integrare senzorială. Se lucrează cu mărgele de înșirat, pioni, plastilină, decupaje.",
    funFact: "Pensa digitală, adică prinderea fină între degetul mare și arătător, apare în jurul vârstei de 9–12 luni. De ea depinde mai târziu și felul în care ții creionul.",
    note: "Lucrurile mărunte, făcute cu răbdare, schimbă cel mai mult.",
  },
  {
    id: "play",
    name: "Ludoterapie",
    tech: "În ludoterapie, jocul este limbajul copilului: prin el exprimă ce nu poate pune în cuvinte, exersează roluri și învață reguli. Terapeutul urmărește jocul, îl reflectă și intervine doar cât e nevoie.",
    funFact: "Virginia Axline a formulat în 1947 cele opt principii ale terapiei prin joc nondirective, folosite și astăzi.",
    note: "Se zice că afli mai multe despre cineva într-o oră de joacă decât într-un an de discuții.",
  },
  {
    id: "autonomy",
    name: "Autonomie personală",
    tech: "Formarea autonomiei personale înseamnă deprinderi de autoservire: îmbrăcat, igienă, hrănire, orientare în spațiu și timp. Se lucrează în pași mici, prin analiza sarcinii, cu suport vizual și cu retragerea treptată a ajutorului.",
    funFact: "Maria Montessori și-a rezumat metoda în rugămintea copilului către adult: „Ajută-mă să fac singur.”",
    note: "Deși unele lucruri ies mai frumos în doi.",
  },
  {
    id: "speech",
    name: "Limbaj și audiologie",
    tech: "Terapia limbajului corectează tulburările de pronunție, ritm și fluență și dezvoltă vocabularul și structura gramaticală, de multe ori în fața oglinzii logopedice. Audiologia educațională pornește de la audiogramă și îl ajută pe copilul protezat auditiv sau cu implant cohlear să învețe să asculte.",
    funFact: "Pe audiogramă, sunetele vorbirii se adună într-o zonă în formă de banană, căreia i se spune chiar „banana vorbirii”.",
    note: "Eu aș asculta ore întregi tot ce ai de povestit.",
  },
  {
    id: "social",
    name: "Socializare",
    tech: "Abilitățile sociale nu se predau, se exersează: contact vizual, așteptarea rândului, inițierea și menținerea unei conversații, joc de rol în situații cât mai reale.",
    funFact: "Atenția împărtășită, adică a privi împreună cu cineva același lucru, apare pe la 9–12 luni și este una dintre bazele limbajului.",
    note: "La capitolul ăsta am eu nevoie de câteva ședințe. Recomandarea e pe cartonașul de mai jos.",
  },
]

const Room3D = dynamic(() => import("./room-3d"), { ssr: false })

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

export function RoomExplorer() {
  // Cate colturi sunt amenajate si care e afisat in panou
  const [built, setBuilt] = useState(0)
  const [selected, setSelected] = useState(0)

  // Cabinetul 3D are nevoie de WebGL; fara el raman cartonasele 2D (null = inca verificam)
  const [use3D, setUse3D] = useState<boolean | null>(null)
  useEffect(() => setUse3D(hasWebGL()), [])

  const finished = built === stages.length
  const stage = built > 0 ? stages[selected] : null
  const next = stages[built]

  const buildNext = () => {
    if (finished) return
    setSelected(built)
    setBuilt(built + 1)
  }

  return (
    <section className="py-12 md:py-20 relative">
      {/* Decorations */}
      <div className="absolute top-20 left-5 opacity-40 rotate-[-15deg]">
        <PuzzlePiece size={60} />
      </div>
      <div className="absolute bottom-20 right-5 opacity-40 rotate-[15deg]">
        <AlphabetBlock size={56} letter="R" />
      </div>

      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Poți amenaja
          </h2>
          <p className="font-sans text-muted-foreground max-w-lg mx-auto">
            Cabinetul e al tău. Apasă pe buton și amenajează-l colț cu colț, câte un domeniu pe rând.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          {/* Cabinetul */}
          <div className="bg-blueprint rounded-3xl p-4 md:p-6 shadow-2xl border-4 border-white/80 outline outline-2 outline-blueprint">
            {use3D !== false ? (
              <>
                <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-3 overflow-hidden rounded-t-[1.25rem] aspect-[4/5] sm:aspect-square cursor-grab active:cursor-grabbing">
                  {use3D && <Room3D built={built} onContextLost={() => setUse3D(false)} />}
                </div>
                <p className="text-center text-white/60 font-hand text-base">Trage de cabinet ca să îl întorci</p>
              </>
            ) : (
              <RoomPictograms built={built} />
            )}
            <div className="mt-2 flex items-center gap-3 text-white font-hand text-lg">
              <span className="whitespace-nowrap">Progres: {Math.round((built / stages.length) * 100)}%</span>
              <div className="h-2 flex-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-700"
                  style={{ width: `${(built / stages.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="mt-5 mb-2 text-center">
              {finished ? (
                <a
                  href="#cartonas"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-rose text-white font-sans font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Mergi la cartonaș
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </a>
              ) : (
                <button
                  onClick={buildNext}
                  className="px-6 py-3 bg-accent text-accent-foreground font-sans font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {built === 0 ? "Începe cu" : "Adaugă"}: {next.name}
                </button>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-card rounded-3xl p-6 md:p-8 border-2 border-primary/20 shadow-xl lg:sticky lg:top-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {stages.map((s, i) => (
                <button
                  key={s.id}
                  disabled={i >= built}
                  onClick={() => setSelected(i)}
                  aria-pressed={stage?.id === s.id}
                  className={`px-3 py-1 rounded-full text-sm font-sans border transition-colors ${
                    stage?.id === s.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : i < built
                        ? "bg-secondary text-secondary-foreground border-transparent hover:border-primary/40 cursor-pointer"
                        : "bg-transparent text-muted-foreground/60 border-dashed border-border"
                  }`}
                >
                  {i + 1}. {s.name}
                </button>
              ))}
            </div>

            {stage ? (
              <div key={stage.id} className="min-h-[220px]">
                <p className="text-muted-foreground text-sm font-sans uppercase tracking-wide mb-1">
                  Domeniul {selected + 1} din {stages.length}
                </p>
                <h3 className="font-serif text-3xl font-semibold text-foreground mb-4">{stage.name}</h3>
                <p className="font-sans text-foreground leading-relaxed mb-5">{stage.tech}</p>
                <div className="bg-accent/15 border border-accent/50 rounded-2xl px-4 py-3 mb-5">
                  <p className="font-sans text-xs font-semibold uppercase tracking-widest text-accent-foreground/80 mb-1">
                    Știai că?
                  </p>
                  <p className="font-sans text-foreground leading-relaxed">{stage.funFact}</p>
                </div>
                <p className="font-hand text-xl text-rose leading-snug border-l-2 border-rose/50 pl-4">
                  {stage.note}
                </p>
              </div>
            ) : (
              <div className="min-h-[220px]">
                <p className="text-muted-foreground text-sm font-sans uppercase tracking-wide mb-1">
                  Înainte de prima ședință
                </p>
                <h3 className="font-serif text-3xl font-semibold text-foreground mb-4">Cabinetul e gol</h3>
                <p className="font-sans text-foreground leading-relaxed">
                  Deocamdată avem doar o cameră luminoasă, un covor și o ghirlandă stinsă. Restul îl aduci tu, cu tot ce
                  știi să faci.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
