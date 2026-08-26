import { useState } from "react";
import { supabase } from "../lib/supabase";
import { TABLES } from "./schema";
import TableEditor from "./TableEditor";
import BlogEditor from "./BlogEditor";
import JobEditor from "./JobEditor";
import CommentsAdmin from "./CommentsAdmin";
import SubscribersAdmin from "./SubscribersAdmin";
import ResourceSubscribersAdmin from "./ResourceSubscribersAdmin";
import JobSubscribersAdmin from "./JobSubscribersAdmin";
import AccessRequestsAdmin from "./AccessRequestsAdmin";
import FolderUpload from "./FolderUpload";
import ResumeAdmin from "./ResumeAdmin";
import ChangePassword from "./ChangePassword";

const BLOG_KEY = "__blog";
const JOBS_KEY = "__jobs";
const JOB_SUBS_KEY = "__job_subs";
const COMMENTS_KEY = "__comments";
const SUBS_KEY = "__subs";
const RESOURCE_SUBS_KEY = "__resource_subs";
const ACCESS_KEY = "__access";
const FOLDER_KEY = "__folder";
const RESUME_KEY = "__resume";
const PASSWORD_KEY = "__password";

export default function Dashboard({ session }) {
  const [activeKey, setActiveKey] = useState(TABLES[0].key);
  const isBlog = activeKey === BLOG_KEY;
  const isJobs = activeKey === JOBS_KEY;
  const isJobSubs = activeKey === JOB_SUBS_KEY;
  const isComments = activeKey === COMMENTS_KEY;
  const isSubs = activeKey === SUBS_KEY;
  const isResourceSubs = activeKey === RESOURCE_SUBS_KEY;
  const isAccess = activeKey === ACCESS_KEY;
  const isFolder = activeKey === FOLDER_KEY;
  const isResume = activeKey === RESUME_KEY;
  const isPassword = activeKey === PASSWORD_KEY;
  const active = TABLES.find((t) => t.key === activeKey);

  const logout = () => supabase.auth.signOut();

  return (
    <div className="min-h-screen bg-base text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:flex-row md:px-6 md:py-10">
        {/* Sidebar */}
        <aside className="md:w-60 md:shrink-0">
          <div className="glass rounded-2xl p-4">
            <h1 className="px-2 text-lg font-bold">
              <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="truncate px-2 pt-1 text-xs text-white/40">
              {session.user.email}
            </p>

            <nav className="mt-4 space-y-1">
              {TABLES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveKey(t.key)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    activeKey === t.key
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
              <button
                onClick={() => setActiveKey(BLOG_KEY)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isBlog ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span>📝</span>
                Blog
              </button>
              <button
                onClick={() => setActiveKey(JOBS_KEY)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isJobs ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span>💼</span>
                Job Updates
              </button>
              <button
                onClick={() => setActiveKey(JOB_SUBS_KEY)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isJobSubs ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span>📬</span>
                Job Subscribers
              </button>
              <button
                onClick={() => setActiveKey(COMMENTS_KEY)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isComments ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span>💬</span>
                Comments
              </button>
              <button
                onClick={() => setActiveKey(SUBS_KEY)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isSubs ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span>📧</span>
                Subscribers
              </button>
              <button
                onClick={() => setActiveKey(RESOURCE_SUBS_KEY)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isResourceSubs ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span>📦</span>
                Resource Subscribers
              </button>
              <button
                onClick={() => setActiveKey(ACCESS_KEY)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isAccess ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span>🛂</span>
                Access Requests
              </button>
              <button
                onClick={() => setActiveKey(FOLDER_KEY)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isFolder ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span>📁</span>
                Folder Upload
              </button>
              <button
                onClick={() => setActiveKey(RESUME_KEY)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isResume ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span>📄</span>
                Resume
              </button>
              <button
                onClick={() => setActiveKey(PASSWORD_KEY)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  isPassword ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                <span>🔑</span>
                Change Password
              </button>
            </nav>

            <div className="mt-4 border-t border-white/10 pt-4">
              <a
                href="/"
                className="block rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white"
              >
                ↗ View site
              </a>
              <button
                onClick={logout}
                className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
              >
                Log out
              </button>
            </div>
          </div>
        </aside>

        {/* Main editor */}
        <main className="min-w-0 flex-1">
          {isBlog ? (
            <BlogEditor />
          ) : isJobs ? (
            <JobEditor />
          ) : isJobSubs ? (
            <JobSubscribersAdmin />
          ) : isComments ? (
            <CommentsAdmin />
          ) : isSubs ? (
            <SubscribersAdmin />
          ) : isResourceSubs ? (
            <ResourceSubscribersAdmin />
          ) : isAccess ? (
            <AccessRequestsAdmin />
          ) : isFolder ? (
            <FolderUpload />
          ) : isResume ? (
            <ResumeAdmin />
          ) : isPassword ? (
            <ChangePassword />
          ) : (
            <TableEditor key={active.key} table={active} />
          )}
        </main>
      </div>
    </div>
  );
}
