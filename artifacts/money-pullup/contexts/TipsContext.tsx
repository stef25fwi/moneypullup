import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface Tip {
  id: string;
  amount: number;
  fromName: string;
  message: string;
  timestamp: Date;
  djId: string;
  djName: string;
}

export interface DJ {
  id: string;
  name: string;
  genre: string;
  isLive: boolean;
  totalTipsToday: number;
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
  addFunds: (amount: number) => void;
  sendTip: (djId: string, amount: number, message: string) => boolean;
  setSelectedDj: (dj: DJ | null) => void;
  openStripeModal: () => void;
  closeStripeModal: () => void;
  toggleDJMode: () => void;
  setCurrentDJName: (name: string) => void;
  getTipsForDJ: (djId: string) => Tip[];
  getDJBalance: (djId: string) => number;
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
  },
  {
    id: "dj2",
    name: "DJ VIPER",
    genre: "Hip-Hop / Trap",
    isLive: true,
    totalTipsToday: 0,
    avatar: "🎵",
  },
  {
    id: "dj3",
    name: "DJ LUNA",
    genre: "Trance / EDM",
    isLive: false,
    totalTipsToday: 0,
    avatar: "🌙",
  },
];

const STORAGE_KEY_WALLET = "@moneypullup/wallet";
const STORAGE_KEY_TIPS = "@moneypullup/tips";

export function TipsProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({ balance: 0, currency: "EUR" });
  const [tips, setTips] = useState<Tip[]>([]);
  const [djs, setDjs] = useState<DJ[]>(INITIAL_DJS);
  const [selectedDj, setSelectedDj] = useState<DJ | null>(INITIAL_DJS[0]);
  const [isStripeModalVisible, setIsStripeModalVisible] = useState(false);
  const [isDJMode, setIsDJMode] = useState(false);
  const [currentDJName, setCurrentDJName] = useState("DJ MASTER BEAT");

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedWallet = await AsyncStorage.getItem(STORAGE_KEY_WALLET);
        if (storedWallet) {
          setWallet(JSON.parse(storedWallet));
        }
        const storedTips = await AsyncStorage.getItem(STORAGE_KEY_TIPS);
        if (storedTips) {
          const parsed = JSON.parse(storedTips) as Tip[];
          const withDates = parsed.map((t) => ({
            ...t,
            timestamp: new Date(t.timestamp),
          }));
          setTips(withDates);
        }
      } catch {
        // ignore
      }
    };
    loadData();
  }, []);

  const persistWallet = useCallback(async (w: WalletState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(w));
    } catch {
      // ignore
    }
  }, []);

  const persistTips = useCallback(async (t: Tip[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_TIPS, JSON.stringify(t));
    } catch {
      // ignore
    }
  }, []);

  const addFunds = useCallback(
    (amount: number) => {
      setWallet((prev) => {
        const updated = { ...prev, balance: prev.balance + amount };
        persistWallet(updated);
        return updated;
      });
    },
    [persistWallet]
  );

  const sendTip = useCallback(
    (djId: string, amount: number, message: string): boolean => {
      if (wallet.balance < amount) return false;

      const dj = djs.find((d) => d.id === djId);
      if (!dj) return false;

      const newTip: Tip = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        amount,
        fromName: "Toi",
        message,
        timestamp: new Date(),
        djId,
        djName: dj.name,
      };

      setWallet((prev) => {
        const updated = { ...prev, balance: prev.balance - amount };
        persistWallet(updated);
        return updated;
      });

      setTips((prev) => {
        const updated = [newTip, ...prev];
        persistTips(updated);
        return updated;
      });

      setDjs((prev) =>
        prev.map((d) =>
          d.id === djId
            ? { ...d, totalTipsToday: d.totalTipsToday + amount }
            : d
        )
      );

      return true;
    },
    [wallet.balance, djs, persistWallet, persistTips]
  );

  const getTipsForDJ = useCallback(
    (djId: string) => tips.filter((t) => t.djId === djId),
    [tips]
  );

  const getDJBalance = useCallback(
    (djId: string) =>
      tips
        .filter((t) => t.djId === djId)
        .reduce((sum, t) => sum + t.amount, 0),
    [tips]
  );

  const openStripeModal = useCallback(() => setIsStripeModalVisible(true), []);
  const closeStripeModal = useCallback(() => setIsStripeModalVisible(false), []);
  const toggleDJMode = useCallback(() => setIsDJMode((prev) => !prev), []);

  return (
    <TipsContext.Provider
      value={{
        wallet,
        tips,
        djs,
        selectedDj,
        isStripeModalVisible,
        isDJMode,
        currentDJName,
        addFunds,
        sendTip,
        setSelectedDj,
        openStripeModal,
        closeStripeModal,
        toggleDJMode,
        setCurrentDJName,
        getTipsForDJ,
        getDJBalance,
      }}
    >
      {children}
    </TipsContext.Provider>
  );
}

export function useTips() {
  const ctx = useContext(TipsContext);
  if (!ctx) throw new Error("useTips must be used inside TipsProvider");
  return ctx;
}
