'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/imageCrop';

interface ImageCropModalProps {
  imageSrc: string;
  onComplete: (blob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropModal({
  imageSrc,
  onComplete,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    setError(null);

    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onComplete(blob);
    } catch (err) {
      console.error('Crop error:', err);
      setError('Không thể cắt ảnh');
    } finally {
      setIsProcessing(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isProcessing) return;
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') handleConfirm();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, croppedAreaPixels]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--bg-secondary)] rounded-lg w-full max-w-md border border-[var(--border)] shadow-xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-[var(--text-primary)] font-medium">Cắt ảnh đại diện</h2>
          <button
            onClick={onCancel}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            disabled={isProcessing}
          >
            ✕
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-4">
          <div className="relative h-80 bg-[var(--bg)] rounded overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={7 / 10}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}

          {/* Zoom Slider */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[var(--text-tertiary)] text-sm">Thu phóng</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer"
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border)] flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded"
            disabled={isProcessing}
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-[var(--accent-dim)] hover:bg-[var(--accent)] text-white rounded font-medium disabled:opacity-50"
            disabled={isProcessing || !croppedAreaPixels}
          >
            {isProcessing ? 'Đang xử lý...' : 'Cắt ảnh'}
          </button>
        </div>
      </div>
    </div>
  );
}
