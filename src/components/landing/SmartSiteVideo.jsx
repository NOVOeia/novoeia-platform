import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
function SmartSiteVideo() {
  return /* @__PURE__ */ jsxs("section", { className: "video-section", id: "video", children: [
    /* @__PURE__ */ jsx("div", { className: "video-aura" }),
    /* @__PURE__ */ jsxs(motion.div, { className: "video-head", initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, children: [
      /* @__PURE__ */ jsx("span", { className: "section-eyebrow", children: "EN DOS MINUTOS" }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "M\xEDralo antes de ",
        /* @__PURE__ */ jsx("em", { children: "imaginarlo." })
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Un recorrido corto por lo que recibes, c\xF3mo se administra y por qu\xE9 tu operaci\xF3n se vuelve m\xE1s simple." })
    ] }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "video-frame",
        initial: { opacity: 0, y: 40, scale: 0.96 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "video-slot", children: [
            /* @__PURE__ */ jsx("div", { className: "video-grain" }),
            /* @__PURE__ */ jsxs(motion.button, { className: "video-play", whileHover: { scale: 1.06 }, whileTap: { scale: 0.97 }, "aria-label": "Reproducir presentaci\xF3n", children: [
              /* @__PURE__ */ jsx("span", { className: "video-play-ring" }),
              /* @__PURE__ */ jsx(Play, { size: 26, fill: "currentColor" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "video-placeholder-note", children: "Espacio reservado para tu video de producto" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "video-frame-glow" })
        ]
      }
    )
  ] });
}
export {
  SmartSiteVideo
};
