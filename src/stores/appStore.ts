import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User,
  UserPreferences,
  FeedFilter,
  SortType,
  Post,
  Notification,
  Conversation,
  Message,
  FavoriteGroup,
  FavoriteItem,
  Draft,
  BlockItem,
} from "@/types";
import {
  CURRENT_USER,
  POSTS,
  NOTIFICATIONS,
  CONVERSATIONS,
  MESSAGES,
  FAVORITE_GROUPS,
  FAVORITE_ITEMS,
  DRAFTS,
} from "@/mock";
import { SHORTCUT_DEFS } from "@/types";

interface AppState {
  currentUser: User;
  preferences: UserPreferences;
  feedFilter: FeedFilter;
  posts: Post[];
  notifications: Notification[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId?: string;
  favoriteGroups: FavoriteGroup[];
  favoriteItems: FavoriteItem[];
  activeFavoriteGroupId: string;
  drafts: Draft[];
  activePanel: "feed" | "categories" | "post" | "messages" | "favorites" | "profile" | "settings" | "editor";
  activePostId?: string;
  showEditor: boolean;
  editorDraftId?: string;
  showSearch: boolean;
  showUserMenu: boolean;
  showNotificationPanel: boolean;
  activeSettingsTab: string;
  activeProfileTab: string;
  activeCategoryId?: string;
  profileUserId: string;
  reportTarget?: { type: "post" | "reply" | "user"; id: string; name: string };
  showReportDialog: boolean;

  setActivePanel: (p: AppState["activePanel"]) => void;
  setActivePost: (id?: string) => void;
  setFeedFilter: (f: Partial<FeedFilter>) => void;
  toggleTheme: () => void;
  setAccentColor: (c: string) => void;
  setFontSize: (n: number) => void;
  setSidebarWidth: (n: number) => void;
  setNotificationSetting: (key: keyof UserPreferences["notifications"], v: boolean) => void;
  likePost: (id: string) => void;
  favoritePost: (postId: string, groupId: string) => void;
  removeFavoriteItem: (itemId: string) => void;
  createFavoriteGroup: (name: string, color?: string) => void;
  deleteFavoriteGroup: (id: string) => void;
  renameFavoriteGroup: (id: string, name: string) => void;
  setActiveFavoriteGroup: (id: string) => void;
  moveFavoriteItem: (itemId: string, targetGroupId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setActiveConversation: (id?: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  markConversationRead: (id: string) => void;
  saveDraft: (draft: Partial<Draft> & { content: string }) => void;
  deleteDraft: (id: string) => void;
  setShowEditor: (show: boolean, draftId?: string) => void;
  toggleShowSearch: () => void;
  toggleShowNotificationPanel: () => void;
  setActiveSettingsTab: (t: string) => void;
  setActiveProfileTab: (t: string) => void;
  setActiveCategory: (id?: string) => void;
  setProfileUserId: (id: string) => void;
  toggleBlockUser: (userId: string, userName: string) => void;
  setReportTarget: (target?: AppState["reportTarget"]) => void;
  setShortcut: (key: string, value: string) => void;
  resetShortcuts: () => void;
  toggleShowUserMenu: () => void;
  getUnreadTotal: () => number;
}

const defaultShortcuts: Record<string, string> = {};
SHORTCUT_DEFS.forEach((s) => (defaultShortcuts[s.key] = s.defaultMac));

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: CURRENT_USER,
      preferences: {
        theme: "system" as UserPreferences["theme"],
        accentColor: "#007AFF",
        fontSize: 100,
        fontFamily: "system",
        showAvatars: true,
        showSignatures: true,
        notifications: {
          reply: true,
          mention: true,
          like: true,
          message: true,
          system: true,
          sound: true,
          badge: true,
        },
        shortcuts: defaultShortcuts,
        blockedItems: [],
        sidebarWidth: 240,
      },
      feedFilter: { sort: "hot" as SortType },
      posts: POSTS,
      notifications: NOTIFICATIONS,
      conversations: CONVERSATIONS,
      messages: MESSAGES,
      favoriteGroups: FAVORITE_GROUPS,
      favoriteItems: FAVORITE_ITEMS,
      activeFavoriteGroupId: "fg1",
      drafts: DRAFTS,
      activePanel: "feed",
      showEditor: false,
      showSearch: false,
      showUserMenu: false,
      showNotificationPanel: false,
      activeSettingsTab: "appearance",
      activeProfileTab: "posts",
      profileUserId: CURRENT_USER.id,
      showReportDialog: false,

      setActivePanel: (p) => set({ activePanel: p, activePostId: undefined, activeCategoryId: undefined }),
      setActivePost: (id) => set({ activePostId: id, activePanel: id ? "post" : "feed" }),
      setFeedFilter: (f) => set((s) => ({ feedFilter: { ...s.feedFilter, ...f } })),
      toggleTheme: () =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            theme: s.preferences.theme === "dark" ? "light" : s.preferences.theme === "light" ? "auto" : "dark",
          },
        })),
      setAccentColor: (c) => set((s) => ({ preferences: { ...s.preferences, accentColor: c } })),
      setFontSize: (n) => set((s) => ({ preferences: { ...s.preferences, fontSize: n } })),
      setSidebarWidth: (n) => set((s) => ({ preferences: { ...s.preferences, sidebarWidth: n } })),
      setNotificationSetting: (key, v) =>
        set((s) => ({ preferences: { ...s.preferences, notifications: { ...s.preferences.notifications, [key]: v } } })),

      likePost: (id) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id ? { ...p, isLiked: !p.isLiked, likeCount: p.likeCount + (p.isLiked ? -1 : 1) } : p
          ),
        })),

      favoritePost: (postId, groupId) => {
        const state = get();
        const post = state.posts.find((p) => p.id === postId);
        if (!post) return;
        const existing = state.favoriteItems.find((fi) => fi.targetId === postId && fi.groupId === groupId);
        if (existing) {
          set((s) => ({
            favoriteItems: s.favoriteItems.filter((fi) => fi.id !== existing.id),
            favoriteGroups: s.favoriteGroups.map((g) =>
              g.id === groupId ? { ...g, itemCount: g.itemCount - 1 } : g
            ),
          }));
        } else {
          const newItem: FavoriteItem = {
            id: `fi-${Date.now()}`,
            groupId,
            targetType: "post",
            targetId: postId,
            target: post,
            addedAt: new Date().toISOString(),
          };
          set((s) => ({
            favoriteItems: [...s.favoriteItems, newItem],
            favoriteGroups: s.favoriteGroups.map((g) => {
              const count = s.favoriteItems.filter((fi) => fi.groupId === g.id).length + (g.id === groupId ? 1 : 0);
              return { ...g, itemCount: count };
            }),
            posts: s.posts.map((p) =>
              p.id === postId ? { ...p, isFavorited: true, favoriteCount: p.favoriteCount + 1 } : p
            ),
          }));
        }
      },

      removeFavoriteItem: (itemId) =>
        set((s) => {
          const item = s.favoriteItems.find((fi) => fi.id === itemId);
          return {
            favoriteItems: s.favoriteItems.filter((fi) => fi.id !== itemId),
            favoriteGroups: s.favoriteGroups.map((g) =>
              item && g.id === item.groupId ? { ...g, itemCount: Math.max(0, g.itemCount - 1) } : g
            ),
          };
        }),

      createFavoriteGroup: (name, color = "#007AFF") =>
        set((s) => ({
          favoriteGroups: [
            ...s.favoriteGroups,
            {
              id: `fg-${Date.now()}`,
              name,
              color,
              order: s.favoriteGroups.length,
              itemCount: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deleteFavoriteGroup: (id) => {
        if (id === "fg1") return;
        set((s) => ({
          favoriteGroups: s.favoriteGroups.filter((g) => g.id !== id),
          favoriteItems: s.favoriteItems.filter((fi) => fi.groupId !== id),
          activeFavoriteGroupId: s.activeFavoriteGroupId === id ? "fg1" : s.activeFavoriteGroupId,
        }));
      },

      renameFavoriteGroup: (id, name) =>
        set((s) => ({ favoriteGroups: s.favoriteGroups.map((g) => (g.id === id ? { ...g, name } : g)) })),

      setActiveFavoriteGroup: (id) => set({ activeFavoriteGroupId: id }),

      moveFavoriteItem: (itemId, targetGroupId) =>
        set((s) => {
          const item = s.favoriteItems.find((fi) => fi.id === itemId);
          if (!item) return {};
          const items = s.favoriteItems.map((fi) => (fi.id === itemId ? { ...fi, groupId: targetGroupId } : fi));
          return {
            favoriteItems: items,
            favoriteGroups: s.favoriteGroups.map((g) => ({
              ...g,
              itemCount: items.filter((fi) => fi.groupId === g.id).length,
            })),
          };
        }),

      markNotificationRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      setActiveConversation: (id) => {
        if (id) get().markConversationRead(id);
        set({ activeConversationId: id });
      },

      sendMessage: (conversationId, content) => {
        const msg: Message = {
          id: `m-${Date.now()}`,
          conversationId,
          senderId: get().currentUser.id,
          content,
          type: "text",
          readBy: [get().currentUser.id],
          createdAt: new Date().toISOString(),
        };
        set((s) => {
          const conv = s.conversations.find((c) => c.id === conversationId);
          return {
            messages: {
              ...s.messages,
              [conversationId]: [...(s.messages[conversationId] || []), msg],
            },
            conversations: s.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    lastMessage: msg,
                    updatedAt: msg.createdAt,
                    unreadCount: conv?.unreadCount || 0,
                  }
                : c
            ),
          };
        });
      },

      markConversationRead: (id) =>
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
        })),

      saveDraft: (draft) =>
        set((s) => {
          if (draft.id) {
            return {
              drafts: s.drafts.map((d) =>
                d.id === draft.id
                  ? {
                      ...d,
                      ...draft,
                      tagIds: draft.tagIds || d.tagIds,
                      images: draft.images || d.images,
                      savedAt: new Date().toISOString(),
                    }
                  : d
              ),
            };
          }
          return {
            drafts: [
              {
                id: `d-${Date.now()}`,
                title: draft.title || "",
                content: draft.content,
                categoryId: draft.categoryId,
                tagIds: draft.tagIds || [],
                images: draft.images || [],
                savedAt: new Date().toISOString(),
                autoSaved: true,
              },
              ...s.drafts,
            ],
          };
        }),

      deleteDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),

      setShowEditor: (show, draftId) =>
        set((s) => ({
          showEditor: show,
          editorDraftId: draftId,
          activePanel: show ? "editor" : s.activePanel,
        })),
      toggleShowSearch: () => set((s) => ({ showSearch: !s.showSearch })),
      toggleShowNotificationPanel: () =>
        set((s) => ({ showNotificationPanel: !s.showNotificationPanel, showUserMenu: false })),
      setActiveSettingsTab: (t) => set({ activeSettingsTab: t }),
      setActiveProfileTab: (t) => set({ activeProfileTab: t }),
      setActiveCategory: (id) => set({ activeCategoryId: id, activePanel: "categories" }),
      setProfileUserId: (id) => set({ profileUserId: id, activePanel: "profile" }),
      toggleShowUserMenu: () => set((s) => ({ showUserMenu: !s.showUserMenu, showNotificationPanel: false })),

      toggleBlockUser: (userId, userName) =>
        set((s) => {
          const existing = s.preferences.blockedItems.find((b) => b.type === "user" && b.targetId === userId);
          return {
            preferences: {
              ...s.preferences,
              blockedItems: existing
                ? s.preferences.blockedItems.filter((b) => b.id !== existing.id)
                : [
                    ...s.preferences.blockedItems,
                    { id: `b-${Date.now()}`, type: "user", targetId: userId, targetName: userName, createdAt: new Date().toISOString() },
                  ],
            },
          };
        }),

      setReportTarget: (target) => set({ reportTarget: target, showReportDialog: !!target }),
      setShortcut: (key, value) =>
        set((s) => ({ preferences: { ...s.preferences, shortcuts: { ...s.preferences.shortcuts, [key]: value } } })),
      resetShortcuts: () => set((s) => ({ preferences: { ...s.preferences, shortcuts: defaultShortcuts } })),

      getUnreadTotal: () => {
        const s = get();
        const unreadNotif = s.notifications.filter((n) => !n.read).length;
        const unreadMsg = s.conversations.reduce((acc, c) => acc + c.unreadCount, 0);
        return unreadNotif + unreadMsg;
      },
    }),
    {
      name: "mac-forum-store",
      partialize: (s) => ({
        preferences: s.preferences,
        favoriteGroups: s.favoriteGroups,
        favoriteItems: s.favoriteItems,
        drafts: s.drafts,
      }),
    }
  )
);
