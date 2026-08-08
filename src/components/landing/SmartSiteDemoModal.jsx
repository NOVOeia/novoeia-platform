import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, ExternalLink, LayoutDashboard, Maximize2, Monitor, Sparkles, X } from "lucide-react";
import { metaFor } from "../../data/smartSiteMeta.js";
import { SmartSiteMiniSite } from "./SmartSiteMiniSite.jsx";
import { SmartSiteDemoPanel } from "./SmartSiteDemoPanel.jsx";
function SmartSiteDemoModal({ demo, onClose, onPrevious, onNext, onEvaluate }) {
  const [mode, setMode] = useState("site");
  const [pageIndex, setPageIndex] = useState(0);
  const [toast, setToast] = useState("");
  useEffect(() => {
    setMode("site");
    setPageIndex(0);
    setToast("");
  }, [demo.id]);
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrevious]);
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, []);
  function openFullscreen() {
    if (demo.liveUrl) {
      window.open(demo.liveUrl, "_blank", "noopener");
      return;
    }
    window.open(`${window.location.pathname}#demo-${demo.id}`, "_blank", "noopener");
  }
  function handleAction(label) {
    setToast(`\u201C${label}\u201D \u2014 interacci\xF3n de demostraci\xF3n`);
    window.setTimeout(() => setToast(""), 2400);
  }
  const meta = metaFor(demo.id);
  const slug = meta.domain.replace(/\.[a-z]+$/, "");
  return /* @__PURE__ */ jsxs(motion.div, { className: "demo-modal", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, role: "dialog", "aria-modal": "true", "aria-label": `Experiencia ${demo.name}`, children: [
    /* @__PURE__ */ jsx("button", { className: "demo-backdrop", "aria-label": "Cerrar", onClick: onClose }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "demo-shell",
        initial: { opacity: 0, y: 34, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.98 },
        transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
        style: { ["--demo-accent"]: demo.accent },
        children: [
          /* @__PURE__ */ jsxs("header", { className: "demo-shell-top", children: [
            /* @__PURE__ */ jsxs("div", { className: "demo-shell-id", children: [
              /* @__PURE__ */ jsx("span", { className: `demo-chip ${demo.status === "CLIENTE REAL" ? "real" : ""}`, children: demo.status }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("strong", { children: demo.name }),
                /* @__PURE__ */ jsx("small", { children: meta.label })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "demo-shell-switch", children: [
              /* @__PURE__ */ jsxs("button", { className: mode === "site" ? "active" : "", onClick: () => setMode("site"), children: [
                /* @__PURE__ */ jsx(Monitor, { size: 14 }),
                " Sitio"
              ] }),
              /* @__PURE__ */ jsxs("button", { className: mode === "panel" ? "active" : "", onClick: () => setMode("panel"), children: [
                /* @__PURE__ */ jsx(LayoutDashboard, { size: 14 }),
                " Panel"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "demo-shell-actions", children: [
              /* @__PURE__ */ jsxs("button", { className: "demo-open-full", onClick: openFullscreen, children: [
                /* @__PURE__ */ jsx(Maximize2, { size: 14 }),
                /* @__PURE__ */ jsx("span", { children: demo.liveUrl ? "Abrir sitio real" : "Abrir en pesta\xF1a nueva" })
              ] }),
              /* @__PURE__ */ jsx("button", { onClick: onPrevious, "aria-label": "Anterior", children: /* @__PURE__ */ jsx(ChevronLeft, { size: 17 }) }),
              /* @__PURE__ */ jsx("button", { onClick: onNext, "aria-label": "Siguiente", children: /* @__PURE__ */ jsx(ChevronRight, { size: 17 }) }),
              /* @__PURE__ */ jsx("button", { className: "close", onClick: onClose, "aria-label": "Cerrar", children: /* @__PURE__ */ jsx(X, { size: 18 }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "demo-browser", children: [
            /* @__PURE__ */ jsxs("div", { className: "demo-browser-bar", children: [
              /* @__PURE__ */ jsxs("div", { className: "demo-dots", children: [
                /* @__PURE__ */ jsx("i", {}),
                /* @__PURE__ */ jsx("i", {}),
                /* @__PURE__ */ jsx("i", {})
              ] }),
              /* @__PURE__ */ jsx("span", { className: "demo-url", children: mode === "site" ? `${meta.domain}/${(demo.pages[pageIndex]?.label ?? "").toLowerCase()}` : `panel.${slug}.com` }),
              demo.liveUrl && /* @__PURE__ */ jsxs("a", { href: demo.liveUrl, target: "_blank", rel: "noreferrer", className: "demo-live-link", children: [
                "Sitio publicado ",
                /* @__PURE__ */ jsx(ExternalLink, { size: 12 })
              ] })
            ] }),
            mode === "site" && /* @__PURE__ */ jsx("nav", { className: "demo-site-nav", children: demo.pages.map(
              (page, index) => /* @__PURE__ */ jsxs("button", { className: pageIndex === index ? "active" : "", onClick: () => setPageIndex(index), children: [
                page.label,
                pageIndex === index && /* @__PURE__ */ jsx(motion.i, { layoutId: `nav-${demo.id}`, transition: { type: "spring", stiffness: 380, damping: 30 } })
              ] }, page.label)
            ) }),
            /* @__PURE__ */ jsx("div", { className: "demo-viewport", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
              motion.div,
              {
                initial: { opacity: 0, y: 18 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -12 },
                transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] },
                style: { height: "100%" },
                children: mode === "site" ? /* @__PURE__ */ jsx(SmartSiteMiniSite, { demo, pageIndex, onAction: handleAction }) : /* @__PURE__ */ jsx(SmartSiteDemoPanel, { demo, onAction: handleAction })
              },
              `${demo.id}-${mode}-${pageIndex}`
            ) }) })
          ] }),
          /* @__PURE__ */ jsxs("footer", { className: "demo-shell-foot", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx(Sparkles, { size: 15 }),
              " ",
              demo.signature
            ] }),
            /* @__PURE__ */ jsxs("button", { className: "demo-cta", onClick: onEvaluate, children: [
              "Quiero algo as\xED para mi negocio ",
              /* @__PURE__ */ jsx(ArrowUpRight, { size: 15 })
            ] })
          ] }),
          /* @__PURE__ */ jsx(AnimatePresence, { children: toast && /* @__PURE__ */ jsx(motion.div, { className: "demo-toast", initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 }, children: toast }) })
        ]
      }
    )
  ] });
}
export {
  SmartSiteDemoModal
};
