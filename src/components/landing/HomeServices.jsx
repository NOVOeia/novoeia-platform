import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Inbox,
  MessageCircle,
  MonitorSmartphone,
  Repeat,
  Sparkles,
  Target,
  Users,
  Wallet
} from "lucide-react";
const crmTabs = [
  { id: "contactos", icon: Users, label: "Contactos" },
  { id: "conversaciones", icon: MessageCircle, label: "Conversaciones" },
  { id: "calendario", icon: CalendarDays, label: "Calendario" },
  { id: "oportunidades", icon: Target, label: "Oportunidades" }
];
function CompanyDemo({ live }) {
  const [tab, setTab] = useState(0);
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => setTab((current) => (current + 1) % crmTabs.length), 2800);
    return () => window.clearInterval(timer);
  }, [live]);
  const active = crmTabs[tab];
  return /* @__PURE__ */ jsxs("div", { className: "sv-demo sv-demo-company", children: [
    /* @__PURE__ */ jsxs("div", { className: "sv-bar", children: [
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("i", {}),
      /* @__PURE__ */ jsx("span", { children: "app.tuempresa.com" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "sv-company-body", children: [
      /* @__PURE__ */ jsx("div", { className: "sv-company-rail", children: crmTabs.map((item, index) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: index === tab ? "on" : "",
            onClick: () => setTab(index),
            "aria-label": item.label,
            children: [
              /* @__PURE__ */ jsx(Icon, { size: 14 }),
              index === tab && /* @__PURE__ */ jsx(motion.i, { layoutId: "sv-rail", transition: { type: "spring", stiffness: 380, damping: 30 } })
            ]
          },
          item.id
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "sv-company-screen", children: [
        /* @__PURE__ */ jsxs("div", { className: "sv-company-head", children: [
          /* @__PURE__ */ jsx("span", { children: active.label }),
          /* @__PURE__ */ jsx("b", { children: "Hoy" })
        ] }),
        /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
          motion.div,
          {
            className: "sv-company-content",
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: { duration: 0.35 },
            children: [
              active.id === "contactos" && ["Ana Restrepo", "Grupo Delta", "Luis Ram\xEDrez"].map(
                (name, index) => /* @__PURE__ */ jsxs("div", { className: "sv-line", children: [
                  /* @__PURE__ */ jsx("em", { children: name.charAt(0) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("b", { children: name }),
                    /* @__PURE__ */ jsx("small", { children: index === 0 ? "Nuevo lead \xB7 Instagram" : index === 1 ? "Cliente activo" : "Cotizaci\xF3n enviada" })
                  ] })
                ] }, name)
              ),
              active.id === "conversaciones" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("p", { className: "sv-msg", children: "\xBFTienen disponibilidad hoy?" }),
                /* @__PURE__ */ jsx("p", { className: "sv-msg mine", children: "\xA1Claro! Te comparto horarios \u{1F447}" }),
                /* @__PURE__ */ jsx("p", { className: "sv-msg mine", children: "Agendado 4:00 PM \u2705" })
              ] }),
              active.id === "calendario" && /* @__PURE__ */ jsx("div", { className: "sv-cal", children: ["09:00", "11:30", "16:00"].map(
                (time, index) => /* @__PURE__ */ jsxs("div", { className: index === 2 ? "on" : "", children: [
                  /* @__PURE__ */ jsx("small", { children: time }),
                  /* @__PURE__ */ jsx("b", { children: index === 0 ? "Llamada Grupo Delta" : index === 1 ? "Visita t\xE9cnica" : "Cierre de propuesta" })
                ] }, time)
              ) }),
              active.id === "oportunidades" && /* @__PURE__ */ jsx("div", { className: "sv-pipe", children: [["Nuevo", 42, 34], ["Contactado", 28, 62], ["Propuesta", 14, 84], ["Ganado", 9, 100]].map(
                ([stage, count, width]) => /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("small", { children: stage }),
                  /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(motion.span, { initial: { width: 0 }, animate: { width: `${width}%` }, transition: { duration: 0.7 } }) }),
                  /* @__PURE__ */ jsx("b", { children: count })
                ] }, stage)
              ) })
            ]
          },
          active.id
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(motion.div, { className: "sv-badge", animate: live ? { y: [0, -6, 0] } : {}, transition: { duration: 4.4, repeat: Infinity }, children: [
      /* @__PURE__ */ jsx(Repeat, { size: 12 }),
      " Seguimiento autom\xE1tico"
    ] })
  ] });
}
const chain = [
  { label: "GoHighLevel", sub: "Tecnolog\xEDa base" },
  { label: "Tu marca", sub: "Tu logo y dominio" },
  { label: "Tus clientes", sub: "Cuentas activas" },
  { label: "Ingresos", sub: "Recurrentes" }
];
const brands = ["Tu Agencia", "Delta Growth", "Nova Media", "Summit Co."];
function PartnerDemo({ live }) {
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState(0);
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => setStep((current) => (current + 1) % chain.length), 1800);
    return () => window.clearInterval(timer);
  }, [live]);
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => setBrand((current) => (current + 1) % brands.length), 3600);
    return () => window.clearInterval(timer);
  }, [live]);
  return /* @__PURE__ */ jsxs("div", { className: "sv-demo sv-demo-partner", children: [
    /* @__PURE__ */ jsxs("div", { className: "sv-ghl", children: [
      /* @__PURE__ */ jsx("span", { className: "sv-ghl-mark", "aria-hidden": "true", children: "HL" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("strong", { children: "GoHighLevel" }),
        /* @__PURE__ */ jsx("small", { children: "Tecnolog\xEDa que impulsa la plataforma" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "sv-chain", children: chain.map(
      (node, index) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: `sv-node${index <= step ? " lit" : ""}${index === step ? " now" : ""}`, children: [
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("b", { children: node.label }),
          /* @__PURE__ */ jsx("small", { children: node.sub })
        ] }),
        index < chain.length - 1 && /* @__PURE__ */ jsx("span", { className: `sv-link${index < step ? " lit" : ""}`, children: index === step && live && /* @__PURE__ */ jsx(motion.i, { initial: { x: "-100%" }, animate: { x: "100%" }, transition: { duration: 1.4, repeat: Infinity, ease: "linear" } }) })
      ] }, node.label)
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "sv-whitelabel", children: [
      /* @__PURE__ */ jsxs("div", { className: "sv-bar", children: [
        /* @__PURE__ */ jsx("i", {}),
        /* @__PURE__ */ jsx("i", {}),
        /* @__PURE__ */ jsx("i", {}),
        /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(motion.span, { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 6 }, transition: { duration: 0.3 }, children: [
          "app.",
          brands[brand].toLowerCase().replace(/[^a-z]/g, ""),
          ".com"
        ] }, brand) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sv-wl-body", children: [
        /* @__PURE__ */ jsxs("aside", { children: [
          /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(motion.b, { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 }, transition: { duration: 0.3 }, children: brands[brand].charAt(0) }, brand) }),
          /* @__PURE__ */ jsx("span", {}),
          /* @__PURE__ */ jsx("span", {}),
          /* @__PURE__ */ jsx("span", {}),
          /* @__PURE__ */ jsx("span", {})
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sv-wl-main", children: [
          /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(motion.strong, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 8 }, transition: { duration: 0.3 }, children: brands[brand] }, brand) }),
          /* @__PURE__ */ jsx("small", { children: "Panel con tu marca \xB7 NOVOeia nunca aparece" }),
          /* @__PURE__ */ jsxs("div", { className: "sv-wl-kpis", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("small", { children: "Clientes" }),
              /* @__PURE__ */ jsx("b", { children: "31" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("small", { children: "Tu precio" }),
              /* @__PURE__ */ jsx("b", { children: "$97" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "win", children: [
              /* @__PURE__ */ jsx("small", { children: "Ganancia" }),
              /* @__PURE__ */ jsx("b", { children: "$43" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(motion.div, { className: "sv-badge violet", animate: live ? { y: [0, -6, 0] } : {}, transition: { duration: 4.8, repeat: Infinity }, children: [
      /* @__PURE__ */ jsx(Wallet, { size: 12 }),
      " $1.339 al mes con 31 clientes"
    ] })
  ] });
}
const promos = [
  { promo: "2x1 los martes", price: "$18", tone: "#ff5fa8" },
  { promo: "Env\xEDo gratis", price: "$24", tone: "#ffa63f" },
  { promo: "Men\xFA del d\xEDa", price: "$12", tone: "#4ad9ff" }
];
function WebDemo({ live }) {
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => {
      setTyping(true);
      window.setTimeout(() => {
        setIndex((current2) => (current2 + 1) % promos.length);
        setTyping(false);
      }, 700);
    }, 3400);
    return () => window.clearInterval(timer);
  }, [live]);
  const current = promos[index];
  return /* @__PURE__ */ jsxs("div", { className: "sv-demo sv-demo-web", children: [
    /* @__PURE__ */ jsxs("div", { className: "sv-split", children: [
      /* @__PURE__ */ jsxs("div", { className: "sv-site", children: [
        /* @__PURE__ */ jsx("div", { className: "sv-site-tag", children: "Tu p\xE1gina publicada" }),
        /* @__PURE__ */ jsxs("div", { className: "sv-bar mini", children: [
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("span", { children: "tunegocio.com" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sv-site-hero", children: [
          /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(
            motion.span,
            {
              className: "sv-site-promo",
              style: { ["--p"]: current.tone },
              initial: { opacity: 0, y: 10, scale: 0.94 },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: -8 },
              transition: { duration: 0.35 },
              children: current.promo
            },
            current.promo
          ) }),
          /* @__PURE__ */ jsx("b", {}),
          /* @__PURE__ */ jsx("em", {}),
          /* @__PURE__ */ jsx("div", { className: "sv-site-cards", children: [0, 1, 2].map(
            (card) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", {}),
              /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsx(motion.small, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: current.price }, current.price) })
            ] }, card)
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sv-panel", children: [
        /* @__PURE__ */ jsx("div", { className: "sv-panel-tag", children: "Tu panel" }),
        /* @__PURE__ */ jsxs("div", { className: "sv-panel-row", children: [
          /* @__PURE__ */ jsx("small", { children: "Promoci\xF3n activa" }),
          /* @__PURE__ */ jsxs("div", { className: `sv-input${typing ? " typing" : ""}`, children: [
            /* @__PURE__ */ jsx("span", { children: current.promo }),
            /* @__PURE__ */ jsx("i", {})
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sv-panel-row", children: [
          /* @__PURE__ */ jsx("small", { children: "Precio" }),
          /* @__PURE__ */ jsx("div", { className: "sv-input", children: /* @__PURE__ */ jsx("span", { children: current.price }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "sv-panel-row", children: [
          /* @__PURE__ */ jsx("small", { children: "Formularios recibidos" }),
          /* @__PURE__ */ jsxs("div", { className: "sv-input ok", children: [
            /* @__PURE__ */ jsx("span", { children: "14 nuevos" }),
            /* @__PURE__ */ jsx(Inbox, { size: 12 })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          motion.button,
          {
            type: "button",
            className: "sv-panel-save",
            animate: typing ? { scale: [1, 0.95, 1] } : {},
            transition: { duration: 0.4 },
            children: typing ? "Guardando\u2026" : "Publicado \u2713"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(motion.div, { className: "sv-badge pink", animate: live ? { y: [0, -6, 0] } : {}, transition: { duration: 4.2, repeat: Infinity }, children: [
      /* @__PURE__ */ jsx(Sparkles, { size: 12 }),
      " Cambias t\xFA, se publica al instante"
    ] })
  ] });
}
const rows = [
  {
    id: "empresas",
    tone: "cyan",
    tag: "PARA EMPRESAS",
    icon: Building2,
    title: "Todo tu negocio en un solo lugar",
    text: "Organiza clientes, conversaciones, citas, ventas y seguimientos dentro de una sola plataforma.",
    extra: "Un CRM preparado para que tu empresa trabaje con m\xE1s orden, conecte sus canales y automatice tareas que hoy haces a mano.",
    price: "97",
    unit: "USD / mes",
    features: [
      "CRM para clientes y oportunidades",
      "WhatsApp, correo y calendarios conectados",
      "Automatizaciones de seguimiento",
      "Formularios y conversaciones organizadas",
      "Panel para controlar tu operaci\xF3n"
    ],
    cta: "Quiero organizar mi empresa",
    target: "clientes",
    footnote: "Ideal para empresas que necesitan m\xE1s orden, seguimiento y control comercial.",
    demo: (live) => /* @__PURE__ */ jsx(CompanyDemo, { live })
  },
  {
    id: "partner",
    tone: "violet",
    tag: "PARTNER CON GOHIGHLEVEL",
    icon: Users,
    title: "Vende GoHighLevel bajo tu propia marca",
    text: "\xDAnete al modelo Partner para usar GoHighLevel en tus propios negocios o crear cuentas para tus clientes.",
    extra: "Trabaja dentro de una estructura avanzada, define tus propios precios y convierte la plataforma en un servicio recurrente para tus clientes, sin tener que desarrollar un CRM desde cero.",
    price: "47",
    unit: "USD / cuenta al mes",
    features: [
      "Registro gratis, sin mensualidad fija",
      "Plataforma personalizada con tu marca",
      "T\xFA decides cu\xE1nto cobrar",
      "\xDAsala tambi\xE9n en tus negocios y marcas",
      "Soporte t\xE9cnico de nuestro equipo",
      "Ingresos mensuales recurrentes"
    ],
    cta: "Quiero ser Partner",
    target: "partners",
    footnote: "El modelo que m\xE1s ingresos recurrentes genera para agencias y consultores.",
    demo: (live) => /* @__PURE__ */ jsx(PartnerDemo, { live })
  },
  {
    id: "web",
    tone: "pink",
    tag: "WEBS INTELIGENTES",
    icon: MonitorSmartphone,
    title: "Tu web, bajo tu control",
    text: "Actualiza textos, im\xE1genes, precios y promociones desde tu propio panel, sin depender de un dise\xF1ador.",
    extra: "Tu p\xE1gina deja de ser solamente una vitrina y se convierte en una herramienta para administrar y hacer crecer tu negocio.",
    price: "87",
    unit: "USD / mes",
    features: [
      "Panel propio de administraci\xF3n",
      "Cambia textos, im\xE1genes y promociones",
      "Administra formularios y contactos",
      "Web y negocio en un mismo dashboard",
      "Dise\xF1o adaptado a tu industria",
      "\xDAsala en tu empresa o rev\xE9ndela"
    ],
    cta: "Quiero mi Web Inteligente",
    target: "webs",
    footnote: "Para negocios que cambian precios, promociones o contenido con frecuencia.",
    demo: (live) => /* @__PURE__ */ jsx(WebDemo, { live })
  }
];
function CountUp({ to, run }) {
  const [value, setValue] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (!run || done.current) return;
    done.current = true;
    const duration = 900;
    const start = performance.now();
    let frame = 0;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, to]);
  return /* @__PURE__ */ jsx(Fragment, { children: value });
}
const copyStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.22 } }
};
const copyItem = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } }
};
const featureItem = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } }
};
function ServiceRow({ row, index, go }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.35 });
  const entered = useInView(ref, { amount: 0.25, once: true });
  const Icon = row.icon;
  const flip = index % 2 === 1;
  const [spot, setSpot] = useState({ x: 50, y: 40, on: false });
  function handleMove(event) {
    const box = event.currentTarget.getBoundingClientRect();
    setSpot({
      x: (event.clientX - box.left) / box.width * 100,
      y: (event.clientY - box.top) / box.height * 100,
      on: true
    });
  }
  return /* @__PURE__ */ jsxs(
    motion.article,
    {
      ref,
      className: `sv-row tone-${row.tone}${flip ? " flip" : ""}${inView ? " live" : ""}`,
      onMouseMove: handleMove,
      onMouseLeave: () => setSpot((current) => ({ ...current, on: false })),
      initial: { opacity: 0, y: 60, scale: 0.965 },
      whileInView: { opacity: 1, y: 0, scale: 1 },
      viewport: { once: true, amount: 0.2 },
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
      children: [
        /* @__PURE__ */ jsx("div", { className: "sv-row-halo" }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "sv-row-spot",
            style: {
              opacity: spot.on ? 1 : 0,
              background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, var(--row-spot), transparent 70%)`
            }
          }
        ),
        /* @__PURE__ */ jsx(
          motion.span,
          {
            className: "sv-row-edge",
            initial: { opacity: 0, scaleX: 0 },
            whileInView: { opacity: [0, 1, 0], scaleX: 1 },
            viewport: { once: true, amount: 0.2 },
            transition: { duration: 1.5, ease: "easeOut", delay: 0.25 }
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            className: "sv-row-stage",
            initial: { opacity: 0, y: 52, rotateY: flip ? -9 : 9, rotateX: 5 },
            whileInView: { opacity: 1, y: 0, rotateY: 0, rotateX: 0 },
            viewport: { once: true, amount: 0.25 },
            transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.08 },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "sv-row-frame", children: [
                /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    className: "sv-row-boot",
                    initial: { opacity: 1 },
                    whileInView: { opacity: 0 },
                    viewport: { once: true, amount: 0.25 },
                    transition: { duration: 0.7, delay: 0.45 }
                  }
                ),
                /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    className: "sv-row-sheen",
                    initial: { x: "-130%" },
                    whileInView: { x: "130%" },
                    viewport: { once: true, amount: 0.25 },
                    transition: { duration: 1.35, ease: [0.4, 0, 0.2, 1], delay: 0.5 }
                  }
                ),
                /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    initial: { opacity: 0, scale: 0.985 },
                    whileInView: { opacity: 1, scale: 1 },
                    viewport: { once: true, amount: 0.25 },
                    transition: { duration: 0.7, delay: 0.35 },
                    children: row.demo(inView)
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "sv-row-shadow" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            className: "sv-row-copy",
            variants: copyStagger,
            initial: "hidden",
            whileInView: "show",
            viewport: { once: true, amount: 0.25 },
            children: [
              /* @__PURE__ */ jsxs(
                motion.span,
                {
                  className: "sv-row-index",
                  initial: { opacity: 0, y: 18 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, amount: 0.25 },
                  transition: { duration: 0.8, delay: 0.1 },
                  children: [
                    "0",
                    index + 1
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(motion.span, { className: "sv-row-tag", variants: copyItem, children: [
                /* @__PURE__ */ jsx(Icon, { size: 13 }),
                " ",
                row.tag
              ] }),
              /* @__PURE__ */ jsx(motion.h3, { variants: copyItem, children: row.title }),
              /* @__PURE__ */ jsx(motion.p, { className: "sv-row-text", variants: copyItem, children: row.text }),
              /* @__PURE__ */ jsx(motion.p, { className: "sv-row-extra", variants: copyItem, children: row.extra }),
              /* @__PURE__ */ jsx(motion.ul, { variants: { hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: 0.5 } } }, children: row.features.map(
                (feature) => /* @__PURE__ */ jsxs(motion.li, { variants: featureItem, children: [
                  /* @__PURE__ */ jsx(
                    motion.i,
                    {
                      variants: { hidden: { scale: 0 }, show: { scale: 1, transition: { type: "spring", stiffness: 520, damping: 18 } } },
                      children: /* @__PURE__ */ jsx(Check, { size: 12 })
                    }
                  ),
                  feature
                ] }, feature)
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "sv-row-bottom", children: [
                /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    className: "sv-row-price",
                    initial: { opacity: 0, y: 20, scale: 0.94 },
                    whileInView: { opacity: 1, y: 0, scale: 1 },
                    viewport: { once: true, amount: 0.25 },
                    transition: { type: "spring", stiffness: 260, damping: 22, delay: 0.75 },
                    children: [
                      /* @__PURE__ */ jsx("small", { children: "Desde" }),
                      /* @__PURE__ */ jsxs("strong", { children: [
                        "$",
                        /* @__PURE__ */ jsx(CountUp, { to: Number(row.price), run: entered })
                      ] }),
                      /* @__PURE__ */ jsx("span", { children: row.unit })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    className: "sv-row-actions",
                    initial: { opacity: 0, y: 18 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, amount: 0.25 },
                    transition: { duration: 0.55, delay: 0.85 },
                    children: [
                      /* @__PURE__ */ jsxs("button", { type: "button", className: "sv-solid", onClick: () => go(row.target), children: [
                        row.cta,
                        " ",
                        /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
                      ] }),
                      row.secondary && /* @__PURE__ */ jsx("button", { type: "button", className: "sv-ghost", onClick: () => go(row.secondary.target), children: row.secondary.label })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                motion.p,
                {
                  className: "sv-row-foot",
                  initial: { opacity: 0 },
                  whileInView: { opacity: 1 },
                  viewport: { once: true, amount: 0.25 },
                  transition: { duration: 0.6, delay: 0.95 },
                  children: row.footnote
                }
              )
            ]
          }
        )
      ]
    }
  );
}
function HomeServices({ go }) {
  return /* @__PURE__ */ jsxs("section", { className: "sv-light", id: "servicios", children: [
    /* @__PURE__ */ jsx("div", { className: "sv-light-top" }),
    /* @__PURE__ */ jsx("div", { className: "sv-light-mesh" }),
    /* @__PURE__ */ jsxs("div", { className: "sv-light-inner", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "sv-head",
          initial: { opacity: 0, y: 26 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.7 },
          children: [
            /* @__PURE__ */ jsx("span", { className: "sv-eyebrow", children: "TRES FORMAS DE TRABAJAR CON NOVOeia" }),
            /* @__PURE__ */ jsxs("h2", { children: [
              "Organiza tu empresa. ",
              /* @__PURE__ */ jsx("em", { children: "Vende bajo tu marca." }),
              " Controla tu web."
            ] }),
            /* @__PURE__ */ jsx("p", { children: "Elige la soluci\xF3n que necesitas hoy: usa nuestra plataforma para administrar tu negocio, convi\xE9rtete en Partner con tecnolog\xEDa GoHighLevel o ten una web inteligente que puedes actualizar t\xFA mismo." })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "sv-rows", children: rows.map(
        (row, index) => /* @__PURE__ */ jsx(ServiceRow, { row, index, go }, row.id)
      ) }),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "sv-close",
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.6 },
          children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("strong", { children: "\xBFTodav\xEDa no sabes cu\xE1l necesitas?" }),
              /* @__PURE__ */ jsx("span", { children: "Cu\xE9ntanos qu\xE9 quieres hacer y te ayudamos a elegir la soluci\xF3n correcta para tu negocio." })
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => go("webs"), children: [
              "Hablar con un asesor ",
              /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "sv-note", children: "La configuraci\xF3n inicial, migraciones, conexiones e integraciones especiales pueden tener costos adicionales seg\xFAn las necesidades de cada proyecto." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "sv-light-bottom" })
  ] });
}
export {
  HomeServices
};
