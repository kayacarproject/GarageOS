import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<Props> = ({
  open, title, message, confirmLabel = 'Confirm', danger = false, loading = false, onConfirm, onCancel,
}) => (
  <Modal open={open} title="" onClose={onCancel} width="max-w-sm">
    <div className="text-center">
      <div className={`w-12 h-12 rounded-full ${danger ? 'bg-red-50' : 'bg-amber-50'} flex items-center justify-center mx-auto mb-4`}>
        <AlertTriangle size={22} className={danger ? 'text-red-500' : 'text-amber-500'} />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
            danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);
