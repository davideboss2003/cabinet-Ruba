"use client";

import { useEffect, useState, type ReactNode } from "react";
import { notifyAccepted } from "@/lib/notify";
import { SpeechStar, StarShape } from "./site-decorations";

export const STORAGE_KEY = "plan-acceptat-antonia";
// Anunta recompensa de jos (portretul) ca planul a fost acceptat
export const PLAN_ACCEPTED_EVENT = "plan-acceptat";

function Confetti() {
  const colors = ["var(--accent)", "var(--rose)", "var(--mint)", "var(--primary)"];
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-visible">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 30}%`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        >
          {i % 3 === 0 ? (
            <svg width={20 + Math.random() * 14} viewBox="-12 -12 24 24" aria-hidden="true">
              <StarShape x={0} y={0} />
            </svg>
          ) : (
            <div
              style={{
                width: 8 + Math.random() * 8,
                height: 8 + Math.random() * 8,
                background: colors[i % colors.length],
                borderRadius: i % 2 === 0 ? "50%" : 2,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Pictograma de pe cartonas: A si D, la o cafea distanta
function ConversationDrawing() {
  return (
    <svg viewBox="0 0 400 150" className="w-full h-auto" role="img" aria-label="Două bule de dialog, A și D, cu o cafea între ele">
      {/* Bula A */}
      <path d="M40 24h84a14 14 0 0 1 14 14v40a14 14 0 0 1-14 14H86l-22 20V92H40a14 14 0 0 1-14-14V38a14 14 0 0 1 14-14z" fill="var(--rose)" fillOpacity="0.2" stroke="var(--rose)" strokeWidth="3" strokeLinejoin="round" />
      {/* Bula D */}
      <path d="M360 24h-84a14 14 0 0 0-14 14v40a14 14 0 0 0 14 14h38l22 20V92h24a14 14 0 0 0 14-14V38a14 14 0 0 0-14-14z" fill="var(--primary)" fillOpacity="0.15" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" />
      <g className="font-serif" textAnchor="middle" fontSize="44" fontWeight="600">
        <text x="82" y="74" fill="var(--rose)">A</text>
        <text x="318" y="74" fill="var(--primary)">D</text>
      </g>
      {/* Unde sonore */}
      <g stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6">
        <path d="M150 46a16 16 0 0 1 0 24M160 38a28 28 0 0 1 0 40" />
        <path d="M250 46a16 16 0 0 0 0 24M240 38a28 28 0 0 0 0 40" />
      </g>
      {/* Cafeaua */}
      <g stroke="var(--foreground)" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round">
        <path d="M184 62h32v18a12 12 0 0 1-12 12h-8a12 12 0 0 1-12-12z" fill="var(--accent)" />
        <path d="M216 68h5a6 6 0 0 1 0 12h-5" fill="none" />
        <path d="M192 52q-4-5 0-10M200 52q-4-5 0-10M208 52q-4-5 0-10" fill="none" strokeWidth="2" opacity="0.6" />
      </g>
      <StarShape x={200} y={22} scale={0.9} />
      <text x="200" y="126" textAnchor="middle" fontSize="17" fill="var(--muted-foreground)" className="font-hand">
        distanța dintre A și D: o cafea
      </text>
    </svg>
  );
}

function PlanRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4 text-left">
      <p className="text-muted-foreground text-xs font-sans mb-1 uppercase tracking-widest">{label}</p>
      <p className="font-sans text-foreground leading-relaxed">{children}</p>
    </div>
  );
}

export function CartonasCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Daca a acceptat deja, pastram steluta si nu mai trimitem notificarea a doua oara
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) setAccepted(true);
    } catch {}
  }, []);

  const handleAccept = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2800);
    setAccepted(true);
    window.dispatchEvent(new Event(PLAN_ACCEPTED_EVENT));
    notifyAccepted().then((sent) => {
      if (!sent) return;
      try {
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      } catch {}
    });
  };

  return (
    <div className="relative perspective-1000">
      {showConfetti && <Confetti />}

      {/* Flip Card Container */}
      <div
        className={`relative w-full max-w-xl mx-auto transition-transform duration-700 ${isFlipped ? "" : "cursor-pointer"}`}
        onClick={() => !isFlipped && setIsFlipped(true)}
        onKeyDown={(e) => {
          if (!isFlipped && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setIsFlipped(true);
          }
        }}
        role={isFlipped ? undefined : "button"}
        tabIndex={isFlipped ? undefined : 0}
        style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : undefined }}
      >
        {/* Front - Planul de interventie */}
        <div className={`bg-card rounded-3xl shadow-2xl overflow-hidden backface-hidden ${isFlipped ? "invisible" : ""}`}>
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between font-hand text-lg">
            <span>Cartonaș nr. 01</span>
            <span className="bg-white rounded-full w-11 h-11 flex items-center justify-center pt-1">
              <SpeechStar size={30} />
            </span>
            <span>Fișa 2026</span>
          </div>

          <div className="p-6 md:p-8 bg-grid-paper">
            <p className="font-serif text-2xl md:text-3xl text-foreground font-semibold mb-1">Plan de Intervenție Personalizat</p>
            <p className="font-hand text-lg text-primary mb-4">domeniul: socializare</p>

            <div className="bg-card rounded-2xl border-2 border-dashed border-primary/30 p-3 mb-5">
              <ConversationDrawing />
            </div>

            <div className="mb-5 text-left">
              <p className="text-muted-foreground text-xs font-sans mb-1 uppercase tracking-widest">Obiectiv</p>
              <p className="font-serif text-xl md:text-2xl text-foreground leading-snug">
                O ieșire în oraș cu potențial ridicat de râsete, voie bună și conversații autentice
              </p>
            </div>

            <PlanRow label="Metode și mijloace">
              Cafea bună sau o plimbare relaxantă, ascultare activă și puțină ludoterapie.
            </PlanRow>
            <PlanRow label="Frecvența ședințelor">Cât de des îți face ție plăcere.</PlanRow>
            <PlanRow label="Rezultate așteptate">
              Reducerea stresului cotidian și tendința de a zâmbi fără nicio explicație logopedică.
            </PlanRow>

            {/* Cine cu cine */}
            <div className="grid grid-cols-2 rounded-2xl border-2 border-primary/30 font-hand text-left overflow-hidden mt-6 bg-card">
              <div className="border-r-2 border-primary/30 px-4 py-2">
                <span className="block text-xs font-sans uppercase tracking-widest text-muted-foreground">Beneficiar</span>
                <span className="text-xl text-foreground">Antonia Ariadna Ruba</span>
              </div>
              <div className="px-4 py-2">
                <span className="block text-xs font-sans uppercase tracking-widest text-muted-foreground">Întocmit de</span>
                <span className="text-xl text-foreground">Davide</span>
              </div>
            </div>

            <p className="text-primary text-base md:text-lg font-sans mt-6 animate-pulse tracking-wide">
              Apasă pe cartonaș ca să îl întorci...
            </p>
          </div>
        </div>

        {/* Back - Invitation */}
        <div
          className={`absolute inset-0 bg-card rounded-3xl p-3 shadow-2xl backface-hidden ${!isFlipped ? "invisible" : ""}`}
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="relative h-full border-2 border-dashed border-primary/40 rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center bg-grid-paper">
            <p className="font-hand text-lg text-primary mb-4">Acordul beneficiarului</p>
            <div className="mb-4">
              <SpeechStar size={72} />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 text-balance">
              O Întrebare Specială
            </h2>
            <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed mb-4 text-balance">
              Dacă aș avea onoarea și privilegiul să te scot în oraș, mi-ar face mare plăcere!
            </p>
            <p className="font-serif text-2xl md:text-3xl text-primary font-semibold mb-8 text-balance">
              Ce zici, începem ședințele?
            </p>

            {accepted ? (
              <div aria-live="polite" className="flex flex-col items-center mt-2">
                <div className="animate-stamp flex items-center gap-3 border-4 border-accent bg-accent/15 text-accent-foreground rounded-2xl px-5 py-2 font-sans font-bold text-2xl md:text-3xl uppercase tracking-widest">
                  <svg width="40" viewBox="-12 -12 24 24" aria-hidden="true">
                    <StarShape x={0} y={0} />
                  </svg>
                  Acceptat
                </div>
                <p className="font-sans text-foreground mt-6 max-w-sm text-balance">
                  Ai primit steluța! Davide a fost anunțat și e cel mai fericit om din cabinet. Urmează programarea
                  primei ședințe.
                </p>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccept();
                }}
                className="group relative px-8 py-4 bg-primary text-primary-foreground font-sans font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 11.080V12a10 10 0 1 1-5.930-9.140" />
                    <polyline points="22 4 12 14.010 9 11.010" />
                  </svg>
                  Accept Planul
                </span>
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-0 group-hover:opacity-100" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
