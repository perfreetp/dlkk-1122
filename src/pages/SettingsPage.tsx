import { useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { OS_VERSIONS, MAC_MODELS, SHORTCUT_DEFS, type UserPreferences } from "@/types";
import { USERS } from "@/mock";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import Modal from "@/components/ui/Modal";
import Empty from "@/components/ui/Empty";
import {
  Settings as SettingsIcon,
  Palette,
  Bell,
  Shield,
  Keyboard,
  Info,
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  UserPlus,
  UserX,
  UserMinus,
  Search,
  CircleDot,
  RotateCcw,
  Check,
  Pencil,
  Trash2,
  Plus,
  Apple,
  RefreshCw,
  ExternalLink,
  Mail,
  Globe,
  Github,
  ChevronRight,
  User,
  X,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

const SETTINGS_NAV = [
  { key: "general", label: "通用", icon: SettingsIcon },
  { key: "appearance", label: "外观", icon: Palette },
  { key: "notifications", label: "通知", icon: Bell },
  { key: "privacy", label: "隐私与屏蔽", icon: Shield },
  { key: "shortcuts", label: "快捷键", icon: Keyboard },
  { key: "about", label: "关于", icon: Info },
] as const;

type SettingsTab = (typeof SETTINGS_NAV)[number]["key"];

const ACCENT_COLORS = [
  "#007AFF",
  "#FF9500",
  "#FF3B30",
  "#FF2D55",
  "#AF52DE",
  "#5856D6",
  "#34C759",
  "#30B0C7",
];

const THEMES: { key: UserPreferences["theme"]; label: string; icon: any }[] = [
  { key: "light", label: "浅色", icon: Sun },
  { key: "dark", label: "深色", icon: Moon },
  { key: "auto", label: "跟随系统", icon: Monitor },
];

const NOTIF_SWITCHES: {
  key: keyof UserPreferences["notifications"];
  label: string;
  desc: string;
}[] = [
  { key: "reply", label: "回复通知", desc: "有人回复我的帖子或回复时" },
  { key: "mention", label: "@提及通知", desc: "有人在帖子或回复中 @我时" },
  { key: "like", label: "点赞通知", desc: "有人点赞我的内容时" },
  { key: "message", label: "私信通知", desc: "收到新的私信消息时" },
  { key: "system", label: "系统公告", desc: "论坛系统公告和维护通知" },
  { key: "sound", label: "声音提醒", desc: "收到通知时播放提示音" },
  { key: "badge", label: "Dock 徽标", desc: "在应用图标上显示未读数量" },
];

const DENSITY_OPTIONS = [
  { key: "compact", label: "紧凑", desc: "较小间距，显示更多内容" },
  { key: "comfortable", label: "舒适", desc: "均衡的间距和可读性" },
  { key: "spacious", label: "宽松", desc: "较大间距，更易阅读" },
];

const GROUPING_OPTIONS = [
  { key: "type", label: "按类型", desc: "按通知类型分组显示" },
  { key: "time", label: "按时间", desc: "按时间顺序分组" },
  { key: "none", label: "不分组", desc: "所有通知按时间混排" },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        checked ? "" : ""
      )}
      style={{
        background: checked ? "var(--app-accent)" : "var(--app-border-strong)",
        "--tw-ring-color": "color-mix(in srgb, var(--app-accent) 30%, transparent)",
      } as any}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 mt-0.5",
          checked ? "translate-x-5.5" : "translate-x-0.5"
        )}
        style={{
          transform: checked ? "translateX(22px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3
        className="text-sm font-semibold mb-1"
        style={{ color: "var(--app-text-primary)" }}
      >
        {title}
      </h3>
      {desc && (
        <p
          className="text-xs mb-4"
          style={{ color: "var(--app-text-secondary)" }}
        >
          {desc}
        </p>
      )}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  desc,
  children,
  last,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn("flex items-center justify-between gap-4 px-4 py-3.5", !last && "")}
      style={{
        borderBottom: last ? "none" : "1px solid var(--app-border)",
      }}
    >
      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-medium"
          style={{ color: "var(--app-text-primary)" }}
        >
          {label}
        </div>
        {desc && (
          <div
            className="text-xs mt-0.5"
            style={{ color: "var(--app-text-secondary)" }}
          >
            {desc}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const {
    preferences,
    activeSettingsTab,
    setActiveSettingsTab,
    toggleTheme,
    setAccentColor,
    setFontSize,
    setSidebarWidth,
    setNotificationSetting,
    toggleBlockUser,
    preferences: { blockedItems, shortcuts, theme, accentColor, fontSize, sidebarWidth, showAvatars, showSignatures },
    setShortcut,
    resetShortcuts,
  } = useAppStore();

  const [activeNav, setActiveNav] = useState<SettingsTab>(
    (activeSettingsTab as SettingsTab) || "appearance"
  );
  const [customAccent, setCustomAccent] = useState("");
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const [recordedCombo, setRecordedCombo] = useState("");
  const [shortcutSearch, setShortcutSearch] = useState("");
  const [dndEnabled, setDndEnabled] = useState(false);
  const [grouping, setGrouping] = useState("type");
  const [density, setDensity] = useState("comfortable");
  const [whoCanDM, setWhoCanDM] = useState("all");
  const [whoCanMention, setWhoCanMention] = useState("all");
  const [keywordInput, setKeywordInput] = useState("");
  const [localBlockedKeywords, setLocalBlockedKeywords] = useState<string[]>([
    "广告",
    "垃圾内容",
  ]);
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [blockSearch, setBlockSearch] = useState("");
  const [notifGrouping, setNotifGrouping] = useState("type");
  const [loadCount, setLoadCount] = useState(20);
  const [scrollThreshold, setScrollThreshold] = useState(80);
  const [imgLoadMode, setImgLoadMode] = useState("always");

  const blockedUsers = blockedItems.filter((b) => b.type === "user");
  const blockedUsersList = blockedUsers
    .map((b) => USERS.find((u) => u.id === b.targetId))
    .filter(Boolean);

  const filteredShortcuts = SHORTCUT_DEFS.filter(
    (s) =>
      !shortcutSearch ||
      s.label.toLowerCase().includes(shortcutSearch.toLowerCase()) ||
      s.defaultMac.toLowerCase().includes(shortcutSearch.toLowerCase())
  );

  const handleTabChange = (tab: SettingsTab) => {
    setActiveNav(tab);
    setActiveSettingsTab(tab);
  };

  const handleKeyRecord = (key: string) => {
    setRecordingKey(key);
    setRecordedCombo("");

    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      const parts: string[] = [];
      if (e.metaKey) parts.push("⌘");
      if (e.ctrlKey) parts.push("⌃");
      if (e.altKey) parts.push("⌥");
      if (e.shiftKey) parts.push("⇧");
      const keyMap: Record<string, string> = {
        ArrowUp: "↑",
        ArrowDown: "↓",
        ArrowLeft: "←",
        ArrowRight: "→",
        Enter: "↩",
        Escape: "Esc",
        Backspace: "⌫",
        Tab: "⇥",
        " ": "Space",
      };
      const k = keyMap[e.key] || e.key.toUpperCase();
      if (!["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
        parts.push(k);
        const combo = parts.join("");
        setRecordedCombo(combo);
        setShortcut(key, combo);
        setTimeout(() => {
          setRecordingKey(null);
          setRecordedCombo("");
        }, 500);
        document.removeEventListener("keydown", handler);
      }
    };

    document.addEventListener("keydown", handler);
    setTimeout(() => {
      if (recordingKey === key) {
        document.removeEventListener("keydown", handler);
        setRecordingKey(null);
      }
    }, 5000);
  };

  const handleRemoveKeyword = (kw: string) => {
    setLocalBlockedKeywords(localBlockedKeywords.filter((k) => k !== kw));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !localBlockedKeywords.includes(keywordInput.trim())) {
      setLocalBlockedKeywords([...localBlockedKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const renderGeneral = () => (
    <div>
      <Section title="启动与默认页面" desc="设置应用启动时默认显示的内容">
        <Row label="默认进入页面" desc="启动应用时显示哪个页面">
          <select className="mac-select text-xs h-8 !py-1 min-w-[140px]">
            <option value="feed">推荐信息流</option>
            <option value="categories">分区列表</option>
            <option value="messages">私信通知</option>
            <option value="favorites">我的收藏</option>
          </select>
        </Row>
      </Section>

      <Section title="默认筛选偏好" desc="自动应用到信息流的筛选条件">
        <Row label="默认系统版本" desc="自动筛选此系统版本的内容">
          <select
            className="mac-select text-xs h-8 !py-1 min-w-[160px]"
            defaultValue={preferences.defaultOsFilter || ""}
          >
            <option value="">不筛选</option>
            {OS_VERSIONS.map((os) => (
              <option key={os.value} value={os.value}>
                {os.label}
              </option>
            ))}
          </select>
        </Row>
        <Row label="默认机型" desc="自动筛选此机型的内容">
          <select
            className="mac-select text-xs h-8 !py-1 min-w-[180px]"
            defaultValue={preferences.defaultModelFilter || ""}
          >
            <option value="">不筛选</option>
            {MAC_MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Row>
      </Section>

      <Section title="内容加载设置" desc="控制信息流的数据加载方式">
        <Row label="每次加载条数" desc={`每页加载 ${loadCount} 条内容`}>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={loadCount}
              onChange={(e) => setLoadCount(parseInt(e.target.value))}
              className="w-32 accent-[var(--app-accent)]"
            />
            <span className="text-xs font-mono w-10 text-right" style={{ color: "var(--app-text-secondary)" }}>
              {loadCount}
            </span>
          </div>
        </Row>
        <Row label="无限滚动阈值" desc={`滚动到距底部 ${scrollThreshold}% 时加载更多`}>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={50}
              max={95}
              step={5}
              value={scrollThreshold}
              onChange={(e) => setScrollThreshold(parseInt(e.target.value))}
              className="w-32 accent-[var(--app-accent)]"
            />
            <span className="text-xs font-mono w-10 text-right" style={{ color: "var(--app-text-secondary)" }}>
              {scrollThreshold}%
            </span>
          </div>
        </Row>
      </Section>

      <Section title="显示设置" desc="控制内容的显示方式">
        <Row label="显示用户签名" desc="在帖子和回复下方显示用户签名">
          <Toggle
            checked={showSignatures}
            onChange={() => {}}
          />
        </Row>
        <Row label="显示用户头像" desc="关闭后所有头像将显示为占位符">
          <Toggle
            checked={showAvatars}
            onChange={() => {}}
          />
        </Row>
        <Row label="图片加载方式" desc="控制帖子中图片的加载策略">
          <select
            className="mac-select text-xs h-8 !py-1 min-w-[140px]"
            value={imgLoadMode}
            onChange={(e) => setImgLoadMode(e.target.value)}
          >
            <option value="always">始终加载</option>
            <option value="wifi">仅 Wi-Fi 时加载</option>
            <option value="manual">手动点击加载</option>
          </select>
        </Row>
      </Section>
    </div>
  );

  const renderAppearance = () => (
    <div>
      <Section title="主题模式" desc="选择应用的显示主题">
        <div className="p-4 grid grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const active = theme === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={toggleTheme}
                className={cn(
                  "relative p-4 rounded-xl text-center transition-all",
                  "border-2 hover:shadow-md"
                )}
                style={{
                  background: t.key === "dark" ? "#1C1C1E" : t.key === "light" ? "#fff" : "linear-gradient(135deg, #fff 0%, #1C1C1E 100%)",
                  borderColor: active ? "var(--app-accent)" : "var(--app-border)",
                }}
              >
                {active && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "var(--app-accent)" }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="flex flex-col items-center gap-2">
                  <Icon
                    className="w-8 h-8 mb-1"
                    style={{ color: t.key === "dark" ? "#fff" : t.key === "auto" ? "#8E8E93" : "#1C1C1E" }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: t.key === "dark" ? "#fff" : "#1C1C1E" }}
                  >
                    {t.label}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <div className="w-10 h-6 rounded-md" style={{ background: t.key === "dark" ? "#2C2C2E" : "#F5F5F7" }} />
                  <div className="w-3 h-6 rounded-r-md" style={{ background: accentColor, opacity: 0.8 }} />
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="主色调" desc="自定义应用的强调色">
        <div className="p-4">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccentColor(c)}
                className={cn(
                  "w-9 h-9 rounded-full transition-all hover:scale-110",
                  accentColor === c ? "ring-2 ring-offset-2" : ""
                )}
                style={{
                  background: c,
                  "--tw-ring-color": c,
                } as any}
              >
                {accentColor === c && (
                  <Check className="w-4 h-4 mx-auto text-white" />
                )}
              </button>
            ))}
            <div className="relative">
              <input
                type="color"
                value={customAccent || accentColor}
                onChange={(e) => {
                  setCustomAccent(e.target.value);
                  setAccentColor(e.target.value);
                }}
                className="w-9 h-9 rounded-full cursor-pointer opacity-0 absolute inset-0"
              />
              <div
                className="w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center"
                style={{ borderColor: "var(--app-border-strong)" }}
              >
                <Plus className="w-4 h-4" style={{ color: "var(--app-text-tertiary)" }} />
              </div>
            </div>
            <div className="ml-2 flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--app-text-tertiary)" }}>
                #
              </span>
              <input
                type="text"
                value={customAccent || accentColor.replace("#", "")}
                onChange={(e) => {
                  const v = e.target.value.replace("#", "");
                  if (/^[0-9A-Fa-f]{0,6}$/.test(v)) {
                    setCustomAccent(`#${v}`);
                    if (v.length === 6) {
                      setAccentColor(`#${v}`);
                    }
                  }
                }}
                className="mac-input text-xs h-8 !py-1 w-24 font-mono uppercase"
                maxLength={7}
              />
            </div>
          </div>

          <div
            className="p-4 rounded-xl text-sm"
            style={{
              background: "var(--app-surface-secondary)",
              color: "var(--app-text-primary)",
            }}
          >
            <p className="font-medium mb-2">实时预览：</p>
            <p>
              这是一段示例文字，展示
              <span style={{ color: accentColor, fontWeight: 600 }}> 主色调 </span>
              在不同场景下的效果。
              <button
                className="ml-2 px-3 py-1 rounded-md text-white text-xs font-medium"
                style={{ background: accentColor }}
              >
                按钮示例
              </button>
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs"
                style={{ background: `${accentColor}20`, color: accentColor }}
              >
                标签示例
              </span>
            </p>
          </div>
        </div>
      </Section>

      <Section title="字体大小" desc={`当前：${fontSize}%`}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="range"
              min={90}
              max={130}
              step={5}
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="flex-1 accent-[var(--app-accent)]"
            />
            <span className="text-xs font-mono w-12 text-right" style={{ color: "var(--app-text-secondary)" }}>
              {fontSize}%
            </span>
          </div>
          <div
            className="p-4 rounded-xl"
            style={{
              background: "var(--app-surface-secondary)",
              fontSize: `${fontSize * 0.01 * 14}px`,
            }}
          >
            <p
              className="font-semibold mb-1"
              style={{ color: "var(--app-text-primary)" }}
            >
              预览标题文本
            </p>
            <p style={{ color: "var(--app-text-secondary)" }}>
              这是预览正文内容，调整滑块可以实时看到文字大小的变化效果。
            </p>
          </div>
        </div>
      </Section>

      <Section title="侧边栏宽度" desc={`当前宽度：${sidebarWidth}px`}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={180}
              max={320}
              step={10}
              value={sidebarWidth}
              onChange={(e) => setSidebarWidth(parseInt(e.target.value))}
              className="flex-1 accent-[var(--app-accent)]"
            />
            <span className="text-xs font-mono w-14 text-right" style={{ color: "var(--app-text-secondary)" }}>
              {sidebarWidth}px
            </span>
          </div>
        </div>
      </Section>

      <Section title="界面密度" desc="调整界面元素的紧凑程度">
        <div className="p-4 grid grid-cols-3 gap-3">
          {DENSITY_OPTIONS.map((d) => {
            const active = density === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setDensity(d.key)}
                className={cn(
                  "p-3 rounded-xl text-left transition-all border-2",
                  active ? "" : ""
                )}
                style={{
                  background: active ? "color-mix(in srgb, var(--app-accent) 10%, transparent)" : "var(--app-surface-hover)",
                  borderColor: active ? "var(--app-accent)" : "var(--app-border)",
                }}
              >
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--app-text-primary)" }}
                >
                  {d.label}
                </div>
                <div
                  className="text-[11px]"
                  style={{ color: "var(--app-text-secondary)" }}
                >
                  {d.desc}
                </div>
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );

  const renderNotifications = () => (
    <div>
      <Section title="通知类型" desc="选择你希望接收的通知类型">
        {NOTIF_SWITCHES.map((s, i) => (
          <Row
            key={s.key}
            label={s.label}
            desc={s.desc}
            last={i === NOTIF_SWITCHES.length - 1}
          >
            <Toggle
              checked={preferences.notifications[s.key]}
              onChange={(v) => setNotificationSetting(s.key, v)}
            />
          </Row>
        ))}
      </Section>

      <Section title="勿扰模式" desc="在设定时间段内不显示通知提醒">
        <Row label="启用勿扰模式" desc="开启后通知不会弹出提醒和声音">
          <Toggle checked={dndEnabled} onChange={setDndEnabled} />
        </Row>
        {dndEnabled && (
          <Row label="勿扰时间段" desc="每天在此时间段内启用勿扰模式" last>
            <div className="flex items-center gap-2">
              <input type="time" defaultValue="22:00" className="mac-input text-xs h-8 !py-1 w-28 text-center" />
              <span className="text-xs" style={{ color: "var(--app-text-tertiary)" }}>
                至
              </span>
              <input type="time" defaultValue="08:00" className="mac-input text-xs h-8 !py-1 w-28 text-center" />
            </div>
          </Row>
        )}
      </Section>

      <Section title="通知分组方式" desc="通知中心的内容分组策略">
        <div className="p-4 space-y-2">
          {GROUPING_OPTIONS.map((g) => {
            const active = notifGrouping === g.key;
            return (
              <label
                key={g.key}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                  active ? "" : "hover:bg-black/5 dark:hover:bg-white/5"
                )}
                style={{
                  background: active ? "color-mix(in srgb, var(--app-accent) 10%, transparent)" : "transparent",
                  border: active ? "1px solid var(--app-accent)" : "1px solid transparent",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center border-2"
                  style={{
                    borderColor: active ? "var(--app-accent)" : "var(--app-border-strong)",
                    background: active ? "var(--app-accent)" : "transparent",
                  }}
                  onClick={() => setNotifGrouping(g.key)}
                >
                  {active && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--app-text-primary)" }}
                  >
                    {g.label}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--app-text-secondary)" }}
                  >
                    {g.desc}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </Section>
    </div>
  );

  const renderPrivacy = () => (
    <div>
      <Section
        title="黑名单用户"
        desc={`已屏蔽 ${blockedUsers.length} 个用户，对方将无法与你互动`}
      >
        <div className="p-4">
          {blockedUsersList.length > 0 ? (
            <div className="space-y-2">
              {blockedUsersList.map((u) => (
                <div
                  key={u!.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: "var(--app-surface-secondary)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={u!.avatar} name={u!.nickname} size="md" />
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--app-text-primary)" }}
                      >
                        {u!.nickname}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: "var(--app-text-tertiary)" }}
                      >
                        @{u!.username}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                    onClick={() => toggleBlockUser(u!.id, u!.nickname)}
                  >
                    解除屏蔽
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Empty type="users" title="黑名单为空" description="屏蔽骚扰你的用户，营造良好的浏览体验" />
          )}

          <div className="mt-4">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<UserMinus className="w-4 h-4" />}
              onClick={() => setShowAddBlockModal(true)}
              className="w-full"
            >
              添加屏蔽用户
            </Button>
          </div>
        </div>
      </Section>

      <Section title="关键词屏蔽" desc="包含这些关键词的内容将被自动过滤">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
              placeholder="输入要屏蔽的关键词..."
              className="flex-1 mac-input text-sm"
            />
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddKeyword}
              disabled={!keywordInput.trim()}
            >
              添加
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {localBlockedKeywords.length > 0 ? (
              localBlockedKeywords.map((kw) => (
                <Tag
                  key={kw}
                  color="#FF3B30"
                  size="md"
                  variant="soft"
                  closable
                  onClose={() => handleRemoveKeyword(kw)}
                >
                  {kw}
                </Tag>
              ))
            ) : (
              <span className="text-xs" style={{ color: "var(--app-text-tertiary)" }}>
                暂无屏蔽关键词
              </span>
            )}
          </div>
        </div>
      </Section>

      <Section title="谁能私信我" desc="限制可以给你发送私信的用户范围">
        <Row label="私信权限" desc="只有符合条件的用户才能给你发私信">
          <select
            className="mac-select text-xs h-8 !py-1 min-w-[160px]"
            value={whoCanDM}
            onChange={(e) => setWhoCanDM(e.target.value)}
          >
            <option value="all">所有人</option>
            <option value="following">我关注的人</option>
            <option value="none">没人（关闭私信）</option>
          </select>
        </Row>
      </Section>

      <Section title="谁能@我" desc="限制可以在帖子中 @提及你的用户范围">
        <Row label="@提及权限" desc="只有符合条件的用户才能@你" last>
          <select
            className="mac-select text-xs h-8 !py-1 min-w-[160px]"
            value={whoCanMention}
            onChange={(e) => setWhoCanMention(e.target.value)}
          >
            <option value="all">所有人</option>
            <option value="following">我关注的人</option>
          </select>
        </Row>
      </Section>

      <Modal
        open={showAddBlockModal}
        onClose={() => setShowAddBlockModal(false)}
        title={
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: "var(--app-accent)" }} />
            添加屏蔽用户
          </div>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddBlockModal(false)}>
              取消
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--app-text-tertiary)" }}
            />
            <input
              type="text"
              value={blockSearch}
              onChange={(e) => setBlockSearch(e.target.value)}
              placeholder="搜索用户名或昵称..."
              className="mac-input pl-9"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1.5 -mx-1 px-1">
            {USERS.filter((u) =>
              blockSearch
                ? u.nickname.toLowerCase().includes(blockSearch.toLowerCase()) ||
                  u.username.toLowerCase().includes(blockSearch.toLowerCase())
                : true
            )
              .filter((u) => !blockedUsers.some((b) => b.targetId === u.id))
              .slice(0, 10)
              .map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar} name={u.nickname} size="sm" />
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: "var(--app-text-primary)" }}
                      >
                        {u.nickname}
                      </div>
                      <div
                        className="text-[10px]"
                        style={{ color: "var(--app-text-tertiary)" }}
                      >
                        @{u.username}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="xs"
                    leftIcon={<UserX className="w-3 h-3" />}
                    onClick={() => {
                      toggleBlockUser(u.id, u.nickname);
                    }}
                  >
                    屏蔽
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </div>
  );

  const renderShortcuts = () => (
    <div>
      <Section title="快捷键列表" desc="查看和自定义应用的全局快捷键">
        <div className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--app-text-tertiary)" }}
              />
              <input
                type="text"
                value={shortcutSearch}
                onChange={(e) => setShortcutSearch(e.target.value)}
                placeholder="搜索快捷键..."
                className="mac-input pl-9"
              />
            </div>
            <Button
              variant="ghost"
              size="md"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={resetShortcuts}
            >
              恢复默认
            </Button>
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--app-border)" }}
          >
            <div
              className="grid grid-cols-12 gap-4 px-4 py-2.5 text-xs font-medium"
              style={{
                background: "var(--app-surface-secondary)",
                color: "var(--app-text-secondary)",
              }}
            >
              <div className="col-span-5">功能</div>
              <div className="col-span-4">macOS 快捷键</div>
              <div className="col-span-3 text-right">操作</div>
            </div>
            {filteredShortcuts.map((s, i) => {
              const current = shortcuts[s.key] || s.defaultMac;
              const isRecording = recordingKey === s.key;
              return (
                <div
                  key={s.key}
                  className={cn(
                    "grid grid-cols-12 gap-4 px-4 py-3 items-center",
                    i !== filteredShortcuts.length - 1 && ""
                  )}
                  style={{
                    borderBottom:
                      i === filteredShortcuts.length - 1
                        ? "none"
                        : "1px solid var(--app-border)",
                  }}
                >
                  <div
                    className="col-span-5 text-sm font-medium truncate"
                    style={{ color: "var(--app-text-primary)" }}
                  >
                    {s.label}
                  </div>
                  <div className="col-span-4">
                    <kbd
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono",
                        isRecording ? "animate-pulse" : ""
                      )}
                      style={{
                        background: isRecording
                          ? "color-mix(in srgb, var(--app-accent) 20%, transparent)"
                          : "var(--app-surface-secondary)",
                        color: isRecording ? "var(--app-accent)" : "var(--app-text-primary)",
                        border: `1px solid ${isRecording ? "var(--app-accent)" : "var(--app-border)"}`,
                      }}
                    >
                      {isRecording ? (recordedCombo || "按下组合键...") : current}
                      {isRecording && (
                        <CircleDot
                          className="w-2 h-2 animate-pulse"
                          style={{ color: "var(--app-danger)" }}
                        />
                      )}
                    </kbd>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-1">
                    <Button
                      variant="icon"
                      size="sm"
                      title={isRecording ? "录制中..." : "录制新快捷键"}
                      onClick={() => handleKeyRecord(s.key)}
                      className={
                        isRecording
                          ? "bg-[var(--app-accent)] text-white"
                          : ""
                      }
                    >
                      {isRecording ? (
                        <CircleDot className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Pencil className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="icon"
                      size="sm"
                      title="恢复默认"
                      onClick={() => setShortcut(s.key, s.defaultMac)}
                      disabled={current === s.defaultMac}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );

  const renderAbout = () => (
    <div>
      <Section title="应用信息">
        <div className="p-6 flex flex-col items-center text-center">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4 shadow-lg"
            style={{
              background:
                "linear-gradient(135deg, var(--app-accent) 0%, var(--app-accent-hover) 100%)",
            }}
          >
            <Apple className="w-14 h-14 text-white" />
          </div>
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: "var(--app-text-primary)" }}
          >
            Mac 社区
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--app-text-secondary)" }}
          >
            版本 1.0.0 (Build 20240101)
          </p>
          <p
            className="text-xs max-w-md leading-relaxed"
            style={{ color: "var(--app-text-tertiary)" }}
          >
            专为果粉打造的优质社区客户端。交流技术、分享经验、结交朋友。
          </p>
        </div>
      </Section>

      <Section title="技术栈" desc="这个应用是用以下技术构建的">
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "Electron", ver: "28.x" },
              { name: "React", ver: "18.x" },
              { name: "TypeScript", ver: "5.x" },
              { name: "Tailwind CSS", ver: "3.x" },
              { name: "Zustand", ver: "5.x" },
              { name: "Vite", ver: "5.x" },
              { name: "React Markdown", ver: "9.x" },
              { name: "Lucide Icons", ver: "0.511" },
            ].map((t) => (
              <div
                key={t.name}
                className="p-3 rounded-xl text-center"
                style={{
                  background: "var(--app-surface-secondary)",
                }}
              >
                <div
                  className="text-sm font-semibold"
                  style={{ color: "var(--app-text-primary)" }}
                >
                  {t.name}
                </div>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: "var(--app-text-tertiary)" }}
                >
                  {t.ver}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="检查更新">
        <Row label="自动检查更新" desc="启动时自动检测新版本">
          <Toggle checked={true} onChange={() => {}} />
        </Row>
        <Row label="当前版本" desc="v1.0.0 是最新版本" last>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">
              <Check className="w-3 h-3" /> 最新
            </Badge>
            <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              检查更新
            </Button>
          </div>
        </Row>
      </Section>

      <Section title="链接与联系方式" desc="获取帮助或参与贡献">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: Globe, label: "官方网站", desc: "macforum.app", color: "#007AFF" },
            { icon: Github, label: "GitHub 仓库", desc: "查看源码 & 贡献", color: "#1C1C1E" },
            { icon: Mail, label: "反馈邮箱", desc: "feedback@macforum.app", color: "#FF9500" },
            { icon: Shield, label: "开源协议", desc: "MIT License", color: "#34C759" },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.label}
                type="button"
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm text-left"
                style={{
                  background: "var(--app-surface-secondary)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${link.color}15`, color: link.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium flex items-center gap-1"
                    style={{ color: "var(--app-text-primary)" }}
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: "var(--app-text-secondary)" }}
                  >
                    {link.desc}
                  </div>
                </div>
                <ChevronRight
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "var(--app-text-tertiary)" }}
                />
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );

  const renderContent = () => {
    switch (activeNav) {
      case "general":
        return renderGeneral();
      case "appearance":
        return renderAppearance();
      case "notifications":
        return renderNotifications();
      case "privacy":
        return renderPrivacy();
      case "shortcuts":
        return renderShortcuts();
      case "about":
        return renderAbout();
      default:
        return renderAppearance();
    }
  };

  return (
    <div
      className="h-full flex overflow-hidden app-transition"
      style={{ background: "var(--app-bg)" }}
    >
      <aside
        className="w-40 flex-shrink-0 flex flex-col h-full border-r py-6"
        style={{
          borderRightColor: "var(--app-border)",
          background: "var(--app-surface)",
        }}
      >
        <div className="px-4 mb-4">
          <h2
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--app-text-tertiary)" }}
          >
            设置
          </h2>
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTabChange(item.key)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                  active ? "font-medium shadow-sm" : "hover:bg-black/5 dark:hover:bg-white/5"
                )}
                style={{
                  background: active ? "var(--app-accent)" : "transparent",
                  color: active ? "#fff" : "var(--app-text-secondary)",
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div
          className="mx-4 p-3 rounded-xl"
          style={{ background: "var(--app-surface-secondary)" }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <Avatar
              src={USERS[0].avatar}
              name={USERS[0].nickname}
              size="sm"
              ring
              online
            />
            <div className="flex-1 min-w-0">
              <div
                className="text-xs font-semibold truncate"
                style={{ color: "var(--app-text-primary)" }}
              >
                {USERS[0].nickname}
              </div>
              <div
                className="text-[10px] truncate"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                @{USERS[0].username}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="w-full text-xs py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: "var(--app-danger)" }}
          >
            <X className="w-3 h-3" />
            退出登录
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "color-mix(in srgb, var(--app-accent) 15%, transparent)",
              }}
            >
              {(() => {
                const NavItem = SETTINGS_NAV.find((n) => n.key === activeNav);
                const Icon = NavItem?.icon || SettingsIcon;
                return (
                  <Icon className="w-5 h-5" style={{ color: "var(--app-accent)" }} />
                );
              })()}
            </div>
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: "var(--app-text-primary)" }}
              >
                {SETTINGS_NAV.find((n) => n.key === activeNav)?.label}
              </h1>
              <p
                className="text-xs"
                style={{ color: "var(--app-text-secondary)" }}
              >
                自定义你的使用体验
              </p>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}
