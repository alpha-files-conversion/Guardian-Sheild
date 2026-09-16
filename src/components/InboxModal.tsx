import React, { useState, useEffect } from 'react';
import { Mail, HeartHandshake, X, RefreshCw, CheckCircle2, Shield } from 'lucide-react';
import { User, CommunityMessage } from '../types';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onRefreshCount?: (count: number) => void;
}

export const InboxModal: React.FC<InboxModalProps> = ({
  isOpen,
  onClose,
  user,
  onRefreshCount,
}) => {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community/messages/${user.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
      if (onRefreshCount) {
        onRefreshCount(data.messages?.length || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen, user.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Encouragement & SOS Inbox
              </h3>
              <p className="text-xs text-slate-400">
                Messages from your {user.gender === 'Male' ? 'brothers' : 'sisters'} urging you forward
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading your encouragements...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Shield className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">
              Your Inbox is Clean
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              When you enter a 3-day reflection period or encounter a struggle, fellow {user.gender === 'Male' ? 'brothers' : 'sisters'} will send you strength right here.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">
                      @{msg.senderUsername}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({msg.senderCountry} • {msg.senderGender})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                  "{msg.message}"
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Close Inbox
          </button>
        </div>
      </div>
    </div>
  );
};
