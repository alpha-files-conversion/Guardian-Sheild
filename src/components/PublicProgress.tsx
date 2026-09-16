import React, { useState, useEffect } from 'react';
import { Globe, Flame, Shield, ShieldCheck, Eye, EyeOff, RefreshCw, Trophy, Filter } from 'lucide-react';
import { User } from '../types';

interface PublicUser {
  id: string;
  username: string;
  gender: 'Male' | 'Female';
  country: string;
  streakDays: number;
  totalBlockedAttempts: number;
  blockerStatus: 'ACTIVE' | 'DISARM_REQUESTED' | 'DISABLED';
  createdAt: number;
}

interface PublicProgressProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export const PublicProgress: React.FC<PublicProgressProps> = ({ user, onUpdateUser }) => {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGender, setFilterGender] = useState<'All' | 'Male' | 'Female'>('All');
  const [toggling, setToggling] = useState(false);

  const fetchPublicUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community/public-progress');
      const data = await res.json();
      setUsers(data.publicUsers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicUsers();
  }, []);

  const handleTogglePrivacy = async () => {
    setToggling(true);
    try {
      const newStatus = !user.isPublic;
      const res = await fetch(`/api/user/settings/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onUpdateUser(data.user);
        fetchPublicUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  const filtered = users.filter((u) => {
    if (filterGender !== 'All' && u.gender !== filterGender) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Privacy Toggle Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>Public Accountability Registry</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Community Progress Readings
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Every member here is anonymous, represented only by their shield username. You have complete control to decide whether your progress readings and streak data are visible to the community.
            </p>
          </div>

          {/* Privacy Toggle Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 w-full lg:w-auto shrink-0 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                {user.isPublic ? (
                  <Eye className="w-4 h-4 text-emerald-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                )}
                <span>My Data Visibility</span>
              </p>
              <p className="text-[11px] text-slate-400">
                {user.isPublic ? 'Public to Brotherhood & Sisterhood' : 'Private (Hidden)'}
              </p>
            </div>

            <button
              id="btn-toggle-privacy"
              onClick={handleTogglePrivacy}
              disabled={toggling}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                user.isPublic
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {toggling ? 'Updating...' : user.isPublic ? 'Public (ON)' : 'Private (OFF)'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter By:</span>
          <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterGender('All')}
              className={`px-3 py-1 rounded-lg ${
                filterGender === 'All' ? 'bg-slate-800 text-white' : 'text-slate-400'
              }`}
            >
              All Members
            </button>
            <button
              onClick={() => setFilterGender('Male')}
              className={`px-3 py-1 rounded-lg ${
                filterGender === 'Male' ? 'bg-blue-600/30 text-blue-300' : 'text-slate-400'
              }`}
            >
              Brothers Only
            </button>
            <button
              onClick={() => setFilterGender('Female')}
              className={`px-3 py-1 rounded-lg ${
                filterGender === 'Female' ? 'bg-pink-600/30 text-pink-300' : 'text-slate-400'
              }`}
            >
              Sisters Only
            </button>
          </div>
        </div>

        <button
          onClick={fetchPublicUsers}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Readings</span>
        </button>
      </div>

      {/* Members Grid / Leaderboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, index) => {
          const isCurrentUser = item.id === user.id;
          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-lg relative flex flex-col justify-between transition-all ${
                isCurrentUser
                  ? 'border-emerald-500/50 bg-slate-900/90 ring-1 ring-emerald-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        item.gender === 'Male'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                      }`}
                    >
                      {index < 3 ? <Trophy className="w-4 h-4" /> : item.username.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>@{item.username}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.country} • {item.gender}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.blockerStatus === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : item.blockerStatus === 'DISARM_REQUESTED'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {item.blockerStatus === 'ACTIVE'
                      ? 'Armed'
                      : item.blockerStatus === 'DISARM_REQUESTED'
                      ? '3-Day Countdown'
                      : 'Disabled'}
                  </span>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3 my-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                      Streak Defended
                    </span>
                    <span className="text-base font-black text-white flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      {item.streakDays} Days
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                      Attacks Blocked
                    </span>
                    <span className="text-base font-black text-white flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {item.totalBlockedAttempts}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Accountability Covenant</span>
                <span className="text-slate-400">Anonymous & Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
