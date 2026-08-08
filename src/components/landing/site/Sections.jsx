import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Minus } from "lucide-react";
function Reveal({
  children,
  delay = 0,
  className = ""
}) {
  return /* @__PURE__ */ jsx(motion.div, { className, initial: {
    opacity: 0,
    y: 28
  }, whileInView: {
    opacity: 1,
    y: 0
  }, viewport: {
    once: true,
    amount: 0.25
  }, transition: {
    duration: 0.6,
    delay,
    ease: [0.2, 0.8, 0.2, 1]
  }, children });
}
function SectionHead({
  eyebrow,
  title,
  text,
  center = true
}) {
  return /* @__PURE__ */ jsxs(Reveal, { className: center ? "nx-head center" : "nx-head", children: [
    /* @__PURE__ */ jsx("span", { className: "nx-eyebrow", children: eyebrow }),
    /* @__PURE__ */ jsx("h2", { children: title }),
    text && /* @__PURE__ */ jsx("p", { children: text })
  ] });
}
function NxButton({
  children,
  tone = "grad",
  onClick
}) {
  return /* @__PURE__ */ jsx("button", { type: "button", className: `nx-btn nx-btn-${tone}`, onClick, children });
}
function StepFlow({
  steps
}) {
  return /* @__PURE__ */ jsx("div", { className: "nx-flow", children: steps.map(([num, title, text], index) => /* @__PURE__ */ jsx(Reveal, { delay: index * 0.08, children: /* @__PURE__ */ jsxs("article", { className: "nx-flow-item", children: [
    /* @__PURE__ */ jsx("span", { className: "nx-flow-num", children: num }),
    /* @__PURE__ */ jsx("h3", { children: title }),
    /* @__PURE__ */ jsx("p", { children: text })
  ] }) }, num)) });
}
function FeatureRow({
  index,
  eyebrow,
  title,
  text,
  points,
  visual
}) {
  const flip = index % 2 === 1;
  return /* @__PURE__ */ jsxs("div", { className: `nx-row${flip ? " flip" : ""}`, children: [
    /* @__PURE__ */ jsxs(Reveal, { className: "nx-row-copy", children: [
      /* @__PURE__ */ jsx("span", { className: "nx-eyebrow", children: eyebrow }),
      /* @__PURE__ */ jsx("h3", { children: title }),
      /* @__PURE__ */ jsx("p", { children: text }),
      /* @__PURE__ */ jsx("ul", { children: points.map((point) => /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx(Check, { size: 15 }),
        point
      ] }, point)) })
    ] }),
    /* @__PURE__ */ jsx(Reveal, { className: "nx-row-visual", delay: 0.1, children: visual })
  ] });
}
function BillingToggle({
  value,
  onChange,
  save = "2 meses gratis"
}) {
  return /* @__PURE__ */ jsxs("div", { className: "nx-billing", role: "group", "aria-label": "Ciclo de facturaci\xF3n", children: [
    /* @__PURE__ */ jsx(motion.span, { className: "nx-billing-pill", "aria-hidden": "true", animate: {
      x: value === "monthly" ? "0%" : "100%"
    }, transition: {
      type: "spring",
      stiffness: 420,
      damping: 34
    } }),
    /* @__PURE__ */ jsx("button", { type: "button", className: value === "monthly" ? "on" : "", onClick: () => onChange("monthly"), "aria-pressed": value === "monthly", children: "Mensual" }),
    /* @__PURE__ */ jsxs("button", { type: "button", className: value === "annual" ? "on" : "", onClick: () => onChange("annual"), "aria-pressed": value === "annual", children: [
      "Anual",
      /* @__PURE__ */ jsx("i", { children: save })
    ] })
  ] });
}
function PriceCard({
  data,
  billing,
  onSelect
}) {
  const price = billing === "monthly" ? data.monthly : data.annual;
  return /* @__PURE__ */ jsxs("article", { className: `nx-price${data.featured ? " featured" : ""}`, children: [
    data.featured && /* @__PURE__ */ jsx("span", { className: "nx-price-ribbon", children: "M\xC1S ELEGIDO" }),
    /* @__PURE__ */ jsx("h3", { children: data.name }),
    /* @__PURE__ */ jsx("p", { className: "nx-price-tag", children: data.tagline }),
    data.custom ? /* @__PURE__ */ jsxs("div", { className: "nx-price-amount custom", children: [
      /* @__PURE__ */ jsx("strong", { children: "A medida" }),
      /* @__PURE__ */ jsx("small", { children: data.custom })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "nx-price-amount", children: [
      /* @__PURE__ */ jsx("span", { children: "USD" }),
      /* @__PURE__ */ jsx("strong", { children: price }),
      /* @__PURE__ */ jsxs("small", { children: [
        "/",
        data.unit || (billing === "monthly" ? "mes" : "mes \xB7 anual")
      ] })
    ] }),
    !data.custom && billing === "annual" && data.monthly > data.annual && /* @__PURE__ */ jsxs("p", { className: "nx-price-save", children: [
      "Ahorras USD ",
      (data.monthly - data.annual) * 12,
      " al a\xF1o"
    ] }),
    /* @__PURE__ */ jsx("ul", { children: data.features.map((feature) => /* @__PURE__ */ jsxs("li", { children: [
      /* @__PURE__ */ jsx(Check, { size: 15 }),
      feature
    ] }, feature)) }),
    data.note && /* @__PURE__ */ jsx("p", { className: "nx-price-note", children: data.note }),
    /* @__PURE__ */ jsxs("button", { type: "button", className: data.featured ? "nx-btn nx-btn-grad" : "nx-btn nx-btn-line", onClick: onSelect, children: [
      data.cta,
      " ",
      /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
    ] })
  ] });
}
function StatBand({
  items
}) {
  return /* @__PURE__ */ jsx("section", { className: "nx-band", children: /* @__PURE__ */ jsx("div", { className: "nx-band-inner", children: items.map(([value, label], index) => /* @__PURE__ */ jsx(Reveal, { delay: index * 0.07, children: /* @__PURE__ */ jsxs("div", { className: "nx-band-item", children: [
    /* @__PURE__ */ jsx("strong", { children: value }),
    /* @__PURE__ */ jsx("span", { children: label })
  ] }) }, label)) }) });
}
function FaqList({
  items
}) {
  const [open, setOpen] = useState(0);
  return /* @__PURE__ */ jsx("div", { className: "nx-faq", children: items.map(([question, answer], index) => {
    const isOpen = open === index;
    return /* @__PURE__ */ jsxs("article", { className: isOpen ? "nx-faq-item open" : "nx-faq-item", children: [
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setOpen(isOpen ? null : index), "aria-expanded": isOpen, children: [
        /* @__PURE__ */ jsx("span", { children: question }),
        /* @__PURE__ */ jsx("i", { children: isOpen ? /* @__PURE__ */ jsx(Minus, { size: 15 }) : /* @__PURE__ */ jsx(ChevronDown, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsx(motion.div, { initial: false, animate: {
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0
      }, transition: {
        duration: 0.3
      }, style: {
        overflow: "hidden"
      }, children: /* @__PURE__ */ jsx("p", { children: answer }) })
    ] }, question);
  }) });
}
function CtaBand({
  eyebrow,
  title,
  text,
  actions
}) {
  return /* @__PURE__ */ jsxs("section", { className: "nx-cta", children: [
    /* @__PURE__ */ jsx("div", { className: "nx-cta-aura" }),
    /* @__PURE__ */ jsxs(Reveal, { className: "nx-cta-inner", children: [
      /* @__PURE__ */ jsx("span", { className: "nx-eyebrow", children: eyebrow }),
      /* @__PURE__ */ jsx("h2", { children: title }),
      /* @__PURE__ */ jsx("p", { children: text }),
      /* @__PURE__ */ jsx("div", { className: "nx-cta-actions", children: actions })
    ] })
  ] });
}
function IconGrid({
  items,
  cols = 3
}) {
  return /* @__PURE__ */ jsx("div", { className: `nx-icons cols-${cols}`, children: items.map(([Icon, title, text], index) => /* @__PURE__ */ jsx(Reveal, { delay: index * 0.06, children: /* @__PURE__ */ jsxs("article", { className: "nx-icon-card", children: [
    /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Icon, { size: 19 }) }),
    /* @__PURE__ */ jsx("h3", { children: title }),
    /* @__PURE__ */ jsx("p", { children: text })
  ] }) }, title)) });
}
export {
  BillingToggle,
  CtaBand,
  FaqList,
  FeatureRow,
  IconGrid,
  NxButton,
  PriceCard,
  Reveal,
  SectionHead,
  StatBand,
  StepFlow
};
