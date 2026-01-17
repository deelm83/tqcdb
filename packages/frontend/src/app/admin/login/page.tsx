'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AdminLoginPage() {
  usePageTitle('Đăng nhập', true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/admin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(password);

    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Đăng nhập thất bại');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="card p-8">
          {/* Gold top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent" />

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[var(--accent-gold)] uppercase tracking-wider mb-2">
              TAMQUOC.GG
            </h1>
            <span className="px-2 py-0.5 bg-[var(--accent-red)] text-white text-[10px] font-bold uppercase tracking-wider">Admin</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-gold)]"
                placeholder="Nhập mật khẩu quản trị"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-[var(--accent-red)]/20 border border-[var(--accent-red)] text-[var(--accent-red-bright)] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
