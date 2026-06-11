import type {
  User,
  Category,
  Tag,
  Post,
  Reply,
  Conversation,
  Message,
  FavoriteGroup,
  FavoriteItem,
  Notification,
  Draft,
  Badge,
} from "@/types";

const now = Date.now();
const days = (n: number) => new Date(now - n * 86400000).toISOString();
const hours = (n: number) => new Date(now - n * 3600000).toISOString();
const mins = (n: number) => new Date(now - n * 60000).toISOString();

export const BADGES: Badge[] = [
  { id: "b1", name: "版主", icon: "Shield", color: "#34C759" },
  { id: "b2", name: "贡献者", icon: "Star", color: "#FF9500" },
  { id: "b3", name: "苹果认证", icon: "Award", color: "#007AFF" },
  { id: "b4", name: "老用户", icon: "Medal", color: "#AF52DE" },
  { id: "b5", name: "热心解答", icon: "Heart", color: "#FF2D55" },
];

export const CURRENT_USER: User = {
  id: "u0",
  username: "applefan_2024",
  nickname: "果粉小王",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wang",
  signature: "MacBook Pro 14\" M3 Pro · macOS 14.4 Sonoma",
  level: 12,
  macModel: "MacBook Pro 14\" M3 Pro",
  osVersion: "macOS 14.4 Sonoma",
  postCount: 156,
  replyCount: 892,
  followerCount: 2341,
  followingCount: 128,
  createdAt: days(520),
  badges: [BADGES[1], BADGES[4]],
  isOnline: true,
};

const makeUser = (id: string, name: string, seed: string, level: number, mac?: string, os?: string, badges?: number[]): User => ({
  id,
  username: `user_${id}`,
  nickname: name,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
  signature: level > 5 ? `热爱技术，享受生活 | ${mac || ""}` : "",
  level,
  macModel: mac,
  osVersion: os,
  postCount: Math.floor(Math.random() * 500),
  replyCount: Math.floor(Math.random() * 2000),
  followerCount: Math.floor(Math.random() * 10000),
  followingCount: Math.floor(Math.random() * 500),
  createdAt: days(Math.floor(Math.random() * 1000)),
  badges: badges ? badges.map((i) => BADGES[i]) : [],
  isOnline: Math.random() > 0.6,
});

export const USERS: User[] = [
  CURRENT_USER,
  makeUser("u1", "开发者老张", "zhang", 28, 'MacBook Pro 16" M3 Max', "macOS 15 Sequoia", [0, 2]),
  makeUser("u2", "Swift小美", "mei", 18, 'MacBook Air 15" M3', "macOS 14.4", [1, 3]),
  makeUser("u3", "Hackintosh达人", "hack", 22, "i7-13700K + RX 6600", "macOS 14.3", [2]),
  makeUser("u4", "设计狮阿Jay", "jay", 15, 'iMac 24" M3', "macOS 14.4", [4]),
  makeUser("u5", "数码评测君", "review", 35, "全部 Mac 系列", "macOS 15 Beta", [0, 1, 2]),
  makeUser("u6", "终端党老李", "li", 19, 'Mac Mini M2 Pro', "macOS 14.4", [3, 4]),
  makeUser("u7", "新手小苹果", "newbie", 3, 'MacBook Air 13" M2', "macOS 14.0"),
  makeUser("u8", "音乐制作人", "music", 25, 'Mac Pro M2 Ultra', "macOS 14.4", [1]),
  makeUser("u9", "效率工具控", "tools", 16, 'MacBook Pro 14" M2 Pro', "macOS 14.3", [4]),
];

