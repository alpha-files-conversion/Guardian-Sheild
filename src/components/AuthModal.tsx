import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Lock, Mail, Globe, Sparkles, X, Eye, EyeOff, AlertTriangle, AlertCircle } from 'lucide-react';
import { GreenShieldLogo } from './GreenShieldLogo';
import { Gender, User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const COUNTRIES = [
  'United States',
  'Germany',
  'Nigeria',
  'United Kingdom',
  'Canada',
  'Australia',
  'Ghana',
  'Kenya',
  'South Africa',
  'India',
  'Brazil',
  'France',
  'Spain',
  'Netherlands',
  'Sweden',
  'Norway',
  'Other',
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [country, setCountry] = useState('United States');
  const [isPublic, setIsPublic] = useState(true);
  const [ackNoReset, setAckNoReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !ackNoReset) {
      setError('You MUST acknowledge that there are no chances of changing passwords or for "Forgot Password".');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        mode === 'register'
          ? { username, email, password, gender, country, isPublic }
          : { identifier: username || email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (genderDemo: 'Male' | 'Female') => {
    if (genderDemo === 'Male') {
      setUsername('Marcus_Phoenix');
      setEmail('marcus@example.com');
      setPassword('covenant2026');
      setGender('Male');
    } else {
      setUsername('Grace_Overcomes');
      setEmail('grace@example.com');
      setPassword('covenant2026');
      setGender('Female');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center mb-3">
            <GreenShieldLogo size={52} glow={true} />
          </div>
          <h3 className="text-xl font-bold text-white font-['Cinzel',serif]">
            {mode === 'register' ? 'Member Verification' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'register'
              ? 'Enter covenant and configure your permanent porn blocker'
              : 'Enter your master credentials to access dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'register' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            New Verification
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'login' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Existing Member
          </button>
        </div>

        {/* CRITICAL WARNING: NO FORGOT PASSWORD OR PASSWORD RESETS */}
        <div className="mb-4 bg-rose-950/40 border border-rose-500/50 rounded-xl p-3 text-left">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-rose-200 leading-tight">
                WARNING: NO FORGOT PASSWORD OR PASSWORD CHANGES
              </p>
              <p className="text-[10px] text-rose-300/80 mt-0.5 leading-normal">
                There are NO chances of changing passwords or recovering forgotten passwords. Once set, this password cannot be reset by anyone.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Anonymous Username <span className="text-slate-500">(Name you want others to see)</span>
            </label>
            <div className="relative">
              <input
                id="input-auth-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. IronWill_99, PhoenixRising"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Keep this anonymous. Real names or personal identifiers are strictly forbidden.
            </p>
          </div>

          {/* Email */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Verification Email <span className="text-slate-500">(Private, never displayed)</span>
              </label>
              <div className="relative">
                <input
                  id="input-auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">
                Master Password <span className="text-rose-400 font-semibold">(Permanent - No Resets)</span>
              </label>
            </div>
            <div className="relative">
              <input
                id="input-auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Secure master password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <>
              {/* Gender (Male / Female Only) */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Gender <span className="text-amber-400 font-semibold">(Strict Same-Gender Mentorship Rule)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('Male')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      gender === 'Male'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>🛡️ Male (Brotherhood)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('Female')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      gender === 'Female'
                        ? 'bg-pink-600/20 border-pink-500 text-pink-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>🌸 Female (Sisterhood)</span>
                  </button>
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Country
                </label>
                <div className="relative">
                  <select
                    id="select-auth-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Public Progress Toggle */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    Make Progress Readings Public
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Allow fellow brothers/sisters to see your streak days and victory counts
                  </p>
                </div>
                <input
                  id="checkbox-auth-public"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Mandatory acknowledgement checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer p-3 bg-rose-950/20 border border-rose-500/40 rounded-xl">
                <input
                  id="checkbox-auth-no-reset"
                  type="checkbox"
                  required
                  checked={ackNoReset}
                  onChange={(e) => setAckNoReset(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded bg-slate-900 border-rose-400 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-[11px] text-rose-200 font-semibold leading-tight">
                  I accept that there is NO "Forgot Password" or password reset.
                </span>
              </label>
            </>
          )}

          <button
            id="btn-submit-auth"
            type="submit"
            disabled={loading || (mode === 'register' && !ackNoReset)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {loading
                ? 'Verifying...'
                : mode === 'register'
                ? 'Lock & Proceed to Activate'
                : 'Sign In'}
            </span>
          </button>
        </form>

        {/* Demo Fast-fill */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <p className="text-[11px] text-slate-500 text-center mb-2 font-medium">
            Quick Test Accounts (Instant Exploration)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('Male')}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-blue-300 flex items-center justify-center gap-1"
            >
              <span>👨 Test as Brother</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('Female')}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-pink-300 flex items-center justify-center gap-1"
            >
              <span>👩 Test as Sister</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
