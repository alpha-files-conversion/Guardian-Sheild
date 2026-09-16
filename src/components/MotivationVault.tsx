import React, { useState } from 'react';
import { Sparkles, Quote, RefreshCw, Flame, ShieldCheck, Zap } from 'lucide-react';
import { User, MotivationalQuote } from '../types';

interface MotivationVaultProps {
  user: User;
}

export const MotivationVault: React.FC<MotivationVaultProps> = ({ user }) => {
  const [emotionalState, setEmotionalState] = useState('Urge / Temptation');
  const [loading, setLoading] = useState(false);
  const [currentMotivation, setCurrentMotivation] = useState<MotivationalQuote & { actionStep?: string }>({
    message: `Wow, you've made it this far... ${user.streakDays} days of choosing your dignity, self-respect, and clear vision over hollow pixels. When urges arise, remember: they peak and fade within minutes. Your future self is thanking you right now.`,
    quote: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn",
    growthMilestone: "Neuroplastic Dopamine Rebuilding & Frontal Lobe Fortification",
    actionStep: "Drink a large glass of ice-cold water immediately and step away from all screens for 15 minutes.",
    waitingDaysTotal: 3,
  });

  const EMOTIONS = [
    'Urge / Temptation',
    'Nighttime Loneliness',
    'Boredom / Brain Fog',
    'Stress & Anxiety',
    'Celebrating Milestone',
  ];

  const handleGenerateNew = async (selectedState = emotionalState) => {
    setLoading(true);
    try {
      const res = await fetch('/api/motivation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streakDays: user.streakDays,
          username: user.username,
          gender: user.gender,
          emotionalState: selectedState,
        }),
      });
      const data = await res.json();
      if (data.motivation) {
        setCurrentMotivation({
          ...data.motivation,
          waitingDaysTotal: user.totalWaitingDays || 3,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>1.2+ Billion Motivational Reflections</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
            <span>Instant & Unlimited Access</span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight">
          Infinite Recovery & Personal Growth Vault
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Every moment of resistance strengthens your brain. Synthesized from over <strong className="text-purple-300 font-semibold">1.2+ billion unique permutations</strong> of timeless wisdom, neurobiological recovery milestones, and actionable directives tailored to your <strong className="text-white">{user.streakDays} days of clean freedom</strong>.
        </p>
      </div>

      {/* Emotion / Situation Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <p className="text-xs font-semibold text-slate-300">
          What are you experiencing right now?
        </p>
        <div className="flex flex-wrap gap-2">
          {EMOTIONS.map((state) => (
            <button
              key={state}
              onClick={() => {
                setEmotionalState(state);
                handleGenerateNew(state);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                emotionalState === state
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>

      {/* Active Motivation Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30 border border-purple-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Day {user.streakDays} Personal Growth Affirmation
            </span>
          </div>
          <span className="text-xs text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
            {emotionalState}
          </span>
        </div>

        {/* Message Body */}
        <p className="text-base md:text-lg text-slate-100 font-medium leading-relaxed my-4">
          "{currentMotivation.message}"
        </p>

        {/* Quote Block */}
        <div className="border-l-4 border-purple-500 pl-4 py-2 my-6 bg-slate-950/60 rounded-r-2xl">
          <div className="flex items-start gap-2">
            <Quote className="w-4 h-4 text-purple-400 shrink-0 mt-1" />
            <p className="text-sm italic text-purple-200">
              "{currentMotivation.quote}"
            </p>
          </div>
          <p className="text-xs text-slate-400 text-right mt-2 font-semibold">
            — {currentMotivation.author}
          </p>
        </div>

        {/* Biological Milestone */}
        <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Current Biological Milestone:</span>
          </div>
          <span className="text-emerald-400 font-bold">
            {currentMotivation.growthMilestone}
          </span>
        </div>

        {/* Tactical Action Step */}
        {currentMotivation.actionStep && (
          <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300 font-medium">Immediate Victory Protocol:</span>
            </div>
            <span className="text-amber-300 font-semibold">
              {currentMotivation.actionStep}
            </span>
          </div>
        )}

        {/* Generate Next Button */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <span className="text-xs text-purple-300 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>1.2+ Billion Curated Reflections Available</span>
          </span>

          <button
            id="btn-generate-next-motivation"
            onClick={() => handleGenerateNew(emotionalState)}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {loading ? 'Synthesizing...' : 'Generate Fresh Motivation (1.2+ Billion Library)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