export const CATEGORIES: Category[] = [
  {
    id: "c1",
    name: "新手入门",
    icon: "BookOpen",
    description: "欢迎新果友，Mac 基础使用教程、常见问题解答",
    postCount: 12456,
    unreadCount: 23,
    moderators: ["u1", "u7"],
    rules: "请先阅读置顶帖，提问前先搜索",
  },
  {
    id: "c2",
    name: "系统讨论",
    icon: "Layers",
    description: "macOS 各个版本讨论、更新日志、Bug 反馈",
    postCount: 45678,
    unreadCount: 156,
    moderators: ["u5"],
    children: [
      { id: "c21", name: "macOS 15 Sequoia", icon: "Sparkles", parentId: "c2", postCount: 8923, unreadCount: 89, moderators: ["u5"] },
      { id: "c22", name: "macOS 14 Sonoma", icon: "Mountain", parentId: "c2", postCount: 15678, unreadCount: 67, moderators: ["u1"] },
      { id: "c23", name: "历史版本归档", icon: "Archive", parentId: "c2", postCount: 21077, unreadCount: 0, moderators: [] },
    ],
  },
  {
    id: "c3",
    name: "硬件外设",
    icon: "Monitor",
    description: "Mac 硬件评测、选购指南、外设推荐",
    postCount: 34567,
    unreadCount: 89,
    moderators: ["u5", "u4"],
    children: [
      { id: "c31", name: "MacBook 系列", icon: "Laptop", parentId: "c3", postCount: 18234, unreadCount: 45, moderators: ["u5"] },
      { id: "c32", name: "iMac / Mac mini", icon: "MonitorSmartphone", parentId: "c3", postCount: 7890, unreadCount: 23, moderators: [] },
      { id: "c33", name: "Mac Studio / Pro", icon: "Server", parentId: "c3", postCount: 3456, unreadCount: 12, moderators: ["u8"] },
      { id: "c34", name: "外设配件", icon: "Keyboard", parentId: "c3", postCount: 4987, unreadCount: 9, moderators: [] },
    ],
  },
  {
    id: "c4",
    name: "开发技术",
    icon: "Code2",
    description: "Swift / Objective-C / Xcode 开发",
    postCount: 67890,
    unreadCount: 234,
    moderators: ["u1", "u2"],
    children: [
      { id: "c41", name: "Swift / SwiftUI", icon: "Zap", parentId: "c4", postCount: 23456, unreadCount: 123, moderators: ["u2"] },
      { id: "c42", name: "Xcode 开发", icon: "FileCode", parentId: "c4", postCount: 15678, unreadCount: 56, moderators: ["u1"] },
      { id: "c43", name: "App 上架审核", icon: "CheckCircle2", parentId: "c4", postCount: 8901, unreadCount: 34, moderators: [] },
      { id: "c44", name: "跨平台开发", icon: "Globe", parentId: "c4", postCount: 12345, unreadCount: 21, moderators: [] },
      { id: "c45", name: "Hackintosh", icon: "Wrench", parentId: "c4", postCount: 7510, unreadCount: 0, moderators: ["u3"] },
    ],
  },
  {
    id: "c5",
    name: "软件分享",
    icon: "Package",
    description: "精品 Mac 软件推荐、限免资讯",
    postCount: 23456,
    unreadCount: 67,
    moderators: ["u9"],
  },
  {
    id: "c6",
    name: "创意设计",
    icon: "Palette",
    description: "Final Cut Pro / Logic Pro / Adobe 全家桶",
    postCount: 18765,
    unreadCount: 45,
    moderators: ["u4", "u8"],
  },
  {
    id: "c7",
    name: "交易市场",
    icon: "ShoppingBag",
    description: "二手 Mac 交易、以物换物",
    postCount: 12345,
    unreadCount: 12,
    moderators: [],
  },
  {
    id: "c8",
    name: "闲聊灌水",
    icon: "Coffee",
    description: "自由讨论区，话题不限",
    postCount: 98765,
    unreadCount: 456,
    moderators: [],
  },
];

const COLORS = ["#007AFF", "#FF9500", "#FF2D55", "#34C759", "#AF52DE", "#30B0C7", "#5856D6"];

