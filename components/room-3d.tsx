"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, RoundedBox, Stars } from "@react-three/drei"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import * as THREE from "three"

type Vec3 = [number, number, number]
type Mode = "rise" | "drop" | "pop"

const WOOD = "#d9b58a"
const WOOD_DARK = "#b98f63"
const WHITE = "#fffdfa"
const LAVENDER = "#8a7de6"
const INDIGO = "#6c5dd3"
const ROSE = "#ff7a8a"
const MINT = "#6fcfb3"
const YELLOW = "#ffb84d"
const SKYBLUE = "#7cc4f0"
const WARM_LIGHT = "#ffc66e"
const RAINBOW = [ROSE, YELLOW, MINT, SKYBLUE, LAVENDER]

const SKY_DAY = new THREE.Color("#b9b0ee")
const SKY_NIGHT = new THREE.Color("#0e0a26")

const NAME = "ANTONIA"

const easeOutBack = (p: number) => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2)
const clamp01 = (v: number) => THREE.MathUtils.clamp(v, 0, 1)

function easeOutBounce(p: number) {
  const n = 7.5625
  const d = 2.75
  if (p < 1 / d) return n * p * p
  if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75
  if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375
  return n * (p -= 2.625 / d) * p + 0.984375
}

// Animatia de aparitie a unui obiect. `position` este baza lui (punctul de pe care se ridica).
function Piece({
  position,
  rotation,
  delay = 0,
  mode = "pop",
  children,
}: {
  position: Vec3
  rotation?: Vec3
  delay?: number
  mode?: Mode
  children: ReactNode
}) {
  const ref = useRef<THREE.Group>(null)
  const time = useRef(0)

  useFrame((_, dt) => {
    const g = ref.current
    if (!g || time.current > delay + 1) return
    time.current += Math.min(dt, 0.05)
    const p = clamp01((time.current - delay) / 0.7)
    g.visible = p > 0
    if (mode === "rise") g.scale.y = Math.max(easeOutBack(p), 0.001)
    if (mode === "pop") g.scale.setScalar(Math.max(easeOutBack(p), 0.001))
    if (mode === "drop") g.position.y = position[1] + (1 - easeOutBounce(p)) * 5
  })

  return (
    <group ref={ref} position={position} rotation={rotation} visible={false}>
      {children}
    </group>
  )
}

// Cutie simpla, pozitionata dupa centru
function Box({ at, size, color, rotation }: { at: Vec3; size: Vec3; color: string; rotation?: Vec3 }) {
  return (
    <mesh position={at} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  )
}

function Ball({ at, r, color }: { at: Vec3; r: number; color: string }) {
  return (
    <mesh position={at} castShadow>
      <sphereGeometry args={[r, 20, 20]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  )
}

// Cilindru vertical, pozitionat dupa centru
function Tube({ at, r, h, color, rotation }: { at: Vec3; r: number; h: number; color: string; rotation?: Vec3 }) {
  return (
    <mesh position={at} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, 20]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  )
}

// Material care se aprinde seara (becuri, lampa, fereastra)
function GlowMaterial({
  lit,
  color,
  glow = WARM_LIGHT,
  intensity = 1.5,
}: {
  lit: boolean
  color: string
  glow?: string
  intensity?: number
}) {
  const ref = useRef<THREE.MeshStandardMaterial>(null)

  // Se aprinde lin; proprietatile care ar forta recompilarea shaderului raman fixe
  useFrame((_, dt) => {
    const m = ref.current
    if (m) m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, lit ? intensity : 0, 4, dt)
  })

  return (
    <meshStandardMaterial ref={ref} color={color} roughness={0.4} emissive={glow} emissiveIntensity={0} toneMapped={false} />
  )
}

function Bulb({ at, lit, color = WARM_LIGHT, radius = 0.07 }: { at: Vec3; lit: boolean; color?: string; radius?: number }) {
  return (
    <mesh position={at}>
      <sphereGeometry args={[radius, 12, 12]} />
      <GlowMaterial lit={lit} color="#fff3d6" glow={color} intensity={3.5} />
    </mesh>
  )
}

// Textura cu o litera, desenata pe loc (fara fonturi descarcate)
function useLetterTexture(letter: string, background: string, ink: string) {
  return useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 128
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = background
    ctx.fillRect(0, 0, 128, 128)
    ctx.strokeStyle = ink
    ctx.globalAlpha = 0.35
    ctx.lineWidth = 6
    ctx.strokeRect(12, 12, 104, 104)
    ctx.globalAlpha = 1
    ctx.fillStyle = ink
    ctx.font = "bold 84px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(letter, 64, 70)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [letter, background, ink])
}

