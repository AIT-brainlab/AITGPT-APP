import { X, ExternalLink, FileText } from 'lucide-react';
import type { PolicyRecord } from '../../types/policy';
import { POLICY_STATUS_LABELS } from '../../types/policy';
import { PolicyTypeBadge } from './PolicyTypeBadge';

interface PolicyDetailModalProps {
  open: boolean;
  policy: PolicyRecord | null;
  loading?: boolean;
  onClose: () => void;
}

export function PolicyDetailModal({ open, policy, loading, onClose }: PolicyDetailModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        className="relative bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl"
        style={{ fontFamily: "'Inter', sans-serif" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#4a5568' }}>
            Policy details
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" style={{ color: '#4a5568' }} />
          </button>
        </div>

        <div className="p-5">
          {loading && (
            <div className="py-8 text-center text-sm" style={{ color: '#717182' }}>
              Loading…
            </div>
          )}
          {!loading && !policy && (
            <div className="py-8 text-center text-sm" style={{ color: '#717182' }}>
              No policy found.
            </div>
          )}
          {!loading && policy && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="w-8 h-8 shrink-0" style={{ color: '#2e7d32' }} />
                <div>
                  <h3 className="font-semibold text-base" style={{ color: '#2f2f2f' }}>
                    {policy.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <PolicyTypeBadge type={policy.type} />
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}
                    >
                      {POLICY_STATUS_LABELS[policy.status]}
                    </span>
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt style={{ color: '#717182' }}>Date of issue</dt>
                <dd style={{ color: '#2f2f2f' }}>{policy.dateOfIssue}</dd>
                {policy.updatedAt && (
                  <>
                    <dt style={{ color: '#717182' }}>Last updated</dt>
                    <dd style={{ color: '#2f2f2f' }}>{policy.updatedAt}</dd>
                  </>
                )}
              </dl>

              {policy.description && (
                <p className="text-sm leading-relaxed" style={{ color: '#4a5568' }}>
                  {policy.description}
                </p>
              )}

              {policy.pdfUrl && policy.pdfUrl !== '#' && (
                <a
                  href={policy.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: '#2e7d32' }}
                >
                  View PDF <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
