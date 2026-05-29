import { UserRole } from '../types/auth';
import { GraduationCap, Users, Briefcase, UserCheck, Crown, BookOpen, X, ArrowLeftRight, ArrowUpDown } from 'lucide-react';
import OwlMascot from './OwlMascot';

interface FloatingUserTypeSelectionProps {
  onSelectType: (userType: UserRole) => void;
  onClose: () => void;
  width: number;
  height: number;
  isWide: boolean;
  isTall: boolean;
  onToggleWide: () => void;
  onToggleTall: () => void;
}

const USER_TYPES: Array<{
  role: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}> = [
  { role: 'candidate', label: 'Candidate', description: 'Prospective Student', icon: BookOpen },
  { role: 'student', label: 'Student', description: 'Current Student', icon: GraduationCap },
  { role: 'faculty', label: 'Faculty', description: 'Faculty Member', icon: Users },
  { role: 'staff', label: 'Staff', description: 'Staff Member', icon: Briefcase },
  { role: 'alumni', label: 'Alumni', description: 'Alumni', icon: UserCheck },
  { role: 'management', label: 'Management', description: 'Management', icon: Crown },
];

const POPPINS = "'Poppins', sans-serif";

export function FloatingUserTypeSelection({
  onSelectType,
  onClose,
  width,
  height,
  isWide,
  isTall,
  onToggleWide,
  onToggleTall,
}: FloatingUserTypeSelectionProps) {
  return (
    <div
      className="fixed bottom-24 right-6 animate-slideUp flex flex-col"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: 'calc(100vw - 48px)',
        maxHeight: 'calc(100vh - 120px)',
        background:
          'linear-gradient(125.03deg, #e8f5e9 0%, #ebf6ec 7.1429%, #eff8ef 14.286%, #f2f9f2 21.429%, #f5fbf6 28.571%, #f8fcf9 35.714%, #fcfefc 42.857%, #ffffff 50%, #ffffff 100%)',
        borderRadius: '15px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        fontFamily: POPPINS,
        zIndex: 60,
        transition: 'width 0.25s ease, height 0.25s ease',
      }}
    >
      {/* Top-right controls: resize toggles + close */}
      <div className="absolute top-3 right-3 flex items-center gap-1" style={{ zIndex: 2 }}>
        <button
          onClick={onToggleWide}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors"
          title={isWide ? 'Reduce width' : 'Increase width'}
          aria-label={isWide ? 'Reduce width' : 'Increase width'}
        >
          <ArrowLeftRight className="w-4 h-4" style={{ color: isWide ? '#2e7d32' : '#4a5568' }} />
        </button>
        <button
          onClick={onToggleTall}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors"
          title={isTall ? 'Reduce height' : 'Increase height'}
          aria-label={isTall ? 'Reduce height' : 'Increase height'}
        >
          <ArrowUpDown className="w-4 h-4" style={{ color: isTall ? '#2e7d32' : '#4a5568' }} />
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" style={{ color: '#4a5568' }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-8 pb-6">
        {/* Owl with green halo (Figma: rgba(101,225,108,0.77) at 25% opacity, 122.749px) */}
        <div className="flex justify-center" style={{ marginBottom: '20px' }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: '122.749px',
              height: '122.749px',
              borderRadius: '50%',
              background: 'rgba(101, 225, 108, 0.193)',
            }}
          >
            <OwlMascot size={96} hideBackground />
          </div>
        </div>

        {/* Heading — Poppins Medium 24/36 #4a5568 */}
        <h2
          className="text-center"
          style={{
            fontFamily: POPPINS,
            fontWeight: 500,
            fontSize: '24px',
            lineHeight: '36px',
            color: '#4a5568',
            margin: 0,
          }}
        >
          I am...
        </h2>
        <p
          className="text-center"
          style={{
            fontFamily: POPPINS,
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '24px',
            color: '#717182',
            marginTop: '4px',
            marginBottom: '24px',
          }}
        >
          Select your role to continue
        </p>

        {/* Role cards (Figma: white card, 1.97px border #e2e8f0, 14px radius, 18px padding, 12px gap) */}
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {USER_TYPES.map(({ role, label, description, icon: Icon }) => (
            <button
              key={role}
              onClick={() => onSelectType(role)}
              className="group flex items-center bg-white text-left transition-all hover:shadow-md"
              style={{
                gap: '16px',
                padding: '18px',
                border: '1.97px solid #e2e8f0',
                borderRadius: '14px',
                fontFamily: POPPINS,
              }}
            >
              {/* Icon circle — Figma: 56px, bg #e8f5e9 */}
              <div
                className="flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#c8e6c9]"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#e8f5e9',
                }}
              >
                <Icon className="w-7 h-7" style={{ color: '#2e7d32' }} />
              </div>

              {/* Text — Title: Poppins Medium 18/27 #4a5568 / Desc: Poppins Regular 14/20 #717182 */}
              <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div
                  style={{
                    fontFamily: POPPINS,
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#4a5568',
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: POPPINS,
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: '#717182',
                  }}
                >
                  {description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
