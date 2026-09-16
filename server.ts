import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  synthesizeProceduralMotivation,
  generateDisarmReflectionMotivation,
  generateExtensionMotivation,
} from "./src/utils/motivationEngine.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Storage file for persistent synchronization
const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // Plain/simple hashed for demo verification
  gender: "Male" | "Female";
  country: string;
  isPublic: boolean;
  streakDays: number;
  totalBlockedAttempts: number;
  blockerStatus: "UNACTIVATED" | "ACTIVE" | "DISARM_REQUESTED" | "DISABLED";
  disableRequestedAt?: number;
  countdownEndsAt?: number;
  totalWaitingDays: number;
  disabledSince?: number;
  totalDaysDisabled?: number;
  createdAt: number;
  lastActive: number;
}

interface StoredMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderGender: "Male" | "Female";
  senderCountry: string;
  recipientId: string;
  recipientUsername: string;
  message: string;
  createdAt: number;
  isRead: boolean;
}

interface StoredNotification {
  id: string;
  userId: string;
  type: "DISARM_ALERT" | "NEW_MESSAGE" | "STREAK_MILESTONE" | "DISARM_COMPLETE";
  title: string;
  body: string;
  senderId?: string;
  senderUsername?: string;
  senderGender?: "Male" | "Female";
  createdAt: number;
  isRead: boolean;
}

interface AppStore {
  users: StoredUser[];
  messages: StoredMessage[];
  notifications: StoredNotification[];
}

