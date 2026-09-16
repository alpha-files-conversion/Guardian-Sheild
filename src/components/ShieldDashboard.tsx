import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Flame, Lock, Globe, AlertCircle, RefreshCw, Smartphone, Laptop, CheckCircle2, ChevronRight, Zap, Clock, Power, Sparkles, Wifi, Copy, Check, Info, HelpCircle } from 'lucide-react';
import { GreenShieldLogo } from './GreenShieldLogo';
import { User } from '../types';
import { playActivationChime } from '../utils/sound';

interface ShieldDashboardProps {
  user: User;
  onOpenDisableModal: () => void;
  onReArm: () => void;
  onUpdateUser?: (user: User) => void;
}

export const ShieldDashboard: React.FC<ShieldDashboardProps> = ({
  user,
  onOpenDisableModal,
  onReArm,
  onUpdateUser,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 2000);
  };
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    isBlocked: boolean;
    reason: string;
    dnsResponse: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [activating, setActivating] = useState(false);
  const [showActivatedBanner, setShowActivatedBanner] = useState(false);

  // Live Freedom Chronometer (counting every second)
  const [liveElapsed, setLiveElapsed] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const isUnactivated = user.blockerStatus === 'UNACTIVATED';
  const isArmed = user.blockerStatus === 'ACTIVE';
  const isCountdown = user.blockerStatus === 'DISARM_REQUESTED';
  const isDisabled = user.blockerStatus === 'DISABLED';

  useEffect(() => {
    if (isUnactivated) {
      setLiveElapsed({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const calculateTime = () => {
      const baseline = user.createdAt
        ? Number(user.createdAt)
        : Date.now() - (user.streakDays || 1) * 86400000;
      const diff = Math.max(0, Date.now() - baseline);

      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      setLiveElapsed({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [user.createdAt, user.streakDays, isUnactivated]);

  // Round Activate Button handler
  const handleActivateRoundButton = async () => {
    if (isArmed) {
      // If already armed, prompt them if they wish to request disarming with password
      onOpenDisableModal();
      return;
    }

    if (isCountdown) {
      onOpenDisableModal();
      return;
    }

    setActivating(true);
    playActivationChime();

    try {
      const res = await fetch('/api/blocker/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (onUpdateUser) {
          onUpdateUser(data.user);
        }
        setShowActivatedBanner(true);
        setTimeout(() => setShowActivatedBanner(false), 9000);
      }
    } catch (err) {
      console.error('Activation failed:', err);
    } finally {
      setActivating(false);
    }
  };

  const handleTestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;

    setTesting(true);
    try {
      const res = await fetch('/api/blocker/test-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl, userId: user.id }),
      });
      const data = await res.json();
      setTestResult({
        tested: true,
        isBlocked: data.isBlocked,
        reason: data.matchedReason,
        dnsResponse: data.dnsResponse,
      });

      // Update user in parent if blocked
      if (data.isBlocked && onUpdateUser) {
        onUpdateUser({
          ...user,
          totalBlockedAttempts: user.totalBlockedAttempts + 1,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  const handleQuickTestDomain = (domain: string) => {
    setTestUrl(domain);
    fetch('/api/blocker/test-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: domain, userId: user.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        setTestResult({
          tested: true,
          isBlocked: data.isBlocked,
          reason: data.matchedReason,
          dnsResponse: data.dnsResponse,
        });
        if (data.isBlocked && onUpdateUser) {
          onUpdateUser({
            ...user,
            totalBlockedAttempts: user.totalBlockedAttempts + 1,
          });
        }
      });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner when user clicks Activate */}
      {showActivatedBanner && (
        <div className="bg-gradient-to-r from-emerald-900/90 via-emerald-800 to-slate-900 border-2 border-emerald-400 rounded-3xl p-5 shadow-2xl animate-fade-in flex items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                🛡️ GUARDIAN SHIELD ACTIVATED: ALL PORN WEBS ARE NOW STOPPED!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                5,000+ known adult domains, keywords, and explicit queries are permanently intercepted. Your freedom chronometer has begun counting!
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowActivatedBanner(false)}
            className="px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-950 rounded-xl text-xs font-bold shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner Alert if Countdown or Disabled */}
      {isCountdown && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                ⚠️ 3-Day Reflection Countdown is Active
              </h3>
              <p className="text-xs text-amber-200/80">
                You requested to disable the shield. Your {user.gender === 'Male' ? 'brothers' : 'sisters'} have been alerted to message and encourage you!
              </p>
            </div>
          </div>
          <button
            id="btn-view-countdown-banner"
            onClick={onOpenDisableModal}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
          >
            Review Countdown & Motivation
          </button>
        </div>
      )}

      {isDisabled && (
        <div className="bg-rose-950/50 border border-rose-500/40 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                🚨 Shield is Currently Disabled!
              </h3>
              <p className="text-xs text-rose-200/80">
                The blocker is inactive. Press the round <strong>ACTIVATE</strong> button below immediately to stop all porn webs again!
              </p>
            </div>
          </div>
          <button
            id="btn-rearm-banner"
            onClick={handleActivateRoundButton}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Activate Blocker Now</span>
          </button>
        </div>
      )}

      {/* CENTRAL ROUND "ACTIVATE" BUTTON HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center">
        {/* Subtle background mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.07)_0,transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold mb-4">
            <span
              className={`w-2 h-2 rounded-full ${
                isArmed
                  ? 'bg-emerald-400 animate-ping'
                  : isUnactivated
                  ? 'bg-amber-400 animate-bounce'
                  : isCountdown
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-slate-300">
              {isArmed
                ? 'All Porn Websites: Stopped & Blocked'
                : isUnactivated
                ? 'Awaiting Initial Activation'
                : isCountdown
                ? '3-Day Reflection In Progress'
                : 'Porn Blocker Inactive'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-['Cinzel',serif]">
            {isArmed
              ? 'GUARDIAN SHIELD IS ACTIVE'
              : isUnactivated
              ? 'ACTIVATE YOUR GUARDIAN SHIELD'
              : isCountdown
              ? 'REFLECTION IN PROGRESS'
              : 'SHIELD CURRENTLY INACTIVE'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg leading-relaxed">
            {isArmed
              ? 'The blocker is locked. 5,000+ adult websites, search engine queries, and explicit networks are intercepted. To disable, your master password and 3-day reflection period are required.'
              : isUnactivated
              ? 'Press the round button below to activate the blocker and immediately stop all porn websites on your device.'
              : isCountdown
              ? 'Your 3-day reflection period is active. Brothers/sisters of your same gender are supporting you.'
              : 'Press the round ACTIVATE button below to stop all porn webs and re-arm your shield now.'}
          </p>

          {/* THE ROUND BUTTON: "ACTIVATE" */}
          <div className="my-8 relative flex items-center justify-center">
            {/* Outer animated halo rings */}
            <div
              className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full transition-all duration-1000 ${
                isArmed
                  ? 'bg-emerald-500/10 border-2 border-emerald-500/30 animate-pulse'
                  : isUnactivated || isDisabled
                  ? 'bg-emerald-500/20 border-2 border-emerald-400/50 animate-ping'
                  : 'bg-amber-500/15 border-2 border-amber-500/30'
              }`}
            />

            <div
              className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full transition-all ${
                isArmed
                  ? 'bg-emerald-500/5 border border-emerald-500/20'
                  : 'bg-emerald-500/10 border border-emerald-400/30'
              }`}
            />

            {/* Main Round Button */}
            <button
              id="btn-round-activate"
              type="button"
              disabled={activating}
              onClick={handleActivateRoundButton}
              className={`relative z-20 w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center p-4 transition-all transform duration-300 select-none shadow-2xl ${
                isArmed
                  ? 'bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 border-4 border-emerald-500 text-emerald-400 shadow-emerald-900/50 hover:border-emerald-400 hover:scale-105 active:scale-95'
                  : isUnactivated || isDisabled
                  ? 'bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 border-4 border-emerald-300 text-white shadow-emerald-600/60 hover:scale-110 active:scale-95 animate-pulse'
                  : 'bg-gradient-to-b from-amber-700 via-amber-800 to-slate-950 border-4 border-amber-400 text-white shadow-amber-900/50 hover:scale-105 active:scale-95'
              }`}
            >
              {/* Icon */}
              {isArmed ? (
                <div className="mb-1">
                  <GreenShieldLogo size={58} glow={true} />
                </div>
              ) : isCountdown ? (
                <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 text-amber-300 mb-1 drop-shadow-md" />
              ) : (
                <Power className="w-12 h-12 sm:w-16 sm:h-16 text-white mb-1 drop-shadow-lg" />
              )}

              {/* Main Label */}
              <span className="text-xl sm:text-2xl font-black tracking-wider uppercase font-['Cinzel',serif] leading-tight">
                {activating
                  ? 'LOCKING...'
                  : isArmed
                  ? 'ACTIVE'
                  : isCountdown
                  ? 'COUNTDOWN'
                  : 'ACTIVATE'}
              </span>

              {/* Sub-label describing stopping porn webs */}
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-90 mt-1">
                {isArmed
                  ? 'ALL PORN WEBS STOPPED'
                  : isCountdown
                  ? '3-DAY REFLECTION'
                  : 'STOP ALL PORN WEBS'}
              </span>

              {/* Additional badge */}
              <span className="mt-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/40 border border-white/20">
                {isArmed
                  ? 'CLICK TO DISARM (PASSWORD)'
                  : isCountdown
                  ? 'VIEW MOTIVATION'
                  : 'PRESS TO STOP WEBS'}
              </span>
            </button>
          </div>

          <p className="text-xs text-slate-400 max-w-md">
            {isArmed ? (
              <span className="text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pornography blocking filter is armed across all browsers & applications.</span>
              </span>
            ) : (
              <span>
                Pressing <strong>ACTIVATE</strong> locks the DNS filter and blocks all known adult content. Once activated, disabling requires your master password and a mandatory 3-day reflection period.
              </span>
            )}
          </p>

          {/* Action links */}
          {isArmed && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <button
                id="btn-trigger-disable"
                onClick={onOpenDisableModal}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Request Disarm (Master Password Required)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LIVE REAL-TIME COUNTING BAR (Counting every second) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Live Freedom Chronometer
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isArmed ? 'COUNTING LIVE' : 'ACTIVATION REQUIRED'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Continuous real-time timer tracking every second of your freedom from pornography.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            Account: <strong className="text-white font-mono">@{user.username}</strong> ({user.country})
          </div>
        </div>

        {/* Big Live Ticking Clock */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4 text-center">
            <span className="block text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {String(liveElapsed.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase">
              Days
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4 text-center">
            <span className="block text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {String(liveElapsed.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase">
              Hours
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4 text-center">
            <span className="block text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
              {String(liveElapsed.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase">
              Minutes
            </span>
          </div>
          <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-3 sm:p-4 text-center ring-1 ring-emerald-500/20">
            <span className="block text-2xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight animate-pulse">
              {String(liveElapsed.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-400 font-semibold uppercase">
              Seconds
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Clean Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            Day {liveElapsed.days + 1}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 font-mono">
            {liveElapsed.days}d {liveElapsed.hours}h {liveElapsed.minutes}m {liveElapsed.seconds}s clean
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Interceptions Defended
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            {user.totalBlockedAttempts}{' '}
            <span className="text-xs font-medium text-slate-400">Attempts</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            Adult domains blocked & neutralized
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Accountability Circle
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">
            {user.gender === 'Male' ? 'Brotherhood' : 'Sisterhood'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Same-gender peer protection covenant
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Reflection Covenant
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">
            {user.totalWaitingDays} Days Delay
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Mandatory deliberation protocol
          </p>
        </div>
      </div>

      {/* Interactive In-App Blocker & URL Shield Test Engine */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>In-App Shield & Domain Interceptor Test</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify how the activate button stopped all adult domains and keywords in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Quick Test:</span>
            <button
              onClick={() => handleQuickTestDomain('pornhub.com')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-mono"
            >
              pornhub.com
            </button>
            <button
              onClick={() => handleQuickTestDomain('xhamster.com')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-mono"
            >
              xhamster.com
            </button>
            <button
              onClick={() => handleQuickTestDomain('wikipedia.org')}
              className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 font-mono"
            >
              wikipedia.org
            </button>
          </div>
        </div>

        <form onSubmit={handleTestUrl} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              id="input-test-url"
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter domain or URL to test (e.g. adult-site.com, reddit.com/r/nsfw, google.com)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            id="btn-submit-url-test"
            type="submit"
            disabled={testing}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing...' : 'Test Blocker Filter'}</span>
          </button>
        </form>

        {testResult && testResult.tested && (
          <div
            className={`mt-4 p-4 rounded-2xl border transition-all ${
              testResult.isBlocked
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {testResult.isBlocked ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  {testResult.isBlocked
                    ? '🚫 ACCESS DENIED: Content Intercepted & Blocked'
                    : '✅ ACCESS PERMITTED: Safe Clean Domain'}
                </p>
                <p className="text-xs opacity-90">{testResult.reason}</p>
                <div className="pt-1 flex items-center gap-2 text-[11px] font-mono opacity-75">
                  <span>DNS Simulator Resolution:</span>
                  <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {testResult.dnsResponse}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System-Wide Setup Instructions (Permanent Device Armor) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 font-['Cinzel',serif]">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Permanent Device & Network Armor</span>
            </h2>
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Zero Bypass Filter
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Block all adult websites permanently across Safari, Chrome, Edge, apps, and browsers on your personal devices or your entire home.
          </p>
        </div>

        {/* Important Optional Clarification Banner */}
        <div className="bg-gradient-to-r from-sky-950/60 to-indigo-950/40 border border-sky-500/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-lg">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 shrink-0 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Must you put it into your Wi-Fi router to block porn?</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                NO — IT IS OPTIONAL
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Wi-Fi router setup is completely optional.</strong> If you only want your own <strong className="text-emerald-300">Phone</strong> or <strong className="text-indigo-300">Computer</strong> protected, choose <strong>Option 1</strong> or <strong>Option 2</strong> below. You never need to touch your Wi-Fi router!
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Only use <strong>Option 3 (Wi-Fi Router)</strong> if you want the <strong className="text-amber-300">entire house</strong> (all family members, smart TVs, guests, tablets) protected all at once from a single place.
            </p>
          </div>
        </div>

        {/* 3 Clear Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* OPTION 1: PHONE ONLY */}
          <div className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Option 1 • Most Popular
                </span>
                <Smartphone className="w-4 h-4 text-emerald-400" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Phone Only (Android & iPhone)
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Protects your phone everywhere: on both home Wi-Fi and 4G/5G mobile data.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-xs text-slate-300">
                  <strong>Android:</strong> Go to <strong>Settings &gt; Connections &gt; More Connection Settings &gt; Private DNS</strong>, choose <em>Private DNS provider hostname</em> and enter:
                </p>
                <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-mono text-[11px] text-emerald-300 truncate select-all">
                    family.cloudflare-dns.com
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('family.cloudflare-dns.com', 'phone')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                    title="Copy hostname"
                  >
                    {copiedKey === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                <strong className="text-slate-300">iPhone / iOS:</strong> Install the free official <strong>1.1.1.1</strong> app by Cloudflare &gt; Settings &gt; select <strong>1.1.1.1 for Families (Block Adult Content)</strong>.
              </div>
            </div>

            <div className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>No router access needed</span>
            </div>
          </div>

          {/* OPTION 2: COMPUTER BROWSER ONLY */}
          <div className="bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Option 2 • 30 Seconds
                </span>
                <Laptop className="w-4 h-4 text-indigo-400" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Computer / Laptop Only
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Protects Chrome, Edge, Brave, or Firefox on PC and Mac with zero software install.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-xs text-slate-300">
                  In your browser, go to <strong>Settings &gt; Privacy and security &gt; Security &gt; Use Secure DNS</strong>. Select <em>Custom</em> and paste:
                </p>
                <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-mono text-[11px] text-indigo-300 truncate select-all">
                    https://family.cloudflare-dns.com/dns-query
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('https://family.cloudflare-dns.com/dns-query', 'browser')}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                    title="Copy DoH URL"
                  >
                    {copiedKey === 'browser' ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                <strong className="text-slate-300">Enforces SafeSearch:</strong> Stops all adult domains, explicit video tubes, and enforces Google/Bing SafeSearch.
              </div>
            </div>

            <div className="text-[11px] text-indigo-400/90 font-medium flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Immediate browser-level shield</span>
            </div>
          </div>

          {/* OPTION 3: WHOLE HOUSE WI-FI ROUTER (OPTIONAL) */}
          <div className="bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Option 3 • Optional Whole House
                </span>
                <Wifi className="w-4 h-4 text-amber-400" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Whole House Wi-Fi Router
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Only if you want every phone, laptop, TV, and console in the entire home protected at once.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-xs text-slate-300">
                  In your Wi-Fi router admin (<code className="text-amber-300 font-mono text-[10px]">192.168.1.1</code>), set DNS addresses:
                </p>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-semibold">Primary:</span>
                    <span className="font-mono text-xs text-amber-300 select-all">1.1.1.3</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('1.1.1.3', 'dns1')}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy Primary DNS"
                    >
                      {copiedKey === 'dns1' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-semibold">Secondary:</span>
                    <span className="font-mono text-xs text-amber-300 select-all">1.0.0.3</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('1.0.0.3', 'dns2')}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy Secondary DNS"
                    >
                      {copiedKey === 'dns2' ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                <strong className="text-slate-300">Whole-Home Coverage:</strong> Once saved, any device connecting to your home Wi-Fi is protected without configuring them individually.
              </div>
            </div>

            <div className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1.5 pt-2 border-t border-slate-800/60">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Optional: only for multi-person households</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
