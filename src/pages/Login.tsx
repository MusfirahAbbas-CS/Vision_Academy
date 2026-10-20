import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const DEMO_EMAIL = 'admin@academy.com';
const DEMO_PASSWORD = 'admin123';

export default function Login() {
  const { dispatch, state } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate async auth
    await new Promise(r => setTimeout(r, 800));

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      dispatch({ type: 'LOGIN' });
      localStorage.setItem('va_auth', '1');
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } else {
      setError('Invalid email or password. Use demo credentials below.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-blue-600 rounded-2xl items-center justify-center mb-4">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{state.settings.academyName}</h1>
          <p className="text-sm text-slate-500 mt-1">Fee & Admission Management System</p>
        </div>

        {/* Card */}
        <div className="card p-5 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  className="input pl-9"
                  placeholder="admin@academy.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-9 pr-10"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary w-full justify-center py-2.5 text-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 card p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Demo Credentials</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Email:</span>
              <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{DEMO_EMAIL}</code>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Password:</span>
              <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{DEMO_PASSWORD}</code>
            </div>
          </div>
          <button
            type="button"
            className="mt-3 btn btn-secondary btn-sm w-full justify-center text-xs"
            onClick={() => { setEmail(DEMO_EMAIL); setPassword(DEMO_PASSWORD); }}
          >
            Fill Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