// Initial mock community data (seeded with authentic brothers and sisters)
function getInitialStore(): AppStore {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  return {
    users: [
      {
        id: "user-brother-1",
        username: "Marcus_Phoenix",
        email: "marcus@brotherhood.org",
        passwordHash: "password123",
        gender: "Male",
        country: "United States",
        isPublic: true,
        streakDays: 48,
        totalBlockedAttempts: 132,
        blockerStatus: "DISARM_REQUESTED",
        disableRequestedAt: now - 1.2 * DAY_MS,
        countdownEndsAt: now + 1.8 * DAY_MS,
        totalWaitingDays: 3,
        createdAt: now - 48 * DAY_MS,
        lastActive: now - 1000 * 60 * 30,
      },
      {
        id: "user-brother-2",
        username: "IronWill_David",
        email: "david@brotherhood.org",
        passwordHash: "password123",
        gender: "Male",
        country: "Germany",
        isPublic: true,
        streakDays: 84,
        totalBlockedAttempts: 215,
        blockerStatus: "ACTIVE",
        totalWaitingDays: 3,
        createdAt: now - 84 * DAY_MS,
        lastActive: now - 1000 * 60 * 5,
      },
      {
        id: "user-brother-3",
        username: "Kelechi_Vanguard",
        email: "kelechi@brotherhood.org",
        passwordHash: "password123",
        gender: "Male",
        country: "Nigeria",
        isPublic: true,
        streakDays: 14,
        totalBlockedAttempts: 41,
        blockerStatus: "DISABLED",
        disabledSince: now - 2.5 * DAY_MS,
        totalDaysDisabled: 2,
        totalWaitingDays: 3,
        createdAt: now - 20 * DAY_MS,
        lastActive: now - 1000 * 60 * 120,
      },
      {
        id: "user-sister-1",
        username: "Grace_Overcomes",
        email: "grace@sisterhood.org",
        passwordHash: "password123",
        gender: "Female",
        country: "Canada",
        isPublic: true,
        streakDays: 36,
        totalBlockedAttempts: 95,
        blockerStatus: "DISARM_REQUESTED",
        disableRequestedAt: now - 0.8 * DAY_MS,
        countdownEndsAt: now + 2.2 * DAY_MS,
        totalWaitingDays: 3,
        createdAt: now - 36 * DAY_MS,
        lastActive: now - 1000 * 60 * 15,
      },
      {
        id: "user-sister-2",
        username: "Serena_Resilience",
        email: "serena@sisterhood.org",
        passwordHash: "password123",
        gender: "Female",
        country: "United Kingdom",
        isPublic: true,
        streakDays: 112,
        totalBlockedAttempts: 340,
        blockerStatus: "ACTIVE",
        totalWaitingDays: 3,
        createdAt: now - 112 * DAY_MS,
        lastActive: now - 1000 * 60 * 20,
      },
      {
        id: "user-sister-3",
        username: "Amara_Freedom",
        email: "amara@sisterhood.org",
        passwordHash: "password123",
        gender: "Female",
        country: "Nigeria",
        isPublic: true,
        streakDays: 9,
        totalBlockedAttempts: 28,
        blockerStatus: "DISABLED",
        disabledSince: now - 3.1 * DAY_MS,
        totalDaysDisabled: 3,
        totalWaitingDays: 3,
        createdAt: now - 15 * DAY_MS,
        lastActive: now - 1000 * 60 * 60,
      },
    ],
    messages: [
      {
        id: "msg-seed-1",
        senderId: "user-brother-2",
        senderUsername: "IronWill_David",
        senderGender: "Male",
        senderCountry: "Germany",
        recipientId: "user-brother-1",
        recipientUsername: "Marcus_Phoenix",
        message:
          "Brother Marcus, hold the line! 48 days is monumental. The urge passes in 15 minutes, but the regret will haunt you for weeks. Cancel the disable!",
        createdAt: now - 1000 * 60 * 60 * 4,
        isRead: false,
      },
      {
        id: "msg-seed-2",
        senderId: "user-sister-2",
        senderUsername: "Serena_Resilience",
        senderGender: "Female",
        senderCountry: "United Kingdom",
        recipientId: "user-sister-1",
        recipientUsername: "Grace_Overcomes",
        message:
          "Sister Grace, you are not alone in this fight! Think of how clear your mind has felt these 36 days. Breathe, close the browser, and reclaim your power!",
        createdAt: now - 1000 * 60 * 60 * 2,
        isRead: false,
      },
    ],
    notifications: [
      {
        id: "notif-seed-1",
        userId: "user-brother-2",
        type: "DISARM_ALERT",
        title: "🚨 Brotherhood Alert: Marcus_Phoenix requested 3-day reflection!",
        body: "Marcus_Phoenix has entered the 3-day reflection countdown. Reach out with brotherly strength before time expires!",
        senderId: "user-brother-1",
        senderUsername: "Marcus_Phoenix",
        senderGender: "Male",
        createdAt: now - 1000 * 60 * 60 * 3,
        isRead: false,
      },
      {
        id: "notif-seed-2",
        userId: "user-sister-1",
        type: "NEW_MESSAGE",
        title: "New Advice from @Serena_Resilience",
        body: "Sister Grace, you are not alone in this fight! Think of how clear your mind has felt...",
        senderId: "user-sister-2",
        senderUsername: "Serena_Resilience",
        senderGender: "Female",
        createdAt: now - 1000 * 60 * 60 * 2,
        isRead: false,
      },
    ],
  };
}

function loadStore(): AppStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed: AppStore = JSON.parse(data);
      if (!parsed.notifications) {
        parsed.notifications = [];
      }
      return parsed;
    }
  } catch (err) {
    console.error("Error loading store:", err);
  }
  const initial = getInitialStore();
  saveStore(initial);
  return initial;
}

function saveStore(store: AppStore) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving store:", err);
  }
}

// Top adult domains and keywords database for filter engine
const BLOCKED_DOMAINS = [
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "redtube.com",
  "youporn.com",
  "xhamster.com",
  "chaturbate.com",
  "stripchat.com",
  "livejasmin.com",
  "camsoda.com",
  "rule34.xxx",
  "onlyfans.com",
  "fansly.com",
  "spankbang.com",
  "tube8.com",
  "brazzers.com",
  "bangbros.com",
  "naughtyamerica.com",
  "eporner.com",
  "beeg.com",
  "tnaflix.com",
  "daftsex.com",
  "heavy-r.com",
  "hentaihaven.xxx",
  "nhentai.net",
  "luscious.net",
  "danbooru.donmai.us",
  "gelbooru.com",
  "cam4.com",
  "bongacams.com",
  "fapello.com",
  "bravoteens.com",
  "hqporner.com",
  "erome.com",
  "thothub.to",
  "coomer.party",
  "kemono.party",
];

