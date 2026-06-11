import { cn } from "@/lib/utils";
import { Inbox, Search, FileX, MessageSquare, Heart, Users, type LucideIcon } from "lucide-react";
import Button from "./Button";

type EmptyType = "default" | "search" | "posts" | "messages" | "favorites" | "users" | "error";

const iconMap: Record<EmptyType, LucideIcon> = {
  default: Inbox,
  search: Search,
  posts: FileX,
  messages: MessageSquare,
  favorites: Heart,
  users: Users,
  error: FileX,
};

const titleMap: Record<EmptyType, string> = {
  default: "暂无内容",
  search: "未找到匹配结果",
  posts: "还没有帖子",
  messages: "没有对话记录",
  favorites: "收藏夹是空的",
  users: "暂无用户",
  error: "加载失败",
};

const descMap: Record<EmptyType, string> = {
  default: "这里还什么都没有，稍后再来看看吧",
  search: "试试使用不同的关键词或调整筛选条件",
  posts: "快来发布第一篇帖子吧",
  messages: "开始一段对话，和大家打个招呼",
  favorites: "点击帖子的收藏按钮将内容保存到这里",
  users: "该区域暂时没有用户数据",
  error: "加载数据时出现了问题，请稍后重试",
};

interface EmptyProps {
  type?: EmptyType;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function Empty({
  type = "default",
  title,
  description,
  icon: IconProp,
  actionLabel,
  onAction,
  className,
}: EmptyProps) {
  const Icon = IconProp ?? iconMap[type];

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: "var(--app-surface-secondary)" }}
      >
        <Icon
          className="w-8 h-8"
          style={{ color: "var(--app-text-tertiary)" }}
          strokeWidth={1.5}
        />
      </div>
      <h3
        className="text-base font-semibold mb-1.5"
        style={{ color: "var(--app-text-primary)" }}
      >
        {title ?? titleMap[type]}
      </h3>
      <p
        className="text-sm mb-6 max-w-xs"
        style={{ color: "var(--app-text-secondary)" }}
      >
        {description ?? descMap[type]}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
