import React from 'react';
import { Shield, ShieldAlert, Users, Sparkles, LogOut, Lock, Globe, Bell, MessageSquare, Clock } from 'lucide-react';
import { GreenShieldLogo } from './GreenShieldLogo';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  activeTab: 'shield' | 'watchlist' | 'community' | 'progress' | 'motivation';
  setActiveTab: (tab: 'shield' | 'watchlist' | 'community' | 'progress' | 'motivation') => void;
  sosCount: number;
  inboxCount: number;
  notifCount?: number;
  onOpenInbox: () => void;
  onOpenNotifications?: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  sosCount,
  inboxCount,
  notifCount = 0,
  onOpenInbox,
  onOpenNotifications,
  onOpenAuth,
  onLogout,
}) => {
  const isArmed = user?.blockerStatus === 'ACTIVE';
  const isCountdown = user?.blockerStatus === 'DISARM_REQUESTED';
  const isDisabled = user?.blockerStatus === 'DISABLED';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('shield')}>
              <GreenShieldLogo size={42} />
              {/* Optional subtle status indicator dot */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                  !user
                    ? 'bg-slate-500'
                    : isArmed
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-500'
                    : isCountdown
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white font-['Cinzel',serif]">
                  GUARDIAN SHIELD
                </span>
                <span
                  className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                    !user
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : user.blockerStatus === 'UNACTIVATED'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : isArmed
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isCountdown
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {!user
                    ? 'Verification Required'
                    : user.blockerStatus === 'UNACTIVATED'
                    ? 'Awaiting Activation'
                    : isArmed
                    ? 'Locked & Active'
                    : isCountdown
                    ? '3-Day Reflection'
                    : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Permanent adult filter & peer accountability covenant
              </p>
            </div>
          </div>

          {/* Nav Tabs (Only visible when user is logged in) */}
          {user ? (
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
              <button
                id="nav-tab-shield"
                onClick={() => setActiveTab('shield')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'shield'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Shield</span>
              </button>

              {/* Requirement: Particular Dashboard for people on 3 days disable process and unlocked disabled */}
              <button
                id="nav-tab-watchlist"
                onClick={() => setActiveTab('watchlist')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'watchlist'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>3-Day Watchlist</span>
              </button>

              <button
                id="nav-tab-community"
                onClick={() => setActiveTab('community')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                  activeTab === 'community'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>
                  {user?.gender === 'Female' ? 'Sisterhood SOS' : 'Brotherhood SOS'}
                </span>
                {sosCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {sosCount}
                  </span>
                )}
              </button>

              <button
                id="nav-tab-progress"
                onClick={() => setActiveTab('progress')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'progress'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>Public Progress</span>
              </button>

              <button
                id="nav-tab-motivation"
                onClick={() => setActiveTab('motivation')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'motivation'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Limitless Motivation</span>
              </button>
            </nav>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>Anonymous Peer Covenant</span>
            </div>
          )}

          {/* User Controls & Sign Out Section */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Live Notifications Bell (Disarm Alerts & Peer Activity) */}
                <button
                  id="btn-open-notifications"
                  onClick={onOpenNotifications}
                  className="relative p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
                  title="Alerts & Notifications"
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                      {notifCount}
                    </span>
                  )}
                </button>

                {/* Encouragement Inbox Bell */}
                <button
                  id="btn-open-inbox"
                  onClick={onOpenInbox}
                  className="relative p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
                  title="Encouragement Inbox"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  {inboxCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-bold flex items-center justify-center">
                      {inboxCount}
                    </span>
                  )}
                </button>

                {/* Anonymous Badge */}
                <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200">
                      @{user.username}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {user.gender} • {user.country}
                    </p>
                  </div>
                </div>

                {/* Explicit Sign Out Button / Section */}
                <button
                  id="btn-sign-out"
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-rose-300 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  title="Sign out from this device"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <button
                id="btn-open-auth"
                onClick={onOpenAuth}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Sign In / Verify
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs (if logged in) */}
        {user && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs overflow-x-auto gap-1">
            <button
              onClick={() => setActiveTab('shield')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${activeTab === 'shield' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              Shield
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${activeTab === 'watchlist' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'}`}
            >
              Watchlist
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${activeTab === 'community' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              SOS ({sosCount})
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${activeTab === 'progress' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              Progress
            </button>
            <button
              onClick={() => setActiveTab('motivation')}
              className={`px-2.5 py-1 rounded-lg shrink-0 ${activeTab === 'motivation' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              Motivation
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
