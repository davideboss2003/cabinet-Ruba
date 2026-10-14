"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import { FlowerAnimation } from "./flower-animation"

const Portrait3D = dynamic(() => import("./portrait-3d"), { ssr: false })

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

// Buchetul de la final, cu portretul ei 3D si placuta "Psihologul anului".
// Nu depinde de "Accept Planul": modelul se descarca din timp si bustul se ridica
// dintre flori cand ajunge pe ecran. Fara WebGL raman doar florile.
export function RewardStage() {
  const stage = useRef<HTMLDivElement>(null)
  const [use3D, setUse3D] = useState(false)
  const [near, setNear] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const onContextLost = useCallback(() => setUse3D(false), [])

  useEffect(() => {
    if (!hasWebGL()) return
    setUse3D(true)
    const el = stage.current
    if (!el) return

    // Cu mult inainte: montam scena ca modelul sa fie gata cand ajunge ea acolo
    const preload = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          preload.disconnect()
        }
      },
      { rootMargin: "1200px" },
    )
    // Cand recompensa intra pe ecran, bustul se ridica
    const reveal = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true)
          reveal.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    preload.observe(el)
    reveal.observe(el)
    return () => {
      preload.disconnect()
      reveal.disconnect()
    }
  }, [])

  const up = ready && revealed

  return (
    <div ref={stage}>
      {use3D && (
        <div className="relative z-10 mx-auto w-72 h-[22rem] md:w-96 md:h-[28rem] -mb-6 md:-mb-10">
          {/* Aura din spatele portretului */}
          <div
            className={`absolute inset-x-[-25%] top-[-8%] bottom-[2%] rounded-full blur-2xl transition-opacity duration-[1500ms] delay-700 ${up ? "opacity-100 animate-halo" : "opacity-0"}`}
            style={{
              background:
                "radial-gradient(closest-side, rgb(255 184 77 / 0.55), rgb(255 122 138 / 0.35) 45%, rgb(108 93 211 / 0.25) 70%, transparent)",
            }}
          />
          {/* Bustul se ridica din flori */}
          <div
            className={`absolute inset-0 cursor-grab active:cursor-grabbing transition-all duration-[1800ms] delay-1000 ease-out ${up ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-24 scale-75"}`}
          >
            {near && <Portrait3D onReady={onReady} onContextLost={onContextLost} />}
          </div>
          {/* Placuta de pe soclu */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-[1%] md:bottom-[2%] whitespace-nowrap rounded-md px-4 py-1.5 text-center shadow-lg transition-all duration-700 delay-[2800ms] ${up ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
            style={{
              background: "linear-gradient(135deg, #f7d27a, #ffefc2 45%, #e3a93a)",
              border: "1px solid #b9862a",
            }}
          >
            <p className="font-serif font-semibold text-[#3a2a0c] text-sm md:text-base leading-tight">
              Antonia Ariadna Ruba
            </p>
            <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.25em] text-[#6b4e14]">
              Psihologul anului
            </p>
          </div>
        </div>
      )}

      {/* Florile */}
      <div className="relative h-[46vmin] overflow-visible">
        <FlowerAnimation />
      </div>
    </div>
  )
}
