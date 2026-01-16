'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginPage() {
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
    <main className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="bg-stone-800/80 border border-amber-900/30 rounded-lg p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-amber-100 text-center mb-6">
            Đăng nhập quản trị
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-300 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-stone-900/50 border border-stone-600 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="Nhập mật khẩu quản trị"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
