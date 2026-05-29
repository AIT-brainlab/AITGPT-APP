import { X } from 'lucide-react';
import type { PolicyRecord } from '../../types/policy';

interface CurrentPolicyModalProps {
  open: boolean;
  policy: PolicyRecord | null;
  loading?: boolean;
  onClose: () => void;
}

const normalizePolicyName = (name: string): string => {
  const cleaned = name
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned
    .split(' ')
    .map((piece) => piece.charAt(0).toUpperCase() + piece.slice(1))
    .join(' ');
};

export function CurrentPolicyModal({ open, policy, loading = false, onClose }: CurrentPolicyModalProps) {
  if (!open) return null;

  const hasPolicy = Boolean(policy);
  const policyName = policy?.name ? normalizePolicyName(policy.name) : 'Not yet added';
  const policyDate = policy?.dateOfIssue || 'Not available yet';
  const policyDescription = policy?.description || 'No description available yet.';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        className="relative bg-white rounded-[28px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
        style={{ fontFamily: "'Inter', sans-serif" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-5 flex items-center justify-between" style={{ borderColor: '#e2e8f0' }}>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] font-semibold text-green-700">Current policy</p>
            <h2 className="text-2xl font-semibold text-slate-900">Policy topics</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section className="rounded-[24px] border border-green-100 bg-green-50/70 p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Student Policy</h3>
              <p className="text-sm text-slate-600">The active student policy document for the institution.</p>
            </div>

            {loading ? (
              <div className="space-y-4">
                <div className="h-4 rounded-full bg-slate-200 animate-pulse w-2/3" />
                <div className="h-4 rounded-full bg-slate-200 animate-pulse w-1/2" />
                <div className="h-4 rounded-full bg-slate-200 animate-pulse w-5/6" />
              </div>
            ) : (
              <div className="space-y-4 text-sm text-slate-700">
                {hasPolicy ? (
                  <>
                    <div>
                      <span className="font-semibold">Name of the Policy:</span>{' '}
                      <span className="text-slate-900">{policyName}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Date of issue:</span>{' '}
                      <span className="text-slate-900">{policyDate}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Description:</span>
                      <p className="mt-2 text-slate-700">{policyDescription}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-700">No Student Policy uploaded yet.</div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-slate-900">School Policy</h3>
              <p className="text-sm text-slate-600">This section is reserved for the next school policy upload.</p>
            </div>
            <div className="text-sm text-slate-700">Not yet added.</div>
          </section>
        </div>
      </div>
    </div>
  );
}
