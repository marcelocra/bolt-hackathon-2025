import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import About from "./pages/about/index.tsx";
import Examples from "./pages/examples/index.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="about" element={<About />} />

        <Route path="examples">
          <Route index element={<Examples />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
