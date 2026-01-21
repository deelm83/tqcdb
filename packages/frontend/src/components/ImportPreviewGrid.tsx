'use client';

export interface ImportPreviewItem {
  id: string;
  name: string;
  imageUrl: string;
  cropped: boolean;
}

interface ImportPreviewGridProps {
  items: ImportPreviewItem[];
  onNameChange: (id: string, name: string) => void;
  onCrop: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function ImportPreviewGrid({
  items,
  onNameChange,
  onCrop,
  onRemove,
}: ImportPreviewGridProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg overflow-hidden"
        >
          {/* Image Preview */}
          <div className="relative aspect-[7/10] bg-[var(--bg)]">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />

            {/* Crop Status Badge */}
            <div className="absolute top-2 right-2">
              {item.cropped ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Đã cắt
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-600 text-white text-xs font-medium rounded">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Chưa cắt
                </span>
              )}
            </div>

            {/* Crop Button Overlay */}
            <button
              type="button"
              onClick={() => onCrop(item.id)}
              className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity flex items-center justify-center"
            >
              <span className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                </svg>
                {item.cropped ? 'Cắt lại' : 'Cắt ảnh'}
              </span>
            </button>
          </div>

          {/* Info Section */}
          <div className="p-3 space-y-2">
            {/* Name Input */}
            <input
              type="text"
              value={item.name}
              onChange={(e) => onNameChange(item.id, e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded text-white text-sm focus:border-[var(--accent-gold)] focus:outline-none"
              placeholder="Tên tướng"
            />

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="w-full px-3 py-1.5 bg-stone-700/50 hover:bg-red-900/50 text-stone-300 hover:text-red-300 rounded text-xs font-medium transition-colors"
            >
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
