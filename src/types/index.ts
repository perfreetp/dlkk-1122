export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  signature?: string;
  level: number;
  macModel?: string;
  osVersion?: string;
  postCount: number;
  replyCount: number;
  followerCount: number;
  followingCount: number;
  createdAt: string;
  badges: Badge[];
  isBlocked?: boolean;
  isOnline?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  postCount: number;
  unreadCount?: number;
  moderators: string[];
  rules?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  hot: boolean;
  postCount: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: User;
  categoryId: string;
  category: Category;
  tags: Tag[];
  isPinned: boolean;
  isEssence: boolean;
  isDraft?: boolean;
  viewCount: number;
  likeCount: number;
  replyCount: number;
  favoriteCount: number;
  osVersion?: string;
  macModel?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  lastReplyAt?: string;
  isLiked?: boolean;
  isFavorited?: boolean;
}

export interface Reply {
  id: string;
  postId: string;
  floor: number;
  content: string;
  authorId: string;
  author: User;
  replyToId?: string;
  replyToFloor?: number;
  replyToAuthor?: User;
  mentions: string[];
  likeCount: number;
  images: string[];
  createdAt: string;
  isBlocked?: boolean;
  isLiked?: boolean;
  isEssence?: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  pinned: boolean;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "system";
  readBy: string[];
  createdAt: string;
}

export interface FavoriteGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  order: number;
  itemCount: number;
  createdAt: string;
}

export interface FavoriteItem {
  id: string;
  groupId: string;
  targetType: "post" | "reply";
  targetId: string;
  target?: Post | Reply;
  remark?: string;
  addedAt: string;
}

export type NotificationType = "reply" | "mention" | "like" | "system" | "message";

export interface Notification {
  id: string;
  type: NotificationType;
  targetId?: string;
  fromUserId?: string;
  fromUser?: User;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
  tagIds: string[];
  images: string[];
  osVersion?: string;
  macModel?: string;
  savedAt: string;
  autoSaved: boolean;
}

export interface BlockItem {
  id: string;
  type: "user" | "keyword";
  targetId: string;
  targetName: string;
  createdAt: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  accentColor: string;
  fontSize: number;
  fontFamily: string;
  showAvatars: boolean;
  showSignatures: boolean;
  defaultOsFilter?: string;
  defaultModelFilter?: string;
  notifications: {
    reply: boolean;
    mention: boolean;
    like: boolean;
    message: boolean;
    system: boolean;
    sound: boolean;
    badge: boolean;
  };
  shortcuts: Record<string, string>;
  blockedItems: BlockItem[];
  sidebarWidth: number;
}

export type SortType = "hot" | "latest" | "essence";

export interface FeedFilter {
  osVersion?: string;
  macModel?: string;
  tagId?: string;
  sort: SortType;
  keyword?: string;
}

export const OS_VERSIONS = [
  { value: "macos-15", label: "macOS 15 Sequoia" },
  { value: "macos-14", label: "macOS 14 Sonoma" },
  { value: "macos-13", label: "macOS 13 Ventura" },
  { value: "macos-12", label: "macOS 12 Monterey" },
  { value: "macos-11", label: "macOS 11 Big Sur" },
];

export const MAC_MODELS = [
  { value: "mbp-16-m3", label: "MacBook Pro 16\" M3 Max" },
  { value: "mbp-14-m3", label: "MacBook Pro 14\" M3 Pro" },
  { value: "mbp-14-m2", label: "MacBook Pro 14\" M2 Pro" },
  { value: "mba-15-m3", label: "MacBook Air 15\" M3" },
  { value: "mba-13-m3", label: "MacBook Air 13\" M3" },
  { value: "imac-24-m3", label: "iMac 24\" M3" },
  { value: "mac-mini-m2", label: "Mac Mini M2 Pro" },
  { value: "mac-studio-m2", label: "Mac Studio M2 Ultra" },
  { value: "mac-pro-m2", label: "Mac Pro M2 Ultra" },
];

export const SHORTCUT_DEFS = [
  { key: "newPost", label: "新建帖子", defaultMac: "⌘N", defaultWin: "Ctrl+N" },
  { key: "search", label: "全局搜索", defaultMac: "⌘K", defaultWin: "Ctrl+K" },
  { key: "settings", label: "打开设置", defaultMac: "⌘,", defaultWin: "Ctrl+," },
  { key: "toggleTheme", label: "切换夜间模式", defaultMac: "⌘⇧L", defaultWin: "Ctrl+Shift+L" },
  { key: "openMessages", label: "打开私信", defaultMac: "⌘⇧M", defaultWin: "Ctrl+Shift+M" },
  { key: "openFavorites", label: "打开收藏夹", defaultMac: "⌘⇧F", defaultWin: "Ctrl+Shift+F" },
  { key: "goBack", label: "返回上一页", defaultMac: "⌘←", defaultWin: "Alt+←" },
  { key: "goForward", label: "前进下一页", defaultMac: "⌘→", defaultWin: "Alt+→" },
  { key: "nav1", label: "切换到推荐", defaultMac: "⌘1", defaultWin: "Ctrl+1" },
  { key: "nav2", label: "切换到分区", defaultMac: "⌘2", defaultWin: "Ctrl+2" },
  { key: "nav3", label: "切换到消息", defaultMac: "⌘3", defaultWin: "Ctrl+3" },
  { key: "nav4", label: "切换到收藏", defaultMac: "⌘4", defaultWin: "Ctrl+4" },
  { key: "nav5", label: "切换到个人", defaultMac: "⌘5", defaultWin: "Ctrl+5" },
  { key: "saveDraft", label: "保存草稿", defaultMac: "⌘S", defaultWin: "Ctrl+S" },
  { key: "publish", label: "发布帖子", defaultMac: "⌘↩", defaultWin: "Ctrl+Enter" },
  { key: "bold", label: "粗体", defaultMac: "⌘B", defaultWin: "Ctrl+B" },
  { key: "italic", label: "斜体", defaultMac: "⌘I", defaultWin: "Ctrl+I" },
  { key: "insertLink", label: "插入链接", defaultMac: "⌘L", defaultWin: "Ctrl+L" },
  { key: "insertImage", label: "插入图片", defaultMac: "⌘⇧I", defaultWin: "Ctrl+Shift+I" },
];
