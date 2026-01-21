'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useUser } from '@/contexts/UserContext';
import { copyFormation, Formation } from '@/lib/formationsApi';
import { useRouter } from 'next/navigation';

interface ShareButtonProps {
  formation: Formation;
  onExportPreview?: () => void;
}

export default function ShareButton({ formation, onExportPreview }: ShareButtonProps) {
  const { user } = useUser();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copying, setCopying] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleExportImage = async () => {
    setShowMenu(false);
    setExporting(true);

    try {
      const canvas = document.getElementById('formation-canvas');
      if (!canvas) {
        alert('Không tìm thấy đội hình để xuất');
        return;
      }

      // Capture the canvas
      const capturedCanvas = await html2canvas(canvas, {
        backgroundColor: '#1a1a1a',
        scale: 2, // Higher quality
        logging: false,
      });

      // Convert to blob and download
      capturedCanvas.toBlob((blob) => {
        if (!blob) {
          alert('Không thể tạo ảnh');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = formation.name || formation.generals?.[0]?.generalName || 'doi_hinh';
        link.download = `${fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      console.error('Export error:', err);
      alert('Không thể xuất ảnh');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyLink = async () => {
    setShowMenu(false);

    const url = `${window.location.origin}/formations/${formation.id}`;

    try {
      await navigator.clipboard.writeText(url);
      alert('Đã sao chép link!');
    } catch {
      alert('Không thể sao chép link');
    }
  };

  const handleCopyToAccount = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để sao chép đội hình');
      return;
    }

    setShowMenu(false);
    setCopying(true);

    try {
      const copied = await copyFormation(formation.id);
      router.push(`/formations/${copied.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể sao chép đội hình');
    } finally {
      setCopying(false);
    }
  };

  // Close menu when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setShowMenu(false);
    }
  };

  // Add/remove click listener
  useState(() => {
    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  const isOwner = user && parseInt(user.id) === formation.userId;
  const canCopyToAccount = user && !isOwner;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting || copying}
        className="px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-light)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
      >
        {exporting ? 'Đang xuất...' : copying ? 'Đang sao chép...' : 'Chia sẻ'}
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg)] border border-[var(--border)] shadow-lg z-50">
          <div className="p-2">
            <button
              onClick={handleExportImage}
              className="w-full text-left px-4 py-3 text-[15px] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Lưu ảnh
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full text-left px-4 py-3 text-[15px] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Sao chép link
            </button>

            {canCopyToAccount && (
              <button
                onClick={handleCopyToAccount}
                className="w-full text-left px-4 py-3 text-[15px] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Sao chép vào tài khoản
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