export const TAGS: Tag[] = [
  { id: "t1", name: "M3 芯片", color: COLORS[0], hot: true, postCount: 3456 },
  { id: "t2", name: "macOS 15", color: COLORS[3], hot: true, postCount: 8923 },
  { id: "t3", name: "SwiftUI", color: COLORS[6], hot: true, postCount: 5678 },
  { id: "t4", name: "续航测试", color: COLORS[1], hot: true, postCount: 1234 },
  { id: "t5", name: "开发经验", color: COLORS[4], hot: false, postCount: 4567 },
  { id: "t6", name: "选购建议", color: COLORS[5], hot: true, postCount: 2345 },
  { id: "t7", name: "Xcode 16", color: COLORS[2], hot: false, postCount: 890 },
  { id: "t8", name: "外接显示器", color: COLORS[0], hot: false, postCount: 1567 },
  { id: "t9", name: "键盘手感", color: COLORS[1], hot: false, postCount: 789 },
  { id: "t10", name: "PD 虚拟机", color: COLORS[3], hot: true, postCount: 2890 },
  { id: "t11", name: "系统优化", color: COLORS[5], hot: false, postCount: 3421 },
  { id: "t12", name: "数据迁移", color: COLORS[6], hot: false, postCount: 456 },
];

const SAMPLE_MD = `# 欢迎来到 Mac 论坛 🎉

这是一篇示例帖子，展示 **Markdown 渲染** 的各种效果。

## 代码示例

\`\`\`swift
import SwiftUI

struct ContentView: View {
    @State private var count = 0
    
    var body: some View {
        VStack(spacing: 16) {
            Text("点击次数: \\(count)")
                .font(.title)
            
            Button("点我 +1") {
                count += 1
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}
\`\`\`

## 引用块

> **提示**：升级 macOS 前请务必备份重要数据，推荐使用 Time Machine。
> 
> —— 来自版主的温馨提醒

## 列表

### 购买建议清单

1. **明确需求**：办公 / 开发 / 设计？
2. **预算范围**：根据性能需求合理分配
3. **配置选项**：
   - 内存至少 16GB 起步
   - 存储建议 512GB 以上
   - AppleCare+ 值得购买

## 表格

| 机型 | 基础配置 | 升级建议 | 参考价格 |
|------|---------|---------|---------|
| MacBook Air 13" M3 | 8GB + 256GB | 16GB + 512GB | ¥8,999 起 |
| MacBook Pro 14" M3 Pro | 18GB + 512GB | 36GB + 1TB | ¥16,999 起 |
| MacBook Pro 16" M3 Max | 36GB + 1TB | 64GB + 2TB | ¥27,999 起 |

## 任务清单

- [x] 开箱验机
- [x] 初始化设置
- [x] 迁移数据
- [ ] 安装常用软件
- [ ] 购买 AppleCare+

## 结语

希望这篇帖子对你有帮助！如有疑问欢迎在下方评论区讨论 💬`;

const makePost = (
  id: string,
  title: string,
  authorIdx: number,
  catIdx: number,
  tagIdxs: number[],
  opts: Partial<Post> = {}
): Post => ({
  id,
  title,
  content: opts.content || SAMPLE_MD,
  authorId: USERS[authorIdx].id,
  author: USERS[authorIdx],
  categoryId: CATEGORIES[catIdx].id,
  category: CATEGORIES[catIdx],
  tags: tagIdxs.map((i) => TAGS[i]),
  isPinned: opts.isPinned || false,
  isEssence: opts.isEssence || false,
  viewCount: Math.floor(Math.random() * 50000) + 100,
  likeCount: Math.floor(Math.random() * 500),
  replyCount: Math.floor(Math.random() * 200),
  favoriteCount: Math.floor(Math.random() * 100),
  osVersion: opts.osVersion,
  macModel: opts.macModel,
  images: opts.images || [],
  createdAt: opts.createdAt || days(Math.floor(Math.random() * 30)),
  updatedAt: opts.updatedAt || days(Math.floor(Math.random() * 10)),
  lastReplyAt: opts.lastReplyAt || hours(Math.floor(Math.random() * 48)),
  isLiked: false,
  isFavorited: false,
  ...opts,
});

