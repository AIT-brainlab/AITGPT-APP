import { BadgeDollarSign } from 'lucide-react';

export function FeesTabContent() {
  return (
    <div className="flex items-center gap-2.5 bg-[#f0f7ed] border border-[#5a8f47]/20 rounded-xl px-3.5 py-2.5 mb-2">
      <BadgeDollarSign className="w-4 h-4 text-[#4a7a3d] shrink-0" />
      <p className="text-xs text-[#3C6031] leading-snug">
        Ask about tuition fees, payment plans, and scholarship opportunities for any program.
      </p>
    </div>
  );
}
