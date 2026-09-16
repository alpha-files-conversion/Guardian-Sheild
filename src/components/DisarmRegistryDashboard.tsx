import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  Send,
  AlertTriangle,
  Flame,
  Users,
  Search,
  Filter,
  RefreshCw,
  HeartHandshake,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Globe,
  Radio,
  History
} from 'lucide-react';
import { User, CountdownUser, DisabledRegistryUser } from '../types';

interface DisarmRegistryDashboardProps {
  currentUser: User;
  onRefreshUser?: () => void;
  onSendAdviceSuccess?: (msg: string) => void;
}

export const DisarmRegistryDashboard: React.FC<DisarmRegistryDashboardProps> = ({
  currentUser,
  onRefreshUser,
  onSendAdviceSuccess,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'countdown' | 'disabled'>('countdown');
  const [filterGender, setFilterGender] = useState<'same' | 'all'>('same');
  const [searchQuery, setSearchQuery] = useState('');
  const [countdownList, setCountdownList] = useState<CountdownUser[]>([]);
  const [disabledList, setDisabledList] = useState<DisabledRegistryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; username: string; gender: 'Male' | 'Female'; streak: number; type: 'countdown' | 'disabled' } | null>(null);
  const [adviceText, setAdviceText] = useState('');
  const [sendingAdvice, setSendingAdvice] = useState(false);
  const [adviceStatus, setAdviceStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchRegistry = async () => {
    setLoading(true);
    try {
      const genderParam = filterGender === 'same' ? currentUser.gender : '';
      const res = await fetch(`/api/community/disarm-registry${genderParam ? `?gender=${genderParam}` : ''}`);
      const data = await res.json();
      if (res.ok) {
        setCountdownList(data.countdownUsers || []);
        setDisabledList(data.disabledUsers || []);
      }
    } catch (err) {
      console.error('Failed to load disarm registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistry();
    const interval = setInterval(fetchRegistry, 15000);
    return () => clearInterval(interval);
  }, [filterGender, currentUser.gender]);

  const handleSendAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient || !adviceText.trim()) return;

    setSendingAdvice(true);
    setAdviceStatus(null);

    try {
      const res = await fetch('/api/community/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          recipientId: selectedRecipient.id,
          message: adviceText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send advice.');
      }

      setAdviceStatus({ message: data.message || 'Encouragement sent successfully!', type: 'success' });
      setAdviceText('');
      if (onSendAdviceSuccess) onSendAdviceSuccess(data.message);
      setTimeout(() => {
        setSelectedRecipient(null);
        setAdviceStatus(null);
        fetchRegistry();
      }, 1800);
    } catch (err: any) {
      setAdviceStatus({ message: err.message || 'Failed to send advice.', type: 'error' });
    } finally {
      setSendingAdvice(false);
    }
  };

  // Quick message presets tailored to same-gender support
  const adviceTemplates = [
    `Brother/Sister, don't throw away your ${selectedRecipient?.streak || 0} days! Step away from the screen right now, breathe, and remember why you took this covenant.`,
    `The urge is a temporary neurochemical wave that will break in 10 minutes. Stand firm, do 20 pushups or splash cold water on your face!`,
    `You are not fighting alone. I am standing with you right now. Cancel the disable process and let's keep marching toward freedom together!`,
    `Think of the regret 5 minutes after relapsing vs the quiet dignity of conquering this urge today. Choose victory!`,
  ];

  const filteredCountdown = countdownList.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDisabled = disabledList.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-2">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Intervention & Disarm Watchlist</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              3-Day Reflection & Disarmed Shields Registry
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
              Track members currently going through the <strong className="text-amber-300">3-Day Disable Countdown</strong> and
              those who have <strong className="text-rose-400">unlocked and disabled</strong> their blocker. Provide immediate same-gender
              interventions before anyone relapses!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRegistry}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh Registry</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/70 border border-amber-500/20 rounded-2xl p-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
              <Clock className="w-4 h-4" />
              <span>In 3-Day Reflection</span>
            </div>
            <p className="text-2xl font-black text-white mt-1">{countdownList.length}</p>
            <p className="text-[10px] text-slate-400">Members currently in 72h countdown</p>
          </div>

          <div className="bg-slate-950/70 border border-rose-500/20 rounded-2xl p-3">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-medium">
              <ShieldAlert className="w-4 h-4" />
              <span>Completely Disabled</span>
            </div>
            <p className="text-2xl font-black text-white mt-1">{disabledList.length}</p>
            <p className="text-[10px] text-slate-400">Unlocked & disabled shields</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-950/70 border border-emerald-500/20 rounded-2xl p-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
              <HeartHandshake className="w-4 h-4" />
              <span>Accountability Covenant</span>
            </div>
            <p className="text-sm font-bold text-white mt-1.5">Strict Same-Gender Mentorship</p>
            <p className="text-[10px] text-slate-400">
              Only {currentUser.gender === 'Male' ? 'Brothers to Brothers' : 'Sisters to Sisters'} can advise
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Sub-tabs */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('countdown')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'countdown'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>3-Day Reflection Countdown</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[10px]">
              {countdownList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('disabled')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'disabled'
                ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Completely Disabled Shields</span>
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 text-[10px]">
              {disabledList.length}
            </span>
          </button>
        </div>

        {/* Filter by gender & search */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterGender('same')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterGender === 'same'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              My {currentUser.gender === 'Male' ? 'Brothers' : 'Sisters'}
            </button>
            <button
              onClick={() => setFilterGender('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterGender === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              All Members
            </button>
          </div>
        </div>
      </div>

      {/* Main Section Content */}
      {activeSubTab === 'countdown' ? (
        /* SECTION A: In 3-Day Reflection Countdown */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Members who entered master password and are in the mandatory 72-hour delay:</span>
            <span>{filteredCountdown.length} member(s) listed</span>
          </div>

          {filteredCountdown.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-90" />
              <h3 className="text-base font-bold text-white">No Members Currently in Reflection!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                All shields in the {filterGender === 'same' ? `${currentUser.gender.toLowerCase()} covenant` : 'community'} are
                standing strong and active.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCountdown.map((person) => {
                const isSelf = person.id === currentUser.id;
                const canMessage = currentUser.gender === person.gender && !isSelf;

                return (
                  <div
                    key={person.id}
                    className={`bg-slate-900/80 border rounded-2xl p-5 relative overflow-hidden transition-all shadow-lg ${
                      isSelf
                        ? 'border-amber-500/60 bg-amber-950/10'
                        : 'border-amber-500/20 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">@{person.username}</h4>
                          {isSelf && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/30 text-amber-200 text-[10px] font-extrabold">
                              YOU
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              person.gender === 'Male'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                            }`}
                          >
                            {person.gender === 'Male' ? 'Brother' : 'Sister'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3 text-slate-500" />
                          <span>{person.country}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-semibold">{person.totalWaitingDays}-day delay</span>
                        </p>
                      </div>

                      {/* Streak badge */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-extrabold text-white">{person.streakDays}</span>
                        <span className="text-slate-400 text-[10px]">days clean</span>
                      </div>
                    </div>

                    {/* Timer Alert Banner */}
                    <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-3 mb-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-amber-300 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                          <span>Time Left Before Unlocking:</span>
                        </span>
                        <span className="font-mono text-white text-xs bg-amber-500/20 px-2 py-0.5 rounded-md">
                          {person.remainingFormatted}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {person.encouragementsCount > 0
                          ? `Has received ${person.encouragementsCount} brotherly/sisterly advice message(s).`
                          : 'Has not received any advice yet! Reach out immediately.'}
                      </p>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center justify-between pt-1">
                      {isSelf ? (
                        <div className="text-xs text-amber-300 font-medium">
                          You requested disarm. Open your Shield tab to cancel and stay strong!
                        </div>
                      ) : canMessage ? (
                        <button
                          onClick={() =>
                            setSelectedRecipient({
                              id: person.id,
                              username: person.username,
                              gender: person.gender,
                              streak: person.streakDays,
                              type: 'countdown',
                            })
                          }
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Emergency Advice to @{person.username}</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic">
                          Strict same-gender rule: Only {person.gender.toLowerCase()} peers can advise.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* SECTION B: Completely Disabled Registry */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Members whose 3-day reflection expired and who unlocked & disabled their shield completely:</span>
            <span>{filteredDisabled.length} member(s) listed</span>
          </div>

          {filteredDisabled.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-90" />
              <h3 className="text-base font-bold text-white">No Fallen Shields in the Registry!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No members in your covenant have unlocked and completely disabled their protection. Every shield remains unbroken.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDisabled.map((person) => {
                const isSelf = person.id === currentUser.id;
                const canMessage = currentUser.gender === person.gender && !isSelf;

                return (
                  <div
                    key={person.id}
                    className="bg-slate-900/80 border border-rose-500/20 hover:border-rose-500/40 rounded-2xl p-5 relative overflow-hidden transition-all shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">@{person.username}</h4>
                          {isSelf && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/30 text-rose-200 text-[10px] font-extrabold">
                              YOU
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              person.gender === 'Male'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                            }`}
                          >
                            {person.gender === 'Male' ? 'Brother' : 'Sister'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3 text-slate-500" />
                          <span>{person.country}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Shield Disabled</span>
                      </div>
                    </div>

                    {/* Status details */}
                    <div className="bg-slate-950/90 border border-rose-500/20 rounded-xl p-3 mb-4 text-xs">
                      <div className="flex justify-between items-center text-slate-300 mb-1">
                        <span>Time Disabled:</span>
                        <span className="font-bold text-rose-300">{person.disabledDurationText}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400 text-[11px]">
                        <span>Previous Clean Streak:</span>
                        <span className="font-semibold text-slate-200">{person.streakDays} days</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Completed 3-day reflection period and confirmed blocker disable. Needs support to re-arm.
                      </p>
                    </div>

                    {/* Action */}
                    <div>
                      {isSelf ? (
                        <div className="text-xs text-rose-300 font-medium">
                          Your shield is currently disabled. Go to the Shield tab and click "Activate" or "Re-Arm"!
                        </div>
                      ) : canMessage ? (
                        <button
                          onClick={() =>
                            setSelectedRecipient({
                              id: person.id,
                              username: person.username,
                              gender: person.gender,
                              streak: person.streakDays,
                              type: 'disabled',
                            })
                          }
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>Call to Re-Arm Shield (@{person.username})</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic">
                          Strict same-gender rule: Only {person.gender.toLowerCase()} peers can advise.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Send Emergency Advice to Recipient */}
      {selectedRecipient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setSelectedRecipient(null);
                setAdviceStatus(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Send Advice to @{selectedRecipient.username}
                </h3>
                <p className="text-xs text-amber-300">
                  {selectedRecipient.type === 'countdown'
                    ? `Currently in 3-Day Reflection (${selectedRecipient.streak} days clean)`
                    : `Shield completely disabled (Previous streak: ${selectedRecipient.streak} days)`}
                </p>
              </div>
            </div>

            {adviceStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  adviceStatus.type === 'success'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-500/20 border border-rose-500/40 text-rose-200'
                }`}
              >
                {adviceStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{adviceStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSendAdvice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Quick Encouragement Templates:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {adviceTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAdviceText(template)}
                      className="w-full text-left p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-white transition-all line-clamp-2"
                    >
                      "{template}"
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Your Personal Advice Message:</span>
                  <span className="text-[10px] text-emerald-400 font-normal">
                    {currentUser.gender === 'Male' ? 'Brother to Brother' : 'Sister to Sister'}
                  </span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={adviceText}
                  onChange={(e) => setAdviceText(e.target.value)}
                  placeholder="Speak from your heart. Remind them of their strength, the emptiness of relapsing, and encourage them to cancel the disable request..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecipient(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingAdvice || !adviceText.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingAdvice ? 'Delivering...' : 'Send Advice Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
