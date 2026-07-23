import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { applyAccent, getAccent } from "./theme";
import { ContentProvider } from "./lib/ContentContext";

// Admin ships as its own chunk — portfolio visitors never download it.
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

// apply the saved accent before first paint
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