export const POSTS: Post[] = [
  makePost("p1", "【置顶】Mac 论坛新手入门指南 · 2024 版", 1, 0, [4, 5], {
    isPinned: true,
    isEssence: true,
    viewCount: 125678,
    likeCount: 3456,
    replyCount: 567,
    favoriteCount: 8901,
    createdAt: days(500),
    updatedAt: days(5),
  }),
  makePost("p2", "【置顶】发帖规范与社区公约（必看）", 5, 7, [], {
    isPinned: true,
    viewCount: 98765,
    likeCount: 1234,
    replyCount: 234,
    createdAt: days(800),
    updatedAt: days(30),
  }),
  makePost("p3", "从 Intel 换到 M3 Max，一周使用体验分享", 1, 2, [0, 3, 5], {
    isEssence: true,
    osVersion: "macos-15",
    macModel: "mbp-16-m3",
    viewCount: 23456,
    likeCount: 456,
    replyCount: 89,
    favoriteCount: 234,
    createdAt: days(3),
  }),
  makePost("p4", "macOS 15 Sequoia Beta 3 更新了什么？详细测评", 5, 1, [1], {
    isEssence: true,
    osVersion: "macos-15",
    viewCount: 45678,
    likeCount: 890,
    replyCount: 234,
    favoriteCount: 567,
    createdAt: hours(36),
  }),
  makePost("p5", "SwiftUI 实战：从零构建一款 macOS 菜单栏 App", 2, 3, [2, 6], {
    isEssence: true,
    viewCount: 12345,
    likeCount: 345,
    replyCount: 67,
    favoriteCount: 1234,
    createdAt: days(7),
  }),
  makePost("p6", "纠结 MacBook Air M3 选 15 还是 13 寸？看完这篇就明白了", 4, 2, [0, 5], {
    osVersion: "macos-14",
    macModel: "mba-15-m3",
    viewCount: 34567,
    likeCount: 567,
    replyCount: 145,
    favoriteCount: 456,
    createdAt: days(1),
  }),
  makePost("p7", "Hackintosh 最新 EFI 分享：13 代酷睿 + RX 6600 完美 Sonoma", 3, 4, [10], {
    osVersion: "macos-14",
    viewCount: 7890,
    likeCount: 234,
    replyCount: 89,
    favoriteCount: 567,
    createdAt: days(5),
  }),
  makePost("p8", "新手求助：Time Machine 备份速度太慢怎么办？", 7, 0, [10, 11], {
    osVersion: "macos-14",
    macModel: "mba-13-m3",
    viewCount: 3456,
    likeCount: 12,
    replyCount: 45,
    createdAt: hours(8),
  }),
  makePost("p9", "Final Cut Pro 11 体验：AI 功能真香，但还有这些槽点", 4, 5, [], {
    macModel: "mbp-16-m3",
    viewCount: 15678,
    likeCount: 321,
    replyCount: 78,
    favoriteCount: 189,
    createdAt: days(2),
  }),
  makePost("p10", "iMac 24\" M3 评测：颜值即正义，但不适合这几类人", 5, 1, [0, 5], {
    osVersion: "macos-14",
    macModel: "imac-24-m3",
    viewCount: 28901,
    likeCount: 432,
    replyCount: 112,
    favoriteCount: 298,
    createdAt: days(4),
  }),
  makePost("p11", "Mac Studio M2 Ultra 对比 Mac Pro：差距到底在哪里？", 8, 2, [5], {
    macModel: "mac-studio-m2",
    viewCount: 19876,
    likeCount: 287,
    replyCount: 95,
    favoriteCount: 234,
    createdAt: days(8),
  }),
  makePost("p12", "推荐 10 款提升效率的 macOS 菜单栏工具（2024 年度精选）", 9, 4, [10], {
    viewCount: 56789,
    likeCount: 1234,
    replyCount: 234,
    favoriteCount: 5678,
    createdAt: hours(48),
  }),
  makePost("p13", "MacBook 键盘进液了怎么办？一步步教你自救", 6, 2, [9], {
    macModel: "mbp-14-m2",
    viewCount: 8765,
    likeCount: 156,
    replyCount: 67,
    favoriteCount: 432,
    createdAt: days(10),
  }),
  makePost("p14", "外接 4K 显示器模糊？一招搞定 HiDPI 缩放", 1, 3, [8, 10], {
    viewCount: 23456,
    likeCount: 567,
    replyCount: 134,
    favoriteCount: 890,
    createdAt: hours(60),
  }),
  makePost("p15", "Parallels Desktop 20 深度评测：跑 Windows 11 流畅度惊人", 5, 4, [10], {
    viewCount: 34567,
    likeCount: 678,
    replyCount: 189,
    favoriteCount: 789,
    createdAt: days(12),
  }),
];

