'use client';

import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MySuggestionsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6">
        Đề xuất của tôi
      </h1>
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-8 text-center">
        <p className="text-[var(--text-secondary)]">
          Tính năng đang được phát triển...
        </p>
      </div>
    </div>
  );
}
