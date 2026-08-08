import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
function PageHero({
  tone,
  eyebrow,
  title,
  text,
  actions,
  chips,
  visual,
  mirrored
}) {
  return /* @__PURE__ */ jsxs("section", { className: `nx-hero nx-tone-${tone}${mirrored ? " mirrored" : ""}`, children: [
    /* @__PURE__ */ jsx("div", { className: "nx-hero-sky" }),
    /* @__PURE__ */ jsx("div", { className: "nx-hero-mesh" }),
    /* @__PURE__ */ jsx("div", { className: "nx-hero-orb a" }),
    /* @__PURE__ */ jsx("div", { className: "nx-hero-orb b" }),
    /* @__PURE__ */ jsxs("div", { className: "nx-hero-inner", children: [
      /* @__PURE__ */ jsxs(motion.div, { className: "nx-hero-copy", initial: {
        opacity: 0,
        y: 26
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        duration: 0.7,
        ease: [0.2, 0.8, 0.2, 1]
      }, children: [
        /* @__PURE__ */ jsx("span", { className: "nx-pill", children: eyebrow }),
        /* @__PURE__ */ jsx("h1", { children: title }),
        /* @__PURE__ */ jsx("p", { children: text }),
        actions && /* @__PURE__ */ jsx("div", { className: "nx-hero-actions", children: actions }),
        chips && /* @__PURE__ */ jsx("div", { className: "nx-hero-chips", children: chips.map(([Icon, label]) => /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx(Icon, { size: 14 }),
          " ",
          label
        ] }, label)) })
      ] }),
      /* @__PURE__ */ jsxs(motion.div, { className: "nx-hero-visual", initial: {
        opacity: 0,
        y: 40,
        scale: 0.96
      }, animate: {
        opacity: 1,
        y: 0,
        scale: 1
      }, transition: {
        duration: 0.85,
        delay: 0.12,
        ease: [0.2, 0.8, 0.2, 1]
      }, children: [
        /* @__PURE__ */ jsx("div", { className: "nx-hero-block" }),
        /* @__PURE__ */ jsx("div", { className: "nx-hero-stagearea", children: visual })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "nx-hero-fade" })
  ] });
}
export {
  PageHero
};
