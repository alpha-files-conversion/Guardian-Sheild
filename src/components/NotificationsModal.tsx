import React from 'react';
import { X, Bell, ShieldAlert, MessageSquare, Check, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onNavigateToWatchlist?: () => void;
  onNavigateToInbox?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onNavigateToWatchlist,
  onNavigateToInbox,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Brotherhood & Sisterhood Alerts</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-extrabold">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Live alerts for 3-day disable requests and peer encouragement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <p>No notifications yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                You will be notified whenever someone of your gender presses 3-day disable or messages you.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isDisarmAlert = notif.type === 'DISARM_ALERT';
              const isDisarmComplete = notif.type === 'DISARM_COMPLETE';
              const isMessage = notif.type === 'NEW_MESSAGE';

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    !notif.isRead
                      ? isDisarmAlert || isDisarmComplete
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                        : 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isDisarmAlert || isDisarmComplete
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {isDisarmAlert ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isDisarmComplete ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {notif.body}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        {(isDisarmAlert || isDisarmComplete) && onNavigateToWatchlist && (
                          <button
                            onClick={() => {
                              onNavigateToWatchlist();
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold transition-all"
                          >
                            <span>Open 3-Day Watchlist</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {isMessage && onNavigateToInbox && (
                          <button
                            onClick={() => {
                              onNavigateToInbox();
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all"
                          >
                            <span>Read Full Message</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>Same-gender notification covenant</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
