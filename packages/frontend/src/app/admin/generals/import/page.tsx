'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import ImageDropzone from '@/components/ImageDropzone';
import ImportPreviewGrid, { ImportPreviewItem } from '@/components/ImportPreviewGrid';
import ImageCropModal from '@/components/ImageCropModal';
import { createImageUrl, revokeImageUrl } from '@/lib/imageCrop';
import { showToast } from '@/components/Toast';
import Link from 'next/link';

// Parse filename to name: cao_cao.jpg -> Cao Cao
function parseFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '') // Remove extension
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Convert Blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function MassImportPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  usePageTitle('Import tướng hàng loạt', true);

  const [items, setItems] = useState<ImportPreviewItem[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ created: string[]; skipped: string[] } | null>(null);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropItemId, setCropItemId] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);

  // File blobs storage (for cropped images)
  const [fileBlobs, setFileBlobs] = useState<Map<string, Blob>>(new Map());

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach(item => {
        if (item.imageUrl.startsWith('blob:')) {
          revokeImageUrl(item.imageUrl);
        }
      });
    };
  }, [items]);

  const handleFilesSelected = (files: File[]) => {
    const newItems: ImportPreviewItem[] = files.map((file) => {
      const id = `${Date.now()}-${Math.random()}`;
      const imageUrl = createImageUrl(file);
      const name = parseFilename(file.name);

      // Store original file as blob
      setFileBlobs(prev => new Map(prev).set(id, file));

      return {
        id,
        name,
        imageUrl,
        cropped: false,
      };
    });

    setItems(prev => [...prev, ...newItems]);
    setResults(null); // Clear results when new files are added
  };

  const handleNameChange = (id: string, name: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, name } : item))
    );
  };

  const handleCrop = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    setCropItemId(id);
    setCropImageUrl(item.imageUrl);
    setCropModalOpen(true);
  };

  const handleCropComplete = async (blob: Blob) => {
    if (!cropItemId) return;

    setCropModalOpen(false);

    // Create new object URL for cropped image
    const newImageUrl = createImageUrl(new File([blob], 'cropped.jpg'));

    // Update item with cropped image
    setItems(prev =>
      prev.map(item => {
        if (item.id === cropItemId) {
          // Revoke old image URL if it's a blob
          if (item.imageUrl.startsWith('blob:')) {
            revokeImageUrl(item.imageUrl);
          }
          return {
            ...item,
            imageUrl: newImageUrl,
            cropped: true,
          };
        }
        return item;
      })
    );

    // Store cropped blob
    setFileBlobs(prev => new Map(prev).set(cropItemId, blob));

    setCropItemId(null);
    setCropImageUrl(null);
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setCropItemId(null);
    setCropImageUrl(null);
  };

  const handleRemove = (id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item && item.imageUrl.startsWith('blob:')) {
        revokeImageUrl(item.imageUrl);
      }
      return prev.filter(i => i.id !== id);
    });
    setFileBlobs(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const handleImport = async () => {
    // Check if all items are cropped
    const allCropped = items.every(item => item.cropped);
    if (!allCropped) {
      showToast('Vui lòng cắt tất cả ảnh trước khi import', 'error');
      return;
    }

    setImporting(true);
    setResults(null);

    try {
      // Convert all items to base64
      const generals = await Promise.all(
        items.map(async (item) => {
          const blob = fileBlobs.get(item.id);
          if (!blob) throw new Error(`Missing blob for ${item.name}`);

          const imageBase64 = await blobToBase64(blob);
          return {
            name: item.name,
            imageBase64,
          };
        })
      );

      // Send to backend
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/admin/generals/bulk`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ generals }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Import failed');
      }

      const data = await response.json();
      setResults(data);

      // Show success message
      if (data.created.length > 0) {
        showToast(`Đã tạo ${data.created.length} tướng thành công`, 'success');
      }
      if (data.skipped.length > 0) {
        showToast(`Bỏ qua ${data.skipped.length} tướng đã tồn tại`, 'info');
      }

      // Clear items after successful import
      if (data.created.length > 0 && data.skipped.length === 0) {
        items.forEach(item => {
          if (item.imageUrl.startsWith('blob:')) {
            revokeImageUrl(item.imageUrl);
          }
        });
        setItems([]);
        setFileBlobs(new Map());
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể import tướng';
      console.error('Import error:', error);
      showToast(errorMessage, 'error');
    } finally {
      setImporting(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const allCropped = items.length > 0 && items.every(item => item.cropped);
  const canImport = allCropped && !importing;

  return (
    <main className="min-h-screen bg-[var(--bg)] py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/generals"
              className="flex items-center gap-1 text-stone-400 hover:text-white text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Danh sách tướng
            </Link>
            <span className="text-stone-600">|</span>
            <h1 className="text-2xl font-bold text-amber-100">Import tướng hàng loạt</h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleImport}
              disabled={!canImport}
              className="px-6 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Đang import...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Import {items.length} tướng
                </>
              )}
            </button>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="mb-6 space-y-3">
            {results.created.length > 0 && (
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-green-300 mb-2">
                  Đã tạo {results.created.length} tướng
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.created.map((name) => (
                    <span key={name} className="px-2 py-1 bg-green-800/50 text-green-200 rounded text-sm">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {results.skipped.length > 0 && (
              <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-amber-300 mb-2">
                  Bỏ qua {results.skipped.length} tướng đã tồn tại
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.skipped.map((name) => (
                    <span key={name} className="px-2 py-1 bg-amber-800/50 text-amber-200 rounded text-sm">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dropzone */}
        {items.length === 0 ? (
          <ImageDropzone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="mb-6">
            <ImageDropzone onFilesSelected={handleFilesSelected} />
          </div>
        )}

        {/* Preview Grid */}
        {items.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-300">
                Danh sách ({items.length} tướng)
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-stone-400">
                  Đã cắt: {items.filter(i => i.cropped).length}/{items.length}
                </span>
                {!allCropped && (
                  <span className="px-2 py-1 bg-amber-600/30 text-amber-300 rounded text-xs">
                    Cần cắt tất cả ảnh
                  </span>
                )}
              </div>
            </div>

            <ImportPreviewGrid
              items={items}
              onNameChange={handleNameChange}
              onCrop={handleCrop}
              onRemove={handleRemove}
            />
          </div>
        )}

        {/* Crop Modal */}
        {cropModalOpen && cropImageUrl && (
          <ImageCropModal
            imageSrc={cropImageUrl}
            onComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </div>
    </main>
  );
}
