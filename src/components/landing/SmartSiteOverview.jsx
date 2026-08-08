import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BellRing, ClipboardList, FilePenLine, Megaphone, MessageCircleMore, UsersRound } from "lucide-react";
const capabilities = [
  { icon: FilePenLine, title: "Administra tu sitio", text: "Textos, im\xE1genes, horarios y precios se actualizan desde tu panel." },
  { icon: UsersRound, title: "Organiza tus clientes", text: "Cada solicitud queda registrada, ordenada y con historial." },
  { icon: ClipboardList, title: "Recibe solicitudes", text: "Formularios que capturan lo que realmente necesitas saber." },
  { icon: Megaphone, title: "Activa promociones", text: "Campa\xF1as y banners que enciendes cuando el negocio lo pide." },
  { icon: MessageCircleMore, title: "Conecta conversaciones", text: "WhatsApp y seguimientos cuando tu operaci\xF3n est\xE9 lista." },
  { icon: BellRing, title: "Automatiza lo repetible", text: "Confirmaciones y avisos internos que ya no dependen de nadie." }
];
const steps = [
  ["01", "Escuchamos", "Entendemos prioridades, contenido y punto de partida."],
  ["02", "Dise\xF1amos", "Definimos estructura, lenguaje visual y experiencia."],
  ["03", "Construimos", "Sitio y panel configurados con lo acordado."],
  ["04", "Activamos", "Publicamos y te entregamos el control."]
];
function SmartSiteOverview() {
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 0.85", "end 0.4"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("section", { className: "contrast-section", id: "que-es", children: /* @__PURE__ */ jsxs("div", { className: "contrast-inner", children: [
      /* @__PURE__ */ jsxs(motion.div, { className: "contrast-head", initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, children: [
        /* @__PURE__ */ jsx("span", { className: "section-eyebrow", children: "LA DIFERENCIA" }),
        /* @__PURE__ */ jsxs("h2", { children: [
          "Una web muestra. La tuya deber\xEDa ",
          /* @__PURE__ */ jsx("em", { children: "trabajar." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "contrast-duo", children: [
        /* @__PURE__ */ jsxs(motion.article, { className: "contrast-card old", initial: { opacity: 0, x: -28 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true, amount: 0.4 }, transition: { duration: 0.6 }, children: [
          /* @__PURE__ */ jsx("span", { children: "WEB TRADICIONAL" }),
          /* @__PURE__ */ jsx("h3", { children: "Se queda quieta" }),
          /* @__PURE__ */ jsxs("ul", { children: [
            /* @__PURE__ */ jsx("li", { children: "Cada cambio depende de terceros" }),
            /* @__PURE__ */ jsx("li", { children: "Los contactos se pierden en el correo" }),
            /* @__PURE__ */ jsx("li", { children: "Envejece en seis meses" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(motion.article, { className: "contrast-card new", initial: { opacity: 0, x: 28 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true, amount: 0.4 }, transition: { duration: 0.6, delay: 0.1 }, children: [
          /* @__PURE__ */ jsx("span", { children: "NOVO SITIO INTELIGENTE" }),
          /* @__PURE__ */ jsx("h3", { children: "Evoluciona contigo" }),
          /* @__PURE__ */ jsxs("ul", { children: [
            /* @__PURE__ */ jsx("li", { children: "Actualizas tu contenido cuando quieras" }),
            /* @__PURE__ */ jsx("li", { children: "Cada solicitud queda organizada" }),
            /* @__PURE__ */ jsx("li", { children: "Sumas funciones al crecer" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "contrast-shine" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "capability-section", id: "herramientas", children: [
      /* @__PURE__ */ jsx("div", { className: "capability-orbit" }),
      /* @__PURE__ */ jsxs(motion.div, { className: "capability-head", initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, children: [
        /* @__PURE__ */ jsx("span", { className: "section-eyebrow", children: "TODO EN UN LUGAR" }),
        /* @__PURE__ */ jsxs("h2", { children: [
          "Menos herramientas sueltas. ",
          /* @__PURE__ */ jsx("em", { children: "M\xE1s control real." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "capability-grid", children: capabilities.map(
        ({ icon: Icon, title, text }, index) => /* @__PURE__ */ jsxs(
          motion.article,
          {
            className: "capability-card",
            initial: { opacity: 0, y: 30 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, amount: 0.3 },
            transition: { duration: 0.55, delay: index % 3 * 0.08 },
            whileHover: { y: -7 },
            children: [
              /* @__PURE__ */ jsx("div", { className: "capability-icon", children: /* @__PURE__ */ jsx(Icon, { size: 19 }) }),
              /* @__PURE__ */ jsx("h3", { children: title }),
              /* @__PURE__ */ jsx("p", { children: text }),
              /* @__PURE__ */ jsx("i", { className: "capability-index", children: String(index + 1).padStart(2, "0") })
            ]
          },
          title
        )
      ) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "process-section", id: "proceso", ref: trackRef, children: [
      /* @__PURE__ */ jsxs(motion.div, { className: "process-head", initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, children: [
        /* @__PURE__ */ jsx("span", { className: "section-eyebrow", children: "EL PROCESO" }),
        /* @__PURE__ */ jsxs("h2", { children: [
          "Cuatro pasos, ",
          /* @__PURE__ */ jsx("em", { children: "cero improvisaci\xF3n." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "process-track", children: [
        /* @__PURE__ */ jsx(motion.div, { className: "process-line", style: { scaleX: lineScale } }),
        steps.map(
          ([num, title, text], index) => /* @__PURE__ */ jsxs(motion.article, { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.5 }, transition: { delay: index * 0.12, duration: 0.55 }, children: [
            /* @__PURE__ */ jsx("span", { className: "process-num", children: num }),
            /* @__PURE__ */ jsx("h3", { children: title }),
            /* @__PURE__ */ jsx("p", { children: text }),
            index < steps.length - 1 && /* @__PURE__ */ jsx(ArrowRight, { className: "process-arrow", size: 15 })
          ] }, num)
        )
      ] })
    ] })
  ] });
}
export {
  SmartSiteOverview
};
