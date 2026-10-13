interface DecorationProps {
  size?: number
  className?: string
}

const STAR = "M0-10 2.9-3.1 10-3.1 4.3 1.5 6.2 8.500 0 4.200-6.200 8.500-4.300 1.500-10-3.100-2.900-3.100z"

// Steluta, de pus in interiorul unui <svg>
export function StarShape({ x, y, scale = 1, fill = "var(--accent)", className = "" }: { x: number; y: number; scale?: number; fill?: string; className?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className={className}>
      <path d={STAR} fill={fill} stroke="#e39a2b" strokeWidth="1" strokeLinejoin="round" />
    </g>
  )
}

// Emblema: bula de dialog cu steluta
export function SpeechStar({ size = 60, className = "" }: DecorationProps) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 80 72" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 6h52a10 10 0 0 1 10 10v28a10 10 0 0 1-10 10H40L24 68V54H14A10 10 0 0 1 4 44V16A10 10 0 0 1 14 6z"
        fill="var(--primary)"
      />
      <path d="M14 6h52a10 10 0 0 1 10 10v6H4v-6A10 10 0 0 1 14 6z" fill="#8a7de6" />
      <StarShape x={40} y={32} scale={1.7} />
    </svg>
  )
}

export function PuzzlePiece({ size = 80, className = "" }: DecorationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 22h18a8 8 0 1 1 16 0h18v18a8 8 0 1 0 0 16v14H46a8 8 0 1 0-16 0H12V56a8 8 0 1 1 0-16z"
        fill="var(--mint)"
        fillOpacity="0.35"
        stroke="var(--mint)"
        strokeWidth="2.500"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Cub cu litera
export function AlphabetBlock({ size = 70, letter = "A", className = "" }: DecorationProps & { letter?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 70 70" fill="none" className={className} aria-hidden="true">
      <rect x="6" y="6" width="58" height="58" rx="10" fill="var(--rose)" fillOpacity="0.25" stroke="var(--rose)" strokeWidth="2.500" />
      <rect x="14" y="14" width="42" height="42" rx="6" stroke="var(--rose)" strokeWidth="1.500" />
      <text x="35" y="47" textAnchor="middle" fontSize="32" fontWeight="700" fill="var(--rose)" fontFamily="var(--font-outfit), sans-serif">
        {letter}
      </text>
    </svg>
  )
}

// Unde sonore
export function SoundWaves({ size = 80, className = "" }: DecorationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
      <circle cx="18" cy="40" r="7" fill="var(--primary)" fillOpacity="0.5" />
      <path d="M32 26a20 20 0 0 1 0 28M44 16a34 34 0 0 1 0 48M56 6a48 48 0 0 1 0 68" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// Linie cu unda sonora si eticheta la mijloc
export function WaveLine({ label, className = "" }: { label: string; className?: string }) {
  const wave = (
    <svg viewBox="0 0 120 20" preserveAspectRatio="none" className="h-4 flex-1" fill="none">
      <path d="M0 10q7.500-14 15 0t15 0 15 0 15 0 15 0 15 0 15 0 15 0" stroke="currentColor" strokeWidth="1.500" />
    </svg>
  )
  return (
    <div className={`flex items-center gap-3 font-hand ${className}`} aria-hidden="true">
      {wave}
      <span className="text-lg md:text-xl whitespace-nowrap">{label}</span>
      {wave}
    </div>
  )
}
