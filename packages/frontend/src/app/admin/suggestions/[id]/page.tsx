'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import {
  fetchSuggestion,
  fetchSuggestions,
  acceptSuggestion,
  rejectSuggestion,
  type SuggestionDetail,
  type Suggestion,
} from '@/lib/adminApi';
import { usePageTitle } from '@/hooks/usePageTitle';
import { showToast } from '@/components/Toast';
import type { General, Skill } from '@/lib/api';

export default function AdminSuggestionDetailPage() {
  usePageTitle('Chi tiết đề xuất', true);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [suggestion, setSuggestion] = useState<SuggestionDetail | null>(null);
  const [relatedSuggestions, setRelatedSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedRelated, setSelectedRelated] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function loadSuggestion() {
      try {
        const data = await fetchSuggestion(id);
        setSuggestion(data);

        // Fetch other suggestions for the same entity
        if (data.status === 'PENDING') {
          const relatedData = await fetchSuggestions({
            status: 'PENDING',
            entityType: data.entity_type,
            limit: 50,
          });

          const related = relatedData.suggestions.filter(
            (s) => s.entity_id === data.entity_id && s.id !== data.id
          );
          setRelatedSuggestions(related);
        }
      } catch (error) {
        console.error('Error loading suggestion:', error);
        showToast('Không thể tải thông tin đề xuất', 'error');
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadSuggestion();
    }
  }, [isAuthenticated, id]);

  const handleAccept = async () => {
    if (!suggestion) return;

    if (!confirm('Bạn có chắc muốn chấp nhận đề xuất này?')) {
      return;
    }

    setProcessing(true);
    try {
      await acceptSuggestion(suggestion.id);
      showToast('Đã chấp nhận đề xuất', 'success');
      router.push('/admin/suggestions');
    } catch (error) {
      showToast('Không thể chấp nhận đề xuất', 'error');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!suggestion) return;

    if (!confirm('Bạn có chắc muốn từ chối đề xuất này?')) {
      return;
    }

    setProcessing(true);
    try {
      await rejectSuggestion(suggestion.id);
      showToast('Đã từ chối đề xuất', 'success');
      router.push('/admin/suggestions');
    } catch (error) {
      showToast('Không thể từ chối đề xuất', 'error');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSummarize = () => {
    if (!suggestion) return;
    const ids = [suggestion.id, ...selectedRelated];
    router.push(`/admin/suggestions/summarize?ids=${ids.join(',')}`);
  };

  const toggleRelated = (relatedId: string) => {
    setSelectedRelated((prev) =>
      prev.includes(relatedId) ? prev.filter((i) => i !== relatedId) : [...prev, relatedId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">Chờ duyệt</span>;
      case 'ACCEPTED':
        return <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded-full">Đã chấp nhận</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 bg-red-900/30 text-red-400 text-xs rounded-full">Đã từ chối</span>;
      default:
        return null;
    }
  };

  const getEntityTypeBadge = (type: string) => {
    switch (type) {
      case 'general':
        return <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded-full">Võ tướng</span>;
      case 'skill':
        return <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded-full">Chiến pháp</span>;
      default:
        return null;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  };

  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getEntityName = (entity: unknown): string => {
    if (!entity) return 'Unknown';
    const gen = entity as General;
    const skill = entity as Skill;
    return gen.name || skill.name || 'Unknown';
  };

  if (isLoading || !isAuthenticated || loading) {
    return (
      <main className="min-h-screen bg-[var(--bg)] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-[var(--text-secondary)]">Đang tải...</div>
        </div>
      </main>
    );
  }

  if (!suggestion) {
    return (
      <main className="min-h-screen bg-[var(--bg)] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-[var(--text-secondary)]">Không tìm thấy đề xuất</div>
        </div>
      </main>
    );
  }

  const entityName = getEntityName(suggestion.entity);

  return (
    <main className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/admin/suggestions"
          className="inline-flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </Link>

        {/* Header Card */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {getStatusBadge(suggestion.status)}
                {getEntityTypeBadge(suggestion.entity_type)}
              </div>
              <h1 className="text-2xl font-bold text-[var(--accent)]">
                Đề xuất chỉnh sửa: {entityName}
              </h1>
            </div>
            <div className="text-right text-sm text-[var(--text-tertiary)]">
              <p>ID: #{suggestion.id.slice(0, 8)}</p>
              <p>Gửi lúc: {formatDateTime(suggestion.created_at)}</p>
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 p-4 bg-[var(--bg)] rounded-lg">
            <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center text-white font-bold">
              {suggestion.user.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">{suggestion.user.display_name}</p>
              <p className="text-sm text-[var(--text-tertiary)]">{suggestion.user.email || 'Người dùng'}</p>
            </div>
          </div>
        </div>

        {/* Reason Card */}
        {suggestion.reason && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 mb-6">
            <h2 className="text-sm font-semibold text-[var(--text-tertiary)] mb-3">
              Lý do thay đổi
            </h2>
            <p className="text-[var(--text-primary)] leading-relaxed">{suggestion.reason}</p>
          </div>
        )}

        {/* Diff View */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-[var(--text-tertiary)] mb-4">
            So sánh thay đổi
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Left: Current */}
            <div>
              <h3 className="text-center text-sm font-medium text-[var(--text-tertiary)] mb-3 pb-2 border-b border-[var(--border)]">
                Giá trị hiện tại
              </h3>
              <div className="space-y-3">
                {Object.entries(suggestion.changes).map(([field, change]) => (
                  <div key={field} className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">{field}</p>
                    <p className="text-sm font-mono text-red-400 break-words">{renderValue(change.old)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Proposed */}
            <div>
              <h3 className="text-center text-sm font-medium text-[var(--text-tertiary)] mb-3 pb-2 border-b border-[var(--border)]">
                Giá trị đề xuất
              </h3>
              <div className="space-y-3">
                {Object.entries(suggestion.changes).map(([field, change]) => (
                  <div key={field} className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg">
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">{field}</p>
                    <p className="text-sm font-mono text-green-400 break-words">{renderValue(change.new)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Arrow between columns */}
          <div className="flex justify-center -mt-4 mb-4 pointer-events-none">
            <div className="w-12 h-12 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Other suggestions for same entity */}
        {relatedSuggestions.length > 0 && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--text-tertiary)]">
                Đề xuất khác cho {entityName}
              </h2>
              <span className="text-xs text-[var(--text-tertiary)]">{relatedSuggestions.length} đề xuất khác đang chờ</span>
            </div>

            <div className="space-y-3">
              {relatedSuggestions.map((related) => (
                <div key={related.id} className="flex items-center justify-between p-3 bg-[var(--bg)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedRelated.includes(related.id)}
                      onChange={() => toggleRelated(related.id)}
                      className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg)]"
                    />
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">
                        {related.user.display_name} - <span className="text-[var(--accent)]">{Object.keys(related.changes).join(', ')}</span>
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">{formatTimeAgo(related.created_at)}</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/suggestions/${related.id}`}
                    className="text-sm text-[var(--accent)] hover:underline"
                  >
                    Xem
                  </Link>
                </div>
              ))}
            </div>

            <button
              onClick={handleSummarize}
              disabled={selectedRelated.length === 0}
              className={`mt-4 w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                selectedRelated.length > 0
                  ? 'bg-[#5865F2] text-white hover:bg-[#4752C4]'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Tổng hợp các đề xuất đã chọn
            </button>
          </div>
        )}

        {/* Action Buttons */}
        {suggestion.status === 'PENDING' && (
          <>
            <div className="flex items-center justify-between p-6 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl mb-6">
              <button
                onClick={handleReject}
                disabled={processing}
                className="px-6 py-3 border border-red-600 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {processing ? 'Đang xử lý...' : 'Từ chối'}
              </button>
              <button
                onClick={handleAccept}
                disabled={processing}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {processing ? 'Đang xử lý...' : 'Chấp nhận và áp dụng'}
              </button>
            </div>

            {/* Preview what will change */}
            <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Xem trước:</strong> Khi chấp nhận, các trường{' '}
                {Object.keys(suggestion.changes).join(', ')} sẽ được cập nhật cho {suggestion.entity_type === 'general' ? 'võ tướng' : 'chiến pháp'}{' '}
                {entityName}.
              </p>
            </div>
          </>
        )}

        {suggestion.status !== 'PENDING' && (
          <div className={`p-4 border rounded-lg ${
            suggestion.status === 'ACCEPTED'
              ? 'bg-green-900/20 border-green-700/30'
              : 'bg-red-900/20 border-red-700/30'
          }`}>
            <p className={`text-sm ${
              suggestion.status === 'ACCEPTED' ? 'text-green-300' : 'text-red-300'
            }`}>
              {suggestion.status === 'ACCEPTED'
                ? `Đề xuất đã được chấp nhận ${suggestion.reviewed_at ? `lúc ${formatDateTime(suggestion.reviewed_at)}` : ''}`
                : `Đề xuất đã bị từ chối ${suggestion.reviewed_at ? `lúc ${formatDateTime(suggestion.reviewed_at)}` : ''}`
              }
              {suggestion.reviewed_by && ` bởi ${suggestion.reviewed_by}`}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
