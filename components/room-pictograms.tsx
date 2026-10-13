import type { ReactNode } from "react"
import { StarShape } from "./site-decorations"

const line = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

const pictograms: { label: string; color: string; icon: ReactNode }[] = [
  {
    label: "Cognitiv",
    color: "var(--mint)",
    icon: <path d="M12 16h10a5 5 0 1 1 10 0h10v10a5 5 0 1 0 0 10v10H32a5 5 0 1 0-10 0H12V36a5 5 0 1 1 0-10z" {...line} />,
  },
  {
    label: "Ocupațional",
    color: "var(--accent)",
    icon: (
      <>
        <path d="M6 30q22 14 44 0" {...line} />
        {[10, 20, 30, 40, 48].map((x, i) => (
          <circle key={x} cx={x} cy={[33, 37, 38, 36, 32][i]} r="5" fill="currentColor" />
        ))}
      </>
    ),
  },
  {
    label: "Joc",
    color: "var(--rose)",
    icon: (
      <>
        <path d="M28 8 8 46h40z" {...line} />
        <path d="M28 26 20 46h16z" fill="currentColor" />
      </>
    ),
  },
  {
    label: "Autonomie",
    color: "#7cc4f0",
    icon: (
      <>
        <circle cx="28" cy="28" r="20" {...line} />
        <path d="M28 16v12l8 5" {...line} />
      </>
    ),
  },
  {
    label: "Limbaj și auz",
    color: "var(--primary)",
    icon: (
      <>
        <circle cx="12" cy="28" r="5" fill="currentColor" />
        <path d="M24 18a14 14 0 0 1 0 20M34 10a26 26 0 0 1 0 36M44 4a36 36 0 0 1 0 48" {...line} />
      </>
    ),
  },
  {
    label: "Socializare",
    color: "var(--rose)",
    icon: (
      <>
        <path d="M6 10h22a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H16l-6 6v-6H6a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" {...line} />
        <path d="M36 24h14a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h-2v6l-6-6h-6" {...line} />
      </>
    ),
  },
]

// Varianta 2D, folosita cand telefonul sau browserul nu poate afisa cabinetul 3D
export function RoomPictograms({ built }: { built: number }) {
  return (
    <div className="grid grid-cols-3 gap-3" role="img" aria-label="Cartonașe cu pictograme pentru fiecare domeniu">
      {pictograms.map((p, i) => {
        const on = i < built
        return (
          <div
            key={p.label}
            className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-500 ${
              on ? "bg-card shadow-lg scale-100" : "border-2 border-dashed border-white/30 scale-95"
            }`}
          >
            {on ? (
              <>
                <svg viewBox="0 0 56 56" className="w-1/2" style={{ color: p.color }} aria-hidden="true">
                  {p.icon}
                </svg>
                <span className="font-hand text-foreground text-sm md:text-base leading-none">{p.label}</span>
                {built === pictograms.length && (
                  <svg viewBox="-12 -12 24 24" className="absolute -top-2 -right-2 w-7" aria-hidden="true">
                    <StarShape x={0} y={0} />
                  </svg>
                )}
              </>
            ) : (
              <span className="font-hand text-white/40 text-3xl">{i + 1}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
