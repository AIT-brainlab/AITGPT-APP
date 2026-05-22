import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ProgramsTabContentProps {
  onSubmit: (message: string) => void;
}

export function ProgramsTabContent({ onSubmit }: ProgramsTabContentProps) {
  const [interests, setInterests] = useState('');
  const [course, setCourse] = useState('');

  const handleSubmit = () => {
    const parts: string[] = [];
    if (interests.trim()) parts.push(`my interests are: ${interests.trim()}`);
    if (course.trim()) parts.push(`I'm looking for programs in: ${course.trim()}`);
    if (!parts.length) return;
    onSubmit(`I'd like program recommendations — ${parts.join(', ')}. What would you suggest?`);
  };

  const inputClass =
    'w-full py-2.5 px-3 border border-gray-200 rounded-lg text-sm outline-none bg-gray-50 transition-all duration-150 focus:border-[#5a8f47] focus:bg-white focus:ring-2 focus:ring-[#5a8f47]/10';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-2">
      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-[#4a7a3d]" />
        Find your program
      </h3>
      <div className="space-y-2.5">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Your interests</label>
          <input
            className={inputClass}
            type="text"
            placeholder="e.g. Technology, Science, Business..."
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Desired course</label>
          <input
            className={inputClass}
            type="text"
            placeholder="e.g. Computer Science, Engineering..."
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!interests.trim() && !course.trim()}
          className="w-full py-2.5 bg-[#4a7a3d] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:bg-[#3C6031] hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" /> Get Recommendations
        </button>
      </div>
    </div>
  );
}
