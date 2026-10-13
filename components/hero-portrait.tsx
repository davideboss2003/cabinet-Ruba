"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { SpeechStar } from "./site-decorations"

const Portrait3D = dynamic(() => import("./portrait-3d"), { ssr: false })

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

// Portretul 3D din antet; pana se incarca (sau fara WebGL) ramane emblema
export function HeroPortrait() {
  const [use3D, setUse3D] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => setUse3D(hasWebGL()), [])
  const onReady = useCallback(() => setReady(true), [])
  const onContextLost = useCallback(() => setUse3D(false), [])

  if (!use3D) {
    return (
      <div className="flex justify-center mb-6">
        <SpeechStar size={96} />
      </div>
    )
  }

  return (
    <div className="relative mx-auto mb-4 w-64 h-80 md:w-80 md:h-96 cursor-grab active:cursor-grabbing">
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100 animate-pulse"}`}
      >
        <SpeechStar size={96} />
      </div>
      <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
        <Portrait3D onReady={onReady} onContextLost={onContextLost} />
      </div>
    </div>
  )
}
