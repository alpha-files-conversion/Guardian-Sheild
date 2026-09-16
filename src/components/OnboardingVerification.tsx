import React, { useState } from 'react';
import { Shield, ShieldAlert, Lock, UserCheck, Globe, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, AlertTriangle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { GreenShieldLogo } from './GreenShieldLogo';
import { User } from '../types';

interface OnboardingVerificationProps {
  onSuccess: (user: User) => void;
}

export const OnboardingVerification: React.FC<OnboardingVerificationProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [country, setCountry] = useState('United States');
  const [isPublic, setIsPublic] = useState(true);
  const [ackNoReset, setAckNoReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const COUNTRIES = [
    'United States',
    'United Kingdom',
    'Canada',
    'Germany',
    'Nigeria',
    'Australia',
    'India',
    'Ghana',
    'South Africa',
    'Kenya',
    'Philippines',
    'France',
    'Brazil',
    'Other',
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ackNoReset) {
      setError('You MUST acknowledge that there are no chances of changing passwords or for "Forgot Password".');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          gender,
          country,
          isPublic,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification and setup failed.');
      }

      if (data.user) {
        onSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: username.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials or user not found.');
      }

      if (data.user) {
        onSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleExploreDemo = async (demoId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/me/${demoId}`);
      const data = await res.json();
      if (data.user) {
        onSuccess(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center mb-3">
            <GreenShieldLogo size={70} glow={true} />
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            First-Time Setup & Member Verification
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {mode === 'register' ? 'Arm Your Guardian Shield' : 'Sign In to Your Shield'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            {mode === 'register'
              ? 'Complete initial verification to lock the permanent adult blocker. Choose an anonymous username so you remain confidential.'
              : 'Enter your verified username or email and master password to access your dashboard.'}
          </p>

          {/* Toggle between Register & Sign In */}
          <div className="flex justify-center mt-5">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs font-semibold">
              <button
                id="tab-onboarding-register"
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                New Member Verification
              </button>
              <button
                id="tab-onboarding-login"
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In (Existing Member)
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PERMANENT WARNING BANNER: NO FORGOT PASSWORD OR PASSWORD RESET */}
        <div className="mb-6 bg-gradient-to-br from-rose-950/60 via-slate-950 to-rose-950/30 border-2 border-rose-500/60 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
              <AlertTriangle className="w-6 h-6 text-rose-400 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-widest border border-rose-500/40">
                  Critical Warning
                </span>
                <span className="text-xs font-bold text-white">
                  Permanent Password Covenant
                </span>
              </div>
              <h3 className="text-sm font-black text-rose-200 tracking-tight leading-snug">
                THERE WILL BE NO CHANCES OF CHANGING PASSWORDS OR FOR "FORGOT PASSWORD"
              </h3>
              <p className="text-xs text-rose-100/90 leading-relaxed font-medium">
                Under the Guardian Shield accountability covenant, your master password <strong>CANNOT</strong> be changed, reset, or recovered by anyone.
              </p>
              <p className="text-[11px] text-rose-300/80 leading-relaxed">
                If you forget this password, the porn blocker <strong>cannot be disabled</strong> unless the application is uninstalled. Write down or memorize your password safely before continuing!
              </p>
            </div>
          </div>
        </div>

        {mode === 'register' ? (
          /* Registration / Verification Form */
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Anonymous Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anonymous Username <span className="text-emerald-400">(Keep this confidential)</span>
              </label>
              <div className="relative">
                <input
                  id="input-reg-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. IronWill_2026, Phoenix_Rising, BraveHeart"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                This is the username that peers in your brotherhood/sisterhood will see. Do NOT use your real full name.
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Account Email <span className="text-slate-500">(Kept strictly private)</span>
              </label>
              <input
                id="input-reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Master Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Master Password</span>
                <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  NO RESETS ALLOWED
                </span>
              </label>
              <div className="relative">
                <input
                  id="input-reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password (memorize or write it down!)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-amber-300/80 mt-1">
                Remember: Once saved, this password can never be retrieved or changed. Use the eye icon to verify spelling before submitting.
              </p>
            </div>

            {/* Gender Selection: Male / Female ONLY */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gender <span className="text-amber-300/80 font-normal">(Strictly Male or Female for same-gender mentorship rule)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="btn-gender-male"
                  onClick={() => setGender('Male')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    gender === 'Male'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>Male (Brotherhood)</span>
                  {gender === 'Male' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </button>

                <button
                  type="button"
                  id="btn-gender-female"
                  onClick={() => setGender('Female')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    gender === 'Female'
                      ? 'bg-pink-600/20 border-pink-500 text-pink-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>Female (Sisterhood)</span>
                  {gender === 'Female' && <CheckCircle2 className="w-4 h-4 text-pink-400" />}
                </button>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Country
              </label>
              <select
                id="select-reg-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Public Progress Toggle */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <input
                  id="checkbox-reg-public"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Public Progress Readings
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Decide if your progress readings and streak data should be visible anonymously to other community members. (You can change this anytime).
                  </span>
                </div>
              </label>
            </div>

            {/* MANDATORY WARNING ACKNOWLEDGEMENT CHECKBOX */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer bg-rose-950/30 p-3.5 rounded-xl border border-rose-500/50 hover:border-rose-500 transition-colors">
                <input
                  id="checkbox-ack-no-reset"
                  type="checkbox"
                  required
                  checked={ackNoReset}
                  onChange={(e) => setAckNoReset(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-rose-400"
                />
                <div>
                  <span className="text-xs font-black text-rose-200 block">
                    I Solemnly Acknowledge: NO Password Changes & NO "Forgot Password"
                  </span>
                  <span className="text-[11px] text-rose-200/80 leading-relaxed block mt-0.5">
                    I understand that there are zero chances of changing passwords or recovering a forgotten password. I take full responsibility to keep it written down or memorized.
                  </span>
                </div>
              </label>
            </div>

            {/* Submit & Guide to Activate Button */}
            <button
              id="btn-complete-verification"
              type="submit"
              disabled={loading || !ackNoReset}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-emerald-950 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>{loading ? 'Verifying Covenant...' : 'Complete Verification & Proceed to Activate'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-slate-400">
              Next step: You will press the round <strong>ACTIVATE</strong> button to engage the permanent porn blocker.
            </p>
          </form>
        ) : (
          /* Sign In Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Anonymous Username or Email
              </label>
              <input
                id="input-login-id"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your registered username or email"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Master Password
              </label>
              <div className="relative">
                <input
                  id="input-login-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your master password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-11 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Notice: No Forgot Password */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">No "Forgot Password" or Reset Option:</strong>
                Per our covenant rules, password resets are impossible. You must enter the original master password created during verification.
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-emerald-950 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Guardian Shield'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Quick Demo Exploration Options */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400 mb-3">
            Want to test existing community profiles right now?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleExploreDemo('user-brother-1')}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-blue-300 font-semibold rounded-lg transition-colors"
            >
              Demo Brother (@Marcus_Phoenix • 48d streak)
            </button>
            <button
              type="button"
              onClick={() => handleExploreDemo('user-sister-1')}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-pink-300 font-semibold rounded-lg transition-colors"
            >
              Demo Sister (@Grace_Overcomes • 36d streak)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
