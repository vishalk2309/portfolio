import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import CursorTrail from "./components/CursorTrail.jsx";
import TouchSpark from "./components/TouchSpark.jsx";
import "./index.css";
import { applyAccent, getAccent, applyMode, getMode } from "./theme";
import { ContentProvider } from "./lib/ContentContext";
import { AuthProvider } from "./lib/AuthContext";

// Admin ships as its own chunk — portfolio visitors never download it.
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));
// Blog pages are lazy so react-markdown only loads when a post is opened.
const BlogIndex = lazy(() => import("./pages/BlogIndex.jsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.jsx"));
const BlogWrite = lazy(() => import("./pages/BlogWrite.jsx"));
const BlogStatus = lazy(() => import("./pages/BlogStatus.jsx"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage.jsx"));
const AccountPage = lazy(() => import("./pages/AccountPage.jsx"));
const Terms = lazy(() =>
  import("./pages/LegalPages.jsx").then((m) => ({ default: m.Terms }))
);
const Privacy = lazy(() =>
  import("./pages/LegalPages.jsx").then((m) => ({ default: m.Privacy }))
);
const Refund = lazy(() =>
  import("./pages/LegalPages.jsx").then((m) => ({ default: m.Refund }))
);

// apply the saved light/dark mode + accent before first paint
applyMode(getMode());
applyAccent(getAccent());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
      {/* Global pointer effects — one instance each, on every page.
          CursorTrail is desktop-only; TouchSpark is its touch-device counterpart. */}
      <CursorTrail />
      <TouchSpark />
      <Routes>
        {/* Public portfolio */}
        <Route
          path="/"
          element={
            <ContentProvider>
              <App />
            </ContentProvider>
          }
        />
        {/* Blog */}
        <Route
          path="/blog"
          element={
            <ContentProvider>
              <Suspense fallback={null}>
                <BlogIndex />
              </Suspense>
            </ContentProvider>
          }
        />
        <Route
          path="/blog/write"
          element={
            <ContentProvider>
              <Suspense fallback={null}>
                <BlogWrite />
              </Suspense>
            </ContentProvider>
          }
        />
        <Route
          path="/blog/status"
          element={
            <ContentProvider>
              <Suspense fallback={null}>
                <BlogStatus />
              </Suspense>
            </ContentProvider>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <ContentProvider>
              <Suspense fallback={null}>
                <BlogPost />
              </Suspense>
            </ContentProvider>
          }
        />
        {/* Resources */}
        <Route
          path="/resources"
          element={
            <ContentProvider>
              <Suspense fallback={null}>
                <ResourcesPage />
              </Suspense>
            </ContentProvider>
          }
        />
        {/* Buyer library */}
        <Route
          path="/account"
          element={
            <ContentProvider>
              <Suspense fallback={null}>
                <AccountPage />
              </Suspense>
            </ContentProvider>
          }
        />
        {/* Legal / policy pages (required for Razorpay activation) */}
        <Route
          path="/terms"
          element={
            <ContentProvider>
              <Suspense fallback={null}>
                <Terms />
              </Suspense>
            </ContentProvider>
          }
        />
        <Route
          path="/privacy"
          element={
            <ContentProvider>
              <Suspense fallback={null}>
                <Privacy />
              </Suspense>
            </ContentProvider>
          }
        />
        <Route
          path="/refund"
          element={
            <ContentProvider>
              <Suspense fallback={null}>
                <Refund />
              </Suspense>
            </ContentProvider>
          }
        />
        {/* Private dashboard */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
