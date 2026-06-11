import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/stores/appStore";
import { useToast } from "@/stores/toastStore";
import { CATEGORIES, TAGS, DRAFTS } from "@/mock";
import { OS_VERSIONS, MAC_MODELS } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import Dropdown, { type DropdownItem } from "@/components/ui/Dropdown";
import Empty from "@/components/ui/Empty";
import Badge from "@/components/ui/Badge";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Modal from "@/components/ui/Modal";
import Tooltip from "@/components/ui/Tooltip";
import { useDropzone } from "react-dropzone";
import {
  X,
  Bold,
  Italic,
  Quote,
  Code,
  Link,
  Image,
  List,
  ListOrdered,
  Table,
  Undo,
  Redo,
  Save,
  Trash2,
  Eye,
  Clock,
  ChevronRight,
  ChevronDown,
  Plus,
  Send,
  Layers,
  Calendar,
  Search,
  PanelLeftClose,
  PanelLeft,
  FileText,
  GripVertical,
  FolderOpen,
  Upload,
} from "lucide-react";
import { cn, formatTime, debounce, genId } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category, Tag as TagType } from "@/types";

function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[name] || LucideIcons.Folder;
}

const TOOLBAR_ITEMS = [
  { key: "bold", icon: Bold, title: "粗体", prefix: "**", suffix: "**", placeholder: "粗体文字" },
  { key: "italic", icon: Italic, title: "斜体", prefix: "_", suffix: "_", placeholder: "斜体文字" },
  { key: "quote", icon: Quote, title: "引用", prefix: "\n> ", suffix: "", placeholder: "引用内容" },
  { key: "code", icon: Code, title: "代码", prefix: "\n```swift\n", suffix: "\n```\n", placeholder: "// 代码" },
  { key: "link", icon: Link, title: "链接", prefix: "[", suffix: "](url)", placeholder: "链接文字" },
  { key: "image", icon: Image, title: "图片", prefix: "\n![", suffix: "](url)\n", placeholder: "图片描述" },
  { key: "ul", icon: List, title: "无序列表", prefix: "\n- ", suffix: "", placeholder: "列表项" },
  { key: "ol", icon: ListOrdered, title: "有序列表", prefix: "\n1. ", suffix: "", placeholder: "列表项" },
  { key: "table", icon: Table, title: "表格", prefix: "\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| ", suffix: " | | |\n", placeholder: "内容" },
];

const PRESET_COLORS = ["#007AFF", "#FF9500", "#FF2D55", "#34C759", "#AF52DE", "#30B0C7", "#5856D6", "#FF3B30"];

