import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Maximize2, Play } from "lucide-react";
import { smartSiteDemos } from "../../data/smartSiteDemos.js";
import { metaFor } from "../../data/smartSiteMeta.js";
import { SmartSiteDemoModal } from "./SmartSiteDemoModal.jsx";
function openFullscreen(demo) {
  if (demo.liveUrl) {
    window.open(demo.liveUrl, "_blank", "noopener");
    return;
  }
  window.open(`${window.location.pathname}#demo-${demo.id}`, "_blank", "noopener");
}
function SmartSiteShowcase({ onEvaluate }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const total = smartSiteDemos.length;
  const move = (dir) => setIndex((current) => (current + dir + total) % total);
  const visible = [-1, 0, 1].map((offset) => {
    const position = (index + offset + total) % total;
    return { demo: smartSiteDemos[position], offset };
  });
  const active = smartSiteDemos[index];
  const activeMeta = metaFor(active.id);
  return /* @__PURE__ */ jsxs("section", { className: "showcase", id: "ejemplos", children: [
    /* @__PURE__ */ jsx("div", { className: "showcase-aura", style: { background: `radial-gradient(circle at 50% 40%, ${active.accent}33, transparent 62%)` } }),
    /* @__PURE__ */ jsxs("div", { className: "showcase-head", children: [
      /* @__PURE__ */ jsx(motion.span, { className: "section-eyebrow", initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, children: "CON CU\xC1L TIPO DE WEB SE IDENTIFICA TU MARCA" }),
      /* @__PURE__ */ jsxs(motion.h2, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.08 }, children: [
        "Cada industria merece ",
        /* @__PURE__ */ jsx("em", { children: "su propio lenguaje." })
      ] }),
      /* @__PURE__ */ jsx(motion.p, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay: 0.14 }, children: "\xC1brelas y nav\xE9galas de verdad: p\xE1ginas, reservas, cat\xE1logos y su panel. No son capturas." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "showcase-stage", children: [
      /* @__PURE__ */ jsx("button", { className: "showcase-arrow left", onClick: () => move(-1), "aria-label": "Anterior", children: /* @__PURE__ */ jsx(ArrowLeft, { size: 19 }) }),
      /* @__PURE__ */ jsx("div", { className: "showcase-track", children: visible.map(({ demo, offset }) => {
        const meta = metaFor(demo.id);
        const isActive = offset === 0;
        return /* @__PURE__ */ jsxs(
          motion.button,
          {
            className: `showcase-card ${isActive ? "is-active" : ""}`,
            onClick: () => isActive ? setSelected(demo) : move(offset),
            animate: {
              x: `${offset * 68}%`,
              scale: isActive ? 1 : 0.78,
              opacity: isActive ? 1 : 0.42,
              rotateY: offset * -22,
              zIndex: isActive ? 3 : 1,
              filter: isActive ? "blur(0px)" : "blur(2px)"
            },
            transition: { type: "spring", stiffness: 240, damping: 30 },
            style: { ["--card-accent"]: demo.accent },
            "aria-label": `${meta.label} \u2014 ${demo.name}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "showcase-browser", children: [
                /* @__PURE__ */ jsxs("div", { className: "showcase-browser-bar", children: [
                  /* @__PURE__ */ jsx("i", {}),
                  /* @__PURE__ */ jsx("i", {}),
                  /* @__PURE__ */ jsx("i", {}),
                  /* @__PURE__ */ jsx("span", { children: meta.domain })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "showcase-card-media", children: [
                  /* @__PURE__ */ jsx("img", { src: demo.image, alt: `${meta.label}: ${demo.name}` }),
                  /* @__PURE__ */ jsx("div", { className: "showcase-card-glow" }),
                  /* @__PURE__ */ jsxs("div", { className: "showcase-literal", children: [
                    /* @__PURE__ */ jsx("span", { className: demo.status === "CLIENTE REAL" ? "tag real" : "tag", children: demo.status === "CLIENTE REAL" ? "Cliente real" : "Ejemplo de dise\xF1o" }),
                    /* @__PURE__ */ jsx("strong", { children: meta.label }),
                    /* @__PURE__ */ jsx("small", { children: meta.sub })
                  ] }),
                  isActive && /* @__PURE__ */ jsxs(motion.span, { className: "showcase-play", initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, children: [
                    /* @__PURE__ */ jsx(Play, { size: 15 }),
                    " Entrar a la experiencia"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "showcase-card-foot", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("strong", { children: demo.name }),
                  /* @__PURE__ */ jsx("small", { children: demo.industry })
                ] }),
                isActive && /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "showcase-card-open",
                    role: "button",
                    tabIndex: 0,
                    onClick: (event) => {
                      event.stopPropagation();
                      openFullscreen(demo);
                    },
                    onKeyDown: (event) => {
                      if (event.key === "Enter") {
                        event.stopPropagation();
                        openFullscreen(demo);
                      }
                    },
                    "aria-label": `Abrir ${demo.name} en una pesta\xF1a nueva`,
                    children: /* @__PURE__ */ jsx(Maximize2, { size: 14 })
                  }
                )
              ] })
            ]
          },
          demo.id
        );
      }) }),
      /* @__PURE__ */ jsx("button", { className: "showcase-arrow right", onClick: () => move(1), "aria-label": "Siguiente", children: /* @__PURE__ */ jsx(ArrowRight, { size: 19 }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "showcase-meta", children: [
      /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.35 }, children: [
        /* @__PURE__ */ jsx("p", { className: "showcase-literal-line", children: activeMeta.label }),
        /* @__PURE__ */ jsx("p", { className: "showcase-desc", children: active.description }),
        /* @__PURE__ */ jsxs("div", { className: "showcase-meta-actions", children: [
          /* @__PURE__ */ jsxs("button", { className: "btn-glow", onClick: () => setSelected(active), children: [
            "Explorar ",
            active.name
          ] }),
          /* @__PURE__ */ jsxs("button", { className: "btn-line", onClick: () => openFullscreen(active), children: [
            "Abrir en pesta\xF1a nueva ",
            /* @__PURE__ */ jsx(ExternalLink, { size: 14 })
          ] })
        ] })
      ] }, active.id) }),
      /* @__PURE__ */ jsx("div", { className: "showcase-dots", children: smartSiteDemos.map(
        (demo, i) => /* @__PURE__ */ jsx("button", { className: i === index ? "active" : "", onClick: () => setIndex(i), "aria-label": demo.name, children: i === index && /* @__PURE__ */ jsx(motion.i, { layoutId: "showcase-dot", style: { background: demo.accent } }) }, demo.id)
      ) })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: selected && /* @__PURE__ */ jsx(
      SmartSiteDemoModal,
      {
        demo: selected,
        onClose: () => setSelected(null),
        onPrevious: () => setSelected(smartSiteDemos[(smartSiteDemos.findIndex((d) => d.id === selected.id) - 1 + total) % total]),
        onNext: () => setSelected(smartSiteDemos[(smartSiteDemos.findIndex((d) => d.id === selected.id) + 1) % total]),
        onEvaluate: () => {
          setSelected(null);
          onEvaluate();
        }
      }
    ) })
  ] });
}
export {
  SmartSiteShowcase
};