// Cub cu litera: cade la final si lumineaza usor seara
function LetterBlock({ letter, color, at, turn, delay, lit }: { letter: string; color: string; at: Vec3; turn: number; delay: number; lit: boolean }) {
  const texture = useLetterTexture(letter, color, "#ffffff")
  const material = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((_, dt) => {
    const m = material.current
    if (m) m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, lit ? 0.45 : 0, 3, dt)
  })

  return (
    <Piece position={at} rotation={[0, turn, 0]} delay={delay} mode="drop">
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.64, 0.64, 0.64]} />
        <meshStandardMaterial
          ref={material}
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0}
          roughness={0.6}
          toneMapped={false}
        />
      </mesh>
    </Piece>
  )
}

function LetterCard({ letter, at, color }: { letter: string; at: Vec3; color: string }) {
  const texture = useLetterTexture(letter, "#ffffff", color)
  return (
    <mesh position={at} rotation={[-0.25, 0, 0]} castShadow>
      <boxGeometry args={[0.3, 0.38, 0.02]} />
      <meshStandardMaterial map={texture} roughness={0.8} />
    </mesh>
  )
}

/* ---------- Camera goala: podea, pereti, fereastra, lampa, ghirlanda ---------- */

function Room({ lit, dusk }: { lit: boolean; dusk: boolean }) {
  const backLights = Array.from({ length: 15 }, (_, i) => i)
  const sideLights = Array.from({ length: 11 }, (_, i) => i)
  const moon = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    if (moon.current) moon.current.scale.setScalar(THREE.MathUtils.damp(moon.current.scale.x, dusk ? 1 : 0.001, 3, dt))
  })

  return (
    <group>
      {/* Podea */}
      <RoundedBox args={[9.6, 0.5, 7.6]} radius={0.12} smoothness={4} position={[0, -0.25, 0]} receiveShadow>
        <meshStandardMaterial color="#ead2ad" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[9.2, 0.5, 7.2]} radius={0.2} smoothness={4} position={[0, -0.7, 0]}>
        <meshStandardMaterial color={WOOD_DARK} roughness={1} />
      </RoundedBox>
      {[-2.5, -1.25, 0, 1.25, 2.5].map((z) => (
        <mesh key={z} position={[0.05, 0.004, z]}>
          <boxGeometry args={[9.1, 0.004, 0.03]} />
          <meshStandardMaterial color="#d6b98f" />
        </mesh>
      ))}

      {/* Pereti */}
      <Box at={[0, 1.8, -3.7]} size={[9.6, 3.6, 0.2]} color="#f6f2fd" />
      <Box at={[-4.7, 1.8, 0]} size={[0.2, 3.6, 7.6]} color="#f6f2fd" />
      <Box at={[0.05, 0.6, -3.58]} size={[9.3, 1.2, 0.05]} color="#dcd5f8" />
      <Box at={[-4.58, 0.6, 0.05]} size={[0.05, 1.2, 7.3]} color="#dcd5f8" />
      <Box at={[0.05, 1.22, -3.56]} size={[9.3, 0.06, 0.08]} color={WHITE} />
      <Box at={[-4.56, 1.22, 0.05]} size={[0.08, 0.06, 7.3]} color={WHITE} />

      {/* Fereastra */}
      <Box at={[2.6, 2.25, -3.58]} size={[1.9, 1.5, 0.1]} color={WHITE} />
      <mesh position={[2.6, 2.25, -3.56]}>
        <boxGeometry args={[1.62, 1.22, 0.1]} />
        <GlowMaterial lit={lit} color={dusk ? "#2a2f6e" : "#bfe3ff"} glow="#4a5fd0" intensity={0.5} />
      </mesh>
      <Box at={[2.6, 2.25, -3.5]} size={[0.06, 1.22, 0.04]} color={WHITE} />
      <Box at={[2.6, 2.25, -3.5]} size={[1.62, 0.06, 0.04]} color={WHITE} />
      <group ref={moon} position={[3, 2.55, -3.49]} scale={0.001}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
          <meshBasicMaterial color={[2.2, 2, 1.4]} toneMapped={false} />
        </mesh>
      </group>

      {/* Covor */}
      <mesh position={[0.9, 0.02, 0.9]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.04, 48]} />
        <meshStandardMaterial color="#cdeee3" roughness={1} />
      </mesh>
      <mesh position={[0.9, 0.03, 0.9]} receiveShadow>
        <cylinderGeometry args={[1.6, 1.6, 0.04, 48]} />
        <meshStandardMaterial color="#e9f8f2" roughness={1} />
      </mesh>

      {/* Lampadar */}
      <Tube at={[4.1, 0.03, -3.1]} r={0.25} h={0.06} color={INDIGO} />
      <Tube at={[4.1, 1, -3.1]} r={0.03} h={2} color={INDIGO} />
      <mesh position={[4.1, 2.15, -3.1]}>
        <cylinderGeometry args={[0.2, 0.38, 0.45, 20]} />
        <GlowMaterial lit={lit} color="#fff1d0" intensity={2.2} />
      </mesh>

      {/* Ghirlanda de becuri */}
      {backLights.map((i) => (
        <Bulb key={i} at={[-4.2 + i * 0.6, 3.38 - 0.16 * Math.abs(Math.sin((i / 14) * Math.PI * 3)), -3.55]} lit={lit} color={RAINBOW[i % 5]} />
      ))}
      {sideLights.map((i) => (
        <Bulb key={i} at={[-4.55, 3.38 - 0.16 * Math.abs(Math.sin((i / 10) * Math.PI * 2)), -3.2 + i * 0.65]} lit={lit} color={RAINBOW[(i + 2) % 5]} />
      ))}
    </group>
  )
}

