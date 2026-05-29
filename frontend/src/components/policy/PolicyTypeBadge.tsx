import type { PolicyType } from '../../types/policy';
import { POLICY_TYPE_LABELS } from '../../types/policy';

const TYPE_STYLES: Record<PolicyType, { bg: string; text: string }> = {
  academic: { bg: '#dbeafe', text: '#1d4ed8' },
  conduct: { bg: '#fee2e2', text: '#b91c1c' },
  financial: { bg: '#fef3c7', text: '#b45309' },
  general: { bg: '#f3f4f6', text: '#4b5563' },
  hr: { bg: '#ede9fe', text: '#6d28d9' },
  safety: { bg: '#d1fae5', text: '#047857' },
};

interface PolicyTypeBadgeProps {
  type: PolicyType;
}

export function PolicyTypeBadge({ type }: PolicyTypeBadgeProps) {
  const style = TYPE_STYLES[type];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {POLICY_TYPE_LABELS[type]}
    </span>
  );
}
