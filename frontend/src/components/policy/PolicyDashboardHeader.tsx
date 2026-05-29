import { Link } from 'react-router-dom';
import { Mail, Phone, Globe, User as UserIcon, ChevronLeft } from 'lucide-react';
import type { User } from '../../types/auth';

interface PolicyDashboardHeaderProps {
  user: User | null;
}

export function PolicyDashboardHeader({ user }: PolicyDashboardHeaderProps) {
  return (
    <>
      <div className="bg-[#4a7a3d] text-white py-2.5">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <a href="mailto:contact@ait.ac.th" className="flex items-center gap-2 hover:text-gray-200">
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">contact@ait.ac.th</span>
            </a>
            <a href="tel:+6625245000" className="flex items-center gap-2 hover:text-gray-200">
              <Phone className="w-3.5 h-3.5" />
              +66
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              {user?.name || 'Username'}
            </span>
            <button type="button" className="flex items-center gap-1 hover:text-gray-200">
              <Globe className="w-4 h-4" />
              EN
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-80"
            style={{ color: '#2e7d32' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to AITGPT
          </Link>
          <div className="w-10 h-10 bg-[#4a7a3d] rounded flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">AIT</span>
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Asian Institute of Technology</div>
            <div className="text-xs text-gray-600">Policy management</div>
          </div>
        </div>
      </div>
    </>
  );
}