/* ---------- 1. Stimulare cognitiva: raftul cu jocuri ---------- */

function CognitiveShelf() {
  return (
    <>
      <Piece position={[-2.9, 0, -3.3]} mode="rise">
        <Box at={[0, 0.9, -0.23]} size={[2.08, 1.8, 0.04]} color="#ece6fb" />
        <Box at={[-1, 0.9, 0]} size={[0.08, 1.8, 0.5]} color={WHITE} />
        <Box at={[1, 0.9, 0]} size={[0.08, 1.8, 0.5]} color={WHITE} />
        {[0.04, 0.85, 1.76].map((y) => (
          <Box key={y} at={[0, y, 0]} size={[2.08, 0.07, 0.5]} color={WHITE} />
        ))}
      </Piece>

      {/* Carti */}
      <Piece position={[-3.75, 0.08, -3.3]} delay={0.5}>
        {RAINBOW.map((c, i) => (
          <Box key={c} at={[i * 0.13, 0.28 + (i % 2) * 0.03, 0]} size={[0.1, 0.56 + (i % 2) * 0.06, 0.34]} color={c} />
        ))}
      </Piece>
      {/* Cub de sortat forme */}
      <Piece position={[-2.35, 0.08, -3.3]} delay={0.65}>
        <Box at={[0, 0.24, 0]} size={[0.48, 0.48, 0.42]} color={YELLOW} />
        <Tube at={[-0.1, 0.34, 0.22]} r={0.07} h={0.02} color={ROSE} rotation={[Math.PI / 2, 0, 0]} />
        <Box at={[0.11, 0.33, 0.22]} size={[0.13, 0.13, 0.02]} color={INDIGO} />
        <Box at={[0, 0.13, 0.22]} size={[0.13, 0.13, 0.02]} color={MINT} rotation={[0, 0, Math.PI / 4]} />
      </Piece>
      {/* Turn de inele */}
      <Piece position={[-3.45, 0.89, -3.3]} delay={0.8}>
        <Tube at={[0, 0.3, 0]} r={0.025} h={0.6} color={WOOD_DARK} />
        {RAINBOW.map((c, i) => (
          <mesh key={c} position={[0, 0.06 + i * 0.105, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.2 - i * 0.03, 0.055, 12, 28]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
        ))}
      </Piece>
      {/* Puzzle */}
      <Piece position={[-2.5, 0.89, -3.36]} delay={0.95}>
        <Box at={[0, 0.3, 0]} size={[0.72, 0.6, 0.05]} color={WHITE} rotation={[-0.18, 0, 0]} />
        {[ROSE, MINT, YELLOW, SKYBLUE].map((c, i) => (
          <Box
            key={c}
            at={[-0.16 + (i % 2) * 0.32, 0.16 + Math.floor(i / 2) * 0.27, 0.05 - Math.floor(i / 2) * 0.05]}
            size={[0.28, 0.24, 0.03]}
            color={c}
            rotation={[-0.18, 0, 0]}
          />
        ))}
      </Piece>
      {/* Planta */}
      <Piece position={[-2.9, 1.8, -3.3]} delay={1.1}>
        <Tube at={[0, 0.12, 0]} r={0.13} h={0.24} color={ROSE} />
        <Ball at={[0, 0.4, 0]} r={0.2} color="#6fbf8f" />
        <Ball at={[0.14, 0.52, 0.05]} r={0.13} color="#7ccf97" />
        <Ball at={[-0.13, 0.5, -0.04]} r={0.12} color="#5fb37c" />
      </Piece>
    </>
  )
}

/* ---------- 2. Terapie ocupationala: masuta de lucru ---------- */

function OccupationalTable() {
  return (
    <>
      <Piece position={[-3.4, 0, 0.3]} mode="rise">
        <Box at={[0, 0.64, 0]} size={[1.2, 0.08, 1.9]} color={WHITE} />
        {[
          [-0.5, -0.85],
          [0.5, -0.85],
          [-0.5, 0.85],
          [0.5, 0.85],
        ].map(([x, z]) => (
          <Box key={`${x}${z}`} at={[x, 0.3, z]} size={[0.08, 0.6, 0.08]} color={WOOD} />
        ))}
      </Piece>
      {/* Taburet */}
      <Piece position={[-2.3, 0, 0.3]} delay={0.3}>
        <Tube at={[0, 0.4, 0]} r={0.28} h={0.07} color={MINT} />
        {[0, 2.1, 4.2].map((a) => (
          <Tube key={a} at={[Math.cos(a) * 0.17, 0.19, Math.sin(a) * 0.17]} r={0.03} h={0.38} color={WOOD} />
        ))}
      </Piece>
      {/* Placa cu pioni */}
      <Piece position={[-3.4, 0.68, -0.25]} delay={0.6}>
        <Box at={[0, 0.03, 0]} size={[0.62, 0.06, 0.62]} color="#f1e3c8" />
        {[-0.18, 0, 0.18].flatMap((x, i) =>
          [-0.18, 0, 0.18].map((z, j) => (
            <Tube key={`${x}${z}`} at={[x, 0.13, z]} r={0.045} h={0.16} color={RAINBOW[(i * 2 + j) % 5]} />
          )),
        )}
      </Piece>
      {/* Sirag de margele */}
      <Piece position={[-3.4, 0.68, 0.72]} delay={0.8}>
        {RAINBOW.concat(RAINBOW.slice(0, 2)).map((c, i) => (
          <Ball key={i} at={[-0.36 + i * 0.12, 0.08, 0.1 * Math.sin((i / 6) * Math.PI)]} r={0.075} color={c} />
        ))}
      </Piece>
      {/* Pahar cu creioane */}
      <Piece position={[-3.75, 0.68, 0.25]} delay={0.95}>
        <Tube at={[0, 0.12, 0]} r={0.1} h={0.24} color={INDIGO} />
        {[ROSE, YELLOW, MINT].map((c, i) => (
          <Tube key={c} at={[-0.04 + i * 0.04, 0.3, (i - 1) * 0.03]} r={0.018} h={0.3} color={c} rotation={[0, 0, (i - 1) * 0.2]} />
        ))}
      </Piece>
    </>
  )
}

/* ---------- 3. Ludoterapie: cortul si jucariile ---------- */

function PlayCorner({ lit }: { lit: boolean }) {
  return (
    <>
      {/* Cort */}
      <Piece position={[2.9, 0, -1.9]} mode="rise">
        <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.25, 2.1, 4]} />
          <meshStandardMaterial color="#ffc2b0" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 0.55, 0.36]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.62, 1.1, 4]} />
          <meshStandardMaterial color="#7a4f63" roughness={1} flatShading />
        </mesh>
        <Tube at={[0.05, 2.2, 0]} r={0.025} h={0.5} color={WOOD_DARK} rotation={[0, 0, 0.3]} />
        <Tube at={[-0.05, 2.2, 0]} r={0.025} h={0.5} color={WOOD_DARK} rotation={[0, 0, -0.3]} />
        <Bulb at={[0, 0.35, 0.5]} lit={lit} color={ROSE} radius={0.09} />
      </Piece>
      {/* Minge */}
      <Piece position={[1.45, 0, -2.7]} delay={0.4}>
        <Ball at={[0, 0.3, 0]} r={0.3} color={YELLOW} />
        <mesh position={[0, 0.3, 0]} rotation={[0.5, 0, 0.3]}>
          <torusGeometry args={[0.3, 0.03, 8, 32]} />
          <meshStandardMaterial color={ROSE} />
        </mesh>
      </Piece>
      {/* Ursulet */}
      <Piece position={[4.0, 0, -0.9]} rotation={[0, -0.7, 0]} delay={0.6}>
        <Ball at={[0, 0.34, 0]} r={0.32} color="#c9a070" />
        <Ball at={[0, 0.8, 0]} r={0.25} color="#c9a070" />
        <Ball at={[-0.18, 1, 0]} r={0.09} color="#b88c5c" />
        <Ball at={[0.18, 1, 0]} r={0.09} color="#b88c5c" />
        <Ball at={[0, 0.75, 0.2]} r={0.1} color="#f1dfc4" />
        <Ball at={[0, 0.3, 0.26]} r={0.17} color="#f1dfc4" />
        <Ball at={[-0.3, 0.45, 0.1]} r={0.12} color="#c9a070" />
        <Ball at={[0.3, 0.45, 0.1]} r={0.12} color="#c9a070" />
        <Ball at={[-0.2, 0.1, 0.22]} r={0.13} color="#c9a070" />
        <Ball at={[0.2, 0.1, 0.22]} r={0.13} color="#c9a070" />
        <Ball at={[-0.09, 0.86, 0.21]} r={0.03} color="#3a2c2c" />
        <Ball at={[0.09, 0.86, 0.21]} r={0.03} color="#3a2c2c" />
      </Piece>
      {/* Turn de cuburi */}
      <Piece position={[1.5, 0, -1.2]} delay={0.8}>
        <Box at={[0, 0.16, 0]} size={[0.32, 0.32, 0.32]} color={SKYBLUE} />
        <Box at={[0.02, 0.48, 0]} size={[0.32, 0.32, 0.32]} color={ROSE} rotation={[0, 0.4, 0]} />
        <Box at={[0, 0.8, 0.02]} size={[0.32, 0.32, 0.32]} color={MINT} rotation={[0, -0.3, 0]} />
        <Box at={[0.45, 0.16, 0.2]} size={[0.32, 0.32, 0.32]} color={YELLOW} rotation={[0, 0.6, 0]} />
      </Piece>
      {/* Curcubeu din lemn */}
      <Piece position={[3.9, 0, 0.5]} rotation={[0, -0.8, 0]} delay={1}>
        {RAINBOW.map((c, i) => (
          <mesh key={c} position={[0, 0.02, 0]} castShadow>
            <torusGeometry args={[0.62 - i * 0.115, 0.055, 10, 28, Math.PI]} />
            <meshStandardMaterial color={c} roughness={0.7} />
          </mesh>
        ))}
      </Piece>
    </>
  )
}

