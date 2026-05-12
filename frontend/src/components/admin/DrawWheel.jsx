import { forwardRef, useEffect, useMemo, useRef, useState } from "react";

/**
 * Sonatrach presidential live-draw ceremony — V2 with premium SFX,
 * confetti, camera shake, screen flash, sweeping light beams,
 * and mirrored name reflections.
 *
 * All sound is synthesized live via Web Audio API (no external MP3s).
 */
export default function DrawWheel({
  candidates = [],
  winners = [],
  running = false,
  sessionTitle = "Selection ceremony",
  drawId = null,
  onComplete,
}) {
  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(3);
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(-1);
  const [flash, setFlash] = useState(false);
  const [shake, setShake] = useState(false);

  const confettiRef = useRef(null);
  const sound = useSoundEngine();

  // Pre-compute random positions for shuffle scene
  const chipPositions = useMemo(
    () =>
      candidates.map(() => ({
        startX: (Math.random() - 0.5) * 90,
        startY: (Math.random() - 0.5) * 90,
        delay: Math.random() * 0.4,
        angle: Math.random() * 360,
      })),
    [candidates]
  );

  // master scheduler
  useEffect(() => {
    if (!running || candidates.length === 0) return;
    const timers = [];

    // unlock audio context (must be in user gesture context — running becomes true after click)
    sound.init();

    setPhase("init");

    // INIT → 1.5s
    timers.push(setTimeout(() => {
      setPhase("countdown");
      sound.heartbeat();
    }, 1500));

    // COUNTDOWN beats
    timers.push(setTimeout(() => { setCountdown(2); sound.heartbeat(); }, 2500));
    timers.push(setTimeout(() => { setCountdown(1); sound.heartbeat(); }, 3500));

    // → SHUFFLE
    timers.push(setTimeout(() => {
      setPhase("shuffle");
      sound.drumrollStart();
    }, 4500));

    // → REVEAL
    timers.push(setTimeout(() => {
      sound.drumrollStop();
      setPhase("reveal");
      setCurrentWinnerIndex(0);
    }, 8500));

    return () => {
      timers.forEach(clearTimeout);
      sound.drumrollStop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, candidates]);

  // Reveal one winner at a time (2.0s each for breathing room)
  useEffect(() => {
    if (phase !== "reveal") return;
    if (currentWinnerIndex >= winners.length) {
      const t = setTimeout(() => {
        setPhase("final");
        sound.fanfare();
        // big tricolore confetti finale
        burstConfetti(confettiRef.current, "finale");
      }, 1000);
      return () => clearTimeout(t);
    }

    // Trigger reveal effects
    const winner = winners[currentWinnerIndex];
    sound.whoosh();
    setShake(true);
    setFlash(true);
    setTimeout(() => sound.chime(winner.kind), 380);
    setTimeout(() => burstConfetti(confettiRef.current, winner.kind), 400);
    setTimeout(() => setFlash(false), 120);
    setTimeout(() => setShake(false), 320);

    const t = setTimeout(() => {
      setCurrentWinnerIndex((i) => i + 1);
    }, 2000);
    return () => clearTimeout(t);
  }, [phase, currentWinnerIndex, winners, sound]);

  // notify parent when done
  useEffect(() => {
    if (phase === "final") {
      const t = setTimeout(() => onComplete && onComplete(), 7000);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  if (!running && phase === "idle") return null;

  const currentWinner =
    phase === "reveal" && currentWinnerIndex < winners.length
      ? winners[currentWinnerIndex]
      : null;

  const now = new Date();
  const timestamp = now.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-[#050B14] overflow-hidden"
      style={{
        animation: shake ? "screenShake 0.32s cubic-bezier(0.36, 0.07, 0.19, 0.97)" : undefined,
      }}
    >
      {/* ─── BACKGROUND LAYERS ─────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, #0F1F36 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, #1A0F0A 0%, transparent 60%), #050B14",
        }}
      />

      <ParticleField />
      <SweepingBeams active={phase === "reveal" || phase === "shuffle"} />

      {/* Algerian flag stripe */}
      <div className="absolute top-0 inset-x-0 h-[3px] flex z-30">
        <div className="flex-1 bg-[#006233]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#D21034]" />
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Confetti layer */}
      <ConfettiCanvas ref={confettiRef} />

      {/* White flash overlay */}
      {flash && (
        <div
          className="absolute inset-0 z-[55] pointer-events-none"
          style={{
            background: "white",
            animation: "flashOut 0.12s ease-out forwards",
          }}
        />
      )}

      {/* ─── BROADCAST CHROME ──────────────────────── */}
      <div className="absolute top-0 inset-x-0 px-10 pt-8 z-40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg tracking-tight relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #ED8D31 0%, #B5560F 100%)",
              boxShadow:
                "0 0 30px rgba(237,141,49,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <span className="relative z-10">S</span>
          </div>
          <div>
            <p className="text-[#ED8D31] text-[10px] uppercase tracking-[0.35em] font-bold">
              Sonatrach
            </p>
            <p className="text-white text-base font-medium tracking-tight">
              Live employee draw
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-[#D21034] opacity-75 animate-ping" />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-[#D21034]" />
            </span>
            <span className="text-white text-[11px] uppercase tracking-[0.3em] font-bold">
              On air
            </span>
          </div>
          <div className="text-right">
            <p className="text-[#7A8B9F] text-[10px] uppercase tracking-[0.3em] font-semibold">
              {timestamp}
            </p>
            {drawId && (
              <p className="text-[#ED8D31] text-[10px] tabular-nums tracking-wider mt-0.5">
                DRAW-{String(drawId).padStart(6, "0")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM CHYRON ─────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 z-40">
        <div
          className="h-[4px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, #ED8D31, #B5560F, #ED8D31, transparent)",
          }}
        />
        <div className="bg-gradient-to-t from-black/80 to-transparent px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-[#ED8D31] text-black text-[11px] uppercase font-extrabold tracking-wider px-3 py-1 rounded">
              {phase === "init" && "Initializing"}
              {phase === "countdown" && "Standby"}
              {phase === "shuffle" && "Shuffling"}
              {phase === "reveal" && "Reveal"}
              {phase === "final" && "Complete"}
            </span>
            <p className="text-white text-sm font-medium tracking-wide">
              {sessionTitle}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#7A8B9F] text-[10px] uppercase tracking-[0.3em] font-bold">
              {candidates.length} eligible · {winners.filter((w) => w.kind === "selected").length} positions
            </p>
            {phase === "reveal" && currentWinner && (
              <p className="text-white text-xs mt-1">
                Revealing {currentWinnerIndex + 1} of {winners.length}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── STAGE CONTENT ─────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center z-30 px-10">
        {phase === "init" && <SceneInit />}
        {phase === "countdown" && <SceneCountdown number={countdown} />}
        {phase === "shuffle" && (
          <SceneShuffle candidates={candidates} positions={chipPositions} />
        )}
        {phase === "reveal" && currentWinner && (
          <SceneReveal
            key={`reveal-${currentWinnerIndex}`}
            winner={currentWinner}
            index={currentWinnerIndex}
            total={winners.length}
          />
        )}
        {phase === "final" && <SceneFinal winners={winners} />}
      </div>

      <style>{`
        @keyframes presIn {
          0%   { opacity: 0; transform: scale(0.4); filter: blur(20px); }
          60%  { opacity: 1; transform: scale(1.05); filter: blur(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes scaleFade {
          0%   { opacity: 0; transform: scale(0.5); }
          20%  { opacity: 1; transform: scale(1); }
          80%  { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes nameSlideUp {
          0%   { opacity: 0; transform: translateY(60px); letter-spacing: 0.5em; filter: blur(20px); }
          100% { opacity: 1; transform: translateY(0);   letter-spacing: -0.02em; filter: blur(0); }
        }
        @keyframes nameSubFade {
          0%, 30% { opacity: 0; transform: translateY(20px); }
          100%    { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotateRays {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes chipFly {
          0%   { opacity: 0; transform: translate(var(--sx), var(--sy)) rotate(var(--rot)) scale(0); }
          30%  { opacity: 0.9; transform: translate(var(--sx), var(--sy)) rotate(var(--rot)) scale(1); }
          70%  { opacity: 0.6; transform: translate(calc(var(--sx) * 0.3), calc(var(--sy) * 0.3)) rotate(0) scale(0.9); }
          100% { opacity: 0; transform: translate(0, 0) rotate(0) scale(0.4); }
        }
        @keyframes orbiter {
          from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 60px rgba(237,141,49,0.3), 0 0 120px rgba(237,141,49,0.15); }
          50%      { box-shadow: 0 0 100px rgba(237,141,49,0.6), 0 0 180px rgba(237,141,49,0.3); }
        }
        @keyframes finalRise {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes particleFloat {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes screenShake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-3px, 1px); }
          20%, 40%, 60%, 80%      { transform: translate(3px, -1px); }
        }
        @keyframes flashOut {
          0%   { opacity: 0.9; }
          100% { opacity: 0; }
        }
        @keyframes beamSweep1 {
          0%   { transform: rotate(20deg) translateX(-100vw); opacity: 0; }
          20%  { opacity: 0.7; }
          80%  { opacity: 0.5; }
          100% { transform: rotate(20deg) translateX(100vw); opacity: 0; }
        }
        @keyframes beamSweep2 {
          0%   { transform: rotate(-20deg) translateX(100vw); opacity: 0; }
          20%  { opacity: 0.6; }
          80%  { opacity: 0.4; }
          100% { transform: rotate(-20deg) translateX(-100vw); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════ */
/*  SCENES                                          */
/* ════════════════════════════════════════════════ */

function SceneInit() {
  return (
    <div className="text-center" style={{ animation: "presIn 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}>
      <div
        className="w-32 h-32 rounded-2xl mx-auto mb-8 flex items-center justify-center text-6xl font-bold text-white relative"
        style={{
          background: "linear-gradient(135deg, #ED8D31 0%, #B5560F 100%)",
          animation: "pulseGlow 2s ease-in-out infinite",
        }}
      >
        S
      </div>
      <p className="text-[#ED8D31] text-[11px] uppercase tracking-[0.4em] font-bold mb-3">
        Sonatrach National Lottery
      </p>
      <h2 className="text-white text-6xl font-extralight tracking-tight">
        Preparing draw
      </h2>
      <p className="text-[#7A8B9F] text-sm mt-4 tracking-wide">
        Cryptographically secure random selection · supervised by system audit
      </p>
    </div>
  );
}

function SceneCountdown({ number }) {
  return (
    <div className="relative">
      <div
        className="absolute inset-0 -m-32 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(237,141,49,0.4) 0%, transparent 70%)",
          animation: "scaleFade 1s ease-out",
        }}
        key={number}
      />
      <div
        key={`num-${number}`}
        className="text-white tabular-nums text-center"
        style={{
          fontSize: "300px",
          fontWeight: 200,
          lineHeight: 1,
          letterSpacing: "-0.05em",
          animation: "scaleFade 1s ease-out",
          textShadow: "0 0 80px rgba(237,141,49,0.5)",
        }}
      >
        {number}
      </div>
    </div>
  );
}

function SceneShuffle({ candidates, positions }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="absolute"
        style={{
          width: 400, height: 400, borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(237,141,49,0.3) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      <div className="absolute z-10 text-center">
        <p className="text-[#ED8D31] text-[10px] uppercase tracking-[0.4em] font-bold mb-3">
          Shuffling pool
        </p>
        <p className="text-white text-7xl font-extralight tabular-nums">
          {candidates.length}
        </p>
        <p className="text-[#7A8B9F] text-sm mt-2 uppercase tracking-widest">
          candidates
        </p>
      </div>

      {candidates.slice(0, 12).map((c, i) => (
        <div
          key={c.user_id || i}
          className="absolute"
          style={{
            animation: `orbiter ${8 + (i % 4) * 2}s linear infinite`,
            animationDelay: `-${i * 0.5}s`,
            transformOrigin: "0 0",
          }}
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-white text-xs font-medium whitespace-nowrap">
            {c.first_name} {c.name?.[0]}.
          </div>
        </div>
      ))}

      {candidates.slice(0, 20).map((c, i) => {
        const pos = positions[i] || { startX: 0, startY: 0, delay: 0, angle: 0 };
        return (
          <div
            key={`chip-${c.user_id || i}-${i}`}
            className="absolute bg-[#ED8D31]/20 border border-[#ED8D31]/40 rounded-lg px-3 py-1 text-[#ED8D31] text-xs font-semibold tracking-wide pointer-events-none"
            style={{
              "--sx": `${pos.startX}vw`,
              "--sy": `${pos.startY}vh`,
              "--rot": `${pos.angle}deg`,
              animation: `chipFly 3.5s ${pos.delay}s cubic-bezier(0.16, 1, 0.3, 1) infinite`,
            }}
          >
            {c.employee_number}
          </div>
        );
      })}
    </div>
  );
}

function SceneReveal({ winner, index, total }) {
  const kindLabel = {
    selected: "Selected",
    substitute: "Substitute",
    waiting: "Waiting list",
  }[winner.kind];

  const kindColor = {
    selected: "#ED8D31",
    substitute: "#FFFFFF",
    waiting: "#94A3B8",
  }[winner.kind];

  return (
    <div className="relative flex flex-col items-center text-center">
      <div
        className="absolute"
        style={{
          top: -200, left: "50%", transform: "translateX(-50%)",
          width: 800, height: 800,
          background: `radial-gradient(ellipse at top, ${kindColor}33 0%, transparent 60%)`,
          pointerEvents: "none",
          animation: "scaleFade 1.8s ease-out",
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: 900, height: 900,
          top: "50%", left: "50%", marginTop: -450, marginLeft: -450,
          background: `conic-gradient(from 0deg, transparent 0deg, ${kindColor}22 10deg, transparent 20deg, transparent 60deg, ${kindColor}22 70deg, transparent 80deg, transparent 120deg, ${kindColor}22 130deg, transparent 140deg, transparent 180deg, ${kindColor}22 190deg, transparent 200deg, transparent 240deg, ${kindColor}22 250deg, transparent 260deg, transparent 300deg, ${kindColor}22 310deg, transparent 320deg)`,
          animation: "rotateRays 12s linear infinite",
          opacity: 0.7,
        }}
      />

      <div style={{ animation: "nameSubFade 1s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both" }} className="relative z-10">
        <span
          className="inline-block px-5 py-2 rounded-full text-[11px] uppercase tracking-[0.4em] font-bold border-2"
          style={{
            color: kindColor,
            borderColor: kindColor,
            background: `${kindColor}11`,
          }}
        >
          {kindLabel}
        </span>
      </div>

      <p
        className="text-[#7A8B9F] text-[10px] uppercase tracking-[0.4em] font-semibold mt-6 mb-3 tabular-nums relative z-10"
        style={{ animation: "nameSubFade 0.8s 0.3s both" }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>

      {/* Container for name + mirror */}
      <div className="relative z-10">
        <h1
          className="text-white font-bold relative"
          style={{
            fontSize: "clamp(64px, 9vw, 140px)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            animation: "nameSlideUp 0.9s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
            textShadow: `0 0 60px ${kindColor}66`,
          }}
        >
          {winner.first_name}{" "}
          <span style={{ fontWeight: 200 }}>{winner.name}</span>
        </h1>

        {/* MIRROR REFLECTION */}
        <h1
          aria-hidden="true"
          className="absolute inset-x-0 top-full font-bold pointer-events-none select-none"
          style={{
            fontSize: "clamp(64px, 9vw, 140px)",
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: kindColor,
            transform: "scaleY(-1)",
            opacity: 0.25,
            animation: "nameSlideUp 0.9s 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 60%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 60%)",
            filter: "blur(2px)",
          }}
        >
          {winner.first_name}{" "}
          <span style={{ fontWeight: 200 }}>{winner.name}</span>
        </h1>
      </div>

      <p
        className="text-[#ED8D31] text-2xl mt-4 tabular-nums tracking-[0.4em] font-light relative z-10"
        style={{ animation: "nameSubFade 0.8s 0.8s both" }}
      >
        {winner.employee_number}
      </p>

      {(winner.site_name || winner.substitute_rank) && (
        <p
          className="text-white/70 text-sm mt-6 uppercase tracking-[0.3em] font-medium relative z-10"
          style={{ animation: "nameSubFade 0.8s 1s both" }}
        >
          {winner.site_name && <>Assigned · {winner.site_name}</>}
          {winner.kind === "substitute" && winner.substitute_rank && (
            <> · Rank {winner.substitute_rank}</>
          )}
        </p>
      )}
    </div>
  );
}

function SceneFinal({ winners }) {
  const selected = winners.filter((w) => w.kind === "selected");
  const substitutes = winners.filter((w) => w.kind === "substitute");
  const waiting = winners.filter((w) => w.kind === "waiting");

  return (
    <div
      className="w-full max-w-[1400px] max-h-full overflow-y-auto py-12"
      style={{ animation: "finalRise 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div className="text-center mb-10">
        <p className="text-[#ED8D31] text-[11px] uppercase tracking-[0.4em] font-bold mb-3">
          Selection complete
        </p>
        <h2 className="text-white text-5xl font-extralight tracking-tight">
          Official results
        </h2>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="h-px w-12 bg-[#ED8D31]" />
          <p className="text-[#7A8B9F] text-xs uppercase tracking-[0.3em]">
            Certified by Sonatrach audit
          </p>
          <div className="h-px w-12 bg-[#ED8D31]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FinalColumn title="Selected" accent="#ED8D31" items={selected} icon="◆" />
        <FinalColumn title="Substitutes" accent="#FFFFFF" items={substitutes} icon="◇" />
        <FinalColumn title="Waiting list" accent="#94A3B8" items={waiting} icon="○" />
      </div>
    </div>
  );
}

function FinalColumn({ title, accent, items, icon }) {
  return (
    <div
      className="rounded-2xl p-5 border backdrop-blur-md"
      style={{
        background: `linear-gradient(180deg, ${accent}08 0%, transparent 100%)`,
        borderColor: `${accent}33`,
      }}
    >
      <div className="flex items-baseline justify-between mb-5 pb-4 border-b" style={{ borderColor: `${accent}22` }}>
        <div className="flex items-center gap-2">
          <span style={{ color: accent, fontSize: 18 }}>{icon}</span>
          <p className="uppercase tracking-[0.25em] text-[11px] font-bold" style={{ color: accent }}>
            {title}
          </p>
        </div>
        <span className="text-white tabular-nums font-light text-2xl">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((w, i) => (
          <div
            key={`${w.user_id}-${i}`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 bg-white/[0.03] border border-white/[0.05]"
            style={{ animation: `finalRise 0.5s ${0.2 + i * 0.05}s cubic-bezier(0.16, 1, 0.3, 1) both` }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accent}66, ${accent}22)`,
                border: `1px solid ${accent}44`,
              }}
            >
              {(w.first_name?.[0] || "?") + (w.name?.[0] || "")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">
                {w.first_name} {w.name}
              </p>
              <p className="text-[#7A8B9F] text-[11px] tabular-nums mt-0.5 truncate">
                {w.employee_number}
                {w.site_name && ` · ${w.site_name}`}
              </p>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-[#7A8B9F] text-xs italic text-center py-6">None</p>
        )}
      </div>
    </div>
  );
}

function ParticleField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 8,
        size: 1 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.4,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[#ED8D31]"
          style={{
            left: `${p.left}%`, bottom: -10,
            width: p.size, height: p.size, opacity: p.opacity,
            animation: `particleFloat ${p.duration}s ${p.delay}s linear infinite`,
            boxShadow: "0 0 4px rgba(237,141,49,0.8)",
          }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════ */
/*  SWEEPING LIGHT BEAMS                            */
/* ════════════════════════════════════════════════ */

function SweepingBeams({ active }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {[0, 1, 2].map((i) => (
        <div
          key={`b1-${i}`}
          className="absolute"
          style={{
            top: "-50%", left: 0,
            width: "150vw", height: 6,
            background: "linear-gradient(90deg, transparent, rgba(237,141,49,0.7), transparent)",
            filter: "blur(8px)",
            animation: `beamSweep1 ${5 + i * 1.5}s ${i * 1.5}s ease-in-out infinite`,
            transformOrigin: "center",
          }}
        />
      ))}
      {[0, 1].map((i) => (
        <div
          key={`b2-${i}`}
          className="absolute"
          style={{
            top: "30%", left: 0,
            width: "150vw", height: 4,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            filter: "blur(6px)",
            animation: `beamSweep2 ${6 + i * 2}s ${i * 2}s ease-in-out infinite`,
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════ */
/*  CONFETTI — Canvas-based, Sonatrach palette      */
/* ════════════════════════════════════════════════ */

const ConfettiCanvas = forwardRef(function ConfettiCanvas(props, ref) {
    const canvasRef = useRef(null);
    const stateRef = useRef({ particles: [], rafId: null });

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener("resize", resize);

      const tick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const state = stateRef.current;
        state.particles.forEach((p) => {
          p.vy += 0.35; // gravity
          p.vx *= 0.99; // drag
          p.x += p.vx;
          p.y += p.vy;
          p.rotation += p.rotationSpeed;
          p.opacity -= 0.005;
        });
        state.particles = state.particles.filter(
          (p) => p.opacity > 0 && p.y < canvas.height + 80
        );

        state.particles.forEach((p) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });

        state.rafId = requestAnimationFrame(tick);
      };
      tick();

      return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(stateRef.current.rafId);
      };
    }, []);

    if (ref) ref.current = stateRef.current;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[45] pointer-events-none"
    />
  );
});

const SONATRACH_PALETTES = {
  selected: ["#ED8D31", "#B5560F", "#FFFFFF", "#1A1A1A", "#FFD27A"],
  substitute: ["#FFFFFF", "#E0E0E0", "#ED8D31", "#7A8088"],
  waiting: ["#94A3B8", "#FFFFFF", "#475569"],
  finale: ["#ED8D31", "#FFFFFF", "#006233", "#D21034", "#FFD27A", "#1A1A1A"],
};

function burstConfetti(state, kind) {
  if (!state) return;
  const palette = SONATRACH_PALETTES[kind] || SONATRACH_PALETTES.selected;
  const count = kind === "finale" ? 240 : 110;

  if (kind === "finale") {
    // Three bursts spread across the screen
    [0.25, 0.5, 0.75].forEach((xRatio) => {
      const cx = window.innerWidth * xRatio;
      spawn(state, cx, window.innerHeight * 0.55, palette, count / 3);
    });
  } else {
    const cx = window.innerWidth * 0.5;
    const cy = window.innerHeight * 0.45;
    spawn(state, cx, cy, palette, count);
  }
}

function spawn(state, cx, cy, palette, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 8 + Math.random() * 14;
    state.particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 14,
      color: palette[Math.floor(Math.random() * palette.length)],
      w: 6 + Math.random() * 8,
      h: 3 + Math.random() * 5,
      opacity: 1,
    });
  }
}

/* ════════════════════════════════════════════════ */
/*  SOUND ENGINE — Web Audio API synth              */
/* ════════════════════════════════════════════════ */

function useSoundEngine() {
  const engineRef = useRef(null);

  if (!engineRef.current) {
    engineRef.current = createSoundEngine();
  }

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
    };
  }, []);

  return engineRef.current;
}

function createSoundEngine() {
  let ctx = null;
  let master = null;
  let reverb = null;
  let drumrollNode = null;
  let drumrollGain = null;

  function init() {
    if (ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.7;

      // Simple "reverb": delay + feedback for body
      const delay = ctx.createDelay(0.5);
      delay.delayTime.value = 0.18;
      const fb = ctx.createGain();
      fb.gain.value = 0.32;
      const wet = ctx.createGain();
      wet.gain.value = 0.35;
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(wet);
      wet.connect(ctx.destination);

      reverb = delay; // anything connected here gets wet send
      master.connect(ctx.destination);
      master.connect(delay);
    } catch (e) {
      console.warn("Web Audio unavailable", e);
    }
  }

  function now() {
    return ctx ? ctx.currentTime : 0;
  }

  /** Deep heartbeat kick — used during countdown */
  function heartbeat() {
    if (!ctx) return;
    const t = now();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(1.0, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.45);

    // click layer
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "triangle";
    click.frequency.value = 800;
    clickGain.gain.setValueAtTime(0.3, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    click.connect(clickGain);
    clickGain.connect(master);
    click.start(t);
    click.stop(t + 0.06);
  }

  /** Long building drumroll while the wheel shuffles */
  function drumrollStart() {
    if (!ctx || drumrollNode) return;
    const t = now();
    // White noise buffer
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    drumrollNode = ctx.createBufferSource();
    drumrollNode.buffer = buffer;
    drumrollNode.loop = true;

    // Bandpass filter for "rumble"
    const bp = ctx.createBiquadFilter();
    bp.type = "lowpass";
    bp.frequency.setValueAtTime(140, t);
    bp.frequency.exponentialRampToValueAtTime(900, t + 4);
    bp.Q.value = 1.5;

    drumrollGain = ctx.createGain();
    drumrollGain.gain.setValueAtTime(0.0001, t);
    drumrollGain.gain.exponentialRampToValueAtTime(0.55, t + 4);

    // Tremolo: rapid amplitude modulation = drumroll feel
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(8, t);
    lfo.frequency.exponentialRampToValueAtTime(22, t + 4);
    lfoGain.gain.value = 0.4;
    lfo.connect(lfoGain);
    lfoGain.connect(drumrollGain.gain);

    drumrollNode.connect(bp);
    bp.connect(drumrollGain);
    drumrollGain.connect(master);
    drumrollNode.start(t);
    lfo.start(t);

    drumrollNode._lfo = lfo;
    drumrollNode._bp = bp;
  }

  function drumrollStop() {
    if (!ctx || !drumrollNode) return;
    const t = now();
    try {
      drumrollGain.gain.cancelScheduledValues(t);
      drumrollGain.gain.setValueAtTime(drumrollGain.gain.value, t);
      drumrollGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      drumrollNode.stop(t + 0.25);
      drumrollNode._lfo?.stop(t + 0.25);
    } catch (e) {}
    drumrollNode = null;
    drumrollGain = null;
  }

  /** Cinematic whoosh — air pass right before reveal */
  function whoosh() {
    if (!ctx) return;
    const t = now();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 3;
    bp.frequency.setValueAtTime(3000, t);
    bp.frequency.exponentialRampToValueAtTime(400, t + 0.45);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    g.connect(reverb);
    src.start(t);
    src.stop(t + 0.55);
  }

  /** Bell-like chime stack — plays when name appears */
  function chime(kind = "selected") {
    if (!ctx) return;
    const t = now();
    // Major triad — gold feeling
    const freqs = kind === "selected"
      ? [523.25, 659.25, 783.99, 1046.5]    // C5 E5 G5 C6 — bright
      : kind === "substitute"
      ? [440, 554.37, 659.25]               // A4 C#5 E5
      : [392, 466.16, 587.33];              // G4 A#4 D5 — softer

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const delay = i * 0.02;
      g.gain.setValueAtTime(0.001, t + delay);
      g.gain.exponentialRampToValueAtTime(0.25, t + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 2.2);
      osc.connect(g);
      g.connect(master);
      g.connect(reverb);
      osc.start(t + delay);
      osc.stop(t + delay + 2.3);
    });

    // shimmer harmonic
    const sh = ctx.createOscillator();
    const shg = ctx.createGain();
    sh.type = "triangle";
    sh.frequency.setValueAtTime(2093, t);
    shg.gain.setValueAtTime(0.001, t);
    shg.gain.exponentialRampToValueAtTime(0.08, t + 0.05);
    shg.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    sh.connect(shg);
    shg.connect(master);
    shg.connect(reverb);
    sh.start(t);
    sh.stop(t + 1.6);
  }

  /** Triumphant fanfare for the finale */
  function fanfare() {
    if (!ctx) return;
    const t = now();
    // C major fanfare
    const sequence = [
      [t,        [261.63, 329.63, 392.00], 0.6],   // C E G
      [t + 0.25, [293.66, 369.99, 440.00], 0.5],   // D F# A
      [t + 0.5,  [329.63, 415.30, 493.88], 0.5],   // E G# B
      [t + 0.85, [392.00, 493.88, 587.33, 783.99], 0.9], // G B D5 G5 — held
    ];

    sequence.forEach(([startTime, freqs, dur]) => {
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = f;
        // brass-ish filter
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 2400;
        lp.Q.value = 1;

        g.gain.setValueAtTime(0.001, startTime);
        g.gain.exponentialRampToValueAtTime(0.18, startTime + 0.04);
        g.gain.setValueAtTime(0.18, startTime + dur - 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(lp);
        lp.connect(g);
        g.connect(master);
        g.connect(reverb);
        osc.start(startTime);
        osc.stop(startTime + dur + 0.05);
      });
    });

    // big kick on the final chord
    const kickT = t + 0.85;
    const k = ctx.createOscillator();
    const kg = ctx.createGain();
    k.type = "sine";
    k.frequency.setValueAtTime(110, kickT);
    k.frequency.exponentialRampToValueAtTime(38, kickT + 0.25);
    kg.gain.setValueAtTime(0.001, kickT);
    kg.gain.exponentialRampToValueAtTime(0.9, kickT + 0.01);
    kg.gain.exponentialRampToValueAtTime(0.001, kickT + 0.6);
    k.connect(kg);
    kg.connect(master);
    k.start(kickT);
    k.stop(kickT + 0.7);
  }

  function dispose() {
    try { drumrollStop(); } catch (e) {}
    try { ctx?.close(); } catch (e) {}
    ctx = null;
  }

  return {
    init,
    heartbeat,
    drumrollStart,
    drumrollStop,
    whoosh,
    chime,
    fanfare,
    dispose,
  };
}
