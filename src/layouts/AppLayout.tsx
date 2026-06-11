import { useAppStore } from "@/stores/appStore";
import TitleBar from "./TitleBar";
import Sidebar from "./Sidebar";
import FeedPage from "@/pages/FeedPage";
import CategoriesPage from "@/pages/CategoriesPage";
import PostDetailPage from "@/pages/PostDetailPage";
import EditorPage from "@/pages/EditorPage";
import MessagesPage from "@/pages/MessagesPage";
import FavoritesPage from "@/pages/FavoritesPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import NotificationPanel from "@/components/NotificationPanel";
import SearchOverlay from "@/components/SearchOverlay";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Flag, Shield } from "lucide-react";
import { useState } from "react";

export default function AppLayout() {
  const {
    activePanel,
    showEditor,
    showSearch,
    showNotificationPanel,
    showReportDialog,
    reportTarget,
    setReportTarget,
  } = useAppStore();

  const [reportReason, setReportReason] = useState("");

  const renderContent = () => {
    if (showEditor) {
      return <EditorPage />;
    }

    switch (activePanel) {
      case "feed":
        return <FeedPage />;
      case "categories":
        return <CategoriesPage />;
      case "post":
        return <PostDetailPage />;
      case "messages":
        return <MessagesPage />;
      case "favorites":
        return <FavoritesPage />;
      case "profile":
        return <ProfilePage />;
      case "settings":
        return <SettingsPage />;
      case "editor":
        return <EditorPage />;
      default:
        return <FeedPage />;
    }
  };

  const showDetailPanel = activePanel === "post" || activePanel === "profile";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden app-transition" style={{ background: "var(--app-bg)" }}>
      <TitleBar />

      <div className="flex-1 min-h-0 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 min-w-0 flex overflow-hidden">
          <div className="flex-1 min-w-0 h-full overflow-hidden">
            {renderContent()}
          </div>

          {showDetailPanel && (
            <aside
              className="hidden xl:flex w-80 flex-shrink-0 flex-col border-l h-full"
              style={{
                borderLeftColor: "var(--app-border)",
                background: "var(--app-surface)",
              }}
            >
              <div className="p-4 border-b" style={{ borderBottomColor: "var(--app-border)" }}>
                <h3 className="text-sm font-semibold" style={{ color: "var(--app-text-primary)" }}>
                  相关推荐
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-xs text-center py-8" style={{ color: "var(--app-text-tertiary)" }}>
                  暂无推荐内容
                </p>
              </div>
            </aside>
          )}
        </main>
      </div>

      {showSearch && <SearchOverlay />}

      {showNotificationPanel && <NotificationPanel />}

      <Modal
        open={showReportDialog}
        onClose={() => setReportTarget(undefined)}
        title={
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5" style={{ color: "var(--app-warning)" }} />
            <span>举报{reportTarget?.type === "post" ? "帖子" : reportTarget?.type === "reply" ? "回复" : "用户"}</span>
          </div>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setReportTarget(undefined)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setReportTarget(undefined);
                setReportReason("");
              }}
              disabled={!reportReason}
            >
              <Shield className="w-4 h-4" />
              提交举报
            </Button>
          </>
        }
      >
        {reportTarget && (
          <div className="space-y-4">
            <div
              className="p-3 rounded-lg text-sm"
              style={{ background: "var(--app-surface-secondary)" }}
            >
              <div className="text-xs mb-1" style={{ color: "var(--app-text-tertiary)" }}>举报对象</div>
              <div className="font-medium truncate" style={{ color: "var(--app-text-primary)" }}>
                {reportTarget.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--app-text-primary)" }}>
                举报原因
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="mac-select mb-2"
              >
                <option value="">请选择原因...</option>
                <option value="spam">垃圾广告 / 灌水</option>
                <option value="abuse">辱骂 / 人身攻击</option>
                <option value="illegal">违规内容</option>
                <option value="privacy">侵犯隐私</option>
                <option value="copyright">版权侵权</option>
                <option value="other">其他原因</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--app-text-primary)" }}>
                补充说明 <span style={{ color: "var(--app-text-tertiary)" }}>（可选）</span>
              </label>
              <textarea
                className="mac-input resize-none"
                rows={3}
                placeholder="请详细描述举报原因，帮助我们更快处理..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
