import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Check, MapPin, Star } from "lucide-react";
const fade = {
  hidden: { opacity: 0, y: 26 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.09, duration: 0.6, ease: [0.2, 0.75, 0.2, 1] } })
};
function Section({ section, index, onAction }) {
  if (section.kind === "hero") {
    return /* @__PURE__ */ jsxs(motion.section, { className: "ms-hero", custom: index, initial: "hidden", animate: "show", variants: fade, children: [
      /* @__PURE__ */ jsx("img", { src: section.image, alt: "" }),
      /* @__PURE__ */ jsx("div", { className: "ms-hero-veil" }),
      /* @__PURE__ */ jsxs("div", { className: "ms-hero-copy", children: [
        /* @__PURE__ */ jsx("span", { className: "ms-eyebrow", children: section.eyebrow }),
        /* @__PURE__ */ jsx("h1", { children: section.title }),
        /* @__PURE__ */ jsx("p", { children: section.text }),
        /* @__PURE__ */ jsxs("div", { className: "ms-hero-actions", children: [
          /* @__PURE__ */ jsxs("button", { className: "ms-btn", onClick: () => onAction(section.primary), children: [
            section.primary,
            " ",
            /* @__PURE__ */ jsx(ArrowRight, { size: 14 })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "ms-btn ghost", onClick: () => onAction(section.secondary), children: section.secondary })
        ] })
      ] })
    ] });
  }
  if (section.kind === "stats") {
    return /* @__PURE__ */ jsx(motion.section, { className: "ms-stats", custom: index, initial: "hidden", animate: "show", variants: fade, children: section.items.map(
      ([value, label]) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: value }),
        /* @__PURE__ */ jsx("span", { children: label })
      ] }, label)
    ) });
  }
  if (section.kind === "list") {
    return /* @__PURE__ */ jsxs(motion.section, { className: "ms-block", custom: index, initial: "hidden", animate: "show", variants: fade, children: [
      /* @__PURE__ */ jsxs("header", { className: "ms-block-head", children: [
        /* @__PURE__ */ jsx("h2", { children: section.title }),
        /* @__PURE__ */ jsx("p", { children: section.subtitle })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "ms-list", children: section.items.map(
        (item, i) => /* @__PURE__ */ jsxs(motion.button, { className: "ms-list-row", onClick: () => onAction(item.name), whileHover: { x: 6 }, transition: { type: "spring", stiffness: 320, damping: 24 }, custom: index + i * 0.3, initial: "hidden", animate: "show", variants: fade, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              item.name,
              item.tag && /* @__PURE__ */ jsx("i", { className: "ms-tag", children: item.tag })
            ] }),
            /* @__PURE__ */ jsx("span", { children: item.text })
          ] }),
          item.meta && /* @__PURE__ */ jsx("b", { children: item.meta })
        ] }, item.name)
      ) })
    ] });
  }
  if (section.kind === "cards") {
    return /* @__PURE__ */ jsxs(motion.section, { className: "ms-block", custom: index, initial: "hidden", animate: "show", variants: fade, children: [
      /* @__PURE__ */ jsxs("header", { className: "ms-block-head", children: [
        /* @__PURE__ */ jsx("h2", { children: section.title }),
        /* @__PURE__ */ jsx("p", { children: section.subtitle })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "ms-cards", children: section.items.map(
        (item, i) => /* @__PURE__ */ jsxs(motion.button, { className: "ms-card", onClick: () => onAction(item.name), whileHover: { y: -8 }, transition: { type: "spring", stiffness: 300, damping: 22 }, custom: index + i * 0.3, initial: "hidden", animate: "show", variants: fade, children: [
          item.image && /* @__PURE__ */ jsx("div", { className: "ms-card-media", children: /* @__PURE__ */ jsx("img", { src: item.image, alt: "" }) }),
          /* @__PURE__ */ jsxs("div", { className: "ms-card-body", children: [
            /* @__PURE__ */ jsx("strong", { children: item.name }),
            /* @__PURE__ */ jsx("span", { children: item.text }),
            item.meta && /* @__PURE__ */ jsx("b", { children: item.meta })
          ] })
        ] }, item.name)
      ) })
    ] });
  }
  if (section.kind === "booking") {
    return /* @__PURE__ */ jsxs(motion.section, { className: "ms-block", custom: index, initial: "hidden", animate: "show", variants: fade, children: [
      /* @__PURE__ */ jsxs("header", { className: "ms-block-head", children: [
        /* @__PURE__ */ jsx("h2", { children: section.title }),
        /* @__PURE__ */ jsx("p", { children: section.subtitle })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "ms-booking", children: [
        /* @__PURE__ */ jsx("div", { className: "ms-booking-form", children: section.fields.map(
          (field) => /* @__PURE__ */ jsxs("label", { children: [
            field,
            /* @__PURE__ */ jsx("input", { readOnly: true, placeholder: "\u2014", onClick: () => onAction(field) })
          ] }, field)
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "ms-booking-slots", children: [
          /* @__PURE__ */ jsxs("span", { className: "ms-slots-title", children: [
            /* @__PURE__ */ jsx(Calendar, { size: 14 }),
            " Disponibilidad"
          ] }),
          /* @__PURE__ */ jsx("div", { children: section.slots.map((slot) => /* @__PURE__ */ jsx("button", { onClick: () => onAction(slot), children: slot }, slot)) }),
          /* @__PURE__ */ jsxs("p", { className: "ms-note", children: [
            /* @__PURE__ */ jsx(Check, { size: 13 }),
            " ",
            section.note
          ] }),
          /* @__PURE__ */ jsx("button", { className: "ms-btn full", onClick: () => onAction(section.cta), children: section.cta })
        ] })
      ] })
    ] });
  }
  if (section.kind === "gallery") {
    return /* @__PURE__ */ jsxs(motion.section, { className: "ms-block", custom: index, initial: "hidden", animate: "show", variants: fade, children: [
      section.title && /* @__PURE__ */ jsx("header", { className: "ms-block-head", children: /* @__PURE__ */ jsx("h2", { children: section.title }) }),
      /* @__PURE__ */ jsx("div", { className: "ms-gallery", children: section.images.map(
        (src, i) => /* @__PURE__ */ jsx(motion.div, { className: "ms-gallery-item", whileHover: { scale: 1.03 }, transition: { type: "spring", stiffness: 260, damping: 22 }, children: /* @__PURE__ */ jsx("img", { src, alt: "" }) }, `${src}-${i}`)
      ) })
    ] });
  }
  if (section.kind === "timeline") {
    return /* @__PURE__ */ jsxs(motion.section, { className: "ms-block", custom: index, initial: "hidden", animate: "show", variants: fade, children: [
      /* @__PURE__ */ jsxs("header", { className: "ms-block-head", children: [
        /* @__PURE__ */ jsx("h2", { children: section.title }),
        /* @__PURE__ */ jsx("p", { children: section.subtitle })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "ms-timeline", children: section.items.map(
        (item, i) => /* @__PURE__ */ jsxs(motion.div, { className: "ms-timeline-row", custom: index + i * 0.3, initial: "hidden", animate: "show", variants: fade, children: [
          /* @__PURE__ */ jsx("span", { children: item.time }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { children: item.name }),
            /* @__PURE__ */ jsxs("small", { children: [
              /* @__PURE__ */ jsx(MapPin, { size: 11 }),
              " ",
              item.text
            ] })
          ] })
        ] }, item.name)
      ) })
    ] });
  }
  return /* @__PURE__ */ jsx(motion.section, { className: "ms-block", custom: index, initial: "hidden", animate: "show", variants: fade, children: /* @__PURE__ */ jsxs("div", { className: "ms-contact", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { children: section.title }),
      /* @__PURE__ */ jsx("p", { children: section.subtitle }),
      /* @__PURE__ */ jsxs("button", { className: "ms-btn", onClick: () => onAction(section.cta), children: [
        section.cta,
        " ",
        /* @__PURE__ */ jsx(ArrowRight, { size: 14 })
      ] })
    ] }),
    /* @__PURE__ */ jsx("ul", { children: section.details.map(([label, value]) => /* @__PURE__ */ jsxs("li", { children: [
      /* @__PURE__ */ jsx("span", { children: label }),
      /* @__PURE__ */ jsx("strong", { children: value })
    ] }, label)) })
  ] }) });
}
function SmartSiteMiniSite({ demo, pageIndex, onAction }) {
  const page = demo.pages[pageIndex] ?? demo.pages[0];
  const theme = demo.theme;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `mini-site nav-${theme.navStyle}`,
      style: {
        ["--ms-bg"]: theme.bg,
        ["--ms-surface"]: theme.surface,
        ["--ms-text"]: theme.text,
        ["--ms-muted"]: theme.muted,
        ["--ms-line"]: theme.line,
        ["--ms-accent"]: theme.accent,
        ["--ms-accent-text"]: theme.accentText,
        ["--ms-radius"]: theme.radius,
        ["--ms-font"]: theme.font
      },
      children: /* @__PURE__ */ jsxs("div", { className: "ms-scroll", children: [
        page.sections.map(
          (section, index) => /* @__PURE__ */ jsx(Section, { section, index, onAction }, `${page.label}-${section.kind}-${index}`)
        ),
        /* @__PURE__ */ jsxs("footer", { className: "ms-footer", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx(Star, { size: 12 }),
            " ",
            demo.name
          ] }),
          /* @__PURE__ */ jsx("span", { children: "Experiencia dise\xF1ada por NOVOeia" })
        ] })
      ] })
    }
  );
}
export {
  SmartSiteMiniSite
};
