"use client"

import { OrbitControls, useGLTF } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Suspense, useEffect, useRef } from "react"
import * as THREE from "three"

const MODEL_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/anto.glb`
const SWING = 0.55

function Bust({ onReady }: { onReady?: () => void }) {
  // Modelul e comprimat cu meshopt (fara Draco, ca sa nu depinda de alt server)
  const { scene } = useGLTF(MODEL_URL, false, true)
  useEffect(() => onReady?.(), [onReady])
  // In fisier bustul priveste spre +X; il intoarcem cu fata spre camera
  return <primitive object={scene} rotation={[0, -Math.PI / 2, 0]} />
}

function Pedestal() {
  return (
    <group position={[0, -0.5, 0]}>
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.36, 0.4, 0.07, 48]} />
        <meshStandardMaterial color="#6c5dd3" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.09, 0]}>
        <cylinderGeometry args={[0.43, 0.45, 0.05, 48]} />
        <meshStandardMaterial color="#ffb84d" roughness={0.5} />
      </mesh>
    </group>
  )
}

// Bustul se leagana usor stanga-dreapta; cu degetul il poti intoarce in aceleasi limite
function SwayControls() {
  const controls = useRef<any>(null)
  const dragging = useRef(false)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const id = setTimeout(() => {
      gl.domElement.style.touchAction = "pan-y"
    }, 0)
    return () => clearTimeout(id)
  }, [gl])

  useFrame(({ clock }, dt) => {
    const c = controls.current
    if (!c || dragging.current) return
    const target = SWING * Math.sin(clock.elapsedTime * 0.5)
    c.setAzimuthalAngle(THREE.MathUtils.damp(c.getAzimuthalAngle(), target, 1.5, dt))
    c.update()
  })

  return (
    <OrbitControls
      ref={controls}
      target={[0, -0.09, 0]}
      enableZoom={false}
      enablePan={false}
      minPolarAngle={1.48}
      maxPolarAngle={1.48}
      minAzimuthAngle={-1.1}
      maxAzimuthAngle={1.1}
      onStart={() => (dragging.current = true)}
      onEnd={() => (dragging.current = false)}
    />
  )
}

export default function Portrait3D({ onReady, onContextLost }: { onReady?: () => void; onContextLost?: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 3.3], fov: 26 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", () => onContextLost?.())}
    >
      <hemisphereLight args={["#ffffff", "#9a8fd8", 2.6]} />
      <directionalLight position={[2, 3, 4]} intensity={2.2} />
      <directionalLight position={[-3, 1, 2]} intensity={0.7} color="#ffd9c2" />
      {/* Lumini din spate, ca parul inchis sa se desprinda de fundalul intunecat */}
      <pointLight position={[-1.4, 0.7, -1.2]} intensity={14} color="#ff9db0" />
      <pointLight position={[1.4, 0.7, -1.2]} intensity={14} color="#b9a8ff" />
      <Suspense fallback={null}>
        <Bust onReady={onReady} />
        <Pedestal />
      </Suspense>
      <SwayControls />
    </Canvas>
  )
}
