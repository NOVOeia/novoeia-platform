import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, ChevronRight, Search, Settings2 } from "lucide-react";
const activity = [
  ["Nueva solicitud desde el sitio", "hace 2 min"],
  ["Contenido publicado", "hace 18 min"],
  ["Seguimiento programado", "hace 1 h"],
  ["Contacto a\xF1adido al pipeline", "hace 3 h"]
];
function SmartSiteDemoPanel({ demo, onAction }) {
  const [active, setActive] = useState(0);
  return /* @__PURE__ */ jsxs("div", { className: "demo-panel", style: { ["--panel-accent"]: demo.accent }, children: [
    /* @__PURE__ */ jsxs("aside", { children: [
      /* @__PURE__ */ jsx("div", { className: "demo-panel-brand", children: demo.name.charAt(0) }),
      demo.management.map(
        (item, index) => /* @__PURE__ */ jsxs("button", { className: active === index ? "active" : "", onClick: () => setActive(index), children: [
          item,
          active === index && /* @__PURE__ */ jsx(motion.span, { layoutId: `panel-${demo.id}`, transition: { type: "spring", stiffness: 380, damping: 30 } })
        ] }, item)
      )
    ] }),
    /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsxs("header", { children: [
        /* @__PURE__ */ jsxs("div", { className: "demo-panel-search", children: [
          /* @__PURE__ */ jsx(Search, { size: 13 }),
          " Buscar en ",
          demo.management[active].toLowerCase()
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "demo-panel-tools", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => onAction("Notificaciones"), children: /* @__PURE__ */ jsx(Bell, { size: 15 }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => onAction("Configuraci\xF3n"), children: /* @__PURE__ */ jsx(Settings2, { size: 15 }) }),
          /* @__PURE__ */ jsx("button", { className: "publish", onClick: () => onAction("Publicar cambios"), children: "Publicar" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "demo-panel-kpis", children: demo.metrics.map(
        ([value, label], i) => /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07 }, children: [
          /* @__PURE__ */ jsx("small", { children: label }),
          /* @__PURE__ */ jsx("strong", { children: value }),
          /* @__PURE__ */ jsx("div", { className: "demo-panel-spark", children: /* @__PURE__ */ jsx("i", { style: { width: `${55 + i * 14}%` } }) })
        ] }, label)
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "demo-panel-grid", children: [
        /* @__PURE__ */ jsxs(motion.div, { className: "demo-panel-table", initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.14 }, children: [
          /* @__PURE__ */ jsxs("div", { className: "demo-panel-table-head", children: [
            /* @__PURE__ */ jsx("span", { children: demo.management[active] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => onAction(`Editar ${demo.management[active]}`), children: [
              "Administrar ",
              /* @__PURE__ */ jsx(ChevronRight, { size: 13 })
            ] })
          ] }),
          [0, 1, 2, 3].map(
            (row) => /* @__PURE__ */ jsxs("button", { className: "demo-panel-row", onClick: () => onAction(`${demo.management[active]} \xB7 registro ${row + 1}`), children: [
              /* @__PURE__ */ jsx("i", {}),
              /* @__PURE__ */ jsxs("span", { className: "cell-main", children: [
                demo.management[active],
                " \xB7 registro ",
                row + 1
              ] }),
              /* @__PURE__ */ jsx("span", { className: "cell-tag", children: row % 2 === 0 ? "Activo" : "Revisar" }),
              /* @__PURE__ */ jsx("span", { className: "cell-date", children: "Hoy" })
            ] }, row)
          )
        ] }),
        /* @__PURE__ */ jsxs(motion.div, { className: "demo-panel-side", initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, children: [
          /* @__PURE__ */ jsx("strong", { children: "Actividad" }),
          activity.map(
            ([text, time], i) => /* @__PURE__ */ jsxs("div", { className: "demo-panel-activity", children: [
              /* @__PURE__ */ jsx("i", { className: `dot-${i % 3}` }),
              /* @__PURE__ */ jsx("span", { children: text }),
              /* @__PURE__ */ jsx("small", { children: time })
            ] }, text)
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  SmartSiteDemoPanel
};