const makeReply = (
  id: string,
  postId: string,
  floor: number,
  authorIdx: number,
  content: string,
  opts: Partial<Reply> = {}
): Reply => ({
  id,
  postId,
  floor,
  content,
  authorId: USERS[authorIdx].id,
  author: USERS[authorIdx],
  replyToId: opts.replyToId,
  replyToFloor: opts.replyToFloor,
  replyToAuthor: opts.replyToAuthor,
  mentions: opts.mentions || [],
  likeCount: opts.likeCount || Math.floor(Math.random() * 50),
  images: opts.images || [],
  createdAt: opts.createdAt || hours(Math.floor(Math.random() * 24)),
  isLiked: false,
  ...opts,
});

export const REPLIES: Record<string, Reply[]> = {
  p3: [
    makeReply("r1", "p3", 1, 2, "M3 Max 确实猛！我也是刚从 i9 换过来，编译速度快了 5 倍 😭 终于不用再等 Xcode 编译了", {
      likeCount: 123,
      createdAt: hours(2),
    }),
    makeReply("r2", "p3", 2, 4, "羡慕大佬！想问下散热怎么样？长时间高负载会降频吗？", {
      replyToId: "r1",
      replyToFloor: 1,
      replyToAuthor: USERS[2],
      likeCount: 45,
      createdAt: hours(3),
    }),
    makeReply("r3", "p3", 3, 1, "@Swift小美 说实话 16 寸的散热真的不用担心，我连续编译三个小时 CPU 也才 85 度，风扇几乎听不到", {
      mentions: ["u2"],
      likeCount: 78,
      createdAt: hours(4),
    }),
    makeReply("r4", "p3", 4, 6, "恭喜提机！想问问迁移数据花了多久？我 2TB 的数据还没敢动呢", {
      likeCount: 23,
      createdAt: hours(5),
    }),
    makeReply("r5", "p3", 5, 9, "续航怎么样？这代 M3 Max 能效比提升明显吗？", {
      likeCount: 56,
      createdAt: hours(6),
    }),
    makeReply("r6", "p3", 6, 5, "作为连续 10 年用 Mac 的老用户，我想说苹果芯片这几年真的太猛了。我 2020 年的 M1 到现在还是主力机，完全没有升级欲望", {
      isEssence: true,
      likeCount: 234,
      createdAt: hours(8),
    }),
    makeReply("r7", "p3", 7, 3, "只有我关心能不能跑黑苹果吗哈哈哈", {
      likeCount: 12,
      createdAt: hours(10),
    }),
    makeReply("r8", "p3", 8, 8, "跑逻辑跑大型项目稳定吗？正准备入一台做音乐", {
      likeCount: 34,
      createdAt: hours(12),
    }),
    makeReply("r9", "p3", 9, 7, "看了看自己口袋里的 M1 Air……感觉还能再战三年😂", {
      likeCount: 89,
      createdAt: hours(15),
    }),
    makeReply("r10", "p3", 10, 2, "@开发者老张 同 M1！感觉日常开发完全够用，就是 8GB 内存有时候不够用了", {
      replyToId: "r9",
      replyToFloor: 9,
      replyToAuthor: USERS[7],
      mentions: ["u1"],
      likeCount: 45,
      createdAt: mins(30),
    }),
  ],
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    participants: [CURRENT_USER, USERS[2]],
    lastMessage: {
      id: "m1",
      conversationId: "conv1",
      senderId: "u2",
      content: "好的！那我代码写好后发你帮忙 review 一下 👍",
      type: "text",
      readBy: ["u2"],
      createdAt: mins(5),
    },
    unreadCount: 2,
    pinned: true,
    updatedAt: mins(5),
  },
  {
    id: "conv2",
    participants: [CURRENT_USER, USERS[4]],
    lastMessage: {
      id: "m2",
      conversationId: "conv2",
      senderId: "u0",
      content: "收到，我参考下你的配置清单",
      type: "text",
      readBy: ["u0", "u4"],
      createdAt: hours(3),
    },
    unreadCount: 0,
    pinned: true,
    updatedAt: hours(3),
  },
  {
    id: "conv3",
    participants: [CURRENT_USER, USERS[1]],
    lastMessage: {
      id: "m3",
      conversationId: "conv3",
      senderId: "u1",
      content: "周末有空一起去 Apple Store 体验下 Vision Pro 吗？",
      type: "text",
      readBy: ["u1"],
      createdAt: hours(8),
    },
    unreadCount: 1,
    pinned: false,
    updatedAt: hours(8),
  },
  {
    id: "conv4",
    participants: [CURRENT_USER, USERS[5]],
    lastMessage: {
      id: "m4",
      conversationId: "conv4",
      senderId: "u5",
      content: "评测的图片我已经整理好了，晚点发你链接",
      type: "text",
      readBy: ["u0", "u5"],
      createdAt: days(1),
    },
    unreadCount: 0,
    pinned: false,
    updatedAt: days(1),
  },
  {
    id: "conv5",
    participants: [CURRENT_USER, USERS[7]],
    lastMessage: {
      id: "m5",
      conversationId: "conv5",
      senderId: "u7",
      content: "求助！我的 Mac 开不了机了呜呜呜",
      type: "text",
      readBy: ["u7"],
      createdAt: hours(5),
    },
    unreadCount: 3,
    pinned: false,
    updatedAt: hours(5),
  },
];

