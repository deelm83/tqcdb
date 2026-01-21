'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface SummaryResult {
  entity_type: string;
  entity_id: string;
  suggestions_count: number;
  summary: {
    recommended_changes: Record<string, {
      old: string | number;
      new: string | number;
      confidence: 'high' | 'medium' | 'low';
      reason: string;
    }>;
    conflicts: Array<{
      field: string;
      suggestions: Array<{
        value: string | number;
        count: number;
        users: string[];
      }>;
      recommendation: string;
    }>;
    summary: string;
  };
}

function SummarizeContent() {
  usePageTitle('AI Tổng hợp đề xuất', true);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function summarize() {
      const ids = searchParams.get('ids');
      if (!ids) {
        setError('Không có đề xuất nào được chọn');
        setLoading(false);
        return;
      }

      const suggestionIds = ids.split(',').filter(Boolean);
      if (suggestionIds.length === 0) {
        setError('Không có đề xuất nào được chọn');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/admin/suggestions/summarize`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ suggestionIds }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Không thể tổng hợp đề xuất');
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      summarize();
    }
  }, [isAuthenticated, searchParams]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded-full">Cao</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">Trung bình</span>;
      case 'low':
        return <span className="px-2 py-0.5 bg-red-900/30 text-red-400 text-xs rounded-full">Thấp</span>;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-[var(--text-tertiary)] hover:text-[var(--accent-gold)] transition-colors mb-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <h1 className="text-2xl font-bold text-[var(--accent-gold)] uppercase tracking-wider">
              AI Tổng hợp đề xuất
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-[var(--text-secondary)]">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Đang phân tích đề xuất bằng AI...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-6 text-center">
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Quay lại
            </button>
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Summary overview */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Tổng quan</h2>
                <span className="text-sm text-[var(--text-tertiary)]">
                  {result.suggestions_count} đề xuất cho {result.entity_type === 'general' ? 'võ tướng' : 'chiến pháp'}: <strong className="text-[var(--accent-gold)]">{result.entity_id}</strong>
                </span>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">{result.summary.summary}</p>
            </div>

            {/* Recommended changes */}
            {Object.keys(result.summary.recommended_changes).length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Thay đổi được đề xuất</h2>
                <div className="space-y-4">
                  {Object.entries(result.summary.recommended_changes).map(([field, change]) => (
                    <div key={field} className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-[var(--text-primary)]">{field}</h3>
                        {getConfidenceBadge(change.confidence)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-xs text-[var(--text-tertiary)] block mb-1">Giá trị cũ</span>
                          <span className="text-[var(--text-secondary)]">{String(change.old) || '(trống)'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-[var(--text-tertiary)] block mb-1">Giá trị mới</span>
                          <span className="text-[var(--accent-gold)] font-medium">{String(change.new)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded p-3">
                        {change.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conflicts */}
            {result.summary.conflicts && result.summary.conflicts.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Xung đột cần giải quyết</h2>
                <div className="space-y-4">
                  {result.summary.conflicts.map((conflict, index) => (
                    <div key={index} className="bg-yellow-900/10 border border-yellow-700/30 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-400 mb-3">{conflict.field}</h3>
                      <div className="space-y-2 mb-3">
                        {conflict.suggestions.map((suggestion, i) => (
                          <div key={i} className="flex items-center justify-between bg-[var(--bg)] rounded p-2">
                            <span className="text-[var(--text-primary)]">{String(suggestion.value)}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-[var(--text-tertiary)]">
                                {suggestion.users.join(', ')}
                              </span>
                              <span className="px-2 py-0.5 bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] text-xs rounded-full">
                                {suggestion.count} phiếu
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg)] rounded p-3">
                        <strong className="text-yellow-400">Khuyến nghị:</strong> {conflict.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={() => {
                  // Navigate to entity edit page with suggested changes
                  if (result.entity_type === 'general') {
                    router.push(`/admin/generals/${result.entity_id}`);
                  } else if (result.entity_type === 'skill') {
                    router.push(`/admin/skills/${result.entity_id}`);
                  }
                }}
                className="px-6 py-2 bg-[var(--accent-gold)] text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Áp dụng thay đổi
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function SummarizePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--bg)] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-[var(--bg-secondary)] animate-pulse mb-6" />
          <div className="card p-6 space-y-4">
            <div className="h-6 bg-[var(--bg-secondary)] animate-pulse" />
            <div className="h-24 bg-[var(--bg-secondary)] animate-pulse" />
          </div>
        </div>
      </main>
    }>
      <SummarizeContent />
    </Suspense>
  );
}
