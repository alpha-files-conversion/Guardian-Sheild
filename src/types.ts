export type Gender = 'Male' | 'Female';
export type BlockerStatus = 'UNACTIVATED' | 'ACTIVE' | 'DISARM_REQUESTED' | 'DISABLED';

export interface User {
  id: string;
  username: string;
  email: string;
  gender: Gender;
  country: string;
  isPublic: boolean;
  streakDays: number;
  totalBlockedAttempts: number;
  blockerStatus: BlockerStatus;
  disableRequestedAt?: number;
  countdownEndsAt?: number;
  totalWaitingDays: number;
  disabledSince?: number;
  totalDaysDisabled?: number;
  createdAt: number;
  lastActive: number;
}

export interface SosAlert {
  id: string;
  userId: string;
  username: string;
  gender: Gender;
  country: string;
  status: '3_DAYS_COUNTDOWN' | 'DISABLED';
  streakDays: number;
  countdownEndsAt?: number;
  totalWaitingDays: number;
  disabledSince?: number;
  disabledDurationText?: string;
  encouragementsCount: number;
  updatedAt: number;
}

export interface CommunityMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderGender: Gender;
  senderCountry: string;
  recipientId: string;
  recipientUsername: string;
  message: string;
  createdAt: number;
  isRead: boolean;
}

export interface MotivationalQuote {
  message: string;
  quote: string;
  author: string;
  growthMilestone: string;
  waitingDaysTotal: number;
}

export interface ImageAnalysisResult {
  isExplicit: boolean;
  triggerRisk: 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH';
  detectedElements: string[];
  analysis: string;
  advice: string;
  suggestedAction: string;
}

export interface BlockRule {
  domain: string;
  category: string;
  reason: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'DISARM_ALERT' | 'NEW_MESSAGE' | 'STREAK_MILESTONE' | 'DISARM_COMPLETE';
  title: string;
  body: string;
  senderId?: string;
  senderUsername?: string;
  senderGender?: Gender;
  createdAt: number;
  isRead: boolean;
}

export interface CountdownUser {
  id: string;
  username: string;
  gender: Gender;
  country: string;
  streakDays: number;
  disableRequestedAt?: number;
  countdownEndsAt?: number;
  totalWaitingDays: number;
  msRemaining: number;
  remainingFormatted: string;
  encouragementsCount: number;
  lastActive: number;
}

export interface DisabledRegistryUser {
  id: string;
  username: string;
  gender: Gender;
  country: string;
  streakDays: number;
  disabledSince?: number;
  daysDisabled: number;
  hoursDisabled: number;
  disabledDurationText: string;
  encouragementsCount: number;
  lastActive: number;
}
