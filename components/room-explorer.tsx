"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { RoomPictograms } from "./room-pictograms"
import { AlphabetBlock, PuzzlePiece, StarShape } from "./site-decorations"

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
    funFact: "Taximetriștii din Londra, care învață pe de rost vreo 25.000 de străzi, au hipocampul posterior mai mare decât restul oamenilor, și cu atât mai mare cu cât au mai mulți ani de volan (Eleanor Maguire, 2000). Creierul chiar crește acolo unde îl folosești.",
    note: "Eu am reținut din prima un singur lucru: numele tău.",
  },
  {
    id: "occupational",
    name: "Terapie ocupațională",
    tech: "Terapia ocupațională construiește abilitățile de care ai nevoie în activitățile de zi cu zi: motricitate fină, coordonare oculo-manuală, prehensiune, integrare senzorială. Se lucrează cu mărgele de înșirat, pioni, plastilină, decupaje.",
    funFact: "Vârful degetului simte denivelări de numai 13 nanometri (studiu suedez, 2013). Dacă degetul tău ar fi cât Pământul, ai deosebi la atingere o casă de o mașină.",
    note: "Lucrurile mărunte, făcute cu răbdare, schimbă cel mai mult.",
  },
  {
    id: "play",
    name: "Ludoterapie",
    tech: "În ludoterapie, jocul este limbajul copilului: prin el exprimă ce nu poate pune în cuvinte, exersează roluri și învață reguli. Terapeutul urmărește jocul, îl reflectă și intervine doar cât e nevoie.",
    funFact: "Și bondarii se joacă. Într-un experiment din 2022, rostogoleau biluțe de lemn fără nicio recompensă, doar de plăcere, iar cei tineri o făceau cel mai des. E primul joc cu obiecte observat la insecte.",
    note: "Se zice că afli mai multe despre cineva într-o oră de joacă decât într-un an de discuții.",
  },
  {
    id: "autonomy",
    name: "Autonomie personală",
    tech: "Formarea autonomiei personale înseamnă deprinderi de autoservire: îmbrăcat, igienă, hrănire, orientare în spațiu și timp. Se lucrează în pași mici, prin analiza sarcinii, cu suport vizual și cu retragerea treptată a ajutorului.",
    funFact: "În Japonia rulează din 1991 o emisiune în care copii de 2–3 ani sunt trimiși singuri la cumpărături, cu lista în cap și banii în buzunar, filmați pe ascuns. Aproape toți se descurcă.",
    note: "Eu, la vârsta mea, tot am emoții când trebuie să fac primul pas.",
  },
  {
    id: "speech",
    name: "Limbaj și audiologie",
    tech: "Terapia limbajului corectează tulburările de pronunție, ritm și fluență și dezvoltă vocabularul și structura gramaticală, de multe ori în fața oglinzii logopedice. Audiologia educațională pornește de la audiogramă și îl ajută pe copilul protezat auditiv sau cu implant cohlear să învețe să asculte.",
    funFact: "Pe insula La Gomera, din Canare, oamenii vorbesc de peste văi fluierând. Limba se numește Silbo, se aude la câțiva kilometri și se predă la școală, iar creierul o procesează în aceleași zone ca vorbirea.",
    note: "Eu aș asculta ore întregi tot ce ai de povestit.",
  },
  {
    id: "social",
    name: "Socializare",
    tech: "Abilitățile sociale nu se predau, se exersează: contact vizual, așteptarea rândului, inițierea și menținerea unei conversații, joc de rol în situații cât mai reale.",
    funFact: "Când cineva îți povestește ceva și chiar îl asculți, activitatea creierului tău începe să o copieze pe a lui, cu o mică întârziere. Cu cât vă înțelegeți mai bine, cu atât sincronizarea e mai puternică (Uri Hasson, Princeton, 2010).",
    note: "La capitolul ăsta am eu nevoie de câteva ședințe. Începem chiar cu exercițiul de mai jos.",
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
            {/* Tabla cu jetoane: cate o steluta pentru fiecare domeniu amenajat */}
            <div className="mt-2 rounded-2xl bg-white/10 border border-white/20 px-3 py-2.5">
              <div className="flex items-center justify-between text-white font-hand text-lg mb-1.5">
                <span>Tabla cu jetoane</span>
                <span aria-live="polite">
                  {built} din {stages.length}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                {stages.map((s, i) => (
                  <div
                    key={s.id}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-colors duration-500 ${
                      i < built ? "bg-white border-accent" : "border-dashed border-white/35"
                    }`}
                  >
                    {i < built && (
                      <svg viewBox="-12 -12 24 24" className="w-3/4 animate-token-pop" aria-hidden="true">
                        <StarShape x={0} y={0} />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-center text-white/70 font-hand text-base mt-1.5">
                {finished ? "Tabla e plină. Ai câștigat recompensa!" : "6 steluțe = o recompensă"}
              </p>
            </div>
            <div className="mt-5 mb-2 text-center">
              {finished ? (
                <a
                  href="#banda"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-rose text-white font-sans font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Ia-ți recompensa
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
