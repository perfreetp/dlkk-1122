import { useState, useEffect, useMemo, useRef } from "react";
import { cn, debounce, stripMarkdown, formatTime } from "@/lib/utils";
import { useAppStore } from "@/stores/appStore";
import { Search, X, Hash, FileText, User, MessageSquare, Clock, SlidersHorizontal, ChevronRight } from "lucide-react";
import Avatar from "./ui/Avatar";
import Tag from "./ui/Tag";
import Empty from "./ui/Empty";
import Badge from "./ui/Badge";

type SearchScope = "all" | "posts" | "users" | "tags" | "messages";

const scopeOptions: Array<{ key: SearchScope; label: string; icon: typeof FileText }> = [
  { key: "all", label: "全部", icon: Search },
  { key: "posts", label: "帖子", icon: FileText },
  { key: "users", label: "用户", icon: User },
  { key: "tags", label: "标签", icon: Hash },
  { key: "messages", label: "消息", icon: MessageSquare },
];

interface SearchResult {
  type: SearchScope;
  id: string;
  title: string;
  description?: string;
  extra?: React.ReactNode;
  onClick?: () => void;
}

export default function SearchOverlay() {
  const showSearch = useAppStore((s) => s.showSearch);
  const toggleShowSearch = useAppStore((s) => s.toggleShowSearch);
  const posts = useAppStore((s) => s.posts);
  const conversations = useAppStore((s) => s.conversations);
  const currentUserId = useAppStore((s) => s.currentUser.id);
  const setActivePost = useAppStore((s) => s.setActivePost);
  const setActiveConversation = useAppStore((s) => s.setActiveConversation);
  const setProfileUserId = useAppStore((s) => s.setProfileUserId);
  const setActiveCategory = useAppStore((s) => s.setActiveCategory);

  const [keyword, setKeyword] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch) {
      setKeyword("");
      setScope("all");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showSearch]);

  useEffect(() => {
    setActiveIndex(0);
  }, [keyword, scope]);

  const [history, setHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("search-history") || "[]");
    } catch {
      return [];
    }
  });

  const saveHistory = (term: string) => {
    const next = [term, ...history.filter((h) => h !== term)].slice(0, 10);
    setHistory(next);
    localStorage.setItem("search-history", JSON.stringify(next));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("search-history");
  };

  const results = useMemo<SearchResult[]>(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return [];

    let list: SearchResult[] = [];

    if (scope === "all" || scope === "posts") {
      const matched = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          stripMarkdown(p.content).toLowerCase().includes(kw) ||
          p.tags.some((t) => t.name.toLowerCase().includes(kw)) ||
          p.author.nickname.toLowerCase().includes(kw)
      );
      list = list.concat(
        matched.slice(0, 8).map((p) => ({
          type: "posts",
          id: p.id,
          title: p.title,
          description: stripMarkdown(p.content).slice(0, 100),
          extra: (
            <div className="flex items-center gap-2 flex-wrap mt-1.5">
              <span className="text-xs" style={{ color: "var(--app-text-tertiary)" }}>
                {p.author.nickname}
              </span>
              <span className="text-xs" style={{ color: "var(--app-text-tertiary)" }}>
                · {formatTime(p.createdAt)}
              </span>
              {p.tags.slice(0, 2).map((t) => (
                <Tag key={t.id} color={t.color} size="sm">
                  {t.name}
                </Tag>
              ))}
            </div>
          ),
          onClick: () => {
            setActivePost(p.id);
            saveHistory(keyword.trim());
          },
        }))
      );
    }

    if (scope === "all" || scope === "users") {
      const userSet = new Map<string, { id: string; nickname: string; avatar: string; signature?: string }>();
      posts.forEach((p) => {
        if (p.author.nickname.toLowerCase().includes(kw) || p.author.username.toLowerCase().includes(kw)) {
          userSet.set(p.author.id, {
            id: p.author.id,
            nickname: p.author.nickname,
            avatar: p.author.avatar,
            signature: p.author.signature,
          });
        }
      });
      list = list.concat(
        Array.from(userSet.values()).slice(0, 5).map((u) => ({
          type: "users",
          id: u.id,
          title: u.nickname,
          description: u.signature,
          extra: null,
          onClick: () => {
            setProfileUserId(u.id);
            saveHistory(keyword.trim());
          },
        }))
      );
    }

    if (scope === "all" || scope === "tags") {
      const tagSet = new Map<string, { id: string; name: string; color: string; count: number }>();
      posts.forEach((p) => {
        p.tags.forEach((t) => {
          if (t.name.toLowerCase().includes(kw)) {
            tagSet.set(t.id, {
              id: t.id,
              name: t.name,
              color: t.color,
              count: (tagSet.get(t.id)?.count || 0) + 1,
            });
          }
        });
      });
      list = list.concat(
        Array.from(tagSet.values()).slice(0, 5).map((t) => ({
          type: "tags",
          id: t.id,
          title: t.name,
          description: `${t.count} 篇相关帖子`,
          extra: (
            <Tag color={t.color} size="sm" className="mt-1.5">
              #{t.name}
            </Tag>
          ),
          onClick: () => {
            saveHistory(keyword.trim());
          },
        }))
      );
    }

    if (scope === "all" || scope === "messages") {
      const matched = conversations.filter(
        (c) =>
          c.participants.some((p) => p.nickname.toLowerCase().includes(kw)) ||
          (c.lastMessage?.content || "").toLowerCase().includes(kw)
      );
      list = list.concat(
        matched.slice(0, 5).map((c) => {
          const other = c.participants.find((p) => p.id !== currentUserId);
          return {
            type: "messages",
            id: c.id,
            title: other?.nickname || "对话",
            description: c.lastMessage?.content,
            extra: null,
            onClick: () => {
              setActiveConversation(c.id);
              saveHistory(keyword.trim());
            },
          };
        })
      );
    }

    return list;
  }, [keyword, scope, posts, conversations, currentUserId, setActivePost, setActiveConversation, setProfileUserId, history]);

  useEffect(() => {
    if (!showSearch) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleShowSearch();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[activeIndex]) {
        e.preventDefault();
        results[activeIndex].onClick?.();
        toggleShowSearch();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showSearch, results, activeIndex, toggleShowSearch]);

  if (!showSearch) return null;

  const debouncedSearch = debounce((v: string) => setKeyword(v), 120);

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-[15vh] p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={toggleShowSearch}
      />
      <div
        className={cn(
          "relative w-full max-w-2xl rounded-2xl shadow-mac-lg overflow-hidden animate-fade-in-up"
        )}
        style={{
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
        }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--app-border)" }}
        >
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: "var(--app-text-tertiary)" }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索帖子、用户、标签、消息..."
            className="flex-1 bg-transparent outline-none text-base"
            style={{ color: "var(--app-text-primary)" }}
            onChange={(e) => debouncedSearch(e.target.value)}
            defaultValue={keyword}
          />
          {keyword && (
            <button
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              style={{ color: "var(--app-text-tertiary)" }}
              onClick={() => setKeyword("")}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd
            className="flex-shrink-0 px-2 py-1 rounded text-[10px] font-medium"
            style={{
              background: "var(--app-surface-secondary)",
              color: "var(--app-text-secondary)",
              border: "1px solid var(--app-border)",
            }}
          >
            ESC
          </kbd>
        </div>

        <div
          className="flex items-center gap-1 px-5 py-2.5 overflow-x-auto"
          style={{ borderBottom: "1px solid var(--app-border)" }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 mr-1 flex-shrink-0" style={{ color: "var(--app-text-tertiary)" }} />
          {scopeOptions.map((opt) => {
            const Icon = opt.icon;
            const active = scope === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  active ? "" : "hover:bg-black/5 dark:hover:bg-white/5"
                )}
                style={{
                  background: active ? "var(--app-accent)" : "transparent",
                  color: active ? "#fff" : "var(--app-text-secondary)",
                }}
                onClick={() => setScope(opt.key)}
              >
                <Icon className="w-3 h-3" />
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {!keyword && history.length > 0 ? (
            <div className="p-3">
              <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--app-text-tertiary)" }}>
                  <Clock className="w-3 h-3" />
                  搜索历史
                </span>
                <button
                  className="text-xs transition-colors hover:opacity-80"
                  style={{ color: "var(--app-accent)" }}
                  onClick={clearHistory}
                >
                  清空
                </button>
              </div>
              {history.map((h, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-left transition-colors hover:bg-[var(--app-surface-hover)]"
                  style={{ color: "var(--app-text-primary)" }}
                  onClick={() => setKeyword(h)}
                >
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--app-text-tertiary)" }} />
                  <span className="flex-1 truncate">{h}</span>
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100" style={{ color: "var(--app-text-tertiary)" }} />
                </button>
              ))}
            </div>
          ) : null}

          {keyword && results.length === 0 ? (
            <Empty type="search" description={`没有找到与「${keyword}」匹配的结果`} />
          ) : null}

          {results.length > 0 && (
            <div className="p-2">
              {results.map((r, i) => {
                const active = i === activeIndex;
                const scopeOpt = scopeOptions.find((s) => s.key === r.type);
                const Icon = scopeOpt?.icon || Search;
                return (
                  <button
                    key={`${r.type}-${r.id}`}
                    type="button"
                    className={cn(
                      "w-full flex items-start gap-3.5 px-3 py-2.5 rounded-xl text-left transition-colors",
                      active ? "" : "hover:bg-[var(--app-surface-hover)]"
                    )}
                    style={{
                      background: active ? "var(--app-surface-secondary)" : "transparent",
                    }}
                    onClick={() => {
                      r.onClick?.();
                      toggleShowSearch();
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    {r.type === "users" ? (
                      <Avatar src={undefined} name={r.title} size="sm" className="flex-shrink-0" />
                    ) : r.type === "messages" ? (
                      <Avatar src={undefined} name={r.title} size="sm" className="flex-shrink-0" />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{ background: "var(--app-surface-secondary)" }}
                      >
                        <Icon className="w-4 h-4" style={{ color: "var(--app-accent)" }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="gray" size="sm" className="flex-shrink-0">
                          {scopeOpt?.label}
                        </Badge>
                        <span
                          className="font-medium truncate text-sm"
                          style={{ color: "var(--app-text-primary)" }}
                        >
                          {highlightMatch(r.title, keyword)}
                        </span>
                      </div>
                      {r.description && (
                        <p
                          className="mt-1 text-xs truncate"
                          style={{ color: "var(--app-text-secondary)" }}
                        >
                          {highlightMatch(r.description, keyword, 120)}
                        </p>
                      )}
                      {r.extra}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-between gap-4 px-5 py-2.5 text-[11px]"
          style={{
            borderTop: "1px solid var(--app-border)",
            color: "var(--app-text-tertiary)",
            background: "var(--app-surface-secondary)",
          }}
        >
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>↑↓</kbd>
              选择
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>↵</kbd>
              打开
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--app-surface)", border: "1px solid var(--app-border)" }}>⌘K</kbd>
              搜索
            </span>
          </div>
          {keyword && (
            <span>
              找到 {results.length} 条结果
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function highlightMatch(text: string, keyword: string, maxLen?: number): React.ReactNode {
  if (!keyword.trim()) return text;
  let t = text;
  if (maxLen && t.length > maxLen) {
    t = t.slice(0, maxLen) + "...";
  }
  const kw = keyword.trim();
  const regex = new RegExp(`(${escapeRegex(kw)})`, "gi");
  const parts = t.split(regex);
  return parts.map((p, i) =>
    regex.test(p) ? (
      <mark
        key={i}
        className="px-0.5 rounded"
        style={{
          background: "color-mix(in srgb, var(--app-accent) 22%, transparent)",
          color: "var(--app-accent)",
        }}
      >
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
