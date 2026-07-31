import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { applyAccent, getAccent, applyMode, getMode } from "./theme";
import { ContentProvider } from "./lib/ContentContext";

// Admin ships as its own chunk — portfolio visitors never download it.
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));
// Blog pages are lazy so react-markdown only loads when a post is opened.
const BlogIndex = lazy(() => import("./pages/BlogIndex.jsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.jsx"));
const BlogWrite = lazy(() => import("./pages/BlogWrite.jsx"));

// apply the saved light/dark mode + accent before first paint
applyMode(getMode());
applyAccent(getAccent());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
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
          path="/blog/:slug"
          element={
            <ContentProvider>
              <Suspense fallback={null}>
                <BlogPost />
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
    </BrowserRouter>
  </React.StrictMode>
);
