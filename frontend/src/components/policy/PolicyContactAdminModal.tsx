import { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import type { User } from '../../types/auth';
import type { PolicyViolation } from '../../types/policy';

interface PolicyContactAdminModalProps {
  open: boolean;
  user: User;
  violations?: PolicyViolation[];
  onClose: () => void;
  onSent: () => void;
}

export function PolicyContactAdminModal({
  open,
  user,
  violations = [],
  onClose,
  onSent,
}: PolicyContactAdminModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    const names = violations.map((v) => v.policyName).join(', ');
    setSubject(`Policy inquiry — ${user.name || user.email}`);
    setBody(
      `Hello,\n\nI would like to discuss the following policy matter(s):${names ? `\n\nViolated policies: ${names}` : ''}\n\n[Please describe your question or concern here.]\n\nThank you,\n${user.name || user.email}`
    );
  }, [open, user, violations]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 500));
    setSending(false);
    onSent();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        className="relative bg-white rounded-xl max-w-lg w-full shadow-xl"
        style={{ fontFamily: "'Inter', sans-serif" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#4a5568' }}>
            Contact admin
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" style={{ color: '#4a5568' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#717182' }}>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#717182' }}>Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
              required
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: '#c8d2e0', color: '#4a5568' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
              style={{ backgroundColor: '#2e7d32', opacity: sending ? 0.6 : 1 }}
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