const makeMsg = (id: string, cid: string, senderId: string, content: string, minsAgo: number): Message => ({
  id,
  conversationId: cid,
  senderId,
  content,
  type: "text",
  readBy: senderId === "u0" ? [senderId] : [senderId, "u0"],
  createdAt: mins(minsAgo),
});

export const MESSAGES: Record<string, Message[]> = {
  conv1: [
    makeMsg("m1-1", "conv1", "u2", "嘿！在吗？有个 SwiftUI 的问题想请教", 120),
    makeMsg("m1-2", "conv1", "u0", "在的，你说～", 115),
    makeMsg("m1-3", "conv1", "u2", "就是用 NavigationSplitView 在 macOS 上怎么自定义 sidebar 的宽度呀？", 110),
    makeMsg("m1-4", "conv1", "u0", "你可以试试 .navigationSplitViewColumnWidth(min:ideal:max:) modifier", 100),
    makeMsg("m1-5", "conv1", "u2", "哇塞可以了！感谢大佬 🙏", 90),
    makeMsg("m1-6", "conv1", "u2", "对了，上次你说的那个开源项目，我想一起贡献代码可以吗？", 60),
    makeMsg("m1-7", "conv1", "u0", "当然欢迎啊！我晚上把 GitHub 链接发你", 45),
    makeMsg("m1-8", "conv1", "u2", "好的！那我代码写好后发你帮忙 review 一下 👍", 5),
  ],
  conv3: [
    makeMsg("m3-1", "conv3", "u1", "上周一起讨论的那个新项目，我已经把 PRD 初稿写出来了", 24 * 60 + 120),
    makeMsg("m3-2", "conv3", "u0", "效率高啊！发我看看", 24 * 60 + 100),
    makeMsg("m3-3", "conv3", "u1", "【链接】", 24 * 60 + 90),
    makeMsg("m3-4", "conv3", "u0", "整体思路不错，我有几点小建议晚点整理给你", 24 * 60 + 60),
    makeMsg("m3-5", "conv3", "u1", "周末有空一起去 Apple Store 体验下 Vision Pro 吗？", 8 * 60),
  ],
};

export const FAVORITE_GROUPS: FavoriteGroup[] = [
  { id: "fg1", name: "全部收藏", color: "#007AFF", order: 0, itemCount: 156, description: "所有收藏内容", createdAt: days(500) },
  { id: "fg2", name: "开发教程", color: "#34C759", order: 1, itemCount: 45, description: "Swift / Xcode 相关", createdAt: days(480) },
  { id: "fg3", name: "选购参考", color: "#FF9500", order: 2, itemCount: 32, description: "硬件选购和评测", createdAt: days(400) },
  { id: "fg4", name: "系统技巧", color: "#5856D6", order: 3, itemCount: 28, description: "macOS 使用技巧", createdAt: days(350) },
  { id: "fg5", name: "软件推荐", color: "#AF52DE", order: 4, itemCount: 51, description: "精品 Mac 软件", createdAt: days(300) },
];

