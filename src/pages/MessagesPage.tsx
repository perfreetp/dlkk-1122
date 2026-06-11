import { useState, useRef, useEffect, useMemo } from "react";
import { useAppStore } from "@/stores/appStore";
import { CONVERSATIONS as MOCK_CONVERSATIONS, MESSAGES as MOCK_MESSAGES, USERS } from "@/mock";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dropdown, { type DropdownItem } from "@/components/ui/Dropdown";
import Empty from "@/components/ui/Empty";
import {
  Search,
  Plus,
  CheckCheck,
  Check,
  Phone,
  Video,
  MoreVertical,
  Send,
  Smile,
  Image,
  Pin,
  Volume2,
  VolumeX,
  UserMinus,
  Flag,
  Users,
  MessageSquare,
} from "lucide-react";
import { cn, formatTime, formatRelative } from "@/lib/utils";
import type { Conversation, Message, User } from "@/types";

export default function MessagesPage() {
  const {
    currentUser,
    conversations: storeConversations,
    messages: storeMessages,
    activeConversationId,
    setActiveConversation,
    sendMessage,
    markConversationRead,
    markAllNotificationsRead,
    getFilteredConversations,
    toggleBlockUser,
  } = useAppStore();

  const conversations = storeConversations.length > 0 ? storeConversations : MOCK_CONVERSATIONS;
  const messagesData = Object.keys(storeMessages).length > 0 ? storeMessages : MOCK_MESSAGES;

  const filteredConversations = useMemo(() => {
    const storeFiltered = getFilteredConversations();
    return storeFiltered.length > 0 ? storeFiltered : conversations.filter((c) => {
      const otherUser = c.participants.find((p) => p.id !== currentUser.id);
      return otherUser && otherUser.id !== "u99";
    });
  }, [conversations, getFilteredConversations, currentUser.id]);

  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sortedConversations = useMemo(() => {
    const filtered = filteredConversations.filter((c) => {
      if (!searchQuery) return true;
      const otherUser = c.participants.find((p) => p.id !== currentUser.id);
      return (
        otherUser?.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    return [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredConversations, searchQuery, currentUser.id]);

  const activeConversation = filteredConversations.find((c) => c.id === activeConversationId);
  const otherUser: User | undefined = activeConversation?.participants.find(
    (p) => p.id !== currentUser.id
  );
  const messages = messagesData[activeConversation?.id || ""] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeConversationId]);

  useEffect(() => {
    if (activeConversationId && otherUser) {
      const timer = setTimeout(() => setTypingUserId(null), 4000);
      setTypingUserId(Math.random() > 0.7 ? otherUser.id : null);
      return () => clearTimeout(timer);
    }
  }, [activeConversationId, messages.length, otherUser]);

  const handleSend = () => {
    if (!inputValue.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, inputValue.trim());
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOwnMessage = (msg: Message) => msg.senderId === currentUser.id;
  const isRead = (msg: Message) =>
    activeConversation?.participants
      .filter((p) => p.id !== currentUser.id)
      .every((p) => msg.readBy.includes(p.id));

  return (
    <div className="h-full flex overflow-hidden app-transition" style={{ background: "var(--app-bg)" }}>
      <div
        className="w-80 flex-shrink-0 flex flex-col h-full border-r"
        style={{
          borderRightColor: "var(--app-border)",
          background: "var(--app-surface)",
        }}
      >
        <div className="flex-shrink-0 p-3 border-b" style={{ borderBottomColor: "var(--app-border)" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: "var(--app-text-primary)" }}>
              消息
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="icon"
                size="sm"
                title="新建会话"
                onClick={() => {}}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative mb-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--app-text-tertiary)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索会话..."
              className="mac-input pl-9 text-sm h-9 !py-1.5"
            />
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-xs"
              style={{ color: "var(--app-text-tertiary)" }}
            >
              {sortedConversations.length} 个会话
            </span>
            <button
              type="button"
              onClick={() => {
                markAllNotificationsRead();
                sortedConversations.forEach((c) => markConversationRead(c.id));
              }}
              className="text-xs px-2 py-1 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--app-accent)" }}
            >
              全部已读
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
          {sortedConversations.length > 0 ? (
            sortedConversations.map((conv) => {
              const partner = conv.participants.find((p) => p.id !== currentUser.id)!;
              const isActive = activeConversationId === conv.id;
              const isOwnLast = conv.lastMessage.senderId === currentUser.id;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConversation(conv.id)}
                  className={cn(
                    "w-full p-3 rounded-xl text-left transition-all relative group",
                    isActive
                      ? "shadow-sm"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                  style={{
                    background: isActive ? "var(--app-surface-hover)" : "transparent",
                  }}
                >
                  {conv.unreadCount > 0 && !isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                      style={{ background: "var(--app-accent)" }}
                    />
                  )}

                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar
                        src={partner.avatar}
                        name={partner.nickname}
                        size="md"
                        ring={conv.unreadCount > 0 && !isActive}
                        online={partner.isOnline}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={cn(
                              "text-sm font-semibold truncate",
                              conv.unreadCount > 0 && !isActive ? "" : ""
                            )}
                            style={{ color: "var(--app-text-primary)" }}
                          >
                            {partner.nickname}
                          </span>
                          {conv.pinned && (
                            <Pin className="w-3 h-3 flex-shrink-0" style={{ color: "var(--app-accent)" }} />
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isOwnLast && (
                            <span style={{ color: "var(--app-text-tertiary)" }}>
                              {isRead(conv.lastMessage) ? (
                                <CheckCheck className="w-3 h-3" style={{ color: "var(--app-accent)" }} />
                              ) : (
                                <Check className="w-3 h-3" style={{ color: "var(--app-text-tertiary)" }} />
                              )}
                            </span>
                          )}
                          <span
                            className="text-[10px] flex-shrink-0"
                            style={{ color: "var(--app-text-tertiary)" }}
                          >
                            {formatRelative(conv.updatedAt).replace("大约 ", "")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-xs truncate flex-1",
                            conv.unreadCount > 0 && !isActive
                              ? "font-medium"
                              : ""
                          )}
                          style={{
                            color:
                              conv.unreadCount > 0 && !isActive
                                ? "var(--app-text-primary)"
                                : "var(--app-text-secondary)",
                          }}
                        >
                          {isOwnLast && (
                            <span style={{ color: "var(--app-text-tertiary)" }}>我: </span>
                          )}
                          {conv.lastMessage.type === "system"
                            ? "[系统消息]"
                            : conv.lastMessage.type === "image"
                            ? "[图片]"
                            : conv.lastMessage.content}
                        </p>
                        {conv.unreadCount > 0 && !isActive && (
                          <Badge variant="danger" size="sm" count={conv.unreadCount} />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12">
              <Empty
                type="search"
                title="未找到会话"
                description="尝试使用其他关键词搜索"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col h-full">
        {activeConversation && otherUser ? (
          <>
            <div
              className="flex-shrink-0 border-b vibrant-toolbar px-4 py-3 flex items-center justify-between"
              style={{ borderBottomColor: "var(--app-border)" }}
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {}}
              >
                <Avatar
                  src={otherUser.avatar}
                  name={otherUser.nickname}
                  size="md"
                  ring
                  online={otherUser.isOnline}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--app-text-primary)" }}
                    >
                      {otherUser.nickname}
                    </h3>
                    <Badge variant="primary" size="sm">
                      Lv.{otherUser.level}
                    </Badge>
                  </div>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--app-text-secondary)" }}
                  >
                    {otherUser.isOnline ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--app-success)" }} />
                        在线
                      </span>
                    ) : (
                      `最后在线 ${formatRelative(otherUser.createdAt)}`
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="icon" size="sm" title="语音通话">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="icon" size="sm" title="视频通话">
                  <Video className="w-4 h-4" />
                </Button>
                <Dropdown
                  trigger={
                    <Button variant="icon" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  }
                  items={[
                    {
                      key: "search",
                      label: "搜索聊天记录",
                      icon: <Search className="w-4 h-4" />,
                    },
                    {
                      key: "mute",
                      label: messagesData[activeConversation.id]?.length % 2 === 0 ? "消息免打扰" : "取消免打扰",
                      icon: messagesData[activeConversation.id]?.length % 2 === 0 ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      ),
                    },
                    {
                      key: "pin",
                      label: activeConversation.pinned ? "取消置顶" : "置顶会话",
                      icon: <Pin className="w-4 h-4" />,
                    },
                    { key: "divider1", label: "", divider: true },
                    {
                      key: "block",
                      label: `屏蔽 ${otherUser.nickname}`,
                      icon: <UserMinus className="w-4 h-4" />,
                      danger: true,
                      onClick: () => {
                        if (confirm(`确定要屏蔽 ${otherUser.nickname} 吗？屏蔽后将不会再收到该用户的消息。`)) {
                          toggleBlockUser(otherUser.id, otherUser.nickname);
                        }
                      },
                    },
                    {
                      key: "report",
                      label: "举报用户",
                      icon: <Flag className="w-4 h-4" />,
                      danger: true,
                    },
                  ] as DropdownItem[]}
                  placement="bottom-right"
                />
              </div>
            </div>

            <div
              className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4"
              style={{ background: "var(--app-bg)" }}
            >
              <div
                className="text-center text-[10px] py-2"
                style={{ color: "var(--app-text-tertiary)" }}
              >
                —— 以上是历史消息 ——
              </div>

              {messages.map((msg, idx) => {
                const showTimestamp =
                  idx === 0 ||
                  Math.abs(
                    new Date(msg.createdAt).getTime() -
                      new Date(messages[idx - 1].createdAt).getTime()
                  ) > 300000;

                if (msg.type === "system") {
                  return (
                    <div key={msg.id} className="text-center">
                      {showTimestamp && (
                        <div
                          className="text-[10px] mb-2"
                          style={{ color: "var(--app-text-tertiary)" }}
                        >
                          {formatTime(msg.createdAt)}
                        </div>
                      )}
                      <span
                        className="inline-block text-[10px] px-3 py-1 rounded-full"
                        style={{
                          background: "var(--app-surface-secondary)",
                          color: "var(--app-text-tertiary)",
                        }}
                      >
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                const own = isOwnMessage(msg);
                const sender = USERS.find((u) => u.id === msg.senderId);

                return (
                  <div key={msg.id}>
                    {showTimestamp && (
                      <div
                        className="text-center text-[10px] mb-2"
                        style={{ color: "var(--app-text-tertiary)" }}
                      >
                        {formatTime(msg.createdAt)}
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex items-end gap-2 group",
                        own ? "justify-end" : "justify-start"
                      )}
                    >
                      {!own && sender && (
                        <Avatar
                          src={sender.avatar}
                          name={sender.nickname}
                          size="sm"
                          className="flex-shrink-0"
                        />
                      )}

                      <div
                        className={cn(
                          "relative max-w-[70%] group-hover:opacity-100"
                        )}
                      >
                        <div
                          className={cn(
                            "inline-block px-4 py-2.5 rounded-2xl text-sm break-words",
                            own
                              ? "text-white shadow-sm"
                              : ""
                          )}
                          style={{
                            background: own
                              ? "linear-gradient(180deg, var(--app-accent) 0%, var(--app-accent-hover) 100%)"
                              : "var(--app-surface)",
                            color: own ? "#fff" : "var(--app-text-primary)",
                            borderTopRightRadius: own ? "6px" : "2xl",
                            borderTopLeftRadius: own ? "2xl" : "6px",
                          }}
                        >
                          {msg.type === "image" ? (
                            <img
                              src={msg.content}
                              alt="图片"
                              className="max-w-[240px] rounded-lg"
                            />
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}
                        </div>

                        {own && (
                          <div
                            className={cn(
                              "absolute -bottom-4 right-0 text-[10px] flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                              "pr-1"
                            )}
                          >
                            {isRead(msg) ? (
                              <>
                                <CheckCheck className="w-3 h-3" style={{ color: "var(--app-accent)" }} />
                                <span style={{ color: "var(--app-accent)" }}>已读</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3" style={{ color: "var(--app-text-tertiary)" }} />
                                <span style={{ color: "var(--app-text-tertiary)" }}>未读</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingUserId && typingUserId === otherUser.id && (
                <div className="flex items-end gap-2">
                  <Avatar
                    src={otherUser.avatar}
                    name={otherUser.nickname}
                    size="sm"
                  />
                  <div
                    className="px-4 py-3 rounded-2xl inline-flex items-center gap-1"
                    style={{
                      background: "var(--app-surface)",
                      borderTopLeftRadius: "6px",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        background: "var(--app-text-tertiary)",
                        animationDelay: "0ms",
                      }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        background: "var(--app-text-tertiary)",
                        animationDelay: "150ms",
                      }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        background: "var(--app-text-tertiary)",
                        animationDelay: "300ms",
                      }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div
              className="flex-shrink-0 border-t vibrant-toolbar px-4 py-3"
              style={{ borderTopColor: "var(--app-border)" }}
            >
              <div className="flex items-end gap-2">
                <div className="flex items-center gap-1 flex-shrink-0 pb-2">
                  <button
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className={cn(
                      "w-8 h-8 rounded-md flex items-center justify-center transition-all",
                      "hover:bg-black/5 dark:hover:bg-white/5",
                      showEmoji && "bg-black/5 dark:bg-white/5"
                    )}
                    style={{ color: "var(--app-text-secondary)" }}
                    title="表情"
                  >
                    <Smile className="w-4.5 h-4.5" />
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-md flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: "var(--app-text-secondary)" }}
                    title="图片"
                  >
                    <Image className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`发送消息给 ${otherUser.nickname}... (Enter 发送, Shift+Enter 换行)`}
                    rows={1}
                    className="mac-input resize-none py-2.5 pr-12"
                    style={{ minHeight: "40px", maxHeight: "120px" }}
                  />
                  <div
                    className="absolute right-3 bottom-2.5 text-[10px]"
                    style={{ color: "var(--app-text-tertiary)" }}
                  >
                    {inputValue.length}
                  </div>

                  {showEmoji && (
                    <div
                      className="absolute bottom-full right-0 mb-2 p-2 rounded-xl shadow-mac-lg grid grid-cols-8 gap-1"
                      style={{
                        background: "var(--app-surface)",
                        border: "1px solid var(--app-border)",
                      }}
                    >
                      {["😀", "😂", "🥰", "😎", "🤔", "😭", "😡", "👍", "👏", "🎉", "❤️", "🔥", "💯", "✨", "🙏", "😅"].map(
                        (emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                              setInputValue(inputValue + emoji);
                              setShowEmoji(false);
                              inputRef.current?.focus();
                            }}
                            className="w-8 h-8 flex items-center justify-center text-lg rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            {emoji}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  disabled={!inputValue.trim()}
                  onClick={handleSend}
                  className="h-10"
                  style={{ height: "40px" }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ background: "var(--app-bg)" }}>
            <div className="text-center max-w-sm px-8">
              <div
                className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: "var(--app-surface-secondary)" }}
              >
                <MessageSquare
                  className="w-12 h-12"
                  style={{ color: "var(--app-text-tertiary)" }}
                  strokeWidth={1.5}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--app-text-primary)" }}
              >
                选择一个会话开始聊天
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--app-text-secondary)" }}
              >
                从左侧列表选择一个对话，或创建新的会话与其他果友交流
              </p>
              <Button
                variant="primary"
                leftIcon={<Users className="w-4 h-4" />}
                onClick={() => {}}
              >
                开始新对话
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
