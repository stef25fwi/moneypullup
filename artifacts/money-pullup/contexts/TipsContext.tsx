import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type TipStatus = "pending" | "accepted";

export interface Tip {
  id: string;
  amount: number;
  fromName: string;
  message: string;
  timestamp: Date;
  djId: string;
  djName: string;
  status: TipStatus;
}

export interface SocialLinks {
  instagram: string;
  tiktok: string;
  facebook: string;
}

export interface DJ {
  id: string;
  name: string;
  genre: string;
  isLive: boolean;
  totalTipsToday: number;
  avatar: string;
  socialLinks: SocialLinks;
}

export interface FanProfile {
  name: string;
  avatar: string;
}

interface WalletState {
  balance: number;
  currency: string;
}

interface TipsContextType {
  wallet: WalletState;
  tips: Tip[];
  djs: DJ[];
  selectedDj: DJ | null;
  isStripeModalVisible: boolean;
  isDJMode: boolean;
  currentDJName: string;
  fanProfile: FanProfile;
  addFunds: (amount: number) => void;
  sendTip: (djId: string, amount: number, message: string) => boolean;
  acceptTip: (tipId: string) => void;
  setSelectedDj: (dj: DJ | null) => void;
  openStripeModal: () => void;
  closeStripeModal: () => void;
  toggleDJMode: () => void;
  setCurrentDJName: (name: string) => void;
  updateDJSocialLinks: (djId: string, links: SocialLinks) => void;
  updateFanProfile: (profile: Partial<FanProfile>) => void;
  getTipsForDJ: (djId: string) => Tip[];
  getPendingTipsForDJ: (djId: string) => Tip[];
  getDJBalance: (djId: string) => number;
  getFavoriteDJs: () => DJ[];
  searchDJs: (query: string) => DJ[];
}

const TipsContext = createContext<TipsContextType | undefined>(undefined);

const INITIAL_DJS: DJ[] = [
  {
    id: "dj1",
    name: "DJ MASTER BEAT",
    genre: "House / Techno",
    isLive: true,
    totalTipsToday: 0,
    avatar: "🎧",
    socialLinks: { instagram: "@djmasterbeat", tiktok: "@djmasterbeat", facebook: "DJMasterBeat" },
  },
  {
    id: "dj2",
    name: "DJ VIPER",
    genre: "Hip-Hop / Trap",
    isLive: true,
    totalTipsToday: 0,
    avatar: "🎵",
    socialLinks: { instagram: "@djviper", tiktok: "@djviper_official", facebook: "" },
  },
  {
    id: "dj3",
    name: "DJ LUNA",
    genre: "Trance / EDM",
    isLive: false,
    totalTipsToday: 0,
    avatar: "🌙",
    socialLinks: { instagram: "@djluna", tiktok: "", facebook: "DJLunaOfficial" },
  },
  {
    id: "dj4",
    name: "DJ STORM",
    genre: "Drum & Bass",
    isLive: false,
    totalTipsToday: 0,
    avatar: "⚡",
    socialLinks: { instagram: "", tiktok: "@djstorm", facebook: "" },
  },
  {
    id: "dj5",
    name: "DJ PHOENIX",
    genre: "Progressive House",
    isLive: false,
    totalTipsToday: 0,
    avatar: "🔥",
    socialLinks: { instagram: "@djphoenix", tiktok: "@djphoenix_music", facebook: "DJPhoenixMusic" },
  },
];

const STORAGE_KEY_WALLET = "@moneypullup/wallet";
const STORAGE_KEY_TIPS = "@moneypullup/tips";
const STORAGE_KEY_DJS = "@moneypullup/djs";
const STORAGE_KEY_FAN = "@moneypullup/fan";

