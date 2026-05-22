import { useState, useRef, useCallback, useEffect } from 'react';

interface OwlMascotProps {
  size?: number;
  withSparkle?: boolean;
  coverEyes?: boolean;
}

type OwlState = 'normal' | 'dizzy' | 'annoyed' | 'flyaway' | 'returning' | 'bored' | 'sleepy' | 'waking';

export default function OwlMascot({ size = 120, withSparkle = false, coverEyes = false }: OwlMascotProps) {
  const [hovered, setHovered] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [owlState, setOwlState] = useState<OwlState>('normal');
  const [spinDirection, setSpinDirection] = useState<1 | -1>(1); // 1 = clockwise, -1 = counter-clockwise
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteractive = size >= 60;
  const maxPupilShift = 3.5;

  const dizzy = owlState === 'dizzy';
  const annoyed = owlState === 'annoyed';
  const flyaway = owlState === 'flyaway';
  const returning = owlState === 'returning';
  const bored = owlState === 'bored';
  const sleepy = owlState === 'sleepy';
  const waking = owlState === 'waking';
  const gone = flyaway || returning;
  const idle = bored || sleepy;

  // --- Click spam detection ---
  const clickTimesRef = useRef<number[]>([]);
  const stateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    if (!isInteractive || gone || dizzy) return;

    const now = Date.now();
    // Keep only clicks from the last 3 seconds
    clickTimesRef.current = clickTimesRef.current.filter(t => now - t < 3000);
    clickTimesRef.current.push(now);

    const count = clickTimesRef.current.length;

    // At 5 clicks: owl gets annoyed (warning phase)
    if (count >= 5 && count < 7 && owlState !== 'annoyed') {
      setOwlState('annoyed');
      if (stateTimeoutRef.current) clearTimeout(stateTimeoutRef.current);
      stateTimeoutRef.current = setTimeout(() => {
        setOwlState('normal');
      }, 2000);
    }

    // At 7+ clicks: owl flies away!
    if (count >= 7) {
      clickTimesRef.current = [];
      if (stateTimeoutRef.current) clearTimeout(stateTimeoutRef.current);

      setOwlState('flyaway');

      // After fly-away animation completes (1.2s), switch to returning
      stateTimeoutRef.current = setTimeout(() => {
        setOwlState('returning');

        // After fly-back animation (1.5s), return to normal
        stateTimeoutRef.current = setTimeout(() => {
          setOwlState('normal');
        }, 1500);
      }, 2500);
    }
  }, [isInteractive, gone, dizzy, owlState]);

  // --- Circular motion detection refs ---
  const prevAngleRef = useRef<number | null>(null);
  const cumulativeAngleRef = useRef(0);
  const lastResetRef = useRef(Date.now());

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || gone) return;

      // Eyes are closed — ignore all cursor tracking & spin detection
      if (coverEyes) {
        prevAngleRef.current = null;
        cumulativeAngleRef.current = 0;
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.45;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const clamp = Math.min(dist, 120) / 120;

      if (!dizzy) {
        setEyeOffset({
          x: (dx / dist) * maxPupilShift * clamp,
          y: (dy / dist) * maxPupilShift * clamp,
        });
      }

      // Circular motion detection
      const angle = Math.atan2(dy, dx);
      if (prevAngleRef.current !== null) {
        let delta = angle - prevAngleRef.current;
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;
        cumulativeAngleRef.current += delta;
      }
      prevAngleRef.current = angle;

      const now = Date.now();
      if (now - lastResetRef.current > 2000) {
        if (Math.abs(cumulativeAngleRef.current) < Math.PI * 4) {
          cumulativeAngleRef.current = 0;
        }
        lastResetRef.current = now;
      }

      if (Math.abs(cumulativeAngleRef.current) > Math.PI * 6 && !dizzy && !annoyed && !gone) {
        // In screen coords (Y-down): positive cumulative = clockwise, negative = counter-clockwise
        setSpinDirection(cumulativeAngleRef.current > 0 ? 1 : -1);
        setOwlState('dizzy');
        cumulativeAngleRef.current = 0;
        prevAngleRef.current = null;

        if (stateTimeoutRef.current) clearTimeout(stateTimeoutRef.current);
        stateTimeoutRef.current = setTimeout(() => {
          setOwlState('normal');
        }, 3000);
      }
    },
    [maxPupilShift, dizzy, annoyed, gone, coverEyes]
  );

  useEffect(() => {
    if (!isInteractive) return;
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isInteractive, handleMouseMove]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (stateTimeoutRef.current) clearTimeout(stateTimeoutRef.current);
    };
  }, []);

  // --- Idle detection: bored or sleepy after 15s of no activity ---
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isInteractive) return;

    const resetIdle = () => {
      // If owl is currently idle, snap back to normal on any activity
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

      // Only start idle timer when owl is in a resting state
      idleTimerRef.current = setTimeout(() => {
        setOwlState(prev => {
          // Don't interrupt active states
          if (prev !== 'normal') return prev;
          return Math.random() < 0.5 ? 'bored' : 'sleepy';
        });
      }, 15000);
    };

    const wakeUp = () => {
      setOwlState(prev => {
        if (prev === 'bored' || prev === 'sleepy') return 'waking';
        return prev;
      });
      resetIdle();
    };

    // Start the initial idle timer
    resetIdle();

    window.addEventListener('mousemove', wakeUp);
    window.addEventListener('keydown', wakeUp);
    window.addEventListener('click', wakeUp);
    window.addEventListener('scroll', wakeUp);

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', wakeUp);
      window.removeEventListener('keydown', wakeUp);
      window.removeEventListener('click', wakeUp);
      window.removeEventListener('scroll', wakeUp);
    };
  }, [isInteractive]);

  // Waking → normal after wing flap duration
  useEffect(() => {
    if (!waking) return;
    const t = setTimeout(() => setOwlState('normal'), 1500);
    return () => clearTimeout(t);
  }, [waking]);

  // Sleepy eye droop animation
  const [sleepyPhase, setSleepyPhase] = useState(0); // 0=open, 1=half, 2=closed
  useEffect(() => {
    if (!sleepy) { setSleepyPhase(0); return; }
    // Slowly close eyes: open → half-closed → closed over 2s
    const t1 = setTimeout(() => setSleepyPhase(1), 800);
    const t2 = setTimeout(() => setSleepyPhase(2), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [sleepy]);

  // Dizzy eye spin effect — direction matches cursor spin
  useEffect(() => {
    if (!dizzy) return;
    let raf: number;
    const startTime = performance.now();
    const dir = spinDirection; // capture direction at start
    const spin = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const speed = Math.max(0.5, 4 - elapsed * 1.2);
      const angle = dir * elapsed * speed * Math.PI * 2;
      const r = maxPupilShift * 0.8;
      setEyeOffset({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
      raf = requestAnimationFrame(spin);
    };
    raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, [dizzy, maxPupilShift, spinDirection]);

  const lPx = 78 + eyeOffset.x;
  const lPy = 76 + eyeOffset.y;
  const rPx = 94 + eyeOffset.x;
  const rPy = 76 + eyeOffset.y;

  // Container animation based on state
  const getContainerAnimation = () => {
    if (!isInteractive) return undefined;
    if (flyaway) return 'owlFlyAway 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
    if (returning) return 'owlFlyBack 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    if (dizzy) return 'owlDizzyWobble 0.5s ease-in-out infinite';
    if (annoyed) return 'owlAngryShake 0.3s ease-in-out infinite';
    if (waking) return 'owlWakeUp 0.4s ease-out, owlFloat 3s ease-in-out infinite 0.4s';
    if (sleepy) return 'owlFloat 4s ease-in-out infinite';
    if (bored) return 'owlBoredSway 3s ease-in-out infinite';
    return 'owlFloat 3s ease-in-out infinite';
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto"
style={{
        width: size * 1.3,
        height: size * 1.3,
        animation: getContainerAnimation(),
        cursor: isInteractive ? 'pointer' : undefined,
        zIndex: gone ? 50 : undefined,
      }}
      onMouseEnter={() => isInteractive && setHovered(true)}
      onMouseLeave={() => isInteractive && setHovered(false)}
      onClick={handleClick}
    >
      <svg
        viewBox="0 0 160 160"
        width={size * 1.3}
        height={size * 1.3}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transition: 'transform 150ms ease',
          transform: hovered && !dizzy && !annoyed && !gone ? 'scale(1.08)' : 'scale(1)',
          overflow: 'visible',
        }}
      >
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#f5f0d0" />
            <stop offset="70%" stopColor="#e8e0b8" />
            <stop offset="100%" stopColor="#c8c0a0" />
          </radialGradient>
          <filter id="bgShadow" x="-20%" y="-10%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Background circle — cracks on annoyed, shatters on flyaway */}
        <circle
          cx="85" cy="88" r="62"
          fill="url(#bgGrad)"
          filter="url(#bgShadow)"
          style={{
            transition: 'opacity 0.3s',
            opacity: flyaway ? 0 : 1,
          }}
        />

        {/* Crack lines on the circle when annoyed */}
        {annoyed && (
          <g style={{ opacity: 0.6 }}>
            <path d="M65,30 L75,55 L68,70" stroke="#8B7355" strokeWidth="1.5" fill="none" />
            <path d="M110,35 L100,58 L108,68" stroke="#8B7355" strokeWidth="1.2" fill="none" />
            <path d="M50,80 L62,82 L58,95" stroke="#8B7355" strokeWidth="1" fill="none" />
          </g>
        )}

        {/* Shatter particles when flying away */}
        {flyaway && (
          <g style={{ animation: 'shatterFade 0.8s ease-out forwards' }}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const startX = 85 + Math.cos(rad) * 30;
              const startY = 88 + Math.sin(rad) * 30;
              return (
                <circle
                  key={i}
                  cx={startX}
                  cy={startY}
                  r={3 + (i % 3)}
                  fill={i % 2 === 0 ? '#e8e0b8' : '#c8c0a0'}
                  style={{
                    animation: `shatterPiece${i % 4} 0.6s ease-out forwards`,
                    transformOrigin: `${startX}px ${startY}px`,
                  }}
                />
              );
            })}
          </g>
        )}

        {/* === Sparkle star (top-left) === */}
        <path
          d="M32,28 L38,48 L32,68 L26,48 Z"
          fill="#f59e0b"
          style={{
            animation: hovered && !dizzy && !gone && !idle ? 'sparkleRotate 0.4s ease-in-out' : undefined,
            transformOrigin: '32px 48px',
            opacity: gone ? 0 : idle ? 0.3 : 1,
            transition: 'opacity 0.5s',
          }}
        />
        <path
          d="M12,48 L32,42 L52,48 L32,54 Z"
          fill="#f59e0b"
          style={{
            animation: hovered && !dizzy && !gone && !idle ? 'sparkleRotate 0.4s ease-in-out' : undefined,
            transformOrigin: '32px 48px',
            opacity: gone ? 0 : idle ? 0.3 : 1,
            transition: 'opacity 0.5s',
          }}
        />
        {/* Small green sparkle */}
        <g style={{ opacity: gone ? 0 : idle ? 0.3 : 1, transition: 'opacity 0.5s' }}>
          <path d="M50,62 L52,68 L50,74 L48,68 Z" fill="#2e7d32" />
          <path d="M44,68 L50,66 L56,68 L50,70 Z" fill="#2e7d32" />
        </g>

        {/* === Dizzy stars circling above head — direction matches cursor spin === */}
        {dizzy && (
          <g style={{ animation: `dizzyStarsOrbit 0.8s linear infinite${spinDirection === -1 ? ' reverse' : ''}`, transformOrigin: '85px 60px' }}>
            <g transform="translate(60, 50)">
              <polygon points="0,-5 1.5,-1.5 5,0 1.5,1.5 0,5 -1.5,1.5 -5,0 -1.5,-1.5" fill="#f59e0b" />
            </g>
            <g transform="translate(110, 50)">
              <polygon points="0,-4 1.2,-1.2 4,0 1.2,1.2 0,4 -1.2,1.2 -4,0 -1.2,-1.2" fill="#f59e0b" />
            </g>
            <g transform="translate(85, 38)">
              <polygon points="0,-3.5 1,-1 3.5,0 1,1 0,3.5 -1,1 -3.5,0 -1,-1" fill="#ff8f00" />
            </g>
          </g>
        )}

        {/* Annoyed symbols — "!" marks and anger vein */}
        {annoyed && (
          <>
            {/* Anger vein (cross shape top-right) */}
            <g transform="translate(108, 50)">
              <path d="M-4,-4 L4,4 M4,-4 L-4,4" stroke="#e53935" strokeWidth="2.5" strokeLinecap="round"
                style={{ animation: 'angerPulse 0.4s ease-in-out infinite' }} />
            </g>
            {/* "!" exclamation */}
            <g transform="translate(55, 48)" style={{ animation: 'angerPulse 0.4s ease-in-out infinite 0.1s' }}>
              <text x="0" y="0" fontSize="14" fontWeight="bold" fill="#e53935" textAnchor="middle">!</text>
            </g>
          </>
        )}

        {/* === Bored indicator: "..." thought bubble === */}
        {bored && (
          <g style={{ animation: 'boredBubbleFadeIn 0.6s ease-out forwards' }}>
            {/* Thought bubble dots */}
            <circle cx="118" cy="62" r="2" fill="#9e9e9e" opacity="0.5" />
            <circle cx="124" cy="55" r="3" fill="#9e9e9e" opacity="0.5" />
            {/* Main bubble */}
            <rect x="118" y="34" rx="8" ry="8" width="32" height="18" fill="white" stroke="#e0e0e0" strokeWidth="1" />
            <text x="134" y="47" fontSize="10" fill="#9e9e9e" textAnchor="middle" fontWeight="bold">. . .</text>
          </g>
        )}

        {/* === Sleepy indicator: floating Zzz === */}
        {sleepy && sleepyPhase >= 1 && (
          <g>
            <text x="112" y="58" fontSize="8" fill="#7986cb" fontWeight="bold" fontStyle="italic"
              style={{ animation: 'sleepyZFade 2s ease-in-out infinite', opacity: 0.8 }}>z</text>
            <text x="120" y="48" fontSize="11" fill="#5c6bc0" fontWeight="bold" fontStyle="italic"
              style={{ animation: 'sleepyZFade 2s ease-in-out infinite 0.4s', opacity: 0.9 }}>z</text>
            <text x="130" y="36" fontSize="14" fill="#3f51b5" fontWeight="bold" fontStyle="italic"
              style={{ animation: 'sleepyZFade 2s ease-in-out infinite 0.8s' }}>Z</text>
          </g>
        )}

        {/* === Owl body === */}
        <ellipse cx="85" cy="98" rx="28" ry="30" fill="#2e7d32" />
        <ellipse cx="85" cy="104" rx="18" ry="18" fill="#66bb6a" />
        <ellipse cx="85" cy="76" rx="22" ry="20" fill="#2e7d32" />

        {/* Ear tufts */}
        <polygon points="68,62 65,52 74,60" fill="#2e7d32" />
        <polygon points="102,62 105,52 96,60" fill="#2e7d32" />

        {/* === Eyes === */}
        <circle cx="77" cy="76" r="9" fill="white" />
        <circle cx="93" cy="76" r="9" fill="white" />

        {coverEyes && !dizzy && !annoyed && !gone ? (
          <>
            {/* Fully cover white eyes with head color */}
            <circle cx="77" cy="76" r="9.5" fill="#2e7d32" />
            <circle cx="93" cy="76" r="9.5" fill="#2e7d32" />
            {/* Cute closed eyes — happy upward arcs like ◡ ◡ */}
            <path d="M71,77 Q77,83 83,77" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M87,77 Q93,83 99,77" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Tiny eyelashes for extra cuteness */}
            <line x1="71" y1="76.5" x2="69.5" y2="74.5" stroke="#1a1a2e" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="83" y1="76.5" x2="84.5" y2="74.5" stroke="#1a1a2e" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="87" y1="76.5" x2="85.5" y2="74.5" stroke="#1a1a2e" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="99" y1="76.5" x2="100.5" y2="74.5" stroke="#1a1a2e" strokeWidth="1.2" strokeLinecap="round" />
          </>
        ) : dizzy ? (
          <g style={{ opacity: 0.9 }}>
            <path
              d="M74,73 L80,79 M80,73 L74,79"
              stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round"
              style={{ animation: `dizzyEyeSpin 0.6s linear infinite${spinDirection === -1 ? ' reverse' : ''}`, transformOrigin: '77px 76px' }}
            />
            <path
              d="M90,73 L96,79 M96,73 L90,79"
              stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round"
              style={{ animation: `dizzyEyeSpin 0.6s linear infinite${spinDirection === -1 ? ' reverse' : ''}`, transformOrigin: '93px 76px' }}
            />
          </g>
        ) : annoyed ? (
          <>
            {/* Angry squinting eyes — flat-top eyelids */}
            <clipPath id="angryLeftEye">
              <rect x="68" y="73" width="18" height="12" />
            </clipPath>
            <clipPath id="angryRightEye">
              <rect x="84" y="73" width="18" height="12" />
            </clipPath>
            <g clipPath="url(#angryLeftEye)">
              <circle cx={lPx} cy={lPy} r="5.5" fill="#1a1a2e" />
              <circle cx={lPx - 1.5} cy={lPy - 1.5} r="2" fill="white" />
            </g>
            <g clipPath="url(#angryRightEye)">
              <circle cx={rPx} cy={rPy} r="5.5" fill="#1a1a2e" />
              <circle cx={rPx - 1.5} cy={rPy - 1.5} r="2" fill="white" />
            </g>
            {/* Angry eyebrows */}
            <line x1="70" y1="70" x2="82" y2="73" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="100" y1="70" x2="88" y2="73" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : bored ? (
          <>
            {/* Bored: half-lidded eyes looking to the side, unamused */}
            <clipPath id="boredLeftEye">
              <rect x="68" y="74" width="18" height="10" />
            </clipPath>
            <clipPath id="boredRightEye">
              <rect x="84" y="74" width="18" height="10" />
            </clipPath>
            <g clipPath="url(#boredLeftEye)">
              <circle cx={78 + 2} cy={76} r="5.5" fill="#1a1a2e" />
              <circle cx={78 + 0.5} cy={74.5} r="2" fill="white" />
            </g>
            <g clipPath="url(#boredRightEye)">
              <circle cx={94 + 2} cy={76} r="5.5" fill="#1a1a2e" />
              <circle cx={94 + 0.5} cy={74.5} r="2" fill="white" />
            </g>
            {/* Flat unimpressed eyelids */}
            <line x1="69" y1="74" x2="85" y2="74" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" />
            <line x1="85" y1="74" x2="101" y2="74" stroke="#2e7d32" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : sleepy ? (
          <>
            {/* Sleepy: eyes progressively close */}
            {sleepyPhase === 0 ? (
              <>
                {/* Still open but droopy — half-lidded */}
                <clipPath id="sleepyLeftEye0">
                  <rect x="68" y="74" width="18" height="11" />
                </clipPath>
                <clipPath id="sleepyRightEye0">
                  <rect x="84" y="74" width="18" height="11" />
                </clipPath>
                <g clipPath="url(#sleepyLeftEye0)">
                  <circle cx={78} cy={76} r="5.5" fill="#1a1a2e" />
                  <circle cx={76.5} cy={74.5} r="2" fill="white" />
                </g>
                <g clipPath="url(#sleepyRightEye0)">
                  <circle cx={94} cy={76} r="5.5" fill="#1a1a2e" />
                  <circle cx={92.5} cy={74.5} r="2" fill="white" />
                </g>
                <line x1="69" y1="74" x2="85" y2="74" stroke="#2e7d32" strokeWidth="3" />
                <line x1="85" y1="74" x2="101" y2="74" stroke="#2e7d32" strokeWidth="3" />
              </>
            ) : sleepyPhase === 1 ? (
              <>
                {/* Half-closed — only slivers of eyes visible */}
                <clipPath id="sleepyLeftEye1">
                  <rect x="68" y="75.5" width="18" height="6" />
                </clipPath>
                <clipPath id="sleepyRightEye1">
                  <rect x="84" y="75.5" width="18" height="6" />
                </clipPath>
                <g clipPath="url(#sleepyLeftEye1)">
                  <circle cx={78} cy={76} r="5.5" fill="#1a1a2e" />
                </g>
                <g clipPath="url(#sleepyRightEye1)">
                  <circle cx={94} cy={76} r="5.5" fill="#1a1a2e" />
                </g>
                <line x1="69" y1="75.5" x2="85" y2="75.5" stroke="#2e7d32" strokeWidth="3" />
                <line x1="85" y1="75.5" x2="101" y2="75.5" stroke="#2e7d32" strokeWidth="3" />
              </>
            ) : (
              <>
                {/* Fully asleep — closed arcs like coverEyes but droopy */}
                <circle cx="77" cy="76" r="9.5" fill="#2e7d32" />
                <circle cx="93" cy="76" r="9.5" fill="#2e7d32" />
                <path d="M71,77 Q77,82 83,77" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M87,77 Q93,82 99,77" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" fill="none" />
              </>
            )}
          </>
        ) : (
          <>
            {/* Normal pupils follow cursor */}
            <circle cx={lPx} cy={lPy} r="5.5" fill="#1a1a2e" />
            <circle cx={rPx} cy={rPy} r="5.5" fill="#1a1a2e" />
            <circle cx={lPx - 1.5} cy={lPy - 1.5} r="2" fill="white" />
            <circle cx={rPx - 1.5} cy={rPy - 1.5} r="2" fill="white" />
          </>
        )}

        {/* === Beak === */}
        {dizzy ? (
          <>
            <polygon points="82,85 88,85 85,88" fill="#f59e0b" />
            <path d="M83,89 Q85,92 87,89" fill="none" stroke="#e65100" strokeWidth="1.5" />
          </>
        ) : annoyed ? (
          /* Grumpy frown */
          <>
            <polygon points="82,85 88,85 85,90" fill="#f59e0b" />
            <path d="M80,92 Q85,89 90,92" fill="none" stroke="#e65100" strokeWidth="1.2" />
          </>
        ) : bored ? (
          /* Slight frown — unimpressed */
          <>
            <polygon points="82,85 88,85 85,91" fill="#f59e0b" />
            <path d="M81,93 Q85,91 89,93" fill="none" stroke="#e65100" strokeWidth="1" />
          </>
        ) : sleepy ? (
          /* Sleepy — slightly open beak (yawning when fully asleep) */
          <>
            <polygon points="82,85 88,85 85,89" fill="#f59e0b" />
            {sleepyPhase >= 2 && (
              <ellipse cx="85" cy="92" rx="3" ry="2.5" fill="#e65100" opacity="0.7" />
            )}
          </>
        ) : hovered ? (
          <>
            <polygon points="82,85 88,85 85,88" fill="#f59e0b" />
            <polygon points="83,89 87,89 85,93" fill="#e65100" />
          </>
        ) : (
          <polygon points="82,85 88,85 85,92" fill="#f59e0b" />
        )}

        {/* === Wings === */}
        <ellipse
          cx="60" cy="96" rx="10" ry="18" fill="#1b5e20"
          style={{
            animation: isInteractive
              ? flyaway
                ? 'wingFlapLeft 0.15s ease-in-out infinite'
                : waking
                  ? 'wingFlapLeft 0.2s ease-in-out infinite'
                  : dizzy
                    ? 'wingFlapLeft 0.4s ease-in-out infinite'
                    : hovered || annoyed
                      ? 'wingFlapLeft 0.3s ease-in-out infinite'
                      : 'wingIdleLeft 2s ease-in-out infinite'
              : undefined,
            transformOrigin: '68px 96px',
            transition: 'transform 0.3s',
            transform: idle ? 'rotate(5deg) translateY(2px)' : undefined,
          }}
        />
        <ellipse
          cx="110" cy="96" rx="10" ry="18" fill="#1b5e20"
          style={{
            animation: isInteractive
              ? flyaway
                ? 'wingFlapRight 0.15s ease-in-out infinite'
                : waking
                  ? 'wingFlapRight 0.2s ease-in-out infinite'
                  : dizzy
                    ? 'wingFlapRight 0.4s ease-in-out infinite'
                    : hovered || annoyed
                      ? 'wingFlapRight 0.3s ease-in-out infinite'
                      : 'wingIdleRight 2s ease-in-out infinite'
              : undefined,
            transformOrigin: '102px 96px',
            transition: 'transform 0.3s',
            transform: idle ? 'rotate(-5deg) translateY(2px)' : undefined,
          }}
        />

        {/* Blush cheeks */}
        {(hovered || dizzy || coverEyes) && !annoyed && !gone && (
          <>
            <circle cx="66" cy="84" r="4" fill="#ff8a80" opacity={dizzy ? 0.6 : coverEyes ? 0.5 : 0.4} />
            <circle cx="104" cy="84" r="4" fill="#ff8a80" opacity={dizzy ? 0.6 : coverEyes ? 0.5 : 0.4} />
          </>
        )}

        {/* Dizzy flush on face */}
        {dizzy && <ellipse cx="85" cy="82" rx="20" ry="14" fill="#ff8a80" opacity="0.12" />}

        {/* Annoyed red tint on cheeks */}
        {annoyed && (
          <>
            <circle cx="66" cy="84" r="5" fill="#e53935" opacity="0.25" />
            <circle cx="104" cy="84" r="5" fill="#e53935" opacity="0.25" />
          </>
        )}

        {/* === Feet === */}
        <g style={{ opacity: flyaway ? 0 : 1, transition: 'opacity 0.2s' }}>
          <line x1="78" y1="126" x2="74" y2="132" stroke="#f59e0b" strokeWidth="1.2" />
          <line x1="78" y1="126" x2="78" y2="133" stroke="#f59e0b" strokeWidth="1.2" />
          <line x1="78" y1="126" x2="82" y2="132" stroke="#f59e0b" strokeWidth="1.2" />
          <line x1="92" y1="126" x2="88" y2="132" stroke="#f59e0b" strokeWidth="1.2" />
          <line x1="92" y1="126" x2="92" y2="133" stroke="#f59e0b" strokeWidth="1.2" />
          <line x1="92" y1="126" x2="96" y2="132" stroke="#f59e0b" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}