/* ---------- 4. Autonomie personala: cuier, ceas, program vizual ---------- */

function AutonomyCorner() {
  const hands = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (hands.current) hands.current.rotation.x = -clock.elapsedTime * 0.6
  })

  return (
    <>
      {/* Cuier */}
      <Piece position={[-4.55, 1.75, 2.4]}>
        <Box at={[0, 0, 0]} size={[0.06, 0.16, 1.5]} color={WOOD} />
        {[-0.5, 0, 0.5].map((z) => (
          <Tube key={z} at={[0.1, 0, z]} r={0.03} h={0.2} color={WOOD_DARK} rotation={[0, 0, Math.PI / 2]} />
        ))}
      </Piece>
      {/* Ghiozdan si geaca */}
      <Piece position={[-4.38, 1.2, 1.9]} delay={0.35}>
        <Box at={[0, 0.25, 0]} size={[0.26, 0.5, 0.42]} color={ROSE} />
        <Box at={[0.14, 0.16, 0]} size={[0.05, 0.2, 0.28]} color="#ffa3ae" />
      </Piece>
      <Piece position={[-4.42, 0.95, 2.9]} delay={0.5}>
        <Box at={[0, 0.38, 0]} size={[0.2, 0.75, 0.52]} color={MINT} />
        <Box at={[0, 0.5, -0.32]} size={[0.16, 0.5, 0.14]} color={MINT} rotation={[0.25, 0, 0]} />
        <Box at={[0, 0.5, 0.32]} size={[0.16, 0.5, 0.14]} color={MINT} rotation={[-0.25, 0, 0]} />
      </Piece>
      {/* Pantofi */}
      <Piece position={[-4.2, 0, 2.3]} delay={0.65}>
        <Box at={[0, 0.06, 0]} size={[0.34, 0.12, 0.15]} color={YELLOW} />
        <Box at={[0, 0.06, 0.24]} size={[0.34, 0.12, 0.15]} color={YELLOW} />
      </Piece>
      {/* Ceas de perete */}
      <Piece position={[-4.56, 2.65, -1.7]} delay={0.8}>
        <Tube at={[0, 0, 0]} r={0.38} h={0.06} color={WHITE} rotation={[0, 0, Math.PI / 2]} />
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.38, 0.04, 10, 36]} />
          <meshStandardMaterial color={INDIGO} />
        </mesh>
        <Box at={[0.04, 0.1, 0]} size={[0.02, 0.2, 0.035]} color="#2b2545" />
        <group ref={hands} position={[0.05, 0, 0]}>
          <Box at={[0, 0.14, 0]} size={[0.02, 0.28, 0.025]} color={ROSE} />
        </group>
      </Piece>
      {/* Program vizual cu pictograme */}
      <Piece position={[-1.25, 1.35, -3.56]} delay={1}>
        <Box at={[0, 0.9, 0]} size={[0.5, 1.8, 0.05]} color={WHITE} />
        {[ROSE, YELLOW, MINT, SKYBLUE].map((c, i) => (
          <Box key={c} at={[0, 1.56 - i * 0.43, 0.035]} size={[0.34, 0.34, 0.03]} color={c} />
        ))}
      </Piece>
    </>
  )
}