export function TipsProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({ balance: 0, currency: "EUR" });
  const [tips, setTips] = useState<Tip[]>([]);
  const [djs, setDjs] = useState<DJ[]>(INITIAL_DJS);
  const [selectedDj, setSelectedDj] = useState<DJ | null>(INITIAL_DJS[0]);
  const [isStripeModalVisible, setIsStripeModalVisible] = useState(false);
  const [isDJMode, setIsDJMode] = useState(false);
  const [currentDJName, setCurrentDJName] = useState("DJ MASTER BEAT");
  const [fanProfile, setFanProfile] = useState<FanProfile>({ name: "Fan", avatar: "🎤" });

  useEffect(() => {
    const load = async () => {
      try {
        const [w, t, d, f] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_WALLET),
          AsyncStorage.getItem(STORAGE_KEY_TIPS),
          AsyncStorage.getItem(STORAGE_KEY_DJS),
          AsyncStorage.getItem(STORAGE_KEY_FAN),
        ]);
        if (w) setWallet(JSON.parse(w));
        if (t) {
          const parsed = JSON.parse(t) as Tip[];
          setTips(parsed.map((tip) => ({ ...tip, timestamp: new Date(tip.timestamp), status: tip.status ?? "accepted" })));
        }
        if (d) {
          const parsed = JSON.parse(d) as DJ[];
          setDjs((prev) => prev.map((dj) => {
            const saved = parsed.find((p) => p.id === dj.id);
            return saved ? { ...dj, ...saved } : dj;
          }));
        }
        if (f) setFanProfile(JSON.parse(f));
      } catch { /* ignore */ }
    };
    load();
  }, []);

  const persist = useCallback(async (key: string, value: unknown) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
  }, []);

  const addFunds = useCallback((amount: number) => {
    setWallet((prev) => {
      const updated = { ...prev, balance: prev.balance + amount };
      persist(STORAGE_KEY_WALLET, updated);
      return updated;
    });
  }, [persist]);

  const sendTip = useCallback((djId: string, amount: number, message: string): boolean => {
    if (wallet.balance < amount) return false;
    const dj = djs.find((d) => d.id === djId);
    if (!dj) return false;

    const newTip: Tip = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      amount,
      fromName: fanProfile.name,
      message,
      timestamp: new Date(),
      djId,
      djName: dj.name,
      status: "pending",
    };

    setWallet((prev) => {
      const updated = { ...prev, balance: prev.balance - amount };
      persist(STORAGE_KEY_WALLET, updated);
      return updated;
    });

    setTips((prev) => {
      const updated = [newTip, ...prev];
      persist(STORAGE_KEY_TIPS, updated);
      return updated;
    });

    setDjs((prev) =>
      prev.map((d) => d.id === djId ? { ...d, totalTipsToday: d.totalTipsToday + amount } : d)
    );

    return true;
  }, [wallet.balance, djs, fanProfile.name, persist]);

  const acceptTip = useCallback((tipId: string) => {
    setTips((prev) => {
      const updated = prev.map((t) => t.id === tipId ? { ...t, status: "accepted" as TipStatus } : t);
      persist(STORAGE_KEY_TIPS, updated);
      return updated;
    });
  }, [persist]);

  const updateDJSocialLinks = useCallback((djId: string, links: SocialLinks) => {
    setDjs((prev) => {
      const updated = prev.map((d) => d.id === djId ? { ...d, socialLinks: links } : d);
      persist(STORAGE_KEY_DJS, updated);
      return updated;
    });
  }, [persist]);

  const updateFanProfile = useCallback((profile: Partial<FanProfile>) => {
    setFanProfile((prev) => {
      const updated = { ...prev, ...profile };
      persist(STORAGE_KEY_FAN, updated);
      return updated;
    });
  }, [persist]);

  const getTipsForDJ = useCallback((djId: string) => tips.filter((t) => t.djId === djId), [tips]);
  const getPendingTipsForDJ = useCallback((djId: string) => tips.filter((t) => t.djId === djId && t.status === "pending"), [tips]);
  const getDJBalance = useCallback((djId: string) => tips.filter((t) => t.djId === djId && t.status === "accepted").reduce((s, t) => s + t.amount, 0), [tips]);

  const getFavoriteDJs = useCallback((): DJ[] => {
    const counts: Record<string, number> = {};
    tips.forEach((t) => { counts[t.djId] = (counts[t.djId] || 0) + t.amount; });
    return djs
      .filter((d) => counts[d.id])
      .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
  }, [tips, djs]);

  const searchDJs = useCallback((query: string): DJ[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return djs.filter(
      (d) => d.name.toLowerCase().includes(q) || d.genre.toLowerCase().includes(q)
    );
  }, [djs]);

  return (
    <TipsContext.Provider value={{
      wallet, tips, djs, selectedDj, isStripeModalVisible, isDJMode, currentDJName, fanProfile,
      addFunds, sendTip, acceptTip, setSelectedDj,
      openStripeModal: () => setIsStripeModalVisible(true),
      closeStripeModal: () => setIsStripeModalVisible(false),
      toggleDJMode: () => setIsDJMode((p) => !p),
      setCurrentDJName,
      updateDJSocialLinks, updateFanProfile,
      getTipsForDJ, getPendingTipsForDJ, getDJBalance, getFavoriteDJs, searchDJs,
    }}>
      {children}
    </TipsContext.Provider>
  );
}

export function useTips() {
  const ctx = useContext(TipsContext);
  if (!ctx) throw new Error("useTips must be used inside TipsProvider");
  return ctx;
}
