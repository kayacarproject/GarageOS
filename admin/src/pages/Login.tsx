import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail]       = useState('admin@garageos.in');
  const [password, setPassword] = useState('admin123');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('All fields are required.'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-4">
            <Wrench size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GarageOS</h1>
          <p className="text-sm text-gray-500 mt-1">Super Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to your admin account</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@garageos.in"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Demo: admin@garageos.in / admin123
        </p>
      </div>
    </div>
  );
};
