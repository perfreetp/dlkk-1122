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
  Reply,
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
  CATEGORIES,
  TAGS,
  REPLIES,
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

  createPost: (data: Partial<Post> & { title: string; content: string; categoryId: string; tagIds?: string[]; osVersion?: string; macModel?: string; images?: string[]; draftId?: string }) => string;
  getPostById: (id: string) => Post | undefined;
  getFilteredPosts: () => Post[];
  toggleFavoriteInGroup: (postId: string, groupId: string) => void;
  isPostFavorited: (postId: string) => boolean;
  getPostFavoriteGroups: (postId: string) => string[];
  unfavoritePost: (postId: string) => void;
  getBlockedUserIds: () => string[];
  getFilteredConversations: () => Conversation[];
  getFilteredReplies: (replies: Reply[]) => Reply[];
  getRepliesByPostId: (postId: string) => Reply[];
  addReply: (postId: string, data: { content: string; replyToId?: string; replyToFloor?: number; replyToAuthor?: User; mentions?: string[]; images?: string[] }) => Reply;
  addBlockKeyword: (keyword: string) => void;
  removeBlockKeyword: (keyword: string) => void;
  getBlockedKeywords: () => string[];
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

      getBlockedUserIds: () => {
        const s = get();
        return s.preferences.blockedItems.filter((b) => b.type === "user").map((b) => b.targetId);
      },

      getBlockedKeywords: () => {
        const s = get();
        return s.preferences.blockedItems.filter((b) => b.type === "keyword").map((b) => b.targetName);
      },

      addBlockKeyword: (keyword) =>
        set((s) => {
          const existing = s.preferences.blockedItems.find(
            (b) => b.type === "keyword" && b.targetName.toLowerCase() === keyword.toLowerCase()
          );
          if (existing) return {};
          return {
            preferences: {
              ...s.preferences,
              blockedItems: [
                ...s.preferences.blockedItems,
                {
                  id: `b-${Date.now()}`,
                  type: "keyword",
                  targetId: keyword.toLowerCase(),
                  targetName: keyword,
                  createdAt: new Date().toISOString(),
                },
              ],
            },
          };
        }),

      removeBlockKeyword: (keyword) =>
        set((s) => ({
          preferences: {
            ...s.preferences,
            blockedItems: s.preferences.blockedItems.filter(
              (b) => !(b.type === "keyword" && b.targetName.toLowerCase() === keyword.toLowerCase())
            ),
          },
        })),

      getFilteredPosts: () => {
        const s = get();
        const blockedIds = s.getBlockedUserIds();
        const blockedKeywords = s.getBlockedKeywords();
        return s.posts.filter((p) => {
          if (blockedIds.includes(p.authorId)) return false;
          if (blockedKeywords.length > 0) {
            const titleLower = p.title.toLowerCase();
            const contentLower = p.content.toLowerCase();
            for (const kw of blockedKeywords) {
              const kwLower = kw.toLowerCase();
              if (titleLower.includes(kwLower) || contentLower.includes(kwLower)) {
                return false;
              }
            }
          }
          return true;
        });
      },

      getPostById: (id) => {
        return get().posts.find((p) => p.id === id);
      },

      createPost: (data) => {
        const s = get();
        const category = CATEGORIES.find((c) => c.id === data.categoryId) || CATEGORIES[0];
        const tags = (data.tagIds || []).map((tid) => TAGS.find((t) => t.id === tid)).filter(Boolean) as typeof TAGS;
        const now = new Date().toISOString();
        const newPost: Post = {
          id: `p-${Date.now()}`,
          title: data.title,
          content: data.content,
          authorId: s.currentUser.id,
          author: s.currentUser,
          categoryId: data.categoryId,
          category,
          tags,
          isPinned: false,
          isEssence: false,
          viewCount: 0,
          likeCount: 0,
          replyCount: 0,
          favoriteCount: 0,
          osVersion: data.osVersion,
          macModel: data.macModel,
          images: data.images || [],
          createdAt: now,
          updatedAt: now,
          isLiked: false,
          isFavorited: false,
        };
        set((state) => {
          const newState: Partial<AppState> = {
            posts: [newPost, ...state.posts],
          };
          if (data.draftId) {
            newState.drafts = state.drafts.filter((d) => d.id !== data.draftId);
          }
          return newState;
        });
        return newPost.id;
      },

      toggleFavoriteInGroup: (postId, groupId) => {
        const state = get();
        const post = state.posts.find((p) => p.id === postId);
        if (!post) return;
        const existing = state.favoriteItems.find((fi) => fi.targetId === postId && fi.groupId === groupId);
        if (existing) {
          set((s) => {
            const newItems = s.favoriteItems.filter((fi) => fi.id !== existing.id);
            const isFavorited = newItems.some((fi) => fi.targetId === postId);
            const favCount = newItems.filter((fi) => fi.targetId === postId).length;
            return {
              favoriteItems: newItems,
              favoriteGroups: s.favoriteGroups.map((g) =>
                g.id === groupId ? { ...g, itemCount: Math.max(0, g.itemCount - 1) } : g
              ),
              posts: s.posts.map((p) =>
                p.id === postId ? { ...p, isFavorited, favoriteCount: favCount } : p
              ),
            };
          });
        } else {
          const newItem: FavoriteItem = {
            id: `fi-${Date.now()}`,
            groupId,
            targetType: "post",
            targetId: postId,
            target: post,
            addedAt: new Date().toISOString(),
          };
          set((s) => {
            const newItems = [...s.favoriteItems, newItem];
            const favCount = newItems.filter((fi) => fi.targetId === postId).length;
            return {
              favoriteItems: newItems,
              favoriteGroups: s.favoriteGroups.map((g) => ({
                ...g,
                itemCount: newItems.filter((fi) => fi.groupId === g.id).length,
              })),
              posts: s.posts.map((p) =>
                p.id === postId ? { ...p, isFavorited: true, favoriteCount: favCount } : p
              ),
            };
          });
        }
      },

      isPostFavorited: (postId) => {
        return get().favoriteItems.some((fi) => fi.targetId === postId);
      },

      getPostFavoriteGroups: (postId) => {
        return get()
          .favoriteItems.filter((fi) => fi.targetId === postId)
          .map((fi) => fi.groupId);
      },

      unfavoritePost: (postId) => {
        set((s) => {
          const itemsToRemove = s.favoriteItems.filter((fi) => fi.targetId === postId);
          const groupIds = itemsToRemove.map((fi) => fi.groupId);
          const newItems = s.favoriteItems.filter((fi) => fi.targetId !== postId);
          return {
            favoriteItems: newItems,
            favoriteGroups: s.favoriteGroups.map((g) => {
              if (groupIds.includes(g.id)) {
                const count = newItems.filter((fi) => fi.groupId === g.id).length;
                return { ...g, itemCount: count };
              }
              return g;
            }),
            posts: s.posts.map((p) =>
              p.id === postId ? { ...p, isFavorited: false, favoriteCount: 0 } : p
            ),
          };
        });
      },

      getFilteredConversations: () => {
        const s = get();
        const blockedIds = s.getBlockedUserIds();
        return s.conversations.filter((c) => {
          const otherUser = c.participants.find((p) => p.id !== s.currentUser.id);
          return otherUser && !blockedIds.includes(otherUser.id);
        });
      },

      getFilteredReplies: (replies) => {
        const blockedIds = get().getBlockedUserIds();
        return replies.filter((r) => !blockedIds.includes(r.authorId));
      },

      getRepliesByPostId: (postId) => {
        return REPLIES[postId] || [];
      },

      addReply: (postId, data) => {
        const s = get();
        const postReplies = REPLIES[postId] || [];
        const nextFloor = postReplies.length > 0 ? Math.max(...postReplies.map((r) => r.floor)) + 1 : 1;
        const now = new Date().toISOString();
        const newReply: Reply = {
          id: `r-${Date.now()}`,
          postId,
          floor: nextFloor,
          content: data.content,
          authorId: s.currentUser.id,
          author: s.currentUser,
          replyToId: data.replyToId,
          replyToFloor: data.replyToFloor,
          replyToAuthor: data.replyToAuthor,
          mentions: data.mentions || [],
          likeCount: 0,
          images: data.images || [],
          createdAt: now,
          isLiked: false,
        };
        if (!REPLIES[postId]) {
          REPLIES[postId] = [];
        }
        REPLIES[postId].push(newReply);
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, replyCount: p.replyCount + 1, lastReplyAt: now }
              : p
          ),
        }));
        return newReply;
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
