import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types/auth';
import type { PolicyViolation } from '../../types/policy';
import { evaluateUserPolicies } from '../../utils/policyService';

type BannerPhase = 'hidden' | 'loading' | 'pass' | 'fail' | 'dismissing';

const EVAL_SESSION_KEY = 'policy_eval_shown';

interface PolicyCheckBannerProps {
  user: User;
}

export function PolicyCheckBanner({ user }: PolicyCheckBannerProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<BannerPhase>('hidden');
  const [violations, setViolations] = useState<PolicyViolation[]>([]);

  useEffect(() => {
    if (user.role === 'guest') return;
    if (sessionStorage.getItem(EVAL_SESSION_KEY) === '1') return;

    let cancelled = false;

    const run = async () => {
      setPhase('loading');
      try {
        const result = await evaluateUserPolicies(user);
        if (cancelled) return;
        sessionStorage.setItem(EVAL_SESSION_KEY, '1');

        if (result.passed) {
          setPhase('pass');
          setTimeout(() => {
            if (!cancelled) setPhase('dismissing');
          }, 3000);
          setTimeout(() => {
            if (!cancelled) setPhase('hidden');
          }, 3700);
        } else {
          setViolations(result.violations);
          setPhase('fail');
        }
      } catch {
        if (!cancelled) {
          sessionStorage.setItem(EVAL_SESSION_KEY, '1');
          setPhase('hidden');
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [user.id, user.role]);

  if (phase === 'hidden') return null;

  const phaseClass =
    phase === 'dismissing' ? 'policy-banner-dismiss' : 'policy-banner-enter';

  if (phase === 'loading') {
    return (
      <div className={`px-3 pt-2 pb-0 shrink-0 ${phaseClass}`}>
        <div
          className="rounded-lg px-3 py-2.5 flex items-center gap-2"
          style={{ backgroundColor: '#f8faf9', border: '1px solid #e0e8e0' }}
        >
          <div className="policy-shimmer h-4 w-4 rounded-full shrink-0" />
          <span className="text-xs font-medium policy-shimmer-text" style={{ color: '#4a5568' }}>
            Evaluating policies…
          </span>
        </div>
      </div>
    );
  }

  if (phase === 'pass' || phase === 'dismissing') {
    return (
      <div className={`px-3 pt-2 pb-0 shrink-0 ${phaseClass}`}>
        <div
          className="rounded-lg px-3 py-2 text-xs font-medium text-center"
          style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' }}
        >
          No policy violated.
        </div>
      </div>
    );
  }

  const shown = violations.slice(0, 2);

  return (
    <div className={`px-3 pt-2 pb-0 shrink-0 ${phaseClass}`}>
      <div
        className="rounded-lg px-3 py-2.5 text-xs"
        style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
      >
        <p className="font-semibold mb-1" style={{ color: '#b91c1c' }}>
          You have violated these policies:
        </p>
        <ul className="list-disc list-inside space-y-0.5 mb-2" style={{ color: '#991b1b' }}>
          {shown.map((v) => (
            <li key={v.id}>{v.policyName}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() =>
            navigate('/policydashboard', { state: { highlightViolations: true, violations } })
          }
          className="underline font-medium hover:opacity-80"
          style={{ color: '#b91c1c' }}
        >
          Click to see more details
        </button>
      </div>
    </div>
  );
}