export const FAVORITE_ITEMS: FavoriteItem[] = [
  { id: "fi1", groupId: "fg2", targetType: "post", targetId: "p5", target: POSTS[4], addedAt: days(2), starred: true, statusUpdatedAt: days(1) },
  { id: "fi2", groupId: "fg3", targetType: "post", targetId: "p6", target: POSTS[5], addedAt: days(1), readLater: true, statusUpdatedAt: hours(12) },
  { id: "fi3", groupId: "fg1", targetType: "post", targetId: "p12", target: POSTS[11], addedAt: hours(12) },
  { id: "fi4", groupId: "fg4", targetType: "post", targetId: "p14", target: POSTS[13], addedAt: hours(8), starred: true, readLater: true, statusUpdatedAt: hours(6) },
  { id: "fi5", groupId: "fg5", targetType: "post", targetId: "p12", target: POSTS[11], addedAt: hours(6), archived: true, statusUpdatedAt: hours(2) },
  { id: "fi6", groupId: "fg3", targetType: "post", targetId: "p10", target: POSTS[9], addedAt: days(4) },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "reply",
    targetId: "p3",
    fromUserId: "u2",
    fromUser: USERS[2],
    title: "Swift小美 回复了你的帖子",
    content: "M3 Max 确实猛！我也是刚从 i9 换过来...",
    read: false,
    createdAt: mins(30),
  },
  {
    id: "n2",
    type: "mention",
    targetId: "p3",
    fromUserId: "u1",
    fromUser: USERS[1],
    title: "开发者老张 在帖子中 @了你",
    content: "@果粉小王 你觉得这台配置怎么样？",
    read: false,
    createdAt: hours(2),
  },
  {
    id: "n3",
    type: "like",
    targetId: "p5",
    fromUserId: "u5",
    fromUser: USERS[5],
    title: "数码评测君 赞了你的回复",
    content: "说得好！观点很专业",
    read: false,
    createdAt: hours(4),
  },
  {
    id: "n4",
    type: "message",
    fromUserId: "u7",
    fromUser: USERS[7],
    title: "新手小苹果 给你发了私信",
    content: "求助！我的 Mac 开不了机了呜呜呜",
    read: false,
    createdAt: hours(5),
  },
  {
    id: "n5",
    type: "like",
    targetId: "p1",
    fromUserId: "u4",
    fromUser: USERS[4],
    title: "设计狮阿Jay 赞了你的帖子",
    content: "新手入门指南 · 2024 版",
    read: true,
    createdAt: hours(10),
  },
  {
    id: "n6",
    type: "system",
    title: "系统公告",
    content: "论坛将于本周六凌晨 2:00-4:00 进行服务器维护升级",
    read: true,
    createdAt: days(2),
  },
  {
    id: "n7",
    type: "reply",
    targetId: "p5",
    fromUserId: "u9",
    fromUser: USERS[9],
    title: "效率工具控 回复了你的教程帖",
    content: "代码写得太优雅了，学到了！",
    read: true,
    createdAt: days(3),
  },
];

export const DRAFTS: Draft[] = [
  {
    id: "d1",
    title: "2024 年 Mac 开发者环境配置指北",
    content: "## 前言\n\n作为一名资深 Mac 开发者，今天想和大家分享一下我的开发环境配置...",
    categoryId: "c41",
    tagIds: ["t2", "t5"],
    images: [],
    osVersion: "macos-14",
    macModel: "mbp-14-m3",
    savedAt: hours(2),
    autoSaved: true,
  },
  {
    id: "d2",
    title: "",
    content: "想问下大家，MacBook Air M2 升级 macOS 14.4 后续航...",
    categoryId: "c1",
    tagIds: ["t10"],
    images: [],
    savedAt: days(1),
    autoSaved: true,
  },
];
