// @ts-nocheck
import React from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import App from "./app.js";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element");

const root = createRoot(rootEl);
root.render(React.createElement(App));

