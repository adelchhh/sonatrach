import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import sonatrachLogo from "../../assets/logo/sonatrach_logo2-1024x1024.png";

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

  // master scheduler — uses length deps so a stable-content array with a new
  // reference doesn't restart the whole choreography mid-flight
  const candidatesLength = candidates.length;
  const winnersLength = winners.length;

  useEffect(() => {
    if (!running || candidatesLength === 0) return;
    const timers = [];

    sound.init();

    setPhase("init");
    setCountdown(3);
    setCurrentWinnerIndex(-1);

    // INIT → COUNTDOWN at 1500ms. Pre-schedule ALL THREE heartbeats on
    // the audio clock at once so the rhythm is sample-accurate.
    // Tiny +50ms audio nudge compensates for React paint latency so the
    // sound peaks ~when the number visually pops in.
    timers.push(setTimeout(() => {
      setPhase("countdown");
      sound.heartbeat(0.05);   // beat for "3" — slight offset for paint sync
      sound.heartbeat(1.05);   // beat for "2" — exactly 1s later
      sound.heartbeat(2.05);   // beat for "1" — exactly 2s later
    }, 1500));

    // Visual-only number updates (audio already queued above)
    timers.push(setTimeout(() => setCountdown(2), 2500));
    timers.push(setTimeout(() => setCountdown(1), 3500));

    timers.push(setTimeout(() => {
      setPhase("shuffle");
      sound.drumrollStart();
    }, 4500));

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
  }, [running, candidatesLength]);

  // Reveal one winner at a time
  useEffect(() => {
    if (phase !== "reveal") return;

    if (currentWinnerIndex >= winnersLength) {
      const t = setTimeout(() => {
        setPhase("final");
        sound.fanfare();
        burstConfetti(confettiRef.current, "finale");
      }, 550);
      return () => clearTimeout(t);
    }

    const winner = winners[currentWinnerIndex];
    if (!winner) return;

    // Reveal choreography — all timing relative to scene mount (t=0):
    //   t=0       whoosh (the "spin-down" air pass)
    //   t≈400ms   IMPACT: chime + flash + shake + name slide + confetti
    //             (the name keyframe also starts its slide-up at 400ms via
    //              animation-delay, so audio + visual hit on the same frame)
    //   t=2000ms  move to next winner
    const localTimers = [];
    sound.whoosh();
    localTimers.push(setTimeout(() => {
      sound.chime(winner.kind);
      setShake(true);
      setFlash(true);
      burstConfetti(confettiRef.current, winner.kind);
    }, 400));
    localTimers.push(setTimeout(() => setFlash(false), 520));
    localTimers.push(setTimeout(() => setShake(false), 720));
    localTimers.push(setTimeout(() => {
      setCurrentWinnerIndex((i) => i + 1);
    }, 2000));

    return () => localTimers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentWinnerIndex, winnersLength]);

  // notify parent when done — keep callback in a ref so identity churn on the
  // parent doesn't reset the 7s final-scene hold timer
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (phase !== "final") return;
    const t = setTimeout(() => onCompleteRef.current && onCompleteRef.current(), 7000);
    return () => clearTimeout(t);
  }, [phase]);

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

      {/* Orange accent stripe */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-[#ED8D31] z-30" />

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
            className="w-16 h-16 rounded-xl flex items-center justify-center relative overflow-hidden bg-white/95 p-1"
            style={{
              boxShadow:
                "0 0 30px rgba(237,141,49,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <img src={sonatrachLogo} alt="Sonatrach" className="w-full h-full object-contain" />
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
              <span className="absolute inline-flex w-full h-full rounded-full bg-[#ED8D31] opacity-75 animate-ping" />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-[#ED8D31]" />
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
          0%   { opacity: 0; transform: scale(0.7); }
          10%  { opacity: 1; transform: scale(1); }
          80%  { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes nameSlideUp {
          0%   { opacity: 0; transform: translateY(60px); letter-spacing: 0.5em; filter: blur(20px); }
          100% { opacity: 1; transform: translateY(0);   letter-spacing: -0.02em; filter: blur(0); }
        }
        @keyframes nameSlideUpMirror {
          0%   { opacity: 0; transform: translateY(60px) scaleY(-1); letter-spacing: 0.5em; filter: blur(22px); }
          100% { opacity: 0.25; transform: translateY(0) scaleY(-1); letter-spacing: -0.02em; filter: blur(2px); }
        }
        @keyframes shuffleIn {
          0%   { opacity: 0; transform: scale(0.92); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
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
          0%   { opacity: 0; transform: translate(calc(var(--sx) - 50%), calc(var(--sy) - 50%)) rotate(var(--rot)) scale(0); }
          30%  { opacity: 0.9; transform: translate(calc(var(--sx) - 50%), calc(var(--sy) - 50%)) rotate(var(--rot)) scale(1); }
          70%  { opacity: 0.6; transform: translate(calc(var(--sx) * 0.3 - 50%), calc(var(--sy) * 0.3 - 50%)) rotate(0) scale(0.9); }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(0) scale(0.4); }
        }
        @keyframes orbiter {
          from { transform: rotate(0deg) translateX(220px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(220px) rotate(-360deg); }
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
        className="w-44 h-44 rounded-2xl mx-auto mb-8 flex items-center justify-center relative bg-white/95 p-3"
        style={{
          animation: "pulseGlow 2s ease-in-out infinite",
        }}
      >
        <img src={sonatrachLogo} alt="Sonatrach" className="w-full h-full object-contain" />
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
          animation: "scaleFade 1s ease-out forwards",
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
          animation: "scaleFade 1s ease-out forwards",
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
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{ animation: "shuffleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both" }}
    >
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

      {candidates.slice(0, 8).map((c, i) => (
        <div
          key={c.user_id || i}
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            animation: `orbiter ${9 + (i % 3) * 2}s linear infinite`,
            animationDelay: `-${i * 1.1}s`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          <div className="bg-white/12 border border-white/25 rounded-full px-4 py-1.5 text-white text-xs font-medium whitespace-nowrap -translate-x-1/2 -translate-y-1/2">
            {c.first_name} {c.name?.[0]}.
          </div>
        </div>
      ))}

      {candidates.slice(0, 10).map((c, i) => {
        const pos = positions[i] || { startX: 0, startY: 0, delay: 0, angle: 0 };
        return (
          <div
            key={`chip-${c.user_id || i}-${i}`}
            className="absolute bg-[#ED8D31]/20 border border-[#ED8D31]/40 rounded-lg px-3 py-1 text-[#ED8D31] text-xs font-semibold tracking-wide pointer-events-none"
            style={{
              top: "50%",
              left: "50%",
              "--sx": `${pos.startX}vw`,
              "--sy": `${pos.startY}vh`,
              "--rot": `${pos.angle}deg`,
              animation: `chipFly 3.8s ${pos.delay}s cubic-bezier(0.16, 1, 0.3, 1) infinite`,
              willChange: "transform, opacity",
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
          animation: "scaleFade 1.8s ease-out forwards",
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
            animation: "nameSlideUpMirror 0.9s 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 60%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 60%)",
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
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 12,
        delay: Math.random() * 10,
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
            willChange: "transform, opacity",
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
      {[0, 1].map((i) => (
        <div
          key={`b1-${i}`}
          className="absolute"
          style={{
            top: "-50%", left: 0,
            width: "150vw", height: 6,
            background: "linear-gradient(90deg, transparent, rgba(237,141,49,0.7), transparent)",
            filter: "blur(8px)",
            animation: `beamSweep1 ${6 + i * 2}s ${i * 2}s ease-in-out infinite`,
            transformOrigin: "center",
            willChange: "transform, opacity",
          }}
        />
      ))}
      <div
        className="absolute"
        style={{
          top: "30%", left: 0,
          width: "150vw", height: 4,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          filter: "blur(6px)",
          animation: "beamSweep2 8s 1s ease-in-out infinite",
          transformOrigin: "center",
          willChange: "transform, opacity",
        }}
      />
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
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let alive = true;
    let lastTs = performance.now();

    // Physics tuned for a 60fps baseline. On 144Hz / 240Hz monitors we
    // scale every per-frame quantity by dt so confetti falls at the same
    // perceived speed regardless of refresh rate. dt is clamped to avoid
    // huge jumps if the tab was backgrounded.
    const tick = (ts) => {
      if (!alive) return;
      const nowTs = ts || performance.now();
      const dt = Math.min((nowTs - lastTs) / (1000 / 60), 3);
      lastTs = nowTs;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      const state = stateRef.current;
      const dragFactor = Math.pow(0.99, dt);

      for (const p of state.particles) {
        p.vy += 0.35 * dt;
        p.vx *= dragFactor;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotationSpeed * dt;
        p.opacity -= 0.005 * dt;
      }
      state.particles = state.particles.filter(
        (p) => p.opacity > 0 && p.y < h + 80
      );

      for (const p of state.particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      state.rafId = requestAnimationFrame(tick);
    };
    stateRef.current.rafId = requestAnimationFrame(tick);

    return () => {
      alive = false;
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(stateRef.current.rafId);
      stateRef.current.particles = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (ref) {
    if (typeof ref === "function") ref(stateRef.current);
    else ref.current = stateRef.current;
  }

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
  finale: ["#ED8D31", "#FFFFFF", "#B5560F", "#FFD27A", "#1A1A1A", "#FA9D40"],
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
  let compressor = null;
  let drumrollNode = null;
  let drumrollGain = null;

  function init() {
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      // Master bus → compressor → destination. Compressor catches the
      // brass+kick stack in fanfare so it doesn't clip.
      master = ctx.createGain();
      master.gain.value = 0.65;

      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 8;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.25;

      // Delay-based "reverb" body — single source of wet send for every
      // sound, fed from master so volume scales consistently.
      const delay = ctx.createDelay(0.5);
      delay.delayTime.value = 0.18;
      const fb = ctx.createGain();
      fb.gain.value = 0.3;
      const wet = ctx.createGain();
      wet.gain.value = 0.28;
      delay.connect(fb);
      fb.connect(delay);
      delay.connect(wet);

      master.connect(compressor);
      master.connect(delay);
      wet.connect(compressor);
      compressor.connect(ctx.destination);

      // Tiny silent warm-up — kills the first-sound click on Chrome/Win
      const warm = ctx.createOscillator();
      const warmG = ctx.createGain();
      warmG.gain.value = 0.0001;
      warm.connect(warmG);
      warmG.connect(master);
      warm.start();
      warm.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Web Audio unavailable", e);
    }
  }

  function now() {
    return ctx ? ctx.currentTime : 0;
  }

  /**
   * Deep heartbeat kick — used during countdown.
   * `whenOffset` lets the caller schedule a beat in the future on the
   * audio clock so we get rhythm-accurate playback even if setTimeout
   * jitters by a few ms. Typical use: schedule all 3 countdown beats
   * at once → audio rhythm is sample-accurate.
   */
  function heartbeat(whenOffset = 0) {
    if (!ctx) return;
    const t = now() + Math.max(0, whenOffset);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(0.7, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.45);

    // click layer for transient definition (sharp 5ms attack)
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "triangle";
    click.frequency.value = 800;
    clickGain.gain.setValueAtTime(0.22, t);
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
    drumrollGain.gain.exponentialRampToValueAtTime(0.42, t + 4);

    // Tremolo: rapid amplitude modulation = drumroll feel
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(8, t);
    lfo.frequency.exponentialRampToValueAtTime(22, t + 4);
    lfoGain.gain.value = 0.35;
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
      // Fast 60ms fade so the drumroll doesn't bleed into the whoosh that
      // fires right after — keeps the reveal hit clean.
      drumrollGain.gain.cancelScheduledValues(t);
      drumrollGain.gain.setValueAtTime(drumrollGain.gain.value, t);
      drumrollGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      drumrollNode.stop(t + 0.08);
      drumrollNode._lfo?.stop(t + 0.08);
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
    g.gain.exponentialRampToValueAtTime(0.42, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    src.connect(bp);
    bp.connect(g);
    g.connect(master);
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

    // Per-voice gain ramped down so a 4-note triad doesn't clip the master
    const perVoice = 1 / Math.max(2, freqs.length);
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const delay = i * 0.018;
      const peak = 0.34 * perVoice * (freqs.length === 4 ? 1.4 : 1.2);
      g.gain.setValueAtTime(0.001, t + delay);
      g.gain.exponentialRampToValueAtTime(peak, t + delay + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 2.2);
      osc.connect(g);
      g.connect(master);
      osc.start(t + delay);
      osc.stop(t + delay + 2.3);
    });

    // shimmer harmonic — adds the bell-like sparkle on top
    const sh = ctx.createOscillator();
    const shg = ctx.createGain();
    sh.type = "triangle";
    sh.frequency.setValueAtTime(2093, t);
    shg.gain.setValueAtTime(0.001, t);
    shg.gain.exponentialRampToValueAtTime(0.06, t + 0.05);
    shg.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    sh.connect(shg);
    shg.connect(master);
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
      const perVoice = 0.14 / Math.sqrt(freqs.length);
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
        g.gain.exponentialRampToValueAtTime(perVoice, startTime + 0.04);
        g.gain.setValueAtTime(perVoice, startTime + dur - 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(lp);
        lp.connect(g);
        g.connect(master);
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
    kg.gain.exponentialRampToValueAtTime(0.65, kickT + 0.012);
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
