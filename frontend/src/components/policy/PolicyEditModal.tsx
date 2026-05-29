import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { PolicyRecord, PolicyType, PolicyStatus } from '../../types/policy';
import { POLICY_TYPE_LABELS, POLICY_STATUS_LABELS } from '../../types/policy';
import { updatePolicy } from '../../utils/policyService';

const POLICY_TYPES = Object.keys(POLICY_TYPE_LABELS) as PolicyType[];
const POLICY_STATUSES = Object.keys(POLICY_STATUS_LABELS) as PolicyStatus[];

interface PolicyEditModalProps {
  open: boolean;
  policy: PolicyRecord | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function PolicyEditModal({ open, policy, onClose, onSuccess, onError }: PolicyEditModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<PolicyType>('general');
  const [status, setStatus] = useState<PolicyStatus>('active');
  const [description, setDescription] = useState('');
  const [dateOfIssue, setDateOfIssue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (policy) {
      setName(policy.name);
      setType(policy.type);
      setStatus(policy.status);
      setDescription(policy.description ?? '');
      setDateOfIssue(policy.dateOfIssue);
    }
  }, [policy]);

  if (!open || !policy) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onError('Policy name is required.');
      return;
    }
    setLoading(true);
    try {
      await updatePolicy(policy.id, {
        name: name.trim(),
        type,
        status,
        description: description.trim() || undefined,
        dateOfIssue,
      });
      onClose();
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        className="relative bg-white rounded-xl max-w-md w-full shadow-xl"
        style={{ fontFamily: "'Inter', sans-serif" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#4a5568' }}>
            Edit policy
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" style={{ color: '#4a5568' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#717182' }}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#717182' }}>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PolicyType)}
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
              >
                {POLICY_TYPES.map((t) => (
                  <option key={t} value={t}>{POLICY_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#717182' }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PolicyStatus)}
                className="w-full px-3 py-2 rounded-lg text-sm border"
                style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
              >
                {POLICY_STATUSES.map((s) => (
                  <option key={s} value={s}>{POLICY_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#717182' }}>Date of issue</label>
            <input
              type="date"
              value={dateOfIssue}
              onChange={(e) => setDateOfIssue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border"
              style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#717182' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm border resize-none"
              style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: '#c8d2e0', color: '#4a5568' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: '#2e7d32', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