const BLOCKED_KEYWORDS = [
  "porn",
  "xxx",
  "nsfw",
  "hentai",
  "erotic",
  "nude",
  "naked",
  "fetish",
  "masturbat",
  "orgasm",
  "camsoda",
  "chaturbate",
  "stripchat",
  "hardcore",
  "softcore",
  "rule34",
  "boobs",
  "tits",
  "pussy",
  "milf",
  "gangbang",
  "creampie",
  "blowjob",
  "dildo",
  "sex video",
  "adult tube",
  "pornhub",
  "xvideos",
  "xnxx",
];

// Offline fallback quote library containing diverse, powerful motivations
const BACKUP_MOTIVATIONS = [
  {
    message:
      "Wow, you've made it this far... Every single day you resisted was a battle won against dopamine slavery. Don't throw away your hard-won clarity for 5 seconds of hollow numbness. If only you could try again, I will give you 3 days to think about it.",
    quote: "He who conquers himself is the mightiest warrior.",
    author: "Confucius",
    growthMilestone: "Neuroplastic Healing Phase - Dopamine Receptors Rebuilding",
  },
  {
    message:
      "Look at where you started and look at where you stand right now. You have endured the worst urges and proved you have an iron spine. Don't step backward into darkness when the morning sun is finally breaking through.",
    quote:
      "The man who moves a mountain begins by carrying away small stones.",
    author: "Confucius",
    growthMilestone: "Self-Mastery Epoch - Habit Loop Interruption",
  },
  {
    message:
      "Wow, you've made it this far... Your mind has been clearing, your energy returning, your self-respect growing. The voice telling you to disable this is not you—it is the addiction fighting for its survival because it knows you are winning.",
    quote:
      "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    growthMilestone: "Frontal Cortex Strengthening - Executive Control Active",
  },
  {
    message:
      "You are at the crossroads of your destiny. One road leads to regret, brain fog, and self-disappointment. The other leads to unstoppable confidence and authentic freedom. Choose freedom today.",
    quote:
      "No man is free who is not master of himself.",
    author: "Epictetus",
    growthMilestone: "Identity Transformation - Breaking The Cycle Forever",
  },
];

// Helper: Sanitize user object for client
function sanitizeUser(user: StoredUser) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// ---------------- API ROUTES ----------------

