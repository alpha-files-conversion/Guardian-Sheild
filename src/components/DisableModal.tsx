import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, Clock, HeartHandshake, Sparkles, X, AlertTriangle, CheckCircle, RefreshCw, Quote, Eye, EyeOff } from 'lucide-react';
import { User, MotivationalQuote } from '../types';

interface DisableModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (user: User) => void;
  activeMotivation: MotivationalQuote | null;
  setActiveMotivation: (quote: MotivationalQuote | null) => void;
}

export const DisableModal: React.FC<DisableModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  activeMotivation,
  setActiveMotivation,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const isCountdownActive = user.blockerStatus === 'DISARM_REQUESTED' && Boolean(user.countdownEndsAt);

  // Update countdown clock
  useEffect(() => {
    if (!isCountdownActive || !user.countdownEndsAt) {
      setTimeLeft(null);
      setIsExpired(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = user.countdownEndsAt! - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
        setIsExpired(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountdownActive, user.countdownEndsAt]);

  if (!isOpen) return null;

  // Step 1: Initial Password Submission -> Enters 3-day reflection period
  const handleRequestDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/blocker/request-disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password verification failed.');
      }

      onUpdateUser(data.user);
      if (data.motivation) {
        setActiveMotivation(data.motivation);
      }
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to verify master password.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: "I've added another 3 days waiting and tell the total"
  const handleExtendWaiting = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/blocker/extend-waiting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extend waiting period.');
      }

      onUpdateUser(data.user);
      if (data.motivation) {
        setActiveMotivation(data.motivation);
      }
    } catch (err: any) {
      setError(err.message || 'Could not extend waiting period.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Cancel Disable and Stay Strong ("cancel the disabled and let's continue")
  const handleCancelDisable = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/blocker/cancel-disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel disable.');
      }

      onUpdateUser(data.user);
      setActiveMotivation(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error canceling disable.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Final Disable Confirmation (only if waiting period is expired)
  const handleConfirmFinalDisable = async () => {
    const confirmPass = prompt('Enter your master password one final time to disable:');
    if (!confirmPass) return;

    setLoading(true);
    try {
      const res = await fetch('/api/blocker/confirm-disabled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, password: confirmPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to disable blocker.');
      }

      onUpdateUser(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error finalizing disable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Not in countdown yet: Prompt for master password */}
        {!isCountdownActive ? (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mx-auto flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Disable Shield Verification
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                This app is designed to protect you from porn permanently. Disabling cannot be undone instantly.
                It requires your master password and initiates a mandatory 3-day reflection delay.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Mandatory 3-Day Reflection Covenant:</span>
              </div>
              <p className="text-slate-400">
                1. Once you enter your master password, the blocker will <strong className="text-white">NOT</strong> disable immediately.
              </p>
              <p className="text-slate-400">
                2. You will enter a 3-day (72-hour) waiting protocol with personalized 1.2+ billion motivational reflections and daily quotes.
              </p>
              <p className="text-slate-400">
                3. Your anonymous {user.gender === 'Male' ? 'brothers' : 'sisters'} in the accountability network will be notified to message and support you!
              </p>
            </div>

            <form onSubmit={handleRequestDisable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Enter Master Password</span>
                  <span className="text-[10px] text-rose-400 font-semibold">No Resets or Changes Allowed</span>
                </label>
                <div className="relative">
                  <input
                    id="input-disable-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter the password you created during setup"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-white transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ⚠️ Reminder: There are no chances of changing passwords or for "Forgot Password". You must enter the exact password you chose.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all"
                >
                  Stay Protected & Cancel
                </button>
                <button
                  id="btn-confirm-password-disable"
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : 'Begin 3-Day Reflection'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Countdown is active: The 3-Day Waiting Screen with 1.2+ Billion Motivational Reflections */
          <div className="space-y-6">
            {/* Header & Alert Status */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>3-Day Countdown Protocol Active</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Hold The Line, {user.gender === 'Male' ? 'Brother' : 'Sister'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                You have defended your mind for <strong className="text-emerald-400 font-bold">{user.streakDays} Days</strong>. Total waiting period: <strong className="text-amber-300 font-bold">{user.totalWaitingDays} Days</strong>.
              </p>
            </div>

            {/* Live Countdown Clock */}
            <div className="bg-slate-950 border border-amber-500/20 rounded-2xl p-4 text-center">
              <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2">
                Time Remaining Before Disable Can Be Decided
              </p>
              {timeLeft ? (
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                    <span className="block text-2xl font-black text-white font-mono">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Hours</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                    <span className="block text-2xl font-black text-white font-mono">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Minutes</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                    <span className="block text-2xl font-black text-white font-mono">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Seconds</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Loading countdown...</p>
              )}
            </div>

            {/* Dynamic 1.2+ Billion Motivational Reflection & Quote */}
            {activeMotivation && (
              <div className="bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Voice of Your Conscience & Growth</span>
                </div>

                {/* Core required phrase highlighted */}
                <p className="text-slate-100 text-sm leading-relaxed font-medium mb-4">
                  "{activeMotivation.message}"
                </p>

                {/* Quote */}
                <div className="border-l-2 border-amber-500/50 pl-3 py-1 my-3 bg-slate-950/40 rounded-r-xl">
                  <div className="flex items-start gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs italic text-amber-200">
                      "{activeMotivation.quote}"
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 text-right mt-1 font-semibold">
                    — {activeMotivation.author}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                  <span>Growth Milestone:</span>
                  <span className="text-emerald-400 font-semibold">
                    {activeMotivation.growthMilestone}
                  </span>
                </div>
              </div>
            )}

            {/* Synchronized Community Alert Notification */}
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-xs text-rose-200">
              <HeartHandshake className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">
                  SOS Alert Broadcasted to the {user.gender === 'Male' ? 'Brotherhood' : 'Sisterhood'}:
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  "We are about to lose a {user.gender === 'Male' ? 'brother' : 'sister'}! Please message @{user.username} and bring them back."
                  Check your inbox for encouragement messages from fellow members!
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {/* PRIMARY ACTION: Cancel Disable & Stand Strong */}
              <button
                id="btn-cancel-disable-continue"
                onClick={handleCancelDisable}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Cancel Disable & Continue My Freedom Journey</span>
              </button>

              {/* Requirement: "when the 3 days come the app will tell them I've added another 3 days waiting and tell the total" */}
              <button
                id="btn-extend-3days"
                onClick={handleExtendWaiting}
                disabled={loading}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>
                  Simulate / Request Extension (+3 Days Waiting • Total: {user.totalWaitingDays + 3} Days)
                </span>
              </button>

              {/* Confirmation (only enabled if countdown expired) */}
              {isExpired ? (
                <button
                  id="btn-final-disable-confirmed"
                  onClick={handleConfirmFinalDisable}
                  disabled={loading}
                  className="w-full py-2.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 text-xs font-bold rounded-xl transition-all"
                >
                  Waiting Period Over: Confirm Disarm (Alerts Community)
                </button>
              ) : (
                <p className="text-[10px] text-center text-slate-500 italic">
                  * Blocker cannot be turned off until the full {user.totalWaitingDays}-day waiting period completes or if the app is uninstalled.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
