import React, { useState, useEffect } from 'react';
import { ShieldAlert, HeartHandshake, Send, Clock, AlertTriangle, CheckCircle2, MessageSquare, RefreshCw, Lock } from 'lucide-react';
import { User, SosAlert } from '../types';

interface CommunitySosProps {
  user: User;
  onRefreshSosCount?: (count: number) => void;
}

export const CommunitySos: React.FC<CommunitySosProps> = ({ user, onRefreshSosCount }) => {
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRecipient, setActiveRecipient] = useState<SosAlert | null>(null);
  const [adviceText, setAdviceText] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Query same-gender SOS alerts
      const res = await fetch(
        `/api/community/sos-alerts?gender=${user.gender}&currentUserId=${user.id}`
      );
      const data = await res.json();
      setAlerts(data.alerts || []);
      if (onRefreshSosCount) {
        onRefreshSosCount(data.alerts?.length || 0);
      }
    } catch (err) {
      console.error('Failed to load SOS alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user.gender, user.id]);

  const handleSendAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRecipient || !adviceText.trim()) return;

    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/community/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          recipientId: activeRecipient.userId,
          message: adviceText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send advice.');
      }

      setFeedback({ text: data.message, success: true });
      setAdviceText('');
      // Update local count
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === activeRecipient.id
            ? { ...a, encouragementsCount: a.encouragementsCount + 1 }
            : a
        )
      );
    } catch (err: any) {
      setFeedback({ text: err.message || 'Failed to send advice.', success: false });
    } finally {
      setSending(false);
    }
  };

  // Quick Preset Advice Messages
  const PRESET_ADVICE = [
    `Hold the line, ${user.gender === 'Male' ? 'brother' : 'sister'}! The urge passes in 15 minutes, but the regret will last weeks. Cancel the disable!`,
    `You made it this far! Look at your streak—that is real strength. Close the tab and let's keep fighting together.`,
    `We need you with us! Don't let a momentary dopamine trick rob you of your future self-respect. Hit Cancel and stay armed!`,
    `I was in your shoes last week. It gets easier. Breathe, do 20 pushups, and re-arm your shield!`,
  ];

  const countdownAlerts = alerts.filter((a) => a.status === '3_DAYS_COUNTDOWN');
  const disabledAlerts = alerts.filter((a) => a.status === 'DISABLED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with Gender Covenant */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>
                {user.gender === 'Male'
                  ? 'Brotherhood Accountability Emergency'
                  : 'Sisterhood Accountability Emergency'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Community SOS & Intervention Network
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              When a member presses Disable, the network sounds an alarm: <strong className="text-amber-300 font-semibold">"We are about to lose a {user.gender === 'Male' ? 'brother' : 'sister'}"</strong>.
              In accordance with our covenant, all advice is strictly between members of the <strong className="text-white">same gender ({user.gender})</strong>.
            </p>
          </div>

          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync SOS Feeds</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Active 3-Day Countdown ("We are about to lose a brother / sister") */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              🚨 We Are About to Lose a {user.gender === 'Male' ? 'Brother' : 'Sister'} ({countdownAlerts.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Urge them to cancel the disable!
          </span>
        </div>

        {countdownAlerts.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-white">
              All {user.gender === 'Male' ? 'Brothers' : 'Sisters'} Are Holding The Line!
            </p>
            <p className="text-xs text-slate-400 mt-1">
              No active 3-day countdown alerts in your network right now. Everyone's shield is armed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {countdownAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-gradient-to-br from-slate-900 to-rose-950/20 border border-rose-500/30 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold text-sm">
                        {alert.username.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          @{alert.username}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {alert.country} • {alert.gender}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                      3-Day Countdown
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-4 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Clean Streak Defended:</span>
                      <strong className="text-emerald-400 font-bold">{alert.streakDays} Days</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Deliberation Window:</span>
                      <span className="text-amber-300 font-semibold">{alert.totalWaitingDays} Days Waiting</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                      <span>Fellow Encouragements Sent:</span>
                      <span className="text-sky-300 font-medium">{alert.encouragementsCount} messages</span>
                    </div>
                  </div>

                  <p className="text-xs text-rose-200/90 font-medium mb-4">
                    ⚠️ "We are about to lose a {alert.gender === 'Male' ? 'brother' : 'sister'}! Please message @{alert.username} and bring {alert.gender === 'Male' ? 'him' : 'her'} back—urge {alert.gender === 'Male' ? 'him' : 'her'} to cancel the disable and let's continue!"
                  </p>
                </div>

                <button
                  id={`btn-message-sos-${alert.userId}`}
                  onClick={() => {
                    setActiveRecipient(alert);
                    setFeedback(null);
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Advice to Cancel Disable</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Disabled Members ("Please Chat this: He has disabled me for [X days]") */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Needs Support: Disabled Shields ({disabledAlerts.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Reach out and help them re-arm
          </span>
        </div>

        {disabledAlerts.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 text-center text-xs text-slate-400">
            No disabled shields reported in your circle.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disabledAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-bold text-white">
                        @{alert.username}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {alert.country} • {alert.gender}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                      Shield Inactive
                    </span>
                  </div>

                  {/* Requirement phrase from prompt */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 mb-4">
                    <p className="text-amber-300 font-semibold mb-1">
                      ⚠️ Please chat this {alert.gender === 'Male' ? 'brother' : 'sister'}:
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      {alert.gender === 'Male' ? 'He' : 'She'} has disabled the shield for <strong className="text-white">{alert.disabledDurationText || 'recent hours'}</strong>. Reach out and urge {alert.gender === 'Male' ? 'him' : 'her'} to re-arm!
                    </p>
                  </div>
                </div>

                <button
                  id={`btn-chat-disabled-${alert.userId}`}
                  onClick={() => {
                    setActiveRecipient(alert);
                    setFeedback(null);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4 text-emerald-400" />
                  <span>Reach Out & Support Re-Arming</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message / Advice Modal */}
      {activeRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
                  {activeRecipient.username.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Send Advice to @{activeRecipient.username}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Covenant rule: {user.gender} advising {user.gender} • Anonymous
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveRecipient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-xs"
              >
                Close
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 ${
                  feedback.success
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                }`}
              >
                {feedback.text}
              </div>
            )}

            {/* Presets */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-300 mb-2">
                Quick Inspirational Presets:
              </p>
              <div className="space-y-1.5">
                {PRESET_ADVICE.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAdviceText(p)}
                    className="w-full text-left p-2 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors line-clamp-1"
                  >
                    "{p}"
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendAdvice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Custom Encouragement:
                </label>
                <textarea
                  id="textarea-advice"
                  required
                  rows={4}
                  value={adviceText}
                  onChange={(e) => setAdviceText(e.target.value)}
                  placeholder={`Write your heart-to-heart message to ${activeRecipient.username}. Urge them to cancel the disable and stand strong with you...`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveRecipient(null)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  id="btn-deliver-advice"
                  type="submit"
                  disabled={sending || !adviceText.trim()}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Sending...' : 'Deliver Advice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
