import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ArrowDown, Check, FileText, LayoutDashboard, UsersRound } from "lucide-react";
import { Badge, Button } from "../ui.jsx";
const navItems = ["Inicio", "Servicios", "Promociones", "Contacto"];
function SmartSiteHero({ onEvaluate, onCompare }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % navItems.length), 1700);
    return () => window.clearInterval(timer);
  }, []);
  return /* @__PURE__ */ jsxs("section", { className: "smart-hero", "aria-labelledby": "smart-sites-title", children: [
    /* @__PURE__ */ jsx("div", { className: "smart-hero-grid" }),
    /* @__PURE__ */ jsx("div", { className: "smart-hero-orb smart-hero-orb-left" }),
    /* @__PURE__ */ jsx("div", { className: "smart-hero-orb smart-hero-orb-right" }),
    /* @__PURE__ */ jsxs("div", { className: "smart-hero-copy", children: [
      /* @__PURE__ */ jsx(Badge, { children: "NOVO SITIOS INTELIGENTES" }),
      /* @__PURE__ */ jsxs("h1", { id: "smart-sites-title", children: [
        "Tu sitio web puede hacer mucho m\xE1s que ",
        /* @__PURE__ */ jsx("span", { children: "mostrar informaci\xF3n." })
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Administra tu p\xE1gina, organiza tus clientes y activa nuevas herramientas a medida que tu negocio crece." }),
      /* @__PURE__ */ jsxs("div", { className: "smart-hero-actions", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: onCompare, children: [
          "Ver niveles ",
          /* @__PURE__ */ jsx(ArrowDown, { size: 17 })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: onEvaluate, children: "Solicitar evaluaci\xF3n" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "smart-trust-points", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx(Check, {}),
          " T\xFA administras lo habilitado"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx(Check, {}),
          " Empieza con lo necesario"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx(Check, {}),
          " Crece por etapas"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "smart-hero-visual", "aria-label": "Vista previa de un Sitio Inteligente", children: [
      /* @__PURE__ */ jsx("div", { className: "smart-visual-ring smart-visual-ring-one" }),
      /* @__PURE__ */ jsx("div", { className: "smart-visual-ring smart-visual-ring-two" }),
      /* @__PURE__ */ jsxs("div", { className: "smart-floating-note smart-note-one", children: [
        /* @__PURE__ */ jsx(FileText, { size: 16 }),
        /* @__PURE__ */ jsx("span", { children: "Nuevo formulario" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "smart-floating-note smart-note-two", children: [
        /* @__PURE__ */ jsx(UsersRound, { size: 16 }),
        /* @__PURE__ */ jsx("span", { children: "Contacto organizado" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "smart-floating-note smart-note-three", children: [
        /* @__PURE__ */ jsx(LayoutDashboard, { size: 16 }),
        /* @__PURE__ */ jsx("span", { children: "Cambios publicados" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "smart-console", children: [
        /* @__PURE__ */ jsxs("div", { className: "smart-console-bar", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("i", {}),
            /* @__PURE__ */ jsx("i", {}),
            /* @__PURE__ */ jsx("i", {})
          ] }),
          /* @__PURE__ */ jsx("span", { children: "panel.tunegocio.com" }),
          /* @__PURE__ */ jsx("b", { children: "Seguro" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "smart-console-body", children: [
          /* @__PURE__ */ jsxs("aside", { children: [
            /* @__PURE__ */ jsx("div", { className: "smart-console-logo", children: "N" }),
            navItems.map(
              (item, index) => /* @__PURE__ */ jsx("span", { className: active === index ? "active" : "", children: item }, item)
            )
          ] }),
          /* @__PURE__ */ jsxs("main", { children: [
            /* @__PURE__ */ jsxs("header", { children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("small", { children: "Tu negocio, hoy" }),
                /* @__PURE__ */ jsx("strong", { children: "Todo organizado" })
              ] }),
              /* @__PURE__ */ jsx("button", { children: "Publicar cambios" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "smart-console-stats", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("small", { children: "Solicitudes" }),
                /* @__PURE__ */ jsx("strong", { children: "24" }),
                /* @__PURE__ */ jsx("i", {})
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("small", { children: "Contactos" }),
                /* @__PURE__ */ jsx("strong", { children: "148" }),
                /* @__PURE__ */ jsx("i", {})
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("small", { children: "Promociones" }),
                /* @__PURE__ */ jsx("strong", { children: "2 activas" }),
                /* @__PURE__ */ jsx("i", {})
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "smart-console-lower", children: [
              /* @__PURE__ */ jsxs("div", { className: "smart-site-preview", children: [
                /* @__PURE__ */ jsx("div", { className: "smart-site-nav" }),
                /* @__PURE__ */ jsxs("div", { className: "smart-site-banner", children: [
                  /* @__PURE__ */ jsx("b", {}),
                  /* @__PURE__ */ jsx("span", {}),
                  /* @__PURE__ */ jsx("i", {})
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "smart-site-cards", children: [
                  /* @__PURE__ */ jsx("i", {}),
                  /* @__PURE__ */ jsx("i", {}),
                  /* @__PURE__ */ jsx("i", {})
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "smart-contacts-preview", children: [
                /* @__PURE__ */ jsx("span", { children: "Contactos recientes" }),
                ["Solicitud desde la web", "Consulta por WhatsApp", "Reserva confirmada"].map(
                  (item, index) => /* @__PURE__ */ jsxs("p", { children: [
                    /* @__PURE__ */ jsx("i", { className: `dot-${index + 1}` }),
                    item
                  ] }, item)
                )
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  SmartSiteHero
};
