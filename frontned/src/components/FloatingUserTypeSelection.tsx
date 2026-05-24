import { UserRole } from '../types/auth';
import { GraduationCap, Users, Briefcase, UserCheck, Building2, Crown, X } from 'lucide-react';

interface FloatingUserTypeSelectionProps {
  onSelectType: (userType: UserRole) => void;
  onClose: () => void;
}

const USER_TYPES: Array<{
  role: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}> = [
  {
    role: 'candidate',
    label: 'Candidate',
    description: 'Prospective Student',
    icon: GraduationCap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 hover:bg-blue-600',
  },
  {
    role: 'student',
    label: 'Student',
    description: 'Current Student',
    icon: GraduationCap,
    color: 'text-green-600',
    bgColor: 'bg-green-100 hover:bg-green-600',
  },
  {
    role: 'faculty',
    label: 'Faculty',
    description: 'Faculty Member',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 hover:bg-purple-600',
  },
  {
    role: 'staff',
    label: 'Staff',
    description: 'Staff Member',
    icon: Briefcase,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 hover:bg-orange-600',
  },
  {
    role: 'alumni',
    label: 'Alumni',
    description: 'Alumni',
    icon: UserCheck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 hover:bg-indigo-600',
  },
  {
    role: 'management',
    label: 'Management',
    description: 'Management',
    icon: Crown,
    color: 'text-red-600',
    bgColor: 'bg-red-100 hover:bg-red-600',
  },
];

export function FloatingUserTypeSelection({ onSelectType, onClose }: FloatingUserTypeSelectionProps) {
  return (
    <div
      className="fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl z-40 animate-slideUp border border-[#5a8f47]/20 overflow-y-auto"
      style={{ width: '24rem', minWidth: '24rem', maxWidth: '90vw', maxHeight: '85vh' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4a7a3d] to-[#3C6031] text-white px-4 py-3 rounded-t-2xl sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Select Your Role</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4 text-center">
          Please select your role to continue with sign in
        </p>

        <div className="grid grid-cols-2 gap-3">
          {USER_TYPES.map(({ role, label, description, icon: Icon, color, bgColor }) => (
            <button
              key={role}
              onClick={() => onSelectType(role)}
              className={`group p-4 rounded-xl border-2 border-gray-200 hover:border-[#5a8f47] transition-all bg-white hover:shadow-md`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mb-2 transition-colors`}>
                  <Icon className={`w-6 h-6 ${color} group-hover:text-white transition-colors`} />
                </div>
                <h5 className="font-semibold text-sm text-gray-800 mb-1">{label}</h5>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
