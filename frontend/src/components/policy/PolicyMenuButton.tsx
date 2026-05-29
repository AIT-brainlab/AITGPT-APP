import { useState, useRef, useEffect } from 'react';
import { FileText, ChevronDown, Upload, Trash2, Eye } from 'lucide-react';
import type { User } from '../../types/auth';
import type { PolicyRecord } from '../../types/policy';
import { canManagePolicies } from '../../utils/policyPermissions';
import { getCurrentPolicy, deleteCurrentPolicy } from '../../utils/policyService';
import { CurrentPolicyModal } from './CurrentPolicyModal';
import { PolicyUploadModal } from './PolicyUploadModal';
import { PolicyConfirmDialog } from './PolicyConfirmDialog';

interface PolicyMenuButtonProps {
  user: User;
  isWide: boolean;
  onToast: (text: string, variant: 'success' | 'error') => void;
  onUploadSuccess?: () => void;
}

export function PolicyMenuButton({ user, isWide, onToast, onUploadSuccess }: PolicyMenuButtonProps) {
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [currentPolicy, setCurrentPolicy] = useState<PolicyRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = canManagePolicies(user);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleCurrentPolicy = async () => {
    setOpen(false);
    setDetailOpen(true);
    setDetailLoading(true);
    setCurrentPolicy(null);
    try {
      const policy = await getCurrentPolicy();
      setCurrentPolicy(policy);
    } catch (e) {
      // keep the modal open but show the empty skeleton if fetch fails
      setCurrentPolicy(null);
      onToast(e instanceof Error ? e.message : 'Failed to load policy', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRemove = async () => {
    setRemoveLoading(true);
    try {
      await deleteCurrentPolicy();
      onToast('Policy removed successfully.', 'success');
      setRemoveOpen(false);
      onUploadSuccess?.();
    } catch (e) {
      onToast(e instanceof Error ? e.message : 'Failed to remove policy', 'error');
    } finally {
      setRemoveLoading(false);
    }
  };

  return (
    <>
      <div className="relative shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-150 font-medium"
          style={{ color: '#4a5568' }}
          title="Policy"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          {isWide && <span>Policy</span>}
          <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-1 min-w-[200px] py-1 rounded-xl shadow-lg z-50 bg-white"
            style={{ border: '1px solid #e0e0e0' }}
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleCurrentPolicy}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
              style={{ color: '#4a5568' }}
            >
              <Eye className="w-4 h-4" style={{ color: '#2e7d32' }} />
              Current policy
            </button>
            {isAdmin && (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    setUploadOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
                  style={{ color: '#4a5568' }}
                >
                  <Upload className="w-4 h-4" style={{ color: '#2e7d32' }} />
                  Upload new policy
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    setRemoveOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
                  style={{ color: '#b91c1c' }}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove policy
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <CurrentPolicyModal
        open={detailOpen}
        policy={currentPolicy}
        loading={detailLoading}
        onClose={() => setDetailOpen(false)}
      />

      <PolicyUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          onToast('Policy uploaded successfully.', 'success');
          onUploadSuccess?.();
        }}
        onError={(msg) => onToast(msg, 'error')}
      />

      <PolicyConfirmDialog
        open={removeOpen}
        title="Remove policy"
        message="Remove the current active policy document? This cannot be undone."
        confirmLabel="Remove"
        destructive
        loading={removeLoading}
        onConfirm={handleRemove}
        onCancel={() => setRemoveOpen(false)}
      />
    </>
  );
}
