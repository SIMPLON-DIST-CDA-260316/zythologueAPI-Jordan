import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import { App } from "./app/App";
import "./app/styles/index.css";

// Zod teste new Function() pour compiler ses schémas : la CSP (script-src
// sans 'unsafe-eval') le refuse et l'erreur s'afficherait dans la console
z.config({ jitless: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