/* ---------- 5. Terapia limbajului si audiologie: oglinda, casti, audiograma ---------- */

function SoundRings() {
  const rings = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    rings.current?.children.forEach((ring, i) => {
      const p = (clock.elapsedTime * 0.5 + i / 3) % 1
      ring.scale.setScalar(0.4 + p * 1.6)
      ;((ring as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - p)
    })
  })

  return (
    <group ref={rings}>
      {[0, 1, 2].map((i) => (
        <mesh key={i}>
          <torusGeometry args={[0.3, 0.012, 8, 40]} />
          <meshBasicMaterial color={INDIGO} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function SpeechCorner() {
  return (
    <>
      {/* Oglinda logopedica */}
      <Piece position={[0.5, 1.4, -3.56]}>
        <Box at={[0, 0.65, 0]} size={[1.56, 1.36, 0.08]} color={WOOD} />
        <mesh position={[0, 0.65, 0.03]}>
          <boxGeometry args={[1.36, 1.16, 0.06]} />
          <meshStandardMaterial color="#dff1ff" metalness={0.2} roughness={0.3} />
        </mesh>
      </Piece>
      {/* Masuta */}
      <Piece position={[0.5, 0, -3.2]} mode="rise" delay={0.3}>
        <Box at={[0, 0.72, 0]} size={[1.7, 0.07, 0.62]} color={WHITE} />
        <Box at={[-0.78, 0.35, 0]} size={[0.07, 0.7, 0.56]} color={WOOD} />
        <Box at={[0.78, 0.35, 0]} size={[0.07, 0.7, 0.56]} color={WOOD} />
      </Piece>
      {/* Cartonase cu litere */}
      <Piece position={[0, 0.76, -3.15]} delay={0.7}>
        <LetterCard letter="A" at={[-0.2, 0.2, 0]} color={ROSE} />
        <LetterCard letter="R" at={[0.15, 0.2, 0]} color={INDIGO} />
        <LetterCard letter="S" at={[0.5, 0.2, 0]} color="#3fae8f" />
      </Piece>
      {/* Casti pe suport */}
      <Piece position={[1.05, 0.76, -3.15]} delay={0.9}>
        <Tube at={[0, 0.02, 0]} r={0.12} h={0.04} color={WOOD_DARK} />
        <Tube at={[0, 0.2, 0]} r={0.02} h={0.38} color={WOOD_DARK} />
        <mesh position={[0, 0.36, 0]} castShadow>
          <torusGeometry args={[0.17, 0.028, 10, 24, Math.PI]} />
          <meshStandardMaterial color={INDIGO} />
        </mesh>
        <Tube at={[-0.17, 0.33, 0]} r={0.085} h={0.07} color={LAVENDER} rotation={[0, 0, Math.PI / 2]} />
        <Tube at={[0.17, 0.33, 0]} r={0.085} h={0.07} color={LAVENDER} rotation={[0, 0, Math.PI / 2]} />
        <group position={[0, 0.36, 0.1]}>
          <SoundRings />
        </group>
      </Piece>
      {/* Audiograma pe perete */}
      <Piece position={[-4.56, 1.6, 0.3]} delay={1.1}>
        <Box at={[0, 0.55, 0]} size={[0.05, 1.1, 1.5]} color={WHITE} />
        {[0.2, 0.45, 0.7, 0.95].map((y) => (
          <Box key={y} at={[0.03, y, 0]} size={[0.01, 0.012, 1.3]} color="#d8d2ee" />
        ))}
        {[0.9, 0.84, 0.72, 0.52, 0.36, 0.28].map((y, i) => (
          <Ball key={i} at={[0.05, y, -0.55 + i * 0.22]} r={0.05} color={i < 3 ? ROSE : INDIGO} />
        ))}
      </Piece>
    </>
  )
}

/* ---------- 6. Socializare: masa pentru doi ---------- */

function Steam({ at }: { at: Vec3 }) {
  const puffs = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    puffs.current?.children.forEach((puff, i) => {
      const p = (clock.elapsedTime * 0.4 + i / 3) % 1
      puff.position.set(Math.sin(p * 6 + i) * 0.03, p * 0.35, 0)
      puff.scale.setScalar(0.5 + p)
      ;((puff as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - p)
    })
  })

  return (
    <group ref={puffs} position={at}>
      {[0, 1, 2].map((i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Chair({ at, turn, color, delay }: { at: Vec3; turn: number; color: string; delay: number }) {
  return (
    <Piece position={at} rotation={[0, turn, 0]} delay={delay}>
      <Box at={[0, 0.44, 0]} size={[0.5, 0.07, 0.5]} color={color} />
      <Box at={[-0.22, 0.75, 0]} size={[0.07, 0.6, 0.5]} color={color} />
      {[
        [-0.2, -0.2],
        [0.2, -0.2],
        [-0.2, 0.2],
        [0.2, 0.2],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} at={[x, 0.21, z]} size={[0.06, 0.42, 0.06]} color={WOOD} />
      ))}
    </Piece>
  )
}

function SocialTable() {
  return (
    <>
      <Piece position={[0.9, 0, 0.9]} mode="rise">
        <Tube at={[0, 0.03, 0]} r={0.32} h={0.06} color={WOOD} />
        <Tube at={[0, 0.38, 0]} r={0.06} h={0.7} color={WOOD} />
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.72, 0.72, 0.07, 40]} />
          <meshStandardMaterial color={WHITE} roughness={0.6} />
        </mesh>
      </Piece>
      <Chair at={[-0.25, 0, 0.9]} turn={0} color={ROSE} delay={0.3} />
      <Chair at={[2.05, 0, 0.9]} turn={Math.PI} color={INDIGO} delay={0.45} />
      {/* Doua cafele */}
      {[-0.32, 0.32].map((x, i) => (
        <Piece key={x} position={[0.9 + x, 0.79, 0.9 + (i ? 0.12 : -0.12)]} delay={0.8 + i * 0.15}>
          <Tube at={[0, 0.005, 0]} r={0.14} h={0.01} color="#f1e9ff" />
          <Tube at={[0, 0.075, 0]} r={0.085} h={0.13} color={i ? "#ded8fb" : "#ffd3d9"} />
          <Tube at={[0, 0.137, 0]} r={0.07} h={0.01} color="#6b4630" />
          <Steam at={[0, 0.18, 0]} />
        </Piece>
      ))}
      {/* Vaza cu floare */}
      <Piece position={[0.9, 0.79, 0.9]} delay={1.1}>
        <Tube at={[0, 0.09, 0]} r={0.05} h={0.18} color={MINT} />
        <Tube at={[0, 0.27, 0]} r={0.012} h={0.2} color="#5fb37c" />
        <Ball at={[0, 0.39, 0]} r={0.07} color={ROSE} />
      </Piece>
    </>
  )
}

/* ---------- Finalul: cuburile ii scriu numele ---------- */

function NameBlocks({ lit }: { lit: boolean }) {
  return (
    <>
      {NAME.split("").map((letter, i) => (
        <LetterBlock
          key={i}
          letter={letter}
          color={RAINBOW[i % 5]}
          // Sirul sta usor in diagonala, cu fata spre privitor
          at={[-2.45 + i * 0.716, 0, 3.55 - i * 0.221]}
          turn={0.3 + ((i * 37) % 7) * 0.05 - 0.15}
          delay={1.4 + i * 0.22}
          lit={lit}
        />
      ))}
    </>
  )
}

const FIREFLY_COUNT = 40
const FIREFLY_COLOR = new THREE.Color(3, 2.3, 0.9)

// Luminite care plutesc prin cabinet dupa ce se aprinde ghirlanda
function Fireflies({ lit }: { lit: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const size = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(
    () =>
      Array.from({ length: FIREFLY_COUNT }, () => ({
        x: (Math.random() - 0.5) * 8.5,
        y: 0.8 + Math.random() * 3.2,
        z: (Math.random() - 0.5) * 6.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
      })),
    [],
  )

  useFrame(({ clock }, dt) => {
    if (!mesh.current) return
    size.current = THREE.MathUtils.damp(size.current, lit ? 1 : 0, 2, dt)
    const t = clock.elapsedTime
    seeds.forEach((f, i) => {
      const a = t * f.speed + f.phase
      dummy.position.set(f.x + Math.sin(a) * 0.5, f.y + Math.sin(a * 1.7) * 0.35, f.z + Math.cos(a * 1.3) * 0.5)
      dummy.scale.setScalar(size.current * (0.6 + 0.4 * Math.sin(a * 3)))
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, FIREFLY_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color={FIREFLY_COLOR} toneMapped={false} />
    </instancedMesh>
  )
}

// Ziua trece in seara dupa ce cad cuburile cu numele
function Atmosphere({ dusk, lit }: { dusk: boolean; lit: boolean }) {
  const scene = useThree((s) => s.scene)
  const ambient = useRef<THREE.AmbientLight>(null)
  const sun = useRef<THREE.DirectionalLight>(null)
  const nightLights = useRef<THREE.Group>(null)
  const sky = useMemo(() => SKY_DAY.clone(), [])
  const moonTint = useMemo(() => new THREE.Color("#a9b4ff"), [])
  const white = useMemo(() => new THREE.Color("#ffffff"), [])

  useEffect(() => {
    scene.background = sky
  }, [scene, sky])

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-1.2 * dt)
    sky.lerp(dusk ? SKY_NIGHT : SKY_DAY, k)
    if (ambient.current) {
      ambient.current.intensity = THREE.MathUtils.lerp(ambient.current.intensity, dusk ? 0.75 : 1.5, k)
      ambient.current.color.lerp(dusk ? moonTint : white, k)
    }
    if (sun.current) sun.current.intensity = THREE.MathUtils.lerp(sun.current.intensity, dusk ? 0.55 : 2, k)
    nightLights.current?.children.forEach((l) => {
      const light = l as THREE.PointLight
      light.intensity = THREE.MathUtils.damp(light.intensity, lit ? light.userData.power : 0, 3, dt)
    })
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={1.5} />
      <directionalLight
        ref={sun}
        position={[7, 13, 9]}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0005}
      />

      {/* Montate de la inceput: adaugarea de lumini in timpul animatiei ar bloca scena o clipa */}
      <group ref={nightLights}>
        <pointLight position={[0.9, 2.4, 0.9]} color={WARM_LIGHT} intensity={0} distance={8} userData={{ power: 12 }} />
        <pointLight position={[3.7, 2, -2.7]} color={WARM_LIGHT} intensity={0} distance={6} userData={{ power: 9 }} />
        <pointLight position={[0, 1.2, 3.6]} color="#ffd9a0" intensity={0} distance={5} userData={{ power: 7 }} />
        <pointLight position={[-3, 2.6, -2.2]} color="#c9b8ff" intensity={0} distance={6} userData={{ power: 7 }} />
      </group>
      {/* Pana seara stau micsorate sub podea, ca shaderul lor sa fie deja compilat */}
      <group scale={dusk ? 1 : 0.001} position={[0, dusk ? 0 : -0.6, 0]}>
        <Stars radius={70} depth={30} count={1500} factor={5} fade speed={0.6} />
      </group>
      <Fireflies lit={lit} />
    </>
  )
}

const VIEW_ANGLE = 1.02
const VIEW_CENTER = 0.55
const VIEW_SWING = 0.38

// Camera se leagana usor intre cei doi pereti; cu degetul o poti intoarce in aceleasi limite
function SwayControls() {
  const controls = useRef<any>(null)
  const dragging = useRef(false)

  useFrame(({ clock }, dt) => {
    const c = controls.current
    if (!c || dragging.current) return
    const target = VIEW_CENTER + VIEW_SWING * Math.sin(clock.elapsedTime * 0.25)
    c.setAzimuthalAngle(THREE.MathUtils.damp(c.getAzimuthalAngle(), target, 1.5, dt))
    c.update()
  })

  return (
    <OrbitControls
      ref={controls}
      target={[0, 1.3, 0]}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={VIEW_ANGLE}
      maxPolarAngle={VIEW_ANGLE}
      minAzimuthAngle={0.12}
      maxAzimuthAngle={1.45}
      onStart={() => (dragging.current = true)}
      onEnd={() => (dragging.current = false)}
    />
  )
}

// Pe telefon: glisarea pe verticala deruleaza pagina, cea pe orizontala roteste cabinetul
function AllowPageScroll() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const id = setTimeout(() => {
      gl.domElement.style.touchAction = "pan-y"
    }, 0)
    return () => clearTimeout(id)
  }, [gl])
  return null
}

// Pe ecrane inalte (telefon) largim unghiul, ca tot cabinetul sa incapa pe latime
function FitCamera() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const aspect = useThree((s) => s.size.width / s.size.height)
  useEffect(() => {
    camera.fov = aspect < 1 ? 30 / aspect : 30
    camera.updateProjectionMatrix()
  }, [camera, aspect])
  return null
}

export default function Room3D({ built, onContextLost }: { built: number; onContextLost?: () => void }) {
  // Finalul: cad cuburile, se lasa seara, apoi se aprind luminile
  const [dusk, setDusk] = useState(false)
  const [lit, setLit] = useState(false)
  const finished = built >= 6

  useEffect(() => {
    if (!finished) return
    const toDusk = setTimeout(() => setDusk(true), 3600)
    const toLit = setTimeout(() => setLit(true), 5200)
    return () => {
      clearTimeout(toDusk)
      clearTimeout(toLit)
    }
  }, [finished])

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [7.5, 12, 15.5], fov: 30 }}
      // Daca placa video renunta, pagina trece pe cartonasele 2D
      onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", () => onContextLost?.())}
      aria-label="Cabinet 3D care se amenajează pas cu pas"
    >
      <Atmosphere dusk={dusk} lit={lit} />
      <Room lit={lit} dusk={dusk} />

      {built >= 1 && <CognitiveShelf />}
      {built >= 2 && <OccupationalTable />}
      {built >= 3 && <PlayCorner lit={lit} />}
      {built >= 4 && <AutonomyCorner />}
      {built >= 5 && <SpeechCorner />}
      {built >= 6 && (
        <>
          <SocialTable />
          <NameBlocks lit={lit} />
        </>
      )}

      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={1} intensity={0.7} radius={0.7} />
      </EffectComposer>

      <SwayControls />
      <AllowPageScroll />
      <FitCamera />
    </Canvas>
  )
}