export default function EditorPage() {
  const {
    currentUser,
    editorDraftId,
    setShowEditor,
    saveDraft,
    drafts: storeDrafts,
    createPost,
    setActivePost,
    deleteDraft,
    setActivePanel,
  } = useAppStore();

  const toast = useToast();

  const initialDraft = DRAFTS.find((d) => d.id === editorDraftId) ||
    storeDrafts.find((d) => d.id === editorDraftId);

  const [title, setTitle] = useState(initialDraft?.title || "");
  const [content, setContent] = useState(initialDraft?.content || "");
  const [categoryId, setCategoryId] = useState<string | undefined>(initialDraft?.categoryId);
  const [selectedTags, setSelectedTags] = useState<TagType[]>(
    TAGS.filter((t) => initialDraft?.tagIds?.includes(t.id))
  );
  const [customTagInput, setCustomTagInput] = useState("");
  const [customTagColor, setCustomTagColor] = useState(PRESET_COLORS[0]);
  const [osVersion, setOsVersion] = useState<string | undefined>(initialDraft?.osVersion);
  const [macModel, setMacModel] = useState<string | undefined>(initialDraft?.macModel);
  const [showPreview, setShowPreview] = useState(true);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(initialDraft ? new Date(initialDraft.savedAt) : null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showDraftsDrawer, setShowDraftsDrawer] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string; name: string; progress: number }[]>(
    (initialDraft?.images || []).map((url, idx) => ({
      id: `img-${idx}`,
      url,
      name: `图片${idx + 1}`,
      progress: 100,
    }))
  );
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [keepDraftOnDiscard, setKeepDraftOnDiscard] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePanelRef = useRef<HTMLDivElement>(null);

  const allCategories = useMemo(() => {
    const result: Category[] = [];
    CATEGORIES.forEach((c) => {
      result.push(c);
      if (c.children) result.push(...c.children);
    });
    return result;
  }, []);

  const selectedCategory = allCategories.find((c) => c.id === categoryId);
  const drafts = storeDrafts.length > 0 ? storeDrafts : DRAFTS;

  const canPublish = !!(title.trim() && content.trim() && categoryId);
  const wordCount = content.replace(/\s/g, "").length;

  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        setAutoSaveStatus("saving");
        const newDraftId = saveDraft({
          id: editorDraftId,
          title,
          content,
          categoryId,
          tagIds: selectedTags.map((t) => t.id),
          osVersion,
          macModel,
          images: uploadedImages.map((i) => i.url),
        });
        if (!editorDraftId && newDraftId) {
          setShowEditor(true, newDraftId);
        }
        setTimeout(() => {
          setLastSavedAt(new Date());
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        }, 500);
      }, 3000),
    [title, content, categoryId, selectedTags, osVersion, macModel, uploadedImages, editorDraftId, saveDraft, setShowEditor]
  );

  useEffect(() => {
    if (title || content) {
      debouncedSave();
    }
  }, [title, content, categoryId, selectedTags, osVersion, macModel, debouncedSave]);

  const handleSplitDrag = (e: React.MouseEvent) => {
    if (!splitContainerRef.current) return;
    setIsDraggingSplit(true);
    const startX = e.clientX;
    const startRatio = splitRatio;
    const containerWidth = splitContainerRef.current.offsetWidth;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const newRatio = Math.max(0.2, Math.min(0.8, startRatio + delta / containerWidth));
      setSplitRatio(newRatio);
    };

    const onUp = () => {
      setIsDraggingSplit(false);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const insertMarkdown = (tool: typeof TOOLBAR_ITEMS[0]) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || tool.placeholder;
    const newContent =
      content.slice(0, start) +
      tool.prefix +
      selected +
      tool.suffix +
      content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      ta.focus();
      const pos = start + tool.prefix.length;
      ta.setSelectionRange(pos, pos + selected.length);
    }, 0);
  };

  const insertTextAtCursor = useCallback((text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newContent = content.slice(0, start) + text + content.slice(end);
    setContent(newContent);
    setTimeout(() => {
      ta.focus();
      const pos = start + text.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  }, [content]);

  const simulateUploadProgress = useCallback((imageId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(100, progress + 15);
      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, progress } : img
        )
      );
      if (progress >= 100) {
        clearInterval(interval);
        setUploadedImages((prev) => {
          const img = prev.find((i) => i.id === imageId);
          if (img) {
            setTimeout(() => {
              insertTextAtCursor(`![${img.name}](${img.url})`);
            }, 0);
          }
          return prev;
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [insertTextAtCursor]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    fileArray.forEach((file) => {
      const id = genId();
      const url = URL.createObjectURL(file);
      const newImage = { id, url, name: file.name, progress: 0 };
      setUploadedImages((prev) => [...prev, newImage]);
      simulateUploadProgress(id);
    });
  }, [simulateUploadProgress]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      e.preventDefault();
      handleFiles(files);
    }
  }, [handleFiles]);

  const deleteImage = useCallback((imageId: string) => {
    setUploadedImages((prev) => {
      const img = prev.find((i) => i.id === imageId);
      if (img) {
        const pattern = new RegExp(`!\\[${img.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\(${img.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)\\n?`, 'g');
        setContent((c) => c.replace(pattern, ""));
        URL.revokeObjectURL(img.url);
      }
      return prev.filter((i) => i.id !== imageId);
    });
  }, []);

  const insertImageToContent = useCallback((image: { id: string; url: string; name: string }) => {
    insertTextAtCursor(`![${image.name}](${image.url})`);
    setShowImagePanel(false);
  }, [insertTextAtCursor]);

  const handleImageToolClick = useCallback(() => {
    if (uploadedImages.length > 0) {
      setShowImagePanel((prev) => !prev);
    } else {
      fileInputRef.current?.click();
    }
  }, [uploadedImages.length]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  }, [handleFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    accept: { "image/*": [] },
    noClick: true,
    noKeyboard: true,
  });

  const handleSaveDraft = useCallback(() => {
    setAutoSaveStatus("saving");
    const newDraftId = saveDraft({
      id: editorDraftId,
      title,
      content,
      categoryId,
      tagIds: selectedTags.map((t) => t.id),
      osVersion,
      macModel,
      images: uploadedImages.map((i) => i.url),
    });
    if (!editorDraftId && newDraftId) {
      setShowEditor(true, newDraftId);
    }
    setTimeout(() => {
      setLastSavedAt(new Date());
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus("idle"), 2000);
    }, 300);
    return newDraftId;
  }, [editorDraftId, title, content, categoryId, selectedTags, osVersion, macModel, uploadedImages, saveDraft, setShowEditor]);

  const handlePublish = useCallback(() => {
    if (!canPublish) return;

    const postId = createPost({
      title: title.trim(),
      content: content.trim(),
      categoryId: categoryId!,
      tagIds: selectedTags.map((t) => t.id),
      osVersion,
      macModel,
      images: uploadedImages.map((i) => i.url),
      draftId: editorDraftId,
    });

    setShowEditor(false, undefined);
    setActivePanel("feed");
    setActivePost(postId);
    toast.success("发布成功", "你的帖子已成功发布");
  }, [canPublish, title, content, categoryId, selectedTags, osVersion, macModel, uploadedImages, editorDraftId, createPost, setShowEditor, setActivePanel, setActivePost, toast]);

  const handleDiscard = useCallback(() => {
    if (editorDraftId && !keepDraftOnDiscard) {
      deleteDraft(editorDraftId);
    }
    setShowDiscardConfirm(false);
    setShowEditor(false);
  }, [editorDraftId, keepDraftOnDiscard, deleteDraft, setShowEditor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }

      if (isMod && e.key === "Enter") {
        e.preventDefault();
        if (canPublish) {
          handlePublish();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveDraft, handlePublish, canPublish]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (imagePanelRef.current && !imagePanelRef.current.contains(e.target as Node)) {
        setShowImagePanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tag: TagType) => {
    if (!selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const addCustomTag = () => {
    if (!customTagInput.trim()) return;
    const newTag: TagType = {
      id: `custom-${Date.now()}`,
      name: customTagInput.trim(),
      color: customTagColor,
      hot: false,
      postCount: 0,
    };
    setSelectedTags([...selectedTags, newTag]);
    setCustomTagInput("");
  };

  const filteredTags = TAGS.filter(
    (t) =>
      !selectedTags.find((st) => st.id === t.id) &&
      (tagSearch ? t.name.toLowerCase().includes(tagSearch.toLowerCase()) : true)
  );

  const toggleCatExpand = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden app-transition" style={{ background: "var(--app-bg)" }}>
      <div className="flex-shrink-0 border-b vibrant-toolbar px-4 py-2.5 flex items-center justify-between" style={{ borderBottomColor: "var(--app-border)" }}>
        <div className="flex items-center gap-2">
          <Button
            variant="icon"
            size="md"
            onClick={() => setShowSidebar(!showSidebar)}
            title={showSidebar ? "隐藏设置栏" : "显示设置栏"}
          >
            {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </Button>
          <div className="h-5 w-px mx-1" style={{ background: "var(--app-border)" }} />
          <Avatar src={currentUser.avatar} name={currentUser.nickname} size="sm" />
          <div className="text-sm">
            <span className="font-medium" style={{ color: "var(--app-text-primary)" }}>
              {currentUser.nickname}
            </span>
            <span className="mx-2" style={{ color: "var(--app-text-tertiary)" }}>
              ·
            </span>
            <span className="text-xs" style={{ color: "var(--app-text-tertiary)" }}>
              发布到
            </span>
            <span className="text-xs font-medium ml-1" style={{ color: "var(--app-accent)" }}>
              {selectedCategory?.name || "未选择分区"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs mr-2" style={{ color: "var(--app-text-tertiary)" }}>
            <Save className="w-3.5 h-3.5" />
            {autoSaveStatus === "saving" && <span>保存中...</span>}
            {autoSaveStatus === "saved" && lastSavedAt && (
              <span>{formatTime(lastSavedAt.toISOString()).replace("前", "前保存")}</span>
            )}
            {autoSaveStatus === "idle" && !lastSavedAt && <span>未保存</span>}
            {autoSaveStatus === "idle" && lastSavedAt && (
              <span>{formatTime(lastSavedAt.toISOString()).replace("前", "前自动保存")}</span>
            )}
          </div>

          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" rightIcon={<FolderOpen className="w-3.5 h-3.5" />}>
                草稿箱
                {drafts.length > 0 && <Badge variant="gray" size="sm" count={drafts.length} className="ml-1" />}
              </Button>
            }
            items={drafts.map<DropdownItem>((d) => ({
              key: d.id,
              label: (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium truncate max-w-[240px]">
                    {d.title || "(无标题草稿)"}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--app-text-tertiary)" }}>
                    {d.autoSaved ? "自动保存" : "手动保存"} · {formatTime(d.savedAt)}
                  </span>
                </div>
              ),
              onClick: () => {
                setTitle(d.title);
                setContent(d.content);
                setCategoryId(d.categoryId);
                setOsVersion(d.osVersion);
                setMacModel(d.macModel);
                setSelectedTags(TAGS.filter((t) => d.tagIds?.includes(t.id)));
                setUploadedImages(
                  (d.images || []).map((url, idx) => ({
                    id: `img-${idx}-${Date.now()}`,
                    url,
                    name: `图片${idx + 1}`,
                    progress: 100,
                  }))
                );
                setLastSavedAt(new Date(d.savedAt));
                setShowEditor(true, d.id);
              },
            }))}
            placement="bottom-right"
            menuClassName="min-w-[280px]"
          />

          <Button variant="secondary" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline ml-1">{showPreview ? "隐藏预览" : "显示预览"}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 px-6 pt-5 pb-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="一个吸引人的标题..."
              className="w-full text-2xl font-bold outline-none bg-transparent placeholder-opacity-40"
              style={{
                color: "var(--app-text-primary)",
                minHeight: "44px",
              }}
              maxLength={100}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs" style={{ color: "var(--app-text-tertiary)" }}>
                {title.length} / 100 字
              </div>
            </div>
          </div>

          <div
            className="flex-shrink-0 mx-6 py-2 flex items-center gap-1 border-y relative"
            style={{ borderColor: "var(--app-border)" }}
          >
            {TOOLBAR_ITEMS.filter((t) => t.key !== "image").map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.key}
                  type="button"
                  onClick={() => insertMarkdown(tool)}
                  title={tool.title}
                  className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center transition-all",
                    "hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                  style={{ color: "var(--app-text-secondary)" }}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}

            <div ref={imagePanelRef} className="relative">
              <button
                type="button"
                onClick={handleImageToolClick}
                title="图片"
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center transition-all",
                  "hover:bg-black/5 dark:hover:bg-white/5",
                  showImagePanel && "bg-black/5 dark:bg-white/5"
                )}
                style={{ color: "var(--app-text-secondary)" }}
              >
                <Image className="w-4 h-4" />
              </button>

              {showImagePanel && (
                <div
                  className="absolute top-full left-0 mt-1 p-2 rounded-lg shadow-mac z-50 min-w-[200px]"
                  style={{
                    background: "var(--app-surface)",
                    border: "1px solid var(--app-border)",
                  }}
                >
                  <div className="text-xs font-medium mb-2 px-1" style={{ color: "var(--app-text-secondary)" }}>
                    已上传图片
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto">
                    {uploadedImages.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => insertImageToContent(img)}
                        className="relative w-12 h-12 rounded overflow-hidden hover:ring-2 hover:ring-[var(--app-accent)] transition-all"
                        title={img.name}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--app-border)" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImagePanel(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full text-xs py-1.5 rounded-md flex items-center justify-center gap-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      style={{ color: "var(--app-text-secondary)" }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      上传新图片
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="w-px h-5 mx-1" style={{ background: "var(--app-border)" }} />
            <button
              type="button"
              className="w-8 h-8 rounded-md flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--app-text-secondary)" }}
              title="撤销"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-md flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--app-text-secondary)" }}
              title="重做"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <div ref={splitContainerRef} className="flex-1 min-h-0 flex overflow-hidden">
            <div
              className="flex-1 min-w-0 flex flex-col overflow-hidden relative"
              style={{ flex: showPreview ? `${splitRatio * 100}%` : "1 1 100%" }}
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                placeholder="开始写点什么吧... 支持 Markdown 语法，可拖拽或粘贴图片"
                className="flex-1 w-full resize-none outline-none px-6 py-4 font-mono text-sm leading-relaxed relative z-10"
                style={{
                  background: "transparent",
                  color: "var(--app-text-primary)",
                  caretColor: "var(--app-accent)",
                }}
              />

              {isDragActive && (
                <div
                  className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                  style={{
                    background: "color-mix(in srgb, var(--app-accent) 10%, transparent)",
                    border: "2px dashed var(--app-accent)",
                    margin: "8px",
                    borderRadius: "8px",
                  }}
                >
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto mb-2" style={{ color: "var(--app-accent)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--app-text-primary)" }}>
                      释放鼠标上传图片
                    </p>
                  </div>
                </div>
              )}

              {uploadedImages.length > 0 && (
                <div
                  className="flex-shrink-0 px-6 py-3 border-t flex items-center gap-3 flex-wrap relative z-10"
                  style={{ borderColor: "var(--app-border)" }}
                >
                  {uploadedImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative rounded-lg overflow-hidden group"
                      style={{ width: "88px", height: "88px" }}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => insertImageToContent(img)}
                          className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                          title="插入到正文"
                        >
                          <Image className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteImage(img.id)}
                          className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                          title="删除图片"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {img.progress < 100 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                          <div
                            className="h-full"
                            style={{
                              width: `${img.progress}%`,
                              background: "var(--app-accent)",
                            }}
                          />
                        </div>
                      )}
                      {img.progress < 100 && (
                        <div className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white">
                          {img.progress}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showPreview && (
              <>
                <div
                  onMouseDown={handleSplitDrag}
                  className={cn(
                    "w-1.5 flex-shrink-0 cursor-col-resize transition-colors z-10",
                    isDraggingSplit ? "bg-[var(--app-accent)]/50" : "hover:bg-[var(--app-accent)]/30"
                  )}
                  style={{
                    background: isDraggingSplit
                      ? "var(--app-accent)"
                      : "var(--app-border)",
                  }}
                >
                  <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <GripVertical
                      className="w-3 h-3"
                      style={{ color: "var(--app-text-tertiary)" }}
                    />
                  </div>
                </div>

                <div
                  className="flex-1 min-w-0 overflow-y-auto"
                  style={{ flex: `${(1 - splitRatio) * 100}%` }}
                >
                  <div
                    className="sticky top-0 z-10 px-6 py-2.5 vibrant-toolbar border-b text-xs font-medium flex items-center gap-2"
                    style={{ borderBottomColor: "var(--app-border)" }}
                  >
                    <Eye className="w-3.5 h-3.5" style={{ color: "var(--app-text-tertiary)" }} />
                    <span style={{ color: "var(--app-text-secondary)" }}>实时预览</span>
                  </div>
                  <div className="px-6 py-5">
                    {content ? (
                      <>
                        {title && (
                          <h1
                            className="text-2xl font-bold mb-4 pb-4"
                            style={{
                              color: "var(--app-text-primary)",
                              borderBottom: "1px solid var(--app-border)",
                            }}
                          >
                            {title}
                          </h1>
                        )}
                        <MarkdownRenderer content={content} />
                      </>
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <Empty
                          type="posts"
                          title="预览区"
                          description="在左侧输入内容后，这里会实时显示预览效果"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {showSidebar && (
          <aside
            className="w-72 flex-shrink-0 border-l flex flex-col h-full"
            style={{
              borderLeftColor: "var(--app-border)",
              background: "var(--app-surface)",
            }}
          >
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-4 border-b" style={{ borderBottomColor: "var(--app-border)" }}>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--app-text-primary)" }}>
                  <Layers className="w-4 h-4" style={{ color: "var(--app-accent)" }} />
                  选择分区 <span style={{ color: "var(--app-danger)" }}>*</span>
                </h3>
                {!categoryId && (
                  <p className="text-xs mb-2 flex items-center gap-1" style={{ color: "var(--app-danger)" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--app-danger)" }} />
                    请选择一个分区
                  </p>
                )}
                <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => {
                    const hasChildren = cat.children && cat.children.length > 0;
                    const expanded = expandedCats.has(cat.id);
                    const Icon = getIcon(cat.icon);
                    return (
                      <div key={cat.id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (hasChildren) toggleCatExpand(cat.id);
                            else setCategoryId(cat.id);
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all",
                            categoryId === cat.id
                              ? "font-medium shadow-sm"
                              : "hover:bg-black/5 dark:hover:bg-white/5"
                          )}
                          style={{
                            background:
                              categoryId === cat.id ? "var(--app-accent)" : "transparent",
                            color: categoryId === cat.id ? "#fff" : "var(--app-text-secondary)",
                          }}
                        >
                          {hasChildren ? (
                            <ChevronRight
                              className={cn(
                                "w-3.5 h-3.5 flex-shrink-0 transition-transform",
                                expanded ? "rotate-90" : ""
                              )}
                              style={{
                                color: categoryId === cat.id
                                  ? "rgba(255,255,255,0.8)"
                                  : "var(--app-text-tertiary)",
                              }}
                            />
                          ) : (
                            <span className="w-3.5 h-3.5 flex-shrink-0" />
                          )}
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="flex-1 text-left truncate">{cat.name}</span>
                        </button>
                        {hasChildren && expanded && (
                          <div className="ml-2 mt-0.5 space-y-0.5">
                            {cat.children!.map((child) => {
                              const ChildIcon = getIcon(child.icon);
                              return (
                                <button
                                  key={child.id}
                                  type="button"
                                  onClick={() => setCategoryId(child.id)}
                                  className={cn(
                                    "w-full flex items-center gap-2 pl-7 pr-2.5 py-1.5 rounded-lg text-xs transition-all",
                                    categoryId === child.id
                                      ? "font-medium shadow-sm"
                                      : "hover:bg-black/5 dark:hover:bg-white/5"
                                  )}
                                  style={{
                                    background:
                                      categoryId === child.id
                                        ? "var(--app-accent)"
                                        : "transparent",
                                    color:
                                      categoryId === child.id
                                        ? "#fff"
                                        : "var(--app-text-secondary)",
                                  }}
                                >
                                  <ChildIcon className="w-3 h-3 flex-shrink-0" />
                                  <span className="flex-1 text-left truncate">
                                    {child.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-b" style={{ borderBottomColor: "var(--app-border)" }}>
                <h3 className="text-sm font-semibold mb-3 flex items-center justify-between" style={{ color: "var(--app-text-primary)" }}>
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: "var(--app-accent)" }} />
                    添加标签
                  </span>
                  <span className="text-[10px] font-normal" style={{ color: "var(--app-text-tertiary)" }}>
                    {selectedTags.length}/5
                  </span>
                </h3>

                {selectedTags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    {selectedTags.map((tag) => (
                      <Tag
                        key={tag.id}
                        color={tag.color}
                        size="sm"
                        variant="solid"
                        closable
                        onClose={() => removeTag(tag.id)}
                      >
                        {tag.name}
                      </Tag>
                    ))}
                  </div>
                )}

                {selectedTags.length < 5 && (
                  <>
                    <div className="relative mb-2">
                      <Search
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                        style={{ color: "var(--app-text-tertiary)" }}
                      />
                      <input
                        type="text"
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        placeholder="搜索标签..."
                        className="mac-input pl-8 text-xs h-8 !py-1"
                      />
                    </div>

                    {filteredTags.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap mb-3 max-h-24 overflow-y-auto">
                        {filteredTags.slice(0, 12).map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="text-xs px-2 py-1 rounded-full transition-all hover:scale-105"
                            style={{
                              background: `${tag.color}15`,
                              color: tag.color,
                            }}
                          >
                            + {tag.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] mb-3" style={{ color: "var(--app-text-tertiary)" }}>
                        没有匹配的标签，可自定义创建
                      </p>
                    )}

                    <div
                      className="p-2.5 rounded-lg"
                      style={{ background: "var(--app-surface-secondary)" }}
                    >
                      <p className="text-[10px] mb-2" style={{ color: "var(--app-text-tertiary)" }}>
                        自定义标签
                      </p>
                      <div className="flex items-center gap-1.5 mb-2">
                        <input
                          type="text"
                          value={customTagInput}
                          onChange={(e) => setCustomTagInput(e.target.value)}
                          placeholder="标签名称..."
                          className="flex-1 mac-input text-xs h-7 !py-1"
                          onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCustomTagColor(c)}
                            className={cn(
                              "w-5 h-5 rounded-full transition-transform",
                              customTagColor === c ? "ring-2 ring-offset-1 scale-110" : ""
                            )}
                            style={{
                              background: c,
                              boxShadow: customTagColor === c ? `0 0 0 2px ${c}40, 0 0 0 4px ${c}20` : "none",
                            }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addCustomTag}
                        disabled={!customTagInput.trim()}
                        className="w-full mac-btn !py-1.5 text-xs disabled:opacity-50"
                        style={{
                          background: customTagColor,
                          color: "#fff",
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        创建并添加
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--app-text-primary)" }}>
                  关联信息 <span className="text-[10px] font-normal" style={{ color: "var(--app-text-tertiary)" }}>(可选)</span>
                </h3>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] mb-1.5" style={{ color: "var(--app-text-secondary)" }}>
                      系统版本
                    </label>
                    <select
                      className="mac-select text-xs h-8 !py-1"
                      value={osVersion || ""}
                      onChange={(e) => setOsVersion(e.target.value || undefined)}
                    >
                      <option value="">不关联</option>
                      {OS_VERSIONS.map((os) => (
                        <option key={os.value} value={os.value}>
                          {os.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] mb-1.5" style={{ color: "var(--app-text-secondary)" }}>
                      机型
                    </label>
                    <select
                      className="mac-select text-xs h-8 !py-1"
                      value={macModel || ""}
                      onChange={(e) => setMacModel(e.target.value || undefined)}
                    >
                      <option value="">不关联</option>
                      {MAC_MODELS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(osVersion || macModel) && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    {osVersion && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                        style={{
                          background: "var(--app-accent)",
                          color: "#fff",
                        }}
                      >
                        {OS_VERSIONS.find((o) => o.value === osVersion)?.label.split(" ")[1]}
                        <button
                          type="button"
                          onClick={() => setOsVersion(undefined)}
                          className="ml-0.5 hover:opacity-70"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                    {macModel && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                        style={{
                          background: "var(--app-accent-hover)",
                          color: "#fff",
                        }}
                      >
                        {MAC_MODELS.find((m) => m.value === macModel)?.label.split('"')[0].trim()}
                        <button
                          type="button"
                          onClick={() => setMacModel(undefined)}
                          className="ml-0.5 hover:opacity-70"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      <div
        className="flex-shrink-0 border-t vibrant-toolbar px-6 py-3 flex items-center justify-between"
        style={{ borderTopColor: "var(--app-border)" }}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSaveDraft}
          >
            保存草稿
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDiscardConfirm(true)}
          >
            放弃
          </Button>
        </div>

        <div className="text-xs flex items-center gap-2" style={{ color: "var(--app-text-tertiary)" }}>
          <span className="inline-flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            {wordCount} 字
          </span>
          <span>·</span>
          <span>约 {Math.max(1, Math.ceil(wordCount / 400))} 分钟阅读</span>
        </div>

        <div className="flex items-center gap-2">
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" rightIcon={<ChevronDown className="w-3.5 h-3.5" />}>
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline ml-1">定时发布</span>
              </Button>
            }
            items={[
              { key: "now", label: "立即发布", onClick: () => {} },
              { key: "30m", label: "30 分钟后", onClick: () => {} },
              { key: "1h", label: "1 小时后", onClick: () => {} },
              { key: "tomorrow", label: "明天 09:00", onClick: () => {} },
              { key: "custom", label: "自定义时间...", onClick: () => setShowSchedule(true) },
            ]}
            placement="top-right"
          />

          <Tooltip
            content={
              !canPublish ? (
                <div className="space-y-0.5">
                  {!title.trim() && <div>· 请填写标题</div>}
                  {!content.trim() && <div>· 请填写内容</div>}
                  {!categoryId && <div>· 请选择分区</div>}
                </div>
              ) : (
                "点击发布帖子"
              )
            }
            disabled={!!canPublish}
            placement="top"
          >
            <Button
              variant="primary"
              size="md"
              rightIcon={<Send className="w-4 h-4" />}
              disabled={!canPublish}
              onClick={handlePublish}
            >
              发布
              <span
                className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded opacity-80"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                ⌘↵
              </span>
            </Button>
          </Tooltip>
        </div>
      </div>

      <Modal
        open={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        title="确认放弃编辑？"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDiscardConfirm(false)}>
              继续编辑
            </Button>
            <Button
              variant="danger"
              onClick={handleDiscard}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              确认放弃
            </Button>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--app-text-secondary)" }}>
          未保存的内容将丢失。你确定要放弃当前的编辑内容吗？
        </p>
        {lastSavedAt && (
          <p className="text-xs mt-3 flex items-center gap-1" style={{ color: "var(--app-text-tertiary)" }}>
            <Clock className="w-3 h-3" />
            上次保存于 {formatTime(lastSavedAt.toISOString())}
          </p>
        )}
        {(editorDraftId || (title || content)) && (
          <div className="mt-4 p-3 rounded-lg" style={{ background: "var(--app-surface-secondary)" }}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={keepDraftOnDiscard}
                onChange={(e) => setKeepDraftOnDiscard(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm" style={{ color: "var(--app-text-primary)" }}>
                保留草稿
              </span>
            </label>
            <p className="text-xs mt-1.5 ml-6" style={{ color: "var(--app-text-tertiary)" }}>
              {keepDraftOnDiscard
                ? "放弃后可在草稿箱中继续编辑"
                : "放弃后草稿将被永久删除"}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        title="定时发布"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSchedule(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowSchedule(false);
                setShowEditor(false);
              }}
            >
              确认定时
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--app-text-primary)" }}>
              发布日期
            </label>
            <input type="date" className="mac-input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--app-text-primary)" }}>
              发布时间
            </label>
            <input type="time" className="mac-input" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
