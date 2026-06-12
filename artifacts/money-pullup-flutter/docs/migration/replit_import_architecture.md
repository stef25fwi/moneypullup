# Money Pull-Up - Import Replit vers Codespace Flutter

Source Replit :
/workspaces/moneypullup/_replit_import_tmp/artifacts/money-pullup

Cible Flutter :
/workspaces/moneypullup/artifacts/money-pullup-flutter

## Pages Replit detectees

- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/+not-found.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/_layout.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorBoundary.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlassCard.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlowBackground.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/KeyboardAwareScrollViewCompat.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/constants/colors.ts
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx
- /workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/hooks/useColors.ts

---

## Fonctions, boutons, contexts, hooks detectes

/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/hooks/useColors.ts:4:export function useColors() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/hooks/useColors.ts:6:  const palette = isDark
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/constants/colors.ts:1:const colors = {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:3:  createContext,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:6:  useEffect,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:7:  useState,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:10:export type TipStatus = "pending" | "accepted" | "rejected";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:12:export interface Tip {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:22:  status: TipStatus;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:39:export interface DJTransfer {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:48:export interface DJ {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:53:  totalTipsToday: number;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:58:export interface FanProfile {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:63:interface WalletState {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:68:interface TipsContextType {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:69:  wallet: WalletState;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:70:  tips: Tip[];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:71:  djs: DJ[];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:72:  selectedDj: DJ | null;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:73:  isStripeModalVisible: boolean;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:74:  isDJMode: boolean;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:75:  currentDJName: string;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:76:  fanProfile: FanProfile;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:78:  djTransfers: DJTransfer[];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:80:  sendTip: (djId: string, amount: number, message: string) => boolean;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:81:  acceptTip: (tipId: string) => void;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:82:  rejectTip: (tipId: string) => void;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:83:  setSelectedDj: (dj: DJ | null) => void;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:84:  openStripeModal: () => void;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:85:  closeStripeModal: () => void;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:86:  toggleDJMode: () => void;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:87:  toggleDJLive: (djId: string) => void;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:88:  setCurrentDJName: (name: string) => void;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:89:  updateDJSocialLinks: (djId: string, links: SocialLinks) => void;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:90:  updateFanProfile: (profile: Partial<FanProfile>) => void;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:91:  updateDJBankAccount: (djId: string, account: BankAccount) => void;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:93:  getDJAvailableBalance: (djId: string) => number;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:94:  getTipsForDJ: (djId: string) => Tip[];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:95:  getPendingTipsForDJ: (djId: string) => Tip[];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:96:  getDJBalance: (djId: string) => number;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:97:  getFavoriteDJs: () => DJ[];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:98:  searchDJs: (query: string) => DJ[];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:101:const TipsContext = createContext<TipsContextType | undefined>(undefined);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:103:const INITIAL_DJS: DJ[] = [
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:106:    name: "DJ MASTER BEAT",
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:109:    totalTipsToday: 0,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:111:    socialLinks: { instagram: "@djmasterbeat", tiktok: "@djmasterbeat", facebook: "DJMasterBeat" },
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:115:    name: "DJ VIPER",
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:118:    totalTipsToday: 0,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:124:    name: "DJ LUNA",
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:127:    totalTipsToday: 0,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:129:    socialLinks: { instagram: "@djluna", tiktok: "", facebook: "DJLunaOfficial" },
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:133:    name: "DJ STORM",
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:136:    totalTipsToday: 0,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:142:    name: "DJ PHOENIX",
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:145:    totalTipsToday: 0,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:147:    socialLinks: { instagram: "@djphoenix", tiktok: "@djphoenix_music", facebook: "DJPhoenixMusic" },
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:151:const DEMO_PENDING_TIP: Tip = {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:160:  djName: "DJ MASTER BEAT",
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:164:const STORAGE_KEY_WALLET = "@moneypullup/wallet";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:165:const STORAGE_KEY_TIPS = "@moneypullup/tips";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:166:const STORAGE_KEY_DJS = "@moneypullup/djs";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:167:const STORAGE_KEY_FAN = "@moneypullup/fan";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:168:const STORAGE_KEY_BANK = "@moneypullup/bank";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:169:const STORAGE_KEY_TRANSFERS = "@moneypullup/transfers";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:171:export function TipsProvider({ children }: { children: React.ReactNode }) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:172:  const [wallet, setWallet] = useState<WalletState>({ balance: 0, currency: "EUR" });
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:173:  const [tips, setTips] = useState<Tip[]>([DEMO_PENDING_TIP]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:174:  const [djs, setDjs] = useState<DJ[]>(INITIAL_DJS);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:175:  const [selectedDj, setSelectedDj] = useState<DJ | null>(INITIAL_DJS[0]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:176:  const [isStripeModalVisible, setIsStripeModalVisible] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:177:  const [isDJMode, setIsDJMode] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:178:  const [currentDJName, setCurrentDJName] = useState("DJ MASTER BEAT");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:179:  const [fanProfile, setFanProfile] = useState<FanProfile>({ name: "Fan", avatar: "🎤" });
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:180:  const [djBankAccounts, setDjBankAccounts] = useState<Record<string, BankAccount>>({});
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:181:  const [djTransfers, setDjTransfers] = useState<DJTransfer[]>([]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:183:  useEffect(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:184:    const load = async () => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:189:          AsyncStorage.getItem(STORAGE_KEY_DJS),
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:194:        if (w) setWallet(JSON.parse(w));
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:196:          const parsed = JSON.parse(t) as Tip[];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:197:          setTips(parsed.map((tip) => ({ ...tip, timestamp: new Date(tip.timestamp), status: tip.status ?? "accepted" })));
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:200:          const parsed = JSON.parse(d) as DJ[];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:202:            const saved = parsed.find((p) => p.id === dj.id);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:206:        if (f) setFanProfile(JSON.parse(f));
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:209:          const parsed = JSON.parse(tr) as DJTransfer[];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:217:  const persist = useCallback(async (key: string, value: unknown) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:221:  const addFunds = useCallback((amount: number) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:222:    setWallet((prev) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:223:      const updated = { ...prev, balance: prev.balance + amount };
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:229:  const sendTip = useCallback((djId: string, amount: number, message: string): boolean => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:231:    const dj = djs.find((d) => d.id === djId);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:234:    const handles = ["@lea.music", "@tom_fan", "@sophie.rave", "@marco.dj", "@nina.sound", "@alex.beats"];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:235:    const avatars = ["🎤", "🎵", "🎧", "🔥", "⚡", "🌙"];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:236:    const idx = Math.floor(Math.random() * handles.length);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:237:    const newTip: Tip = {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:240:      fromName: fanProfile.name,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:250:    setWallet((prev) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:251:      const updated = { ...prev, balance: prev.balance - amount };
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:256:    setTips((prev) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:257:      const updated = [newTip, ...prev];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:263:      prev.map((d) => d.id === djId ? { ...d, totalTipsToday: d.totalTipsToday + amount } : d)
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:267:  }, [wallet.balance, djs, fanProfile.name, persist]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:269:  const acceptTip = useCallback((tipId: string) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:270:    setTips((prev) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:271:      const updated = prev.map((t) => t.id === tipId ? { ...t, status: "accepted" as TipStatus } : t);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:277:  const rejectTip = useCallback((tipId: string) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:278:    setTips((prev) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:279:      const updated = prev.map((t) => t.id === tipId ? { ...t, status: "rejected" as TipStatus } : t);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:285:  const toggleDJLive = useCallback((djId: string) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:287:      const updated = prev.map((d) => d.id === djId ? { ...d, isLive: !d.isLive } : d);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:288:      persist(STORAGE_KEY_DJS, updated);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:293:  const updateDJSocialLinks = useCallback((djId: string, links: SocialLinks) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:295:      const updated = prev.map((d) => d.id === djId ? { ...d, socialLinks: links } : d);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:296:      persist(STORAGE_KEY_DJS, updated);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:301:  const updateFanProfile = useCallback((profile: Partial<FanProfile>) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:302:    setFanProfile((prev) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:303:      const updated = { ...prev, ...profile };
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:309:  const updateDJBankAccount = useCallback((djId: string, account: BankAccount) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:311:      const updated = { ...prev, [djId]: account };
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:317:  const getDJAvailableBalance = useCallback((djId: string): number => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:318:    const earned = tips
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:321:    const transferred = djTransfers
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:327:  const requestTransfer = useCallback((djId: string, amount: number): boolean => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:328:    const available = getDJAvailableBalance(djId);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:330:    const bank = djBankAccounts[djId];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:333:    const transfer: DJTransfer = {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:343:      const updated = [transfer, ...prev];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:348:          const u = p.map((t) => t.id === transfer.id ? { ...t, status: "completed" as TransferStatus } : t);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:357:  }, [getDJAvailableBalance, djBankAccounts, persist]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:359:  const getTipsForDJ = useCallback((djId: string) => tips.filter((t) => t.djId === djId), [tips]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:360:  const getPendingTipsForDJ = useCallback((djId: string) => tips.filter((t) => t.djId === djId && t.status === "pending"), [tips]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:361:  const getDJBalance = useCallback((djId: string) => tips.filter((t) => t.djId === djId && t.status === "accepted").reduce((s, t) => s + t.amount, 0), [tips]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:363:  const getFavoriteDJs = useCallback((): DJ[] => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:371:  const searchDJs = useCallback((query: string): DJ[] => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:373:    const q = query.toLowerCase();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:380:    <TipsContext.Provider value={{
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:381:      wallet, tips, djs, selectedDj, isStripeModalVisible, isDJMode, currentDJName, fanProfile,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:383:      addFunds, sendTip, acceptTip, rejectTip, setSelectedDj,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:384:      openStripeModal: () => setIsStripeModalVisible(true),
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:385:      closeStripeModal: () => setIsStripeModalVisible(false),
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:386:      toggleDJMode: () => setIsDJMode((p) => !p),
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:387:      toggleDJLive,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:388:      setCurrentDJName,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:389:      updateDJSocialLinks, updateFanProfile, updateDJBankAccount, requestTransfer, getDJAvailableBalance,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:390:      getTipsForDJ, getPendingTipsForDJ, getDJBalance, getFavoriteDJs, searchDJs,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:393:    </TipsContext.Provider>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:397:export function useTips() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:398:  const ctx = useContext(TipsContext);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/TipsContext.tsx:399:  if (!ctx) throw new Error("useTips must be used inside TipsProvider");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:3:  createContext,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:6:  useEffect,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:7:  useState,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:20:const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:22:const STORAGE_KEY = "@moneypullup/theme";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:24:export function ThemeProvider({ children }: { children: React.ReactNode }) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:25:  const systemScheme = useColorScheme();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:26:  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:28:  useEffect(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:34:  const toggleTheme = useCallback(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:36:      const next = prev === "dark" ? "light" : "dark";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:52:export function useTheme() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/contexts/ThemeContext.tsx:53:  const ctx = useContext(ThemeContext);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/+not-found.tsx:6:export default function NotFoundScreen() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/+not-found.tsx:7:  const colors = useColors();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/+not-found.tsx:11:      <Stack.Screen options={{ title: "Oops!" }} />
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/+not-found.tsx:27:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:4:import React, { useCallback, useState } from "react";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:11:  TouchableOpacity,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:28:import { TipNotification } from "@/components/TipNotification";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:29:import { DJWalletModal } from "@/components/DJWalletModal";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:30:import { useTips, SocialLinks, Tip } from "@/contexts/TipsContext";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:34:function AcceptTipCard({ tip, onAccept }: { tip: Tip; onAccept: (id: string) => void }) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:35:  const colors = useColors();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:36:  const scale = useSharedValue(1);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:38:  const handleAccept = () => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:44:  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:46:  const isLarge = tip.amount >= 30;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:47:  const isHuge = tip.amount >= 50;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:48:  const glowColor = isHuge ? colors.gold : isLarge ? colors.accent : colors.violet;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:73:          <TouchableOpacity
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:82:          </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:89:export default function DJScreen() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:90:  const colors = useColors();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:92:  const insets = useSafeAreaInsets();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:94:    djs, currentDJName, setCurrentDJName,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:95:    getTipsForDJ, getPendingTipsForDJ, getDJBalance, getDJAvailableBalance,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:96:    acceptTip, updateDJSocialLinks, toggleDJLive,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:97:  } = useTips();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:99:  const [activeDJId, setActiveDJId] = useState("dj1");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:100:  const [editingName, setEditingName] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:101:  const [nameInput, setNameInput] = useState(currentDJName);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:102:  const [editingSocial, setEditingSocial] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:103:  const [socialDraft, setSocialDraft] = useState<SocialLinks>({ instagram: "", tiktok: "", facebook: "" });
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:104:  const [walletOpen, setWalletOpen] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:106:  const myDj = djs.find((d) => d.id === activeDJId);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:107:  const myTips = getTipsForDJ(activeDJId);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:108:  const pendingTips = getPendingTipsForDJ(activeDJId);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:109:  const acceptedTips = myTips.filter((t) => t.status === "accepted");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:110:  const myBalance = getDJBalance(activeDJId);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:111:  const avgTip = acceptedTips.length > 0 ? myBalance / acceptedTips.length : 0;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:112:  const biggestTip = acceptedTips.length > 0 ? Math.max(...acceptedTips.map((t) => t.amount)) : 0;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:114:  const topPadding = Platform.OS === "web" ? 67 : insets.top;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:116:  const handleSaveName = useCallback(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:117:    if (nameInput.trim()) setCurrentDJName(nameInput.trim().toUpperCase());
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:119:  }, [nameInput, setCurrentDJName]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:121:  const handleEditSocial = useCallback(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:126:  const handleSaveSocial = useCallback(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:127:    updateDJSocialLinks(activeDJId, socialDraft);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:130:  }, [activeDJId, socialDraft, updateDJSocialLinks]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:149:            <Text style={[styles.modeLabel, { color: colors.violet }]}>MODE DJ</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:161:                <TouchableOpacity onPress={handleSaveName}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:163:                </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:166:              <TouchableOpacity onPress={() => { setNameInput(currentDJName); setEditingName(true); }} style={styles.nameRow}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:167:                <Text style={[styles.djTitle, { color: colors.foreground }]}>{currentDJName}</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:169:              </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:174:            <TouchableOpacity
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:179:            </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:181:            {/* Wallet button */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:182:            <TouchableOpacity
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:183:              onPress={() => setWalletOpen(true)}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:188:                {getDJAvailableBalance(activeDJId).toFixed(0)}€
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:190:            </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:193:            <TouchableOpacity
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:195:                toggleDJLive(activeDJId);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:209:            </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:213:        {/* DJ Switcher */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:216:            <TouchableOpacity key={dj.id} onPress={() => setActiveDJId(dj.id)} style={{ flex: 1 }}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:218:                style={[styles.djTab, { borderColor: activeDJId === dj.id ? colors.violet : colors.glassBorder }]}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:219:                borderColor={activeDJId === dj.id ? colors.violet : colors.glassBorder}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:220:                intensity={activeDJId === dj.id ? 60 : 30}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:223:                <Text style={[styles.djTabName, { color: activeDJId === dj.id ? colors.violet : colors.mutedForeground }]} numberOfLines={1}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:227:            </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:242:              <Text style={[styles.statValue, { color: colors.primary }]}>{acceptedTips.length}</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:247:              <Text style={[styles.statValue, { color: "#F59E0B" }]}>{pendingTips.length}</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:252:              <Text style={[styles.statValue, { color: colors.neonPink }]}>{biggestTip > 0 ? `${biggestTip}€` : "—"}</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:258:        {/* DJ Profile Mini Card */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:259:        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PROFIL DJ — VÉRIFICATION</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:302:                <TouchableOpacity
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:308:                </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:309:                <TouchableOpacity
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:315:                </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:326:              <TouchableOpacity onPress={handleEditSocial} style={styles.editSocialBtn}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:329:              </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:335:        {pendingTips.length > 0 && (
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:340:                <Text style={styles.countBadgeText}>{pendingTips.length}</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:344:              {pendingTips.map((tip) => (
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:345:                <AcceptTipCard key={tip.id} tip={tip} onAccept={acceptTip} />
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:354:          {acceptedTips.length > 0 && (
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:356:              <Text style={styles.countBadgeText}>{acceptedTips.length}</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:361:        {acceptedTips.length === 0 ? (
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:366:              Les fans envoient des tips depuis l'onglet Fan
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:371:            {acceptedTips.map((tip, index) => (
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:372:              <TipNotification key={tip.id} tip={tip} index={index} />
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:381:const SOCIAL_CONFIG = {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:402:function SocialBrandRow({ platform, handle }: { platform: keyof typeof SOCIAL_CONFIG; handle?: string }) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:403:  const cfg = SOCIAL_CONFIG[platform];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:404:  const hasHandle = !!handle;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:432:function SocialEditRow({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:440:  const cfg = SOCIAL_CONFIG[platform];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:459:const brandStyles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/dj.tsx:492:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:3:import React, { useCallback, useRef, useState } from "react";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:12:  TouchableOpacity,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:25:import { useTips, DJ } from "@/contexts/TipsContext";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:39:const AVATARS = ["🎤", "🎸", "🎹", "🎺", "🎻", "🥁", "🎼", "🎵", "🎶", "🤩", "🔥", "⚡"];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:41:export default function ProfileScreen() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:42:  const colors = useColors();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:44:  const insets = useSafeAreaInsets();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:45:  const { tips, fanProfile, updateFanProfile, getFavoriteDJs, searchDJs, setSelectedDj, djs } = useTips();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:47:  const [searchQuery, setSearchQuery] = useState("");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:48:  const [searchResults, setSearchResults] = useState<DJ[]>([]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:49:  const [showSuggestions, setShowSuggestions] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:50:  const [editingName, setEditingName] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:51:  const [nameInput, setNameInput] = useState(fanProfile.name);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:52:  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:54:  const searchRef = useRef<TextInput>(null);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:55:  const suggestionOpacity = useSharedValue(0);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:57:  const favoriteDJs = getFavoriteDJs();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:59:  const handleSearch = useCallback((text: string) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:62:      const results = searchDJs(text);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:71:  }, [searchDJs, suggestionOpacity]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:73:  const handleSelectDJ = useCallback((dj: DJ) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:82:      `Sélectionné comme DJ actif. Allez dans l'onglet Fan pour envoyer un tip !`,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:87:  const handleSaveName = useCallback(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:88:    if (nameInput.trim()) updateFanProfile({ name: nameInput.trim() });
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:90:  }, [nameInput, updateFanProfile]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:92:  const topPadding = Platform.OS === "web" ? 67 : insets.top;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:94:  const suggestionsStyle = useAnimatedStyle(() => ({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:98:  const totalSent = tips.reduce((s, t) => s + t.amount, 0);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:99:  const acceptedTips = tips.filter((t) => t.status === "accepted");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:100:  const pendingTips = tips.filter((t) => t.status === "pending");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:120:          <TouchableOpacity
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:125:          </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:128:        {/* Profile card */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:130:          <TouchableOpacity onPress={() => setShowAvatarPicker((v) => !v)} style={styles.avatarContainer}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:131:            <Text style={styles.avatarEmoji}>{fanProfile.avatar}</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:135:          </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:140:                <TouchableOpacity
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:143:                    updateFanProfile({ avatar: a });
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:150:                      backgroundColor: fanProfile.avatar === a ? colors.violet + "33" : "transparent",
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:151:                      borderColor: fanProfile.avatar === a ? colors.violet : "transparent",
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:156:                </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:172:              <TouchableOpacity onPress={handleSaveName}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:174:              </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:177:            <TouchableOpacity onPress={() => { setNameInput(fanProfile.name); setEditingName(true); }} style={styles.nameRow}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:178:              <Text style={[styles.profileName, { color: colors.foreground }]}>{fanProfile.name}</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:180:            </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:191:              <Text style={[styles.statValue, { color: colors.neonGreen }]}>{acceptedTips.length}</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:196:              <Text style={[styles.statValue, { color: colors.neonPink }]}>{pendingTips.length}</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:202:        {/* DJ Search */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:203:        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>RECHERCHER UN DJ</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:211:              placeholder="Nom du DJ, genre..."
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:222:              <TouchableOpacity onPress={() => handleSearch("")}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:224:              </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:233:                  <TouchableOpacity
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:235:                    onPress={() => handleSelectDJ(dj)}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:253:                  </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:261:              <Text style={[styles.noResults, { color: colors.mutedForeground }]}>Aucun DJ trouvé pour "{searchQuery}"</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:266:        {/* Favorite DJs */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:267:        {favoriteDJs.length > 0 && (
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:269:            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MES DJS FAVORIS</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:271:              {favoriteDJs.map((dj) => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:272:                const djTotal = tips.filter((t) => t.djId === dj.id).reduce((s, t) => s + t.amount, 0);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:274:                  <TouchableOpacity key={dj.id} onPress={() => handleSelectDJ(dj)}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:280:                  </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:287:        {/* Tips history */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:295:              Envoyez votre premier tip depuis l'onglet Fan
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:329:function highlightMatch(text: string, query: string, highlightColor: string) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:331:  const lower = text.toLowerCase();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:332:  const qLower = query.toLowerCase();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:333:  const idx = lower.indexOf(qLower);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/profile.tsx:344:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:1:import React, { useMemo, useState } from 'react';
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:6:  Pressable,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:18:const PINK = '#FF2E9F';
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:19:const HOT_PINK = '#FF147F';
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:20:const CYAN = '#00C8FF';
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:21:const PURPLE = '#7B2CFF';
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:22:const BG = '#05020D';
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:24:const HERO_IMAGE =
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:27:export default function FanScreen() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:28:  const [selectedTip, setSelectedTip] = useState(10);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:29:  const [message, setMessage] = useState('');
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:31:  const compact = SCREEN_HEIGHT < 820;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:33:  const sizes = useMemo(
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:46:  const tips = [5, 10, 15, 20];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:88:                <Text style={styles.djLabel}>DJ</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:101:                    <Text style={styles.statLabel}>Fans</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:124:              const active = selectedTip === tip;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:125:              const borderColor =
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:129:                <Pressable
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:131:                  onPress={() => setSelectedTip(tip)}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:146:                </Pressable>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:161:              {selectedTip} €
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:179:              placeholder="Un message pour le DJ... (optionnel)"
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:190:            <Pressable style={styles.secondaryButton}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:192:              <Text style={styles.secondaryButtonText}>MONTANT{'\n'}LIBRE</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:193:            </Pressable>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:195:            <Pressable style={styles.mainButton}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:203:                <Text style={styles.mainButtonText}>ENVOYER LE TIP</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:205:            </Pressable>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:207:            <Pressable style={[styles.secondaryButton, styles.rechargeButton]}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:209:              <Text style={styles.secondaryButtonText}>RECHARGER</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:210:            </Pressable>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:218:              <Text style={[styles.navText, styles.navTextActive]}>Fan</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:224:              <Text style={styles.navText}>DJ</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:238:const glassBorder = 'rgba(255,255,255,0.10)';
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:240:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:509:  secondaryButton: {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:520:  rechargeButton: {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:524:  secondaryButtonText: {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:532:  mainButton: {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/fan.tsx:551:  mainButtonText: {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:4:import React, { useCallback, useEffect, useState } from "react";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:15:  TouchableOpacity,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:31:import { StripeModal } from "@/components/StripeModal";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:32:import { useTips } from "@/contexts/TipsContext";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:43:const DARK_BORDER = "#2D1A40";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:45:const PRESET_AMOUNTS = [5, 10, 15, 20];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:48:function PulseGlow({ color, radius = 20, children }: { color: string; radius?: number; children: React.ReactNode }) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:49:  const g = useSharedValue(0.5);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:50:  useEffect(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:58:  const s = useAnimatedStyle(() => ({ shadowOpacity: g.value }));
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:66:// ─── DJ Hero card ─────────────────────────────────────────────────────────────
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:67:function DjHeroCard({ dj, onPress }: { dj: any; onPress: () => void }) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:69:    <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={styles.heroCard}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:104:      {/* ── Wallet button (top right inside card) ── */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:109:      {/* ── DJ text info ── */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:111:        <Text style={styles.djSmallLabel}>DJ</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:113:          {(dj?.name ?? "MASTER BEAT").toUpperCase().replace(/^DJ\s*/i, "")}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:131:          <Text style={styles.statLbl}>Fans</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:140:    </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:145:function AmountPanel({ amount }: { amount: number }) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:146:  const label = amount > 0 ? `${amount} €` : "0 €";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:147:  const fontSize = 40;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:148:  const svgH = fontSize + 14;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:179:function ActionBtn({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:185:  const scale = useSharedValue(1);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:186:  const tap = () => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:190:  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:193:    const mainColor = success ? "#00CC55" : disabled ? "#2A1540" : NEON_PINK;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:197:          <TouchableOpacity onPress={tap} disabled={disabled} activeOpacity={0.87}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:208:          </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:214:  const isLibre = variant === "libre";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:217:      <TouchableOpacity onPress={tap} activeOpacity={0.85}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:227:      </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:233:export default function FanScreen() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:234:  const insets = useSafeAreaInsets();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:235:  const { wallet, djs, selectedDj, setSelectedDj, sendTip, openStripeModal, isStripeModalVisible, closeStripeModal } = useTips();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:237:  const [selectedAmount, setSelectedAmount]   = useState<number>(10);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:238:  const [customAmount,   setCustomAmount]     = useState("");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:239:  const [message,        setMessage]          = useState("");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:240:  const [showCustom,     setShowCustom]       = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:241:  const [showDjPicker,   setShowDjPicker]     = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:242:  const [lastSent,       setLastSent]         = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:243:  const [lastSentName,   setLastSentName]     = useState("");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:245:  const effectiveAmount = showCustom ? parseFloat(customAmount) || 0 : selectedAmount;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:246:  const liveDjs = djs.filter((d) => d.isLive);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:249:  const handleSend = useCallback(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:250:    if (!selectedDj) { Alert.alert("Aucun DJ", "Choisissez un DJ."); return; }
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:255:        { text: "Recharger", onPress: openStripeModal },
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:259:    if (sendTip(selectedDj.id, effectiveAmount, message)) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:264:  }, [selectedDj, effectiveAmount, wallet.balance, sendTip, message, openStripeModal]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:275:          {/* ── Wallet pill (top right) ── */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:278:            <TouchableOpacity onPress={openStripeModal}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:283:            </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:286:          {/* ── DJ Hero card ── */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:289:          {/* ── DJ picker ── */}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:293:                ? <Text style={styles.noDj}>Aucun DJ en live pour le moment</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:295:                    const sel = selectedDj?.id === dj.id;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:297:                      <TouchableOpacity key={dj.id}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:307:                      </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:344:              placeholder="Un message pour le DJ... (optionnel)"
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:376:            <ActionBtn label="RECHARGER" icon="wallet-plus" variant="recharge" onPress={openStripeModal} />
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:383:              <Text style={styles.toastTxt}>Tip envoyé à {lastSentName}</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:389:            <TouchableOpacity onPress={openStripeModal} style={styles.lowBal}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:393:            </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:398:      <StripeModal visible={isStripeModalVisible} onClose={closeStripeModal} />
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:404:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/index.tsx:478:  // ── DJ picker ──
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:12:function NativeTabLayout() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:17:        <Label>Fan</Label>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:21:        <Label>DJ</Label>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:31:function ClassicTabLayout() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:32:  const colors = useColors();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:33:  const isIOS = Platform.OS === "ios";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:34:  const isWeb = Platform.OS === "web";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:58:      <Tabs.Screen
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:61:          title: "Fan",
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:70:      <Tabs.Screen
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:73:          title: "DJ",
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:82:      <Tabs.Screen
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/(tabs)/_layout.tsx:98:export default function TabLayout() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/_layout.tsx:11:import React, { useEffect } from "react";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/_layout.tsx:17:import { TipsProvider } from "@/contexts/TipsContext";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/_layout.tsx:22:const queryClient = new QueryClient();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/_layout.tsx:24:function RootLayoutNav() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/_layout.tsx:27:      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/_layout.tsx:32:export default function RootLayout() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/_layout.tsx:40:  useEffect(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/_layout.tsx:53:            <TipsProvider>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/app/_layout.tsx:59:            </TipsProvider>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlassCard.tsx:15:export function GlassCard({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlassCard.tsx:21:  const colors = useColors();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlassCard.tsx:24:  const border = borderColor ?? colors.glassBorder;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlassCard.tsx:71:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:2:import React, { useCallback, useEffect } from "react";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:3:import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:29:export function AmountChip3D({ amount, isSelected, onPress, size: sizeProp }: Props) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:30:  const cfg = COIN_BORDERS[amount] ?? COIN_BORDERS[10];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:32:  const scale = useSharedValue(1);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:34:  const ringOpacity = useSharedValue(isSelected ? 0.85 : 0);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:37:  useEffect(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:52:  const handlePress = useCallback(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:61:  const base = sizeProp ?? 64;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:62:  const coinSize = isSelected ? Math.round(base * 1.14) : base;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:63:  const R = coinSize / 2;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:66:  const ringStyle = useAnimatedStyle(() => ({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:69:  const coinAnimStyle = useAnimatedStyle(() => ({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:75:      <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={{ alignItems: "center", justifyContent: "center" }}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:146:      </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/AmountChip3D.tsx:151:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx:3:import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx:12:interface TipButtonProps {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx:22:export function TipButton({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx:30:}: TipButtonProps) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx:31:  const scale = useSharedValue(1);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx:32:  const glowOpacity = useSharedValue(isSelected ? 1 : 0.55);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx:34:  const animStyle = useAnimatedStyle(() => ({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx:39:  const handlePress = useCallback(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx:64:      <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.touchable}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx:77:      </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipButton.tsx:82:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/KeyboardAwareScrollViewCompat.tsx:9:export function KeyboardAwareScrollViewCompat({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:4:import React, { useCallback, useEffect, useState } from "react";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:8:  Modal,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:14:  TouchableOpacity,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:19:import { BankAccount, DJTransfer, useTips } from "@/contexts/TipsContext";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:30:function maskIban(iban: string) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:35:function formatDate(d: Date) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:39:export function DJWalletModal({ visible, onClose, djId }: Props) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:40:  const colors = useColors();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:42:    getDJBalance,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:43:    getDJAvailableBalance,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:46:    updateDJBankAccount,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:48:  } = useTips();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:50:  const [tab, setTab] = useState<Tab>("balance");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:51:  const [bankDraft, setBankDraft] = useState<BankAccount>({ holderName: "", iban: "", bic: "" });
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:52:  const [bankSaved, setBankSaved] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:53:  const [transferAmount, setTransferAmount] = useState("");
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:54:  const [transferSuccess, setTransferSuccess] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:56:  const balance = getDJBalance(djId);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:57:  const available = getDJAvailableBalance(djId);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:58:  const transferred = balance - available;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:59:  const bank = djBankAccounts[djId];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:60:  const transfers = djTransfers.filter((t) => t.djId === djId);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:62:  useEffect(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:66:  useEffect(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:74:  useEffect(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:78:  const handleSaveBank = useCallback(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:83:    const cleanIban = bankDraft.iban.replace(/\s/g, "").toUpperCase();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:84:    updateDJBankAccount(djId, { ...bankDraft, iban: cleanIban });
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:88:  }, [bankDraft, djId, updateDJBankAccount]);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:90:  const handleTransfer = useCallback(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:91:    const amt = parseFloat(transferAmount);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:102:    const ok = requestTransfer(djId, amt);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:117:    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:119:        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:127:                <Text style={styles.sheetTitle}>Wallet DJ</Text>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:129:              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:131:              </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:137:                <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={[styles.tabItem, tab === t.key && styles.tabItemActive]}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:140:                </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:180:                      <TouchableOpacity onPress={() => setTab("bank")}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:182:                      </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:185:                    <TouchableOpacity onPress={() => setTab("bank")} style={[styles.noBankBtn, { borderColor: "#F59E0B" }]}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:189:                    </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:204:                    <TouchableOpacity onPress={handleTransfer} style={[styles.transferBtn, { opacity: available > 0 ? 1 : 0.45 }]}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:212:                    </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:266:                  <TouchableOpacity onPress={handleSaveBank} style={styles.saveBankBtn}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:274:                  </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:307:    </Modal>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:311:function TransferRow({ transfer }: { transfer: DJTransfer }) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:338:const trStyles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/DJWalletModal.tsx:348:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:3:import React, { useCallback, useState } from "react";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:6:  Modal,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:10:  TouchableOpacity,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:17:import { useTips } from "@/contexts/TipsContext";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:19:const FUND_AMOUNTS = [10, 20, 50, 100];
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:21:interface StripeModalProps {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:26:export function StripeModal({ visible, onClose }: StripeModalProps) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:27:  const colors = useColors();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:29:  const { addFunds } = useTips();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:30:  const [selectedAmount, setSelectedAmount] = useState<number>(20);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:31:  const [isProcessing, setIsProcessing] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:33:  const handlePay = useCallback(async () => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:53:    <Modal
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:75:                Stripe Secure
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:78:            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:80:            </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:92:              <TouchableOpacity
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:123:              </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:142:          <TouchableOpacity
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:166:          </TouchableOpacity>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:169:            Paiement sécurisé via Stripe — Vos données sont protégées
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:173:    </Modal>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/StripeModal.tsx:177:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlowBackground.tsx:2:import React, { useEffect } from "react";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlowBackground.tsx:16:const BG_SOURCE =
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlowBackground.tsx:22:const STARS = [
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlowBackground.tsx:34:function Star({ x, y, s, o, d, dur }: typeof STARS[0]) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlowBackground.tsx:35:  const opacity = useSharedValue(0);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlowBackground.tsx:36:  useEffect(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlowBackground.tsx:46:  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/GlowBackground.tsx:63:export function GlowBackground() {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:2:import React, { useEffect } from "react";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:15:import type { Tip } from "@/contexts/TipsContext";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:17:interface TipNotificationProps {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:18:  tip: Tip;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:22:export function TipNotification({ tip, index }: TipNotificationProps) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:23:  const colors = useColors();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:24:  const opacity = useSharedValue(0);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:25:  const translateY = useSharedValue(30);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:26:  const scale = useSharedValue(0.8);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:28:  useEffect(() => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:29:    const delay = index * 60;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:35:  const animStyle = useAnimatedStyle(() => ({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:40:  const timeStr = tip.timestamp.toLocaleTimeString("fr-FR", {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:45:  const isLarge = tip.amount >= 30;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:46:  const isHuge = tip.amount >= 50;
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:48:  const cardColor = isHuge
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/TipNotification.tsx:93:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:3:import React, { useState } from "react";
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:5:  Modal,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:7:  Pressable,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:22:export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:23:  const colors = useColors();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:24:  const insets = useSafeAreaInsets();
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:26:  const [isModalVisible, setIsModalVisible] = useState(false);
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:28:  const handleRestart = async () => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:37:  const formatErrorDetails = (): string => {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:45:  const monoFont = Platform.select({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:54:        <Pressable
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:55:          onPress={() => setIsModalVisible(true)}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:59:            styles.topButton,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:68:        </Pressable>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:80:        <Pressable
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:99:        </Pressable>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:103:        <Modal
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:104:          visible={isModalVisible}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:107:          onRequestClose={() => setIsModalVisible(false)}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:125:                <Pressable
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:126:                  onPress={() => setIsModalVisible(false)}
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:130:                    styles.closeButton,
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:135:                </Pressable>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:168:        </Modal>
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:174:const styles = StyleSheet.create({
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:201:  topButton: {
/workspaces/moneypullup/artifacts/money-pullup-flutter/docs/legacy_replit/components/ErrorFallback.tsx:255:  closeButton: {
