import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ShieldDashboard } from './components/ShieldDashboard';
import { DisarmRegistryDashboard } from './components/DisarmRegistryDashboard';
import { CommunitySos } from './components/CommunitySos';
import { PublicProgress } from './components/PublicProgress';
import { MotivationVault } from './components/MotivationVault';
import { AuthModal } from './components/AuthModal';
import { OnboardingVerification } from './components/OnboardingVerification';
import { DisableModal } from './components/DisableModal';
import { InboxModal } from './components/InboxModal';
import { NotificationsModal } from './components/NotificationsModal';
import { User, MotivationalQuote, AppNotification } from './types';
import { ShieldAlert, Bell, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { playNotificationChime } from './utils/audioAlert';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'shield' | 'watchlist' | 'community' | 'progress' | 'motivation'>('shield');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [sosCount, setSosCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeMotivation, setActiveMotivation] = useState<MotivationalQuote | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'alert'; title?: string } | null>(null);

  // Track known notification IDs to only chime on brand-new alerts
  const knownNotifIdsRef = useRef<Set<string>>(new Set());
  const isInitialFetchRef = useRef(true);

  // Show toast notification helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'alert' = 'info', title?: string) => {
    setToast({ message, type, title });
    setTimeout(() => setToast(null), 6000);
  };

  // Persistent Device Recognition (Know the phone and don't ask for sign-in or sign-up)
  useEffect(() => {
    const savedUserId = localStorage.getItem('guardian_user_id') || localStorage.getItem('guardian_device_user_id');
    if (savedUserId) {
      fetch(`/api/auth/me/${savedUserId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            // Re-affirm local device storage
            localStorage.setItem('guardian_user_id', data.user.id);
            localStorage.setItem('guardian_device_user_id', data.user.id);
            showToast(`Device Recognized: Welcome back @${data.user.username}!`, 'info');
          } else {
            localStorage.removeItem('guardian_user_id');
            localStorage.removeItem('guardian_device_user_id');
            setUser(null);
          }
        })
        .catch((err) => {
          console.error('Failed to restore device session:', err);
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, []);

  // Sync SOS counter
  const refreshSosCount = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/community/sos-alerts?gender=${user.gender}&currentUserId=${user.id}`);
      const data = await res.json();
      setSosCount(data.alerts?.length || 0);
    } catch (e) {
      console.error(e);
    }
  };

  // Sync Inbox messages count
  const refreshInboxCount = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/community/messages/${user.id}`);
      const data = await res.json();
      setInboxCount(data.messages?.length || 0);
    } catch (e) {
      console.error(e);
    }
  };

  // Sync live notifications (disarm alerts, new peer messages)
  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/notifications/${user.id}`);
      const data = await res.json();
      if (res.ok && data.notifications) {
        const fetched: AppNotification[] = data.notifications;
        setNotifications(fetched);

        // Check for new incoming notifications to chime & toast
        if (!isInitialFetchRef.current) {
          const brandNew = fetched.filter((n) => !knownNotifIdsRef.current.has(n.id) && !n.isRead);
          if (brandNew.length > 0) {
            const latest = brandNew[0];
            const chimeType =
              latest.type === 'DISARM_ALERT' ? 'urgent' : latest.type === 'NEW_MESSAGE' ? 'message' : 'victory';
            playNotificationChime(chimeType);
            showToast(latest.body, latest.type === 'DISARM_ALERT' ? 'alert' : 'info', latest.title);
          }
        }

        // Update known IDs
        fetched.forEach((n) => knownNotifIdsRef.current.add(n.id));
        isInitialFetchRef.current = false;
      }
    } catch (e) {
      console.error('Failed to sync notifications:', e);
    }
  };

  useEffect(() => {
    if (user) {
      refreshSosCount();
      refreshInboxCount();
      refreshNotifications();

      // Poll every 10 seconds for real-time notifications
      const pollInterval = setInterval(() => {
        refreshNotifications();
        refreshSosCount();
        refreshInboxCount();
      }, 10000);

      return () => clearInterval(pollInterval);
    }
  }, [user?.id, user?.gender]);

  const handleMarkAllNotificationsRead = async () => {
    if (!user) return;
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    // Persist device recognition so the user is never asked again on this phone/browser
    localStorage.setItem('guardian_user_id', authenticatedUser.id);
    localStorage.setItem('guardian_device_user_id', authenticatedUser.id);
    setIsAuthOpen(false);
    showToast(`Device remembered! Welcome @${authenticatedUser.username}. Shield is active.`, 'success');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out from this device?')) {
      localStorage.removeItem('guardian_user_id');
      localStorage.removeItem('guardian_device_user_id');
      setUser(null);
      showToast('Signed out from this device. Please sign in or verify again when you return.', 'info');
    }
  };

  const handleReArmShield = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/blocker/re-arm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        playNotificationChime('victory');
        showToast(data.message, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to re-arm', 'error');
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex items-start gap-3 animate-fade-in text-xs font-medium">
          {toast.type === 'alert' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
          ) : toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Bell className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            {toast.title && <h5 className="font-bold text-white mb-0.5">{toast.title}</h5>}
            <p className="text-slate-200 leading-snug">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Primary Navigation Header */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sosCount={sosCount}
        inboxCount={inboxCount}
        notifCount={unreadNotifsCount}
        onOpenInbox={() => setIsInboxOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {!user ? (
          /* First-Time Comers: Onboarding & Verification Gate */
          <OnboardingVerification onSuccess={handleAuthSuccess} />
        ) : (
          <>
            {/* Tab 1: Shield & Status */}
            {activeTab === 'shield' && (
              <ShieldDashboard
                user={user}
                onOpenDisableModal={() => setIsDisableOpen(true)}
                onReArm={handleReArmShield}
                onUpdateUser={(updated) => setUser(updated)}
              />
            )}

            {/* Tab 2: Particular Dashboard for people on 3-day countdown & completely disabled */}
            {activeTab === 'watchlist' && (
              <DisarmRegistryDashboard
                currentUser={user}
                onRefreshUser={() => {
                  fetch(`/api/auth/me/${user.id}`)
                    .then((r) => r.json())
                    .then((d) => d.user && setUser(d.user));
                }}
                onSendAdviceSuccess={(msg) => showToast(msg, 'success')}
              />
            )}

            {/* Tab 3: Same-Gender SOS Requests */}
            {activeTab === 'community' && (
              <CommunitySos
                user={user}
                onRefreshSosCount={(count) => setSosCount(count)}
              />
            )}

            {/* Tab 4: Public Clean Streaks Progress */}
            {activeTab === 'progress' && (
              <PublicProgress
                user={user}
                onUpdateUser={(updated) => setUser(updated)}
              />
            )}

            {/* Tab 5: Limitless Motivation Vault */}
            {activeTab === 'motivation' && <MotivationVault user={user} />}
          </>
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {user && (
        <>
          <DisableModal
            isOpen={isDisableOpen}
            onClose={() => setIsDisableOpen(false)}
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
              refreshNotifications();
            }}
            activeMotivation={activeMotivation}
            setActiveMotivation={setActiveMotivation}
          />

          <InboxModal
            isOpen={isInboxOpen}
            onClose={() => setIsInboxOpen(false)}
            user={user}
            onRefreshCount={(count) => setInboxCount(count)}
          />

          <NotificationsModal
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onNavigateToWatchlist={() => setActiveTab('watchlist')}
            onNavigateToInbox={() => setIsInboxOpen(true)}
          />
        </>
      )}

      {/* Footer & Covenant Statement */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p className="max-w-xl mx-auto px-4">
          Guardian Shield • 100% Free Pure Local Engine • Strict Same-Gender Peer Mentorship Covenant
        </p>
      </footer>
    </div>
  );
}
