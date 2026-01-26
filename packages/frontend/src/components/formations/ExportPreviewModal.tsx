'use client';

import { Formation } from '@/lib/formationsApi';
import FormationCanvas from './FormationCanvas';

interface ExportPreviewModalProps {
  formation: Formation;
  onClose: () => void;
}

export default function ExportPreviewModal({ formation, onClose }: ExportPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Preview */}
      <div className="max-h-[90vh] overflow-auto">
        <FormationCanvas formation={formation} />
      </div>
    </div>
  );
}
