import { useState } from 'react';
import { X, FileUp, Type } from 'lucide-react';
import type { PolicyType } from '../../types/policy';
import { POLICY_TYPE_LABELS } from '../../types/policy';
import { uploadPolicy } from '../../utils/policyService';

const POLICY_TYPES = Object.keys(POLICY_TYPE_LABELS) as PolicyType[];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

type UploadTab = 'pdf' | 'manual';

interface PolicyUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function PolicyUploadModal({ open, onClose, onSuccess, onError }: PolicyUploadModalProps) {
  const [tab, setTab] = useState<UploadTab>('pdf');
  const [name, setName] = useState('');
  const [type, setType] = useState<PolicyType>('general');
  const [description, setDescription] = useState('');
  const [dateOfIssue, setDateOfIssue] = useState(new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const reset = () => {
    setName('');
    setType('general');
    setDescription('');
    setDateOfIssue(new Date().toISOString().slice(0, 10));
    setFile(null);
    setTab('pdf');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onError('Policy name is required.');
      return;
    }
    if (tab === 'pdf' && !file) {
      onError('Please select a PDF file.');
      return;
    }
    if (file && file.type !== 'application/pdf') {
      onError('Only PDF files are allowed.');
      return;
    }
    if (file && file.size > MAX_FILE_BYTES) {
      onError('PDF must be 10 MB or smaller.');
      return;
    }

    setLoading(true);
    try {
      await uploadPolicy({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        dateOfIssue,
        file: tab === 'pdf' ? file ?? undefined : undefined,
      });
      reset();
      onClose();
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div
        className="relative bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl"
        style={{ fontFamily: "'Inter', sans-serif" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between" style={{ borderColor: '#e0e0e0' }}>
          <h2 className="text-lg font-semibold" style={{ color: '#4a5568' }}>
            Upload new policy
          </h2>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100" aria-label="Close">
            <X className="w-5 h-5" style={{ color: '#4a5568' }} />
          </button>
        </div>

        <div className="flex border-b" style={{ borderColor: '#e0e0e0' }}>
          <button
            type="button"
            onClick={() => setTab('pdf')}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium"
            style={{
              color: tab === 'pdf' ? '#2e7d32' : '#717182',
              borderBottom: tab === 'pdf' ? '2px solid #2e7d32' : '2px solid transparent',
            }}
          >
            <FileUp className="w-4 h-4" /> PDF upload
          </button>
          <button
            type="button"
            onClick={() => setTab('manual')}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium"
            style={{
              color: tab === 'manual' ? '#2e7d32' : '#717182',
              borderBottom: tab === 'manual' ? '2px solid #2e7d32' : '2px solid transparent',
            }}
          >
            <Type className="w-4 h-4" /> Manual entry
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#717182' }}>
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none focus:ring-1"
              style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#717182' }}>
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PolicyType)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
            >
              {POLICY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {POLICY_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#717182' }}>
              Date of issue
            </label>
            <input
              type="date"
              value={dateOfIssue}
              onChange={(e) => setDateOfIssue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#717182' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none"
              style={{ borderColor: '#c8d2e0', color: '#2f2f2f' }}
            />
          </div>

          {tab === 'pdf' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium" style={{ color: '#717182' }}>
                PDF file *
              </label>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  file ? 'border-green-600 bg-green-50/10' : 'border-gray-300 hover:border-green-500 hover:bg-gray-50/50'
                }`}
                onClick={() => document.getElementById('pdf-file-input')?.click()}
              >
                <input
                  id="pdf-file-input"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
                
                {file ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-green-100 rounded-full text-green-700">
                      <FileUp className="w-8 h-8" />
                    </div>
                    <div className="text-sm font-semibold text-gray-800 truncate max-w-xs">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-2 text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-gray-100 rounded-full text-gray-500">
                      <FileUp className="w-8 h-8" />
                    </div>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 border border-green-200 shadow-sm">
                      Browse PDF File
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Support PDF up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium border"
              style={{ borderColor: '#c8d2e0', color: '#4a5568' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: '#2e7d32', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
