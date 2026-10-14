"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import { PLAN_ACCEPTED_EVENT, STORAGE_KEY } from "./cartonas-card"
import { FlowerAnimation } from "./flower-animation"

const Portrait3D = dynamic(() => import("./portrait-3d"), { ssr: false })
const MODEL_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/anto.glb`

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

// Buchetul de la final. Dupa "Accept Planul" florile infloresc din nou si din mijlocul lor
// se ridica portretul ei 3D, cu placuta "Terapeutul anului". Fara WebGL raman doar florile.
export function RewardStage() {
  const stage = useRef<HTMLDivElement>(null)
  const [use3D, setUse3D] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [bloom, setBloom] = useState(0)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const onContextLost = useCallback(() => setUse3D(false), [])

  useEffect(() => {
    if (!hasWebGL()) return
    setUse3D(true)

    // A acceptat deja intr-o vizita anterioara: portretul e acolo de la inceput
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        setRevealed(true)
        return
      }
    } catch {}

    // Modelul se descarca din timp, cand se apropie de final, ca la acceptare sa apara imediat
    const el = stage.current
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          fetch(MODEL_URL).catch(() => {})
          io.disconnect()
        }
      },
      { rootMargin: "1200px" },
    )
    if (el) io.observe(el)

    let timer: ReturnType<typeof setTimeout>
    const onAccepted = () => {
      // Lasam confetti si steluta sa se vada, apoi coboram la recompensa
      timer = setTimeout(() => {
        setRevealed(true)
        setBloom((b) => b + 1)
        stage.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 2600)
    }
    window.addEventListener(PLAN_ACCEPTED_EVENT, onAccepted)
    return () => {
      io.disconnect()
      clearTimeout(timer)
      window.removeEventListener(PLAN_ACCEPTED_EVENT, onAccepted)
    }
  }, [])

  const show = use3D && revealed

  return (
    <div ref={stage}>
      {show && (
        <div className="relative z-10 mx-auto w-72 h-[22rem] md:w-96 md:h-[28rem] -mb-6 md:-mb-10">
          {/* Aura din spatele portretului */}
          <div
            className={`absolute inset-x-[-25%] top-[-8%] bottom-[2%] rounded-full blur-2xl transition-opacity duration-[1500ms] delay-700 ${ready ? "opacity-100 animate-halo" : "opacity-0"}`}
            style={{
              background:
                "radial-gradient(closest-side, rgb(255 184 77 / 0.55), rgb(255 122 138 / 0.35) 45%, rgb(108 93 211 / 0.25) 70%, transparent)",
            }}
          />
          {/* Bustul se ridica din flori */}
          <div
            className={`absolute inset-0 cursor-grab active:cursor-grabbing transition-all duration-[1800ms] delay-1000 ease-out ${ready ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-24 scale-75"}`}
          >
            <Portrait3D onReady={onReady} onContextLost={onContextLost} />
          </div>
          {/* Placuta de pe soclu */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 bottom-[1%] md:bottom-[2%] whitespace-nowrap rounded-md px-4 py-1.5 text-center shadow-lg transition-all duration-700 delay-[2800ms] ${ready ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
            style={{
              background: "linear-gradient(135deg, #f7d27a, #ffefc2 45%, #e3a93a)",
              border: "1px solid #b9862a",
            }}
          >
            <p className="font-serif font-semibold text-[#3a2a0c] text-sm md:text-base leading-tight">
              Antonia Ariadna Ruba
            </p>
            <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.25em] text-[#6b4e14]">
              Terapeutul anului
            </p>
          </div>
        </div>
      )}

      {/* Florile; la acceptare pornesc din nou, ca sa infloreasca odata cu portretul */}
      <div className="relative h-[46vmin] overflow-visible">
        <FlowerAnimation key={bloom} />
      </div>
    </div>
  )
}
