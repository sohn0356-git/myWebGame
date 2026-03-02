// @ts-nocheck
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app.js";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root element");

const root = createRoot(rootEl);
root.render(React.createElement(App));

