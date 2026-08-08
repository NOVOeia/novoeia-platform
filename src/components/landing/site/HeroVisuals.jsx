import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  CalendarCheck,
  Globe2,
  MessageCircle,
  Send,
  TrendingUp,
  Users
} from "lucide-react";
import { money } from "../../../lib/format.js";
function ClientsHeroVisual() {
  const rows = [
    ["Ana Restrepo", "Solicitud web", "Nuevo"],
    ["Grupo Delta", "WhatsApp", "En proceso"],
    ["Cl\xEDnica Sur", "Formulario", "Ganado"]
  ];
  return /* @__PURE__ */ jsxs("div", { className: "nv-hv nv-hv-clients", children: [
    /* @__PURE__ */ jsxs("div", { className: "nv-hv-bar", children: [
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("span", { children: "app.tumarca.com" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "nv-hv-body", children: [
      /* @__PURE__ */ jsx("div", { className: "nv-hv-kpis", children: [["142", "Leads"], ["28", "Clientes"], ["91%", "Renovaci\xF3n"]].map(
        ([value, label]) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("small", { children: label }),
          /* @__PURE__ */ jsx("strong", { children: value })
        ] }, label)
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "nv-hv-table", children: [
        /* @__PURE__ */ jsx("span", { className: "nv-hv-label", children: "Bandeja unificada" }),
        rows.map(
          ([name, source, state], index) => /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, x: -14 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: 0.5 + index * 0.15 },
              children: [
                /* @__PURE__ */ jsx("b", { children: name }),
                /* @__PURE__ */ jsx("span", { children: source }),
                /* @__PURE__ */ jsx("i", { className: state === "Ganado" ? "ok" : "", children: state })
              ]
            },
            name
          )
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(motion.div, { className: "nv-hv-float one", animate: { y: [0, -9, 0] }, transition: { duration: 4.6, repeat: Infinity }, children: [
      /* @__PURE__ */ jsx(Bot, { size: 14 }),
      " Automatizaci\xF3n activa"
    ] }),
    /* @__PURE__ */ jsxs(motion.div, { className: "nv-hv-float two", animate: { y: [0, 8, 0] }, transition: { duration: 5.4, repeat: Infinity }, children: [
      /* @__PURE__ */ jsx(CalendarCheck, { size: 14 }),
      " Cita agendada"
    ] })
  ] });
}
function PartnersHeroVisual() {
  const bars = [34, 46, 41, 58, 52, 70, 64, 82, 76, 94];
  return /* @__PURE__ */ jsxs("div", { className: "nv-hv nv-hv-partner", children: [
    /* @__PURE__ */ jsxs("div", { className: "nv-hv-earn", children: [
      /* @__PURE__ */ jsx("span", { children: "Ganancia mensual estimada" }),
      /* @__PURE__ */ jsx(motion.strong, { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.35 }, children: money(1500) }),
      /* @__PURE__ */ jsxs("i", { children: [
        /* @__PURE__ */ jsx(TrendingUp, { size: 13 }),
        " 30 clientes \xD7 USD 50 de margen"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "nv-hv-bars", children: bars.map(
      (height, index) => /* @__PURE__ */ jsx(
        motion.i,
        {
          initial: { height: 0 },
          animate: { height: `${height}%` },
          transition: { delay: 0.4 + index * 0.06, duration: 0.5 }
        },
        index
      )
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "nv-hv-split", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("small", { children: "Costo base" }),
        /* @__PURE__ */ jsx("strong", { children: money(47) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mid", children: [
        /* @__PURE__ */ jsx("small", { children: "Tu precio" }),
        /* @__PURE__ */ jsx("strong", { children: money(97) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "win", children: [
        /* @__PURE__ */ jsx("small", { children: "Tu ganancia" }),
        /* @__PURE__ */ jsx("strong", { children: "$43.21" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(motion.div, { className: "nv-hv-float one", animate: { y: [0, -8, 0] }, transition: { duration: 4.8, repeat: Infinity }, children: [
      /* @__PURE__ */ jsx(Users, { size: 14 }),
      " Cliente #31 activado"
    ] })
  ] });
}
function CatalogHeroVisual() {
  const tiles = [
    { color: "#f0913f", label: "Restaurante" },
    { color: "#3f9d84", label: "Cl\xEDnica" },
    { color: "#c9a227", label: "Inmobiliaria" },
    { color: "#c96f86", label: "Belleza" },
    { color: "#7bd67f", label: "Retail" },
    { color: "#ff7a29", label: "Servicios" }
  ];
  return /* @__PURE__ */ jsx("div", { className: "nv-hv nv-hv-catalog", children: tiles.map(
    (tile, index) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "nv-hv-tile",
        style: { ["--tile"]: tile.color },
        initial: { opacity: 0, y: 18, rotate: index % 2 ? 2 : -2 },
        animate: { opacity: 1, y: 0, rotate: 0 },
        transition: { delay: 0.25 + index * 0.08 },
        whileHover: { y: -7 },
        children: [
          /* @__PURE__ */ jsx("span", { className: "nv-hv-tile-top" }),
          /* @__PURE__ */ jsx("span", { className: "nv-hv-tile-line" }),
          /* @__PURE__ */ jsx("span", { className: "nv-hv-tile-line short" }),
          /* @__PURE__ */ jsx("b", { children: tile.label })
        ]
      },
      tile.label
    )
  ) });
}
function PricingHeroVisual() {
  return /* @__PURE__ */ jsx("div", { className: "nv-hv nv-hv-pricing", children: [
    { name: "Empresa", price: 97, tint: "cyan" },
    { name: "Partner", price: 47, tint: "violet", lift: true },
    { name: "Web", price: 87, tint: "pink" }
  ].map(
    (item, index) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: `nv-hv-col ${item.tint}${item.lift ? " lift" : ""}`,
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: item.lift ? -18 : 0 },
        transition: { delay: 0.25 + index * 0.1, duration: 0.6 },
        children: [
          /* @__PURE__ */ jsx("small", { children: item.name }),
          /* @__PURE__ */ jsxs("strong", { children: [
            "$",
            item.price
          ] }),
          /* @__PURE__ */ jsx("span", {}),
          /* @__PURE__ */ jsx("span", {}),
          /* @__PURE__ */ jsx("span", { className: "short" })
        ]
      },
      item.name
    )
  ) });
}
function ChatBubbles() {
  const messages = [
    ["Hola, \xBFtienen disponibilidad hoy?", false],
    ["\xA1Claro! Te comparto los horarios \u{1F447}", true],
    ["Agendado para las 4:00 PM \u2705", true]
  ];
  return /* @__PURE__ */ jsxs("div", { className: "nv-chat", children: [
    /* @__PURE__ */ jsxs("div", { className: "nv-chat-top", children: [
      /* @__PURE__ */ jsx(MessageCircle, { size: 15 }),
      " WhatsApp conectado ",
      /* @__PURE__ */ jsx("i", {})
    ] }),
    messages.map(
      ([text, mine], index) => /* @__PURE__ */ jsx(
        motion.p,
        {
          className: mine ? "mine" : "",
          initial: { opacity: 0, y: 10 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { delay: index * 0.25 },
          children: text
        },
        text
      )
    ),
    /* @__PURE__ */ jsxs("div", { className: "nv-chat-input", children: [
      /* @__PURE__ */ jsx("span", { children: "Escribe un mensaje\u2026" }),
      /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Send, { size: 13 }) })
    ] })
  ] });
}
function SiteCardVisual() {
  return /* @__PURE__ */ jsxs("div", { className: "nv-sitecard", children: [
    /* @__PURE__ */ jsxs("div", { className: "nv-sitecard-bar", children: [
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsxs("span", { children: [
        /* @__PURE__ */ jsx(Globe2, { size: 11 }),
        " tunegocio.com"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "nv-sitecard-hero", children: [
      /* @__PURE__ */ jsx("b", {}),
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", { className: "short" }),
      /* @__PURE__ */ jsx("i", { children: "Reservar" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "nv-sitecard-grid", children: [
      /* @__PURE__ */ jsx("div", {}),
      /* @__PURE__ */ jsx("div", {}),
      /* @__PURE__ */ jsx("div", {})
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "nv-sitecard-foot", children: [
      /* @__PURE__ */ jsx("span", { children: "Panel de administraci\xF3n" }),
      /* @__PURE__ */ jsx(ArrowUpRight, { size: 13 })
    ] })
  ] });
}
export {
  CatalogHeroVisual,
  ChatBubbles,
  ClientsHeroVisual,
  PartnersHeroVisual,
  PricingHeroVisual,
  SiteCardVisual
};