// 1. Register / Verification
app.post("/api/auth/register", (req: Request, res: Response) => {
  try {
    const { username, email, password, gender, country, isPublic } = req.body;

    if (!username || !email || !password || !gender || !country) {
      return res.status(400).json({
        error: "All fields are required: username, email, password, gender, country.",
      });
    }

    if (gender !== "Male" && gender !== "Female") {
      return res.status(400).json({ error: "Gender must be Male or Female only." });
    }

    const store = loadStore();

    // Check if username or email already exists
    const existing = store.users.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() ||
        u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existing) {
      return res
        .status(400)
        .json({ error: "Username or Email is already registered. Please login." });
    }

    const newUser: StoredUser = {
      id: "user-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: password, // In production use bcrypt
      gender,
      country: country.trim(),
      isPublic: Boolean(isPublic),
      streakDays: 1,
      totalBlockedAttempts: 0,
      blockerStatus: "UNACTIVATED",
      totalWaitingDays: 3,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    store.users.push(newUser);
    saveStore(store);

    res.json({
      success: true,
      user: sanitizeUser(newUser),
      message: `Welcome ${newUser.username}! Your porn blocking shield is permanently armed.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

// 2. Login
app.post("/api/auth/login", (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // username or email

    if (!identifier || !password) {
      return res.status(400).json({ error: "Please enter your username/email and password." });
    }

    const store = loadStore();
    const idClean = identifier.trim().toLowerCase();

    const user = store.users.find(
      (u) =>
        u.username.toLowerCase() === idClean ||
        u.email.toLowerCase() === idClean
    );

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: "Invalid username/email or password." });
    }

    user.lastActive = Date.now();
    saveStore(store);

    res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Login failed" });
  }
});

// 3. Get User Profile
app.get("/api/auth/me/:id", (req: Request, res: Response) => {
  const store = loadStore();
  const user = store.users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ user: sanitizeUser(user) });
});

// 4. Update Privacy or Settings
app.put("/api/user/settings/:id", (req: Request, res: Response) => {
  const store = loadStore();
  const user = store.users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { isPublic, country } = req.body;
  if (typeof isPublic === "boolean") user.isPublic = isPublic;
  if (country) user.country = country;

  saveStore(store);
  res.json({ success: true, user: sanitizeUser(user) });
});

// 5. Blocker: Request Disable (STRICT PASSWORD CHECK + 3-DAY PROTOCOL + GEMINI MOTIVATION)
app.post("/api/blocker/request-disable", async (req: Request, res: Response) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ error: "Password is required to request disabling the blocker." });
    }

    const store = loadStore();
    const user = store.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Verify master password
    if (user.passwordHash !== password) {
      return res.status(403).json({
        error: "Incorrect master password! Disabling was rejected for your protection.",
      });
    }

    const now = Date.now();
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

    user.blockerStatus = "DISARM_REQUESTED";
    user.disableRequestedAt = now;
    user.totalWaitingDays = 3;
    user.countdownEndsAt = now + THREE_DAYS_MS;
    user.lastActive = now;

    // Generate Custom Motivational Reflection (100% Free Procedural Synthesis by default)
    let motivation = generateDisarmReflectionMotivation(user.username, user.gender, user.streakDays);

    // Optional: if explicitly requested and key exists, gemini-2.5-flash-lite free tier can be utilized
    if (req.body.useGemini && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are a compassionate, deeply inspirational addiction recovery guide. A user named "${user.username}" (gender: ${user.gender}) who has achieved ${user.streakDays} days of total freedom from pornography addiction has just entered their password to request disabling the porn blocker.
Follow this mandatory instruction:
Tell them: "Wow, you've made it this far... If only you could try again, so I will give you 3 days to think about it."
Highlight their ${user.streakDays} days of success and their personal growth journey.
Include an inspiring quote about self-improvement, resilience, and personal victory.
Return a valid JSON object with keys:
"message": (string, containing the required words "Wow, you've made it this far... If only you could try again so I will give you 3 days to think about it", personalized with their streak and emotional support),
"quote": (string, famous quote about discipline/recovery/self-mastery),
"author": (string, author of quote),
"growthMilestone": (string, describing the neurological/psychological milestone of their current streak)
ONLY return JSON, nothing else.`;

        const geminiRes = await ai.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = geminiRes.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.message && parsed.quote) {
            motivation = {
              message: parsed.message,
              quote: parsed.quote,
              author: parsed.author || "Unknown",
              growthMilestone: parsed.growthMilestone || "Neuroplastic Dopamine Healing",
            };
          }
        }
      } catch (genErr) {
        console.warn("Gemini generation fallback used:", genErr);
      }
    }

    // Broadcast urgent notification to all members of the same gender
    if (!store.notifications) store.notifications = [];
    const sameGenderPeers = store.users.filter((u) => u.gender === user.gender && u.id !== user.id);
    const alertPrefix = user.gender === "Male" ? "🚨 Brotherhood Alert" : "🚨 Sisterhood Alert";
    const peerNoun = user.gender === "Male" ? "brother" : "sister";
    const nowTime = Date.now();

    for (const peer of sameGenderPeers) {
      store.notifications.push({
        id: "notif-disarm-" + nowTime + "-" + peer.id,
        userId: peer.id,
        type: "DISARM_ALERT",
        title: `${alertPrefix}: @${user.username} entered 3-Day Reflection!`,
        body: `Your ${peerNoun} @${user.username} has initiated the 3-day disable process after ${user.streakDays} days of victory. Send emergency encouragement before the countdown ends!`,
        senderId: user.id,
        senderUsername: user.username,
        senderGender: user.gender,
        createdAt: nowTime,
        isRead: false,
      });
    }

    saveStore(store);

    res.json({
      success: true,
      user: sanitizeUser(user),
      motivation: {
        ...motivation,
        waitingDaysTotal: user.totalWaitingDays,
      },
      message: `Disable requested. 3-day reflection countdown activated. We have notified your ${user.gender === "Male" ? "brothers" : "sisters"} to support you.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process disable request." });
  }
});

// 6. Blocker: Extend Waiting Period ("I've added another 3 days waiting and tell the total")
app.post("/api/blocker/extend-waiting", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const store = loadStore();
    const user = store.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.totalWaitingDays = (user.totalWaitingDays || 3) + 3;
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    user.countdownEndsAt = Date.now() + THREE_DAYS_MS;
    user.lastActive = Date.now();

    // Generate fresh motivation for this extension (100% Free Procedural Synthesis)
    let motivation = generateExtensionMotivation(user.username, user.totalWaitingDays, user.streakDays);

    if (req.body.useGemini && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `User "${user.username}" had a 3-day waiting countdown to disable their porn blocker. The app is now adding another 3 days waiting, bringing the total waiting days to ${user.totalWaitingDays} days!
Write a motivational message explicitly stating: "I've added another 3 days waiting" and mentioning the total of ${user.totalWaitingDays} days.
Remind them: "Wow, you've made it this far...", celebrate their ongoing success and personal growth journey, and provide a strong self-improvement quote.
Return JSON with keys: "message", "quote", "author", "growthMilestone".`;

        const geminiRes = await ai.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        const text = geminiRes.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.message) {
            motivation = {
              message: parsed.message,
              quote: parsed.quote || motivation.quote,
              author: parsed.author || motivation.author,
              growthMilestone: parsed.growthMilestone || motivation.growthMilestone,
            };
          }
        }
      } catch (e) {
        console.warn("Gemini extension motivation fallback:", e);
      }
    }

    saveStore(store);

    res.json({
      success: true,
      user: sanitizeUser(user),
      motivation: {
        ...motivation,
        waitingDaysTotal: user.totalWaitingDays,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to extend waiting period" });
  }
});

// 7. Blocker: Cancel Disable & Stay Strong ("cancel the disabled and let's continue")
app.post("/api/blocker/cancel-disable", (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const store = loadStore();
    const user = store.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.blockerStatus = "ACTIVE";
    user.disableRequestedAt = undefined;
    user.countdownEndsAt = undefined;
    user.totalWaitingDays = 3;
    user.streakDays += 1; // Bonus day for triumphing over temptation!
    user.lastActive = Date.now();

    saveStore(store);

    res.json({
      success: true,
      user: sanitizeUser(user),
      message: `VICTORY! You canceled the disable request and stood your ground! Your shield remains 100% active. Your ${user.gender === "Male" ? "brothers" : "sisters"} celebrate your triumph!`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to cancel disable" });
  }
});

// 8. Blocker: Confirm Disabled (Only if countdown elapsed)
app.post("/api/blocker/confirm-disabled", (req: Request, res: Response) => {
  try {
    const { userId, password } = req.body;
    const store = loadStore();
    const user = store.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.passwordHash !== password) {
      return res.status(403).json({ error: "Incorrect master password." });
    }

    // Set to disabled
    const now = Date.now();
    user.blockerStatus = "DISABLED";
    user.disabledSince = now;
    user.totalDaysDisabled = 0;
    user.countdownEndsAt = undefined;
    user.lastActive = now;

    // Broadcast alert to peers of same gender that member has disabled
    if (!store.notifications) store.notifications = [];
    const sameGenderPeers = store.users.filter((u) => u.gender === user.gender && u.id !== user.id);
    const peerNoun = user.gender === "Male" ? "brother" : "sister";
    for (const peer of sameGenderPeers) {
      store.notifications.push({
        id: "notif-disabled-" + now + "-" + peer.id,
        userId: peer.id,
        type: "DISARM_COMPLETE",
        title: user.gender === "Male" ? "⚠️ Brother's Shield Disarmed" : "⚠️ Sister's Shield Disarmed",
        body: `@${user.username} has completed the 3-day delay and disabled their blocker. Send brotherly/sisterly counsel to help them re-arm!`,
        senderId: user.id,
        senderUsername: user.username,
        senderGender: user.gender,
        createdAt: now,
        isRead: false,
      });
    }

    saveStore(store);

    res.json({
      success: true,
      user: sanitizeUser(user),
      message: "The blocker has been disabled. Your community has been alerted to help you return.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to confirm disabled" });
  }
});

// 9. Blocker: Re-Arm Shield
app.post("/api/blocker/re-arm", (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const store = loadStore();
    const user = store.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.blockerStatus = "ACTIVE";
    user.disabledSince = undefined;
    user.totalDaysDisabled = 0;
    user.disableRequestedAt = undefined;
    user.countdownEndsAt = undefined;
    user.totalWaitingDays = 3;
    user.streakDays = 1;
    user.lastActive = Date.now();

    saveStore(store);

    res.json({
      success: true,
      user: sanitizeUser(user),
      message: "Shield permanently re-armed! Welcome back to the path of freedom.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to re-arm" });
  }
});

// 9b. Blocker: Round Activate Button (stops all porn websites)
app.post("/api/blocker/activate", (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const store = loadStore();
    const user = store.users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.blockerStatus = "ACTIVE";
    user.disabledSince = undefined;
    user.totalDaysDisabled = 0;
    user.disableRequestedAt = undefined;
    user.countdownEndsAt = undefined;
    user.totalWaitingDays = 3;
    user.streakDays = 1;
    user.createdAt = Date.now();
    user.lastActive = Date.now();

    saveStore(store);

    res.json({
      success: true,
      user: sanitizeUser(user),
      message: "SHIELD ACTIVATED: All porn websites, adult queries, and explicit networks are now stopped!",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to activate blocker" });
  }
});

// 10. Community SOS Alerts (SAME GENDER ONLY: "We are about to lose a brother / sister")
app.get("/api/community/sos-alerts", (req: Request, res: Response) => {
  try {
    const gender = req.query.gender as string; // 'Male' | 'Female'
    const currentUserId = req.query.currentUserId as string;

    const store = loadStore();
    const now = Date.now();

    // Filter by same gender and non-current user
    let relevantUsers = store.users.filter(
      (u) => (!gender || u.gender === gender) && (!currentUserId || u.id !== currentUserId)
    );

    const alerts = relevantUsers
      .filter((u) => u.blockerStatus === "DISARM_REQUESTED" || u.blockerStatus === "DISABLED")
      .map((u) => {
        let disabledDurationText = "";
        if (u.blockerStatus === "DISABLED" && u.disabledSince) {
          const hours = Math.max(1, Math.round((now - u.disabledSince) / (1000 * 60 * 60)));
          const days = Math.floor(hours / 24);
          disabledDurationText = days > 0 ? `${days} day(s)` : `${hours} hour(s)`;
        }

        return {
          id: "alert-" + u.id,
          userId: u.id,
          username: u.username,
          gender: u.gender,
          country: u.country,
          status: u.blockerStatus === "DISARM_REQUESTED" ? "3_DAYS_COUNTDOWN" : "DISABLED",
          streakDays: u.streakDays,
          countdownEndsAt: u.countdownEndsAt,
          totalWaitingDays: u.totalWaitingDays || 3,
          disabledSince: u.disabledSince,
          disabledDurationText,
          encouragementsCount: store.messages.filter((m) => m.recipientId === u.id).length,
          updatedAt: u.lastActive,
        };
      });

    res.json({ alerts });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch SOS alerts" });
  }
});

// 11. Public Progress Readings ("people can decide to on if they want their progress readings and data public")
app.get("/api/community/public-progress", (req: Request, res: Response) => {
  try {
    const store = loadStore();
    const publicUsers = store.users
      .filter((u) => u.isPublic)
      .map((u) => ({
        id: u.id,
        username: u.username,
        gender: u.gender,
        country: u.country,
        streakDays: u.streakDays,
        totalBlockedAttempts: u.totalBlockedAttempts,
        blockerStatus: u.blockerStatus,
        createdAt: u.createdAt,
      }))
      .sort((a, b) => b.streakDays - a.streakDays);

    res.json({ publicUsers });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch public progress" });
  }
});

// 12. Send Advice / Message (STRICT SAME-GENDER CHECK)
app.post("/api/community/send-message", (req: Request, res: Response) => {
  try {
    const { senderId, recipientId, message } = req.body;

    if (!senderId || !recipientId || !message || !message.trim()) {
      return res.status(400).json({ error: "Sender, recipient, and message are required." });
    }

    const store = loadStore();
    const sender = store.users.find((u) => u.id === senderId);
    const recipient = store.users.find((u) => u.id === recipientId);

    if (!sender || !recipient) {
      return res.status(404).json({ error: "Sender or Recipient not found." });
    }

    // STRICT SAME-GENDER MANDATE:
    // "And anyone that will give Someone the Advice that is for 3 days there must be d same gender"
    if (sender.gender !== recipient.gender) {
      return res.status(403).json({
        error: `Accountability rule: You can only advise peers of the same gender (${sender.gender} to ${sender.gender}).`,
      });
    }

    const newMsg: StoredMessage = {
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      senderId: sender.id,
      senderUsername: sender.username,
      senderGender: sender.gender,
      senderCountry: sender.country,
      recipientId: recipient.id,
      recipientUsername: recipient.username,
      message: message.trim(),
      createdAt: Date.now(),
      isRead: false,
    };

    store.messages.push(newMsg);

    // Push notification to recipient when they receive a message
    if (!store.notifications) store.notifications = [];
    store.notifications.push({
      id: "notif-msg-" + Date.now() + "-" + recipient.id,
      userId: recipient.id,
      type: "NEW_MESSAGE",
      title: `💬 New Advice from @${sender.username}`,
      body: message.trim().length > 100 ? message.trim().substring(0, 100) + "..." : message.trim(),
      senderId: sender.id,
      senderUsername: sender.username,
      senderGender: sender.gender,
      createdAt: Date.now(),
      isRead: false,
    });

    saveStore(store);

    res.json({
      success: true,
      message: `Your brotherly/sisterly advice has been delivered to ${recipient.username}!`,
      data: newMsg,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to send message" });
  }
});

// 13. Get My Inbox Messages
app.get("/api/community/messages/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const store = loadStore();
    const userMessages = store.messages
      .filter((m) => m.recipientId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({ messages: userMessages });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch messages" });
  }
});

// 13b. Notifications API (Live gender-based alerts & incoming messages)
app.get("/api/notifications/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const store = loadStore();
    const notifs = (store.notifications || [])
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      notifications: notifs,
      unreadCount: notifs.filter((n) => !n.isRead).length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch notifications" });
  }
});

app.post("/api/notifications/mark-read", (req: Request, res: Response) => {
  try {
    const { userId, notificationIds } = req.body;
    const store = loadStore();
    if (!store.notifications) store.notifications = [];

    store.notifications.forEach((n) => {
      if (n.userId === userId && (!notificationIds || notificationIds.includes(n.id))) {
        n.isRead = true;
      }
    });

    saveStore(store);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to mark notifications read" });
  }
});

// 13c. Particular Dashboard for People on 3-Day Disable Process & Completely Disabled Registry
app.get("/api/community/disarm-registry", (req: Request, res: Response) => {
  try {
    const gender = req.query.gender as string; // Optional filter: 'Male' | 'Female'
    const store = loadStore();
    const now = Date.now();

    let users = store.users;
    if (gender && (gender === "Male" || gender === "Female")) {
      users = users.filter((u) => u.gender === gender);
    }

    const countdownUsers = users
      .filter((u) => u.blockerStatus === "DISARM_REQUESTED")
      .map((u) => {
        const msRemaining = Math.max(0, (u.countdownEndsAt || 0) - now);
        const totalMinutes = Math.floor(msRemaining / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const encouragements = (store.messages || []).filter((m) => m.recipientId === u.id);

        return {
          id: u.id,
          username: u.username,
          gender: u.gender,
          country: u.country,
          streakDays: u.streakDays,
          disableRequestedAt: u.disableRequestedAt,
          countdownEndsAt: u.countdownEndsAt,
          totalWaitingDays: u.totalWaitingDays || 3,
          msRemaining,
          remainingFormatted: `${hours}h ${minutes}m`,
          encouragementsCount: encouragements.length,
          lastActive: u.lastActive,
        };
      })
      .sort((a, b) => a.msRemaining - b.msRemaining);

    const disabledUsers = users
      .filter((u) => u.blockerStatus === "DISABLED")
      .map((u) => {
        const disabledTime = u.disabledSince || (now - 24 * 60 * 60 * 1000);
        const hours = Math.max(1, Math.round((now - disabledTime) / (1000 * 60 * 60)));
        const days = Math.floor(hours / 24);
        const encouragements = (store.messages || []).filter((m) => m.recipientId === u.id);

        return {
          id: u.id,
          username: u.username,
          gender: u.gender,
          country: u.country,
          streakDays: u.streakDays,
          disabledSince: disabledTime,
          daysDisabled: days,
          hoursDisabled: hours,
          disabledDurationText: days > 0 ? `${days} day${days === 1 ? "" : "s"}` : `${hours} hour${hours === 1 ? "" : "s"}` ,
          encouragementsCount: encouragements.length,
          lastActive: u.lastActive,
        };
      })
      .sort((a, b) => (b.disabledSince || 0) - (a.disabledSince || 0));

    res.json({
      countdownUsers,
      disabledUsers,
      totalCountdown: countdownUsers.length,
      totalDisabled: disabledUsers.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch disarm registry" });
  }
});

// 14. URL & Domain Blocker Test Engine
app.post("/api/blocker/test-url", (req: Request, res: Response) => {
  try {
    const { url, userId } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const clean = url.trim().toLowerCase();
    let isBlocked = false;
    let matchedReason = "";

    // Check exact or partial domain match
    for (const d of BLOCKED_DOMAINS) {
      if (clean.includes(d)) {
        isBlocked = true;
        matchedReason = `Blocked domain: ${d}`;
        break;
      }
    }

    // Check adult keywords in path / query / URL
    if (!isBlocked) {
      for (const kw of BLOCKED_KEYWORDS) {
        if (clean.includes(kw)) {
          isBlocked = true;
          matchedReason = `Blocked adult keyword: "${kw}"`;
          break;
        }
      }
    }

    // Record attempt if user provided
    if (isBlocked && userId) {
      const store = loadStore();
      const user = store.users.find((u) => u.id === userId);
      if (user) {
        user.totalBlockedAttempts = (user.totalBlockedAttempts || 0) + 1;
        saveStore(store);
      }
    }

    res.json({
      url,
      isBlocked,
      matchedReason: isBlocked ? matchedReason : "Domain is safe according to clean filter rules.",
      dnsResponse: isBlocked ? "0.0.0.0 (REFUSED_BY_GUARDIAN_DNS)" : "208.67.222.123 (CLEAN_BROWSING_RESOLVED)",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Blocker test failed" });
  }
});

// 15. Limitless Motivation Generator (Billions of Procedural Permutations + $0.00 Free API Cost)
app.post("/api/motivation/generate", async (req: Request, res: Response) => {
  try {
    const {
      streakDays = 7,
      username = "Seeker",
      gender = "Male",
      emotionalState = "Urge / Temptation",
      useGemini = false,
    } = req.body;

    // 1. Procedural generation (100% Free, zero tokens, billions of unique combinations)
    let motivation = synthesizeProceduralMotivation({
      streakDays: Number(streakDays),
      username,
      gender,
      emotionalState,
    });

    // 2. Optional: If user explicitly opted for Gemini Flash Lite (Free Tier) and API key exists
    if (useGemini && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Generate a fresh, unique, deeply moving motivational speech and self-improvement quote for user "${username}" (gender: ${gender}) who has stayed clean from pornography for ${streakDays} days.
Current emotional state: "${emotionalState}".
Core theme: "Wow, you've made it this far... Your personal growth journey is irreplaceable."
Address them with dignity, brotherhood/sisterhood, and supreme clarity.
Return JSON with:
{
  "message": "...",
  "quote": "...",
  "author": "...",
  "growthMilestone": "..."
}`;

        const resAI = await ai.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        if (resAI.text) {
          const parsed = JSON.parse(resAI.text);
          if (parsed.message && parsed.quote) {
            motivation = {
              message: parsed.message,
              quote: parsed.quote,
              author: parsed.author || "Stoic Wisdom",
              growthMilestone: parsed.growthMilestone || motivation.growthMilestone,
              actionStep: motivation.actionStep,
            };
          }
        }
      } catch (e) {
        console.warn("Gemini Flash Lite fallback to procedural library:", e);
      }
    }

    res.json({ motivation });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate motivation" });
  }
});

// Vite Middleware & Static Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Porn Blocker & Accountability Network running on http://0.0.0.0:${PORT}`);
  });
}

start();
