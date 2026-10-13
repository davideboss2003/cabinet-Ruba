"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"

const Portrait3D = dynamic(() => import("./portrait-3d"), { ssr: false })

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

// Portretul 3D de langa flori; se incarca abia cand ajunge aproape de ecran, iar fara WebGL nu apare deloc
export function PortraitStage() {
  const holder = useRef<HTMLDivElement>(null)
  const [use3D, setUse3D] = useState(false)
  const [near, setNear] = useState(false)
  const [ready, setReady] = useState(false)
  const onReady = useCallback(() => setReady(true), [])
  const onContextLost = useCallback(() => setUse3D(false), [])

  useEffect(() => {
    if (!hasWebGL()) return
    setUse3D(true)
    const el = holder.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: "800px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!use3D) return <div ref={holder} />

  return (
    <div ref={holder} className="relative z-10 mx-auto w-72 h-[22rem] md:w-96 md:h-[28rem] -mb-6 md:-mb-10">
      {/* Aura din spatele portretului */}
      <div
        className={`absolute inset-x-[-25%] top-[-8%] bottom-[2%] rounded-full blur-2xl transition-opacity duration-[1500ms] ${ready ? "opacity-100 animate-halo" : "opacity-0"}`}
        style={{
          background:
            "radial-gradient(closest-side, rgb(255 184 77 / 0.55), rgb(255 122 138 / 0.35) 45%, rgb(108 93 211 / 0.25) 70%, transparent)",
        }}
      />
      <div
        className={`absolute inset-0 cursor-grab active:cursor-grabbing transition-all duration-[1200ms] ease-out ${ready ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-90"}`}
      >
        {near && <Portrait3D onReady={onReady} onContextLost={onContextLost} />}
      </div>
    </div>
  )
}
