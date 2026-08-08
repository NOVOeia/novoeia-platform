import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Info, X } from "lucide-react";
const plans = [
  {
    name: "Presencia",
    price: "87",
    tagline: "Administra tu sitio y organiza tus clientes.",
    features: ["Sitio profesional adaptable", "Panel de administraci\xF3n", "Productos, servicios y promociones", "Formularios y contactos", "Un pipeline comercial", "Reportes b\xE1sicos"],
    limits: ["Una marca y ubicaci\xF3n", "Hasta 2 usuarios", "Un pipeline", "Formularios est\xE1ndar"],
    excludes: ["WhatsApp y telefon\xEDa", "Automatizaciones personalizadas", "Redes sociales"],
    ideal: "Negocios locales, profesionales, restaurantes y tiendas peque\xF1as."
  },
  {
    name: "Conexi\xF3n",
    price: "167",
    tagline: "Conecta tu sitio, clientes y conversaciones.",
    features: ["Todo lo de Presencia", "WhatsApp Business, si aplica", "Historial y respuestas", "Hasta 3 automatizaciones", "Hasta 2 pipelines", "Calendario o reservas"],
    limits: ["Hasta 3 usuarios", "Una conexi\xF3n de WhatsApp", "Integraciones aprobadas"],
    excludes: ["Costos de Meta o telefon\xEDa", "Bots avanzados", "Community management"],
    ideal: "Cl\xEDnicas, restaurantes y equipos comerciales con citas."
  },
  {
    name: "Expansi\xF3n",
    price: "347",
    tagline: "Automatiza y centraliza tu crecimiento.",
    features: ["Todo lo de Conexi\xF3n", "Hasta 8 automatizaciones", "Hasta 3 pipelines", "Reportes ampliados", "Hasta 5 usuarios", "Redes compatibles conectadas"],
    limits: ["Una marca y un sitio", "Redes con permisos", "Revisi\xF3n peri\xF3dica"],
    excludes: ["Administraci\xF3n humana de redes", "Integraciones ilimitadas", "Personal dedicado"],
    ideal: "Empresas con varios canales y equipos en crecimiento."
  }
];
const comparisonRows = [
  ["Sitio web profesional", "S\xED", "S\xED", "S\xED"],
  ["Panel de administraci\xF3n", "S\xED", "S\xED", "S\xED"],
  ["Formularios y contactos", "S\xED", "S\xED", "S\xED"],
  ["Pipeline comercial", "1", "Hasta 2", "Hasta 3"],
  ["Usuarios", "2", "3", "5"],
  ["WhatsApp", "\u2014", "S\xED", "S\xED"],
  ["Automatizaciones", "\u2014", "Hasta 3", "Hasta 8"],
  ["Pagos", "\u2014", "B\xE1sico", "S\xED"],
  ["Reservas o calendario", "\u2014", "S\xED", "S\xED"],
  ["Redes sociales", "\u2014", "Costo adicional", "Incluidas"],
  ["Creaci\xF3n de contenido", "No", "No", "No"],
  ["Reportes", "B\xE1sicos", "Comerciales", "Ampliados"]
];
function SmartSitePlans({ onEvaluate }) {
  const [expanded, setExpanded] = useState(null);
  const [comparing, setComparing] = useState(false);
  return /* @__PURE__ */ jsxs("section", { className: "plans-section", id: "niveles", children: [
    /* @__PURE__ */ jsx("div", { className: "plans-aura" }),
    /* @__PURE__ */ jsxs(motion.div, { className: "plans-head", initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, children: [
      /* @__PURE__ */ jsx("span", { className: "section-eyebrow", children: "ELIGE C\xD3MO EMPEZAR" }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Tres niveles. ",
        /* @__PURE__ */ jsx("em", { children: "Una plataforma que crece contigo." })
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Presencia es la forma completa de comenzar. Los dem\xE1s se activan cuando tu operaci\xF3n los pide." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "plans-grid", children: plans.map((plan, index) => {
      const open = expanded === plan.name;
      return /* @__PURE__ */ jsxs(
        motion.article,
        {
          className: `plan-card ${index === 0 ? "featured" : ""}`,
          initial: { opacity: 0, y: 34 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.25 },
          transition: { duration: 0.55, delay: index * 0.1 },
          whileHover: { y: -8 },
          children: [
            index === 0 && /* @__PURE__ */ jsx("div", { className: "plan-ribbon", children: "RECOMENDADO" }),
            /* @__PURE__ */ jsx("h3", { children: plan.name }),
            /* @__PURE__ */ jsx("p", { className: "plan-tagline", children: plan.tagline }),
            /* @__PURE__ */ jsxs("div", { className: "plan-price", children: [
              /* @__PURE__ */ jsx("span", { children: "USD" }),
              /* @__PURE__ */ jsx("strong", { children: plan.price }),
              /* @__PURE__ */ jsx("small", { children: "/mes" })
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "plan-features", children: plan.features.map((f) => /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx(Check, { size: 14 }),
              f
            ] }, f)) }),
            /* @__PURE__ */ jsxs("button", { className: "plan-toggle", onClick: () => setExpanded(open ? null : plan.name), children: [
              open ? "Ocultar alcance" : "Ver alcance y l\xEDmites",
              /* @__PURE__ */ jsx(ChevronDown, { size: 15, className: open ? "open" : "" })
            ] }),
            /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: open && /* @__PURE__ */ jsxs(motion.div, { className: "plan-detail", initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.3 }, children: [
              /* @__PURE__ */ jsx("b", { children: "Incluye hasta" }),
              /* @__PURE__ */ jsx("ul", { children: plan.limits.map((l) => /* @__PURE__ */ jsx("li", { children: l }, l)) }),
              /* @__PURE__ */ jsx("b", { children: "No incluye" }),
              /* @__PURE__ */ jsx("ul", { className: "excl", children: plan.excludes.map((e) => /* @__PURE__ */ jsx("li", { children: e }, e)) }),
              /* @__PURE__ */ jsxs("p", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Ideal para:" }),
                " ",
                plan.ideal
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("button", { className: `plan-cta ${index === 0 ? "primary" : ""}`, onClick: onEvaluate, children: index === 0 ? "Empezar con Presencia" : `Evaluar ${plan.name}` })
          ]
        },
        plan.name
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "plans-notice", children: [
      /* @__PURE__ */ jsx(Info, { size: 16 }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "El desarrollo inicial se cotiza aparte" }),
        " seg\xFAn dise\xF1o, p\xE1ginas e integraciones. Los consumos externos \u2014WhatsApp, telefon\xEDa, IA y pasarelas\u2014 se cobran por separado."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "compare-block", children: [
      /* @__PURE__ */ jsxs("button", { className: "compare-toggle", onClick: () => setComparing(!comparing), "aria-expanded": comparing, children: [
        comparing ? "Ocultar comparador" : "Comparar los tres niveles",
        /* @__PURE__ */ jsx(ChevronDown, { size: 16, className: comparing ? "open" : "" })
      ] }),
      /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: comparing && /* @__PURE__ */ jsx(motion.div, { className: "compare-wrap", initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.4 }, children: /* @__PURE__ */ jsx("div", { className: "compare-scroll", tabIndex: 0, role: "region", "aria-label": "Comparaci\xF3n de niveles", children: /* @__PURE__ */ jsxs("div", { className: "compare-table", children: [
        /* @__PURE__ */ jsxs("div", { className: "compare-row head", children: [
          /* @__PURE__ */ jsx("span", { children: "Funcionalidad" }),
          /* @__PURE__ */ jsx("span", { className: "hl", children: "Presencia" }),
          /* @__PURE__ */ jsx("span", { children: "Conexi\xF3n" }),
          /* @__PURE__ */ jsx("span", { children: "Expansi\xF3n" })
        ] }),
        comparisonRows.map(
          ([f, a, b, c]) => /* @__PURE__ */ jsxs("div", { className: "compare-row", children: [
            /* @__PURE__ */ jsx("span", { children: f }),
            /* @__PURE__ */ jsx("span", { className: "hl", children: a === "S\xED" ? /* @__PURE__ */ jsx(Check, { size: 15 }) : a === "No" ? /* @__PURE__ */ jsx(X, { size: 14 }) : a }),
            /* @__PURE__ */ jsx("span", { children: b === "S\xED" ? /* @__PURE__ */ jsx(Check, { size: 15 }) : b === "No" ? /* @__PURE__ */ jsx(X, { size: 14 }) : b }),
            /* @__PURE__ */ jsx("span", { children: c === "S\xED" ? /* @__PURE__ */ jsx(Check, { size: 15 }) : c === "No" ? /* @__PURE__ */ jsx(X, { size: 14 }) : c })
          ] }, f)
        )
      ] }) }) }) })
    ] })
  ] });
}
export {
  SmartSitePlans
};
