import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Inbox,
  AtSign,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
const chaosItems = [
  { icon: MessageSquare, label: "WhatsApp", note: "3 sin responder", x: 6, y: 8, r: -7 },
  { icon: AtSign, label: "Instagram DM", note: "visto ayer", x: 52, y: 2, r: 5 },
  { icon: Mail, label: "Correo", note: "en spam", x: 20, y: 40, r: 3 },
  { icon: Phone, label: "Llamada perdida", note: "sin registrar", x: 58, y: 36, r: -5 },
  { icon: Inbox, label: "Formulario web", note: "nadie lo vio", x: 10, y: 68, r: 6 },
  { icon: AlertTriangle, label: "Cita olvidada", note: "cliente perdido", x: 55, y: 68, r: -4 }
];
const orderRows = [
  { name: "Ana Restrepo", channel: "WhatsApp", stage: "Cita agendada", tone: "#16a34a" },
  { name: "Grupo Delta", channel: "Formulario", stage: "Propuesta enviada", tone: "#2563eb" },
  { name: "Cl\xEDnica Sur", channel: "Instagram", stage: "Seguimiento auto", tone: "#7c3aed" },
  { name: "Luis Ram\xEDrez", channel: "Llamada", stage: "Cliente activo", tone: "#0891b2" }
];
function ClientsChaos() {
  const [mode, setMode] = useState("antes");
  useEffect(() => {
    const timer = window.setTimeout(() => setMode("ahora"), 2600);
    return () => window.clearTimeout(timer);
  }, []);
  return /* @__PURE__ */ jsxs("section", { className: "cx-light", id: "problema", children: [
    /* @__PURE__ */ jsx("div", { className: "cx-light-top" }),
    /* @__PURE__ */ jsx("div", { className: "cx-mesh" }),
    /* @__PURE__ */ jsx("div", { className: "cx-glow one" }),
    /* @__PURE__ */ jsx("div", { className: "cx-glow two" }),
    /* @__PURE__ */ jsxs("div", { className: "cx-inner", children: [
      /* @__PURE__ */ jsxs(
        motion.header,
        {
          className: "cx-head",
          initial: { opacity: 0, y: 26 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.7 },
          children: [
            /* @__PURE__ */ jsx("span", { className: "cx-eyebrow", children: "EL PROBLEMA REAL" }),
            /* @__PURE__ */ jsxs("h2", { children: [
              "Tu negocio no falla por falta de clientes. ",
              /* @__PURE__ */ jsx("em", { children: "Falla por desorden." })
            ] }),
            /* @__PURE__ */ jsx("p", { children: "Mueve el interruptor y mira la diferencia entre c\xF3mo trabajas hoy y c\xF3mo trabajar\xEDas con NOVO." })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "cx-switch", role: "group", "aria-label": "Comparar antes y ahora", children: [
        /* @__PURE__ */ jsx(
          motion.span,
          {
            className: "cx-switch-pill",
            "aria-hidden": "true",
            animate: { x: mode === "antes" ? "0%" : "100%" },
            transition: { type: "spring", stiffness: 420, damping: 34 }
          }
        ),
        /* @__PURE__ */ jsx("button", { type: "button", className: mode === "antes" ? "on" : "", onClick: () => setMode("antes"), "aria-pressed": mode === "antes", children: "Hoy, sin NOVO" }),
        /* @__PURE__ */ jsx("button", { type: "button", className: mode === "ahora" ? "on" : "", onClick: () => setMode("ahora"), "aria-pressed": mode === "ahora", children: "Con NOVO" })
      ] }),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: `cx-compare ${mode}`,
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.25 },
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          children: [
            /* @__PURE__ */ jsx("div", { className: "cx-compare-frame", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: mode === "antes" ? /* @__PURE__ */ jsxs(
              motion.div,
              {
                className: "cx-chaos",
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
                transition: { duration: 0.35 },
                children: [
                  chaosItems.map((item, index) => {
                    const Icon = item.icon;
                    return /* @__PURE__ */ jsxs(
                      motion.div,
                      {
                        className: "cx-chaos-card",
                        style: { left: `${item.x}%`, top: `${item.y}%` },
                        initial: { opacity: 0, scale: 0.8, rotate: 0 },
                        animate: {
                          opacity: 1,
                          scale: 1,
                          rotate: item.r,
                          y: [0, index % 2 === 0 ? -5 : 5, 0]
                        },
                        transition: {
                          opacity: { delay: index * 0.07 },
                          scale: { delay: index * 0.07, type: "spring", stiffness: 260, damping: 18 },
                          rotate: { delay: index * 0.07 },
                          y: { duration: 3.6 + index * 0.3, repeat: Infinity, ease: "easeInOut" }
                        },
                        children: [
                          /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Icon, { size: 14 }) }),
                          /* @__PURE__ */ jsxs("div", { children: [
                            /* @__PURE__ */ jsx("strong", { children: item.label }),
                            /* @__PURE__ */ jsx("small", { children: item.note })
                          ] }),
                          /* @__PURE__ */ jsx("em", {})
                        ]
                      },
                      item.label
                    );
                  }),
                  /* @__PURE__ */ jsxs(
                    motion.div,
                    {
                      className: "cx-chaos-stamp",
                      initial: { opacity: 0, scale: 0.7 },
                      animate: { opacity: 1, scale: 1 },
                      transition: { delay: 0.6, type: "spring", stiffness: 220, damping: 16 },
                      children: [
                        /* @__PURE__ */ jsx(AlertTriangle, { size: 15 }),
                        " 6 canales, cero control"
                      ]
                    }
                  )
                ]
              },
              "antes"
            ) : /* @__PURE__ */ jsxs(
              motion.div,
              {
                className: "cx-order",
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
                transition: { duration: 0.35 },
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "cx-order-bar", children: [
                    /* @__PURE__ */ jsx("span", { className: "cx-od" }),
                    /* @__PURE__ */ jsx("span", { className: "cx-od" }),
                    /* @__PURE__ */ jsx("span", { className: "cx-od" }),
                    /* @__PURE__ */ jsx("em", { children: "Bandeja unificada \xB7 NOVO" }),
                    /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Search, { size: 12 }) })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "cx-order-list", children: orderRows.map(
                    (row, index) => /* @__PURE__ */ jsxs(
                      motion.div,
                      {
                        className: "cx-order-row",
                        initial: { opacity: 0, x: -24 },
                        animate: { opacity: 1, x: 0 },
                        transition: { delay: 0.12 + index * 0.09, duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
                        children: [
                          /* @__PURE__ */ jsx("b", { style: { background: row.tone }, children: row.name.charAt(0) }),
                          /* @__PURE__ */ jsxs("div", { children: [
                            /* @__PURE__ */ jsx("strong", { children: row.name }),
                            /* @__PURE__ */ jsx("small", { children: row.channel })
                          ] }),
                          /* @__PURE__ */ jsx("span", { style: { color: row.tone, background: `${row.tone}1f` }, children: row.stage })
                        ]
                      },
                      row.name
                    )
                  ) }),
                  /* @__PURE__ */ jsxs(
                    motion.div,
                    {
                      className: "cx-order-foot",
                      initial: { opacity: 0, y: 12 },
                      animate: { opacity: 1, y: 0 },
                      transition: { delay: 0.55 },
                      children: [
                        /* @__PURE__ */ jsxs("span", { children: [
                          /* @__PURE__ */ jsx(CheckCircle2, { size: 13 }),
                          " Nada sin responder"
                        ] }),
                        /* @__PURE__ */ jsxs("span", { children: [
                          /* @__PURE__ */ jsx(Zap, { size: 13 }),
                          " Seguimiento autom\xE1tico activo"
                        ] })
                      ]
                    }
                  )
                ]
              },
              "ahora"
            ) }) }),
            /* @__PURE__ */ jsx("div", { className: "cx-compare-copy", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: mode === "antes" ? /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.3 }, children: [
              /* @__PURE__ */ jsxs("span", { className: "cx-tag warn", children: [
                /* @__PURE__ */ jsx(AlertTriangle, { size: 12 }),
                " As\xED se pierde el dinero"
              ] }),
              /* @__PURE__ */ jsx("h3", { children: "Un lead por aqu\xED, otro por all\xE1" }),
              /* @__PURE__ */ jsx("p", { children: "Nadie sabe qui\xE9n respondi\xF3, ni cu\xE1ndo. Los mensajes viven en cinco lugares distintos y el seguimiento depende de que alguien se acuerde." }),
              /* @__PURE__ */ jsxs("ul", { className: "cx-bullets warn", children: [
                /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Clock, { size: 12 }) }),
                  "Horas perdidas copiando datos entre herramientas"
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Inbox, { size: 12 }) }),
                  "Mensajes sin responder que nunca se detectan"
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(AlertTriangle, { size: 12 }) }),
                  "Decisiones tomadas por intuici\xF3n, sin datos"
                ] })
              ] })
            ] }, "c-antes") : /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.3 }, children: [
              /* @__PURE__ */ jsxs("span", { className: "cx-tag good", children: [
                /* @__PURE__ */ jsx(Sparkles, { size: 12 }),
                " As\xED se ordena"
              ] }),
              /* @__PURE__ */ jsx("h3", { children: "Todo en una sola pantalla" }),
              /* @__PURE__ */ jsx("p", { children: "Cada persona con su historial, su etapa y su responsable. El seguimiento sale solo y t\xFA ves exactamente qu\xE9 canal te est\xE1 vendiendo." }),
              /* @__PURE__ */ jsxs("ul", { className: "cx-bullets good", children: [
                /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(CheckCircle2, { size: 12 }) }),
                  "Una bandeja para todos tus canales"
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Zap, { size: 12 }) }),
                  "Recordatorios y respuestas autom\xE1ticas"
                ] }),
                /* @__PURE__ */ jsxs("li", { children: [
                  /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(TrendingUp, { size: 12 }) }),
                  "Reportes que muestran d\xF3nde crecer"
                ] })
              ] })
            ] }, "c-ahora") }) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "cx-light-bottom" })
  ] });
}
const modules = [
  {
    id: "crm",
    icon: Users,
    label: "Contactos",
    title: "Cada contacto con su historia completa",
    text: "Deja de buscar en el celular. Cada cliente tiene su ficha con conversaciones, citas, pagos y notas del equipo.",
    points: ["Pipeline visual por etapas", "Historial unificado", "Notas y tareas del equipo", "Etiquetas y segmentos"]
  },
  {
    id: "chat",
    icon: MessageSquare,
    label: "Conversaciones",
    title: "WhatsApp, correo y formularios en un solo lugar",
    text: "Tu equipo responde desde una misma bandeja, con plantillas y respuestas autom\xE1ticas fuera de horario.",
    points: ["Bandeja compartida", "Respuestas autom\xE1ticas", "Plantillas r\xE1pidas", "Asignaci\xF3n por responsable"]
  },
  {
    id: "agenda",
    icon: CalendarCheck,
    label: "Agenda",
    title: "Citas que se agendan sin llamadas",
    text: "Tus clientes eligen el horario disponible y reciben la confirmaci\xF3n y el recordatorio autom\xE1ticamente.",
    points: ["Disponibilidad por profesional", "Confirmaci\xF3n autom\xE1tica", "Recordatorio 24 h antes", "Menos ausencias"]
  },
  {
    id: "auto",
    icon: Bot,
    label: "Automatizaciones",
    title: "El seguimiento que nunca se te olvida",
    text: "Bienvenidas, recordatorios y reactivaci\xF3n de clientes dormidos. Se configuran una vez y trabajan siempre.",
    points: ["Mensajes de bienvenida", "Recordatorios de cita", "Reactivaci\xF3n autom\xE1tica", "Alertas internas al equipo"]
  }
];
function ScreenCrm() {
  const stages = [
    { name: "Nuevo", tone: "#0891b2", cards: ["Ana Restrepo", "\xD3scar Pe\xF1a"] },
    { name: "Propuesta", tone: "#2563eb", cards: ["Grupo Delta"] },
    { name: "Ganado", tone: "#16a34a", cards: ["Cl\xEDnica Sur", "Luis R."] }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "cx-scr", children: [
    /* @__PURE__ */ jsxs("div", { className: "cx-scr-bar", children: [
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("em", { children: "Oportunidades" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "cx-pipe", children: stages.map(
      (stage, si) => /* @__PURE__ */ jsxs("div", { className: "cx-pipe-col", children: [
        /* @__PURE__ */ jsxs("header", { style: { color: stage.tone }, children: [
          /* @__PURE__ */ jsx("i", { style: { background: stage.tone } }),
          stage.name
        ] }),
        stage.cards.map(
          (card, ci) => /* @__PURE__ */ jsxs(
            motion.div,
            {
              className: "cx-pipe-card",
              initial: { opacity: 0, y: 14 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.1 + si * 0.12 + ci * 0.08 },
              children: [
                /* @__PURE__ */ jsx("b", { style: { background: stage.tone }, children: card.charAt(0) }),
                /* @__PURE__ */ jsx("span", { children: card })
              ]
            },
            card
          )
        )
      ] }, stage.name)
    ) })
  ] });
}
const thread = [
  { side: "in", text: "Hola, \xBFtienen disponibilidad esta semana?" },
  { side: "out", text: "\xA1Claro! Te comparto los horarios libres \u{1F447}" },
  { side: "out", text: "Jueves 10:00 \xB7 Viernes 15:30" },
  { side: "in", text: "El jueves me sirve perfecto" }
];
function ScreenChat({ live }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!live) return;
    setShown(0);
    const timer = window.setInterval(() => {
      setShown((current) => current >= thread.length ? 0 : current + 1);
    }, 1100);
    return () => window.clearInterval(timer);
  }, [live]);
  return /* @__PURE__ */ jsxs("div", { className: "cx-scr", children: [
    /* @__PURE__ */ jsxs("div", { className: "cx-scr-bar", children: [
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("em", { children: "Bandeja unificada" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "cx-chat", children: [
      /* @__PURE__ */ jsxs("div", { className: "cx-chat-who", children: [
        /* @__PURE__ */ jsx("b", { children: "A" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Ana Restrepo" }),
          /* @__PURE__ */ jsxs("small", { children: [
            /* @__PURE__ */ jsx(MessageSquare, { size: 9 }),
            " WhatsApp"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "cx-live", children: [
          /* @__PURE__ */ jsx("i", {}),
          "En l\xEDnea"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "cx-chat-body", children: [
        thread.slice(0, shown).map(
          (message, index) => /* @__PURE__ */ jsx(
            motion.p,
            {
              className: message.side,
              initial: { opacity: 0, y: 10, scale: 0.96 },
              animate: { opacity: 1, y: 0, scale: 1 },
              transition: { type: "spring", stiffness: 320, damping: 24 },
              children: message.text
            },
            `${message.text}-${index}`
          )
        ),
        shown < thread.length && /* @__PURE__ */ jsxs("span", { className: "cx-typing", children: [
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("i", {}),
          /* @__PURE__ */ jsx("i", {})
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "cx-chat-input", children: [
        /* @__PURE__ */ jsx("span", { children: "Escribe una respuesta\u2026" }),
        /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Send, { size: 12 }) })
      ] })
    ] })
  ] });
}
function ScreenAgenda() {
  const slots = ["09:00", "10:00", "11:30", "14:00", "15:30", "16:30"];
  const taken = [1, 4];
  return /* @__PURE__ */ jsxs("div", { className: "cx-scr", children: [
    /* @__PURE__ */ jsxs("div", { className: "cx-scr-bar", children: [
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("em", { children: "Agenda \xB7 Semana 12" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "cx-agenda", children: [
      /* @__PURE__ */ jsx("div", { className: "cx-agenda-days", children: ["L", "M", "M", "J", "V", "S"].map(
        (day, index) => /* @__PURE__ */ jsx("span", { className: index === 3 ? "on" : "", children: day }, `${day}-${index}`)
      ) }),
      /* @__PURE__ */ jsx("div", { className: "cx-agenda-slots", children: slots.map(
        (slot, index) => /* @__PURE__ */ jsxs(
          motion.button,
          {
            type: "button",
            className: taken.includes(index) ? "taken" : index === 2 ? "pick" : "",
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.08 * index },
            children: [
              slot,
              taken.includes(index) && /* @__PURE__ */ jsx("em", { children: "Ocupado" }),
              index === 2 && /* @__PURE__ */ jsx("em", { className: "ok", children: "Elegido" })
            ]
          },
          slot
        )
      ) }),
      /* @__PURE__ */ jsxs(motion.div, { className: "cx-agenda-done", initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6 }, children: [
        /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(CheckCircle2, { size: 14 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Cita confirmada" }),
          /* @__PURE__ */ jsx("small", { children: "Recordatorio programado 24 h antes" })
        ] })
      ] })
    ] })
  ] });
}
const flowSteps = [
  { icon: Bot, label: "Llega un lead nuevo" },
  { icon: Send, label: "Mensaje de bienvenida" },
  { icon: CalendarCheck, label: "Recordatorio 24 h antes" },
  { icon: CheckCircle2, label: "Encuesta post-visita" }
];
function ScreenAuto({ live }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => setStep((current) => (current + 1) % (flowSteps.length + 1)), 900);
    return () => window.clearInterval(timer);
  }, [live]);
  return /* @__PURE__ */ jsxs("div", { className: "cx-scr", children: [
    /* @__PURE__ */ jsxs("div", { className: "cx-scr-bar", children: [
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("span", {}),
      /* @__PURE__ */ jsx("em", { children: "Automatizaci\xF3n activa" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "cx-flow", children: flowSteps.map((item, index) => {
      const Icon = item.icon;
      const done = index < step;
      const now = index === step;
      return /* @__PURE__ */ jsxs("div", { className: `cx-flow-node${done ? " done" : ""}${now ? " now" : ""}`, children: [
        /* @__PURE__ */ jsxs("i", { children: [
          /* @__PURE__ */ jsx(Icon, { size: 14 }),
          now && /* @__PURE__ */ jsx(motion.span, { className: "cx-flow-ring", animate: { scale: [1, 1.5], opacity: [0.7, 0] }, transition: { duration: 1, repeat: Infinity } })
        ] }),
        /* @__PURE__ */ jsx("span", { children: item.label }),
        done && /* @__PURE__ */ jsx("em", { children: /* @__PURE__ */ jsx(CheckCircle2, { size: 12 }) }),
        index < flowSteps.length - 1 && /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx(motion.u, { animate: { width: index < step ? "100%" : "0%" }, transition: { duration: 0.5 } }) })
      ] }, item.label);
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "cx-flow-foot", children: [
      /* @__PURE__ */ jsx(Zap, { size: 12 }),
      " Se configura una vez y trabaja siempre"
    ] })
  ] });
}
function ClientsModules() {
  const [active, setActive] = useState("crm");
  const ref = useRef(null);
  const live = useInView(ref, { amount: 0.3 });
  const current = modules.find((module) => module.id === active);
  return /* @__PURE__ */ jsxs("section", { className: "cx-light alt", id: "incluye", children: [
    /* @__PURE__ */ jsx("div", { className: "cx-light-top" }),
    /* @__PURE__ */ jsx("div", { className: "cx-mesh" }),
    /* @__PURE__ */ jsx("div", { className: "cx-glow three" }),
    /* @__PURE__ */ jsxs("div", { className: "cx-inner", children: [
      /* @__PURE__ */ jsxs(
        motion.header,
        {
          className: "cx-head",
          initial: { opacity: 0, y: 26 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.7 },
          children: [
            /* @__PURE__ */ jsx("span", { className: "cx-eyebrow", children: "QU\xC9 INCLUYE" }),
            /* @__PURE__ */ jsxs("h2", { children: [
              "Herramientas que ",
              /* @__PURE__ */ jsx("em", { children: "trabajan por ti." })
            ] }),
            /* @__PURE__ */ jsx("p", { children: "Toca cada m\xF3dulo y velo funcionando. Esto es exactamente lo que ver\xE1s dentro de tu panel." })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "cx-tabs", role: "tablist", "aria-label": "M\xF3dulos de la plataforma", children: modules.map((module) => {
        const Icon = module.icon;
        const on = module.id === active;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": on,
            className: on ? "on" : "",
            onClick: () => setActive(module.id),
            children: [
              on && /* @__PURE__ */ jsx(motion.span, { className: "cx-tab-bg", layoutId: "cx-tab-bg", transition: { type: "spring", stiffness: 380, damping: 32 } }),
              /* @__PURE__ */ jsxs("span", { className: "cx-tab-label", children: [
                /* @__PURE__ */ jsx(Icon, { size: 15 }),
                module.label
              ] })
            ]
          },
          module.id
        );
      }) }),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "cx-module",
          ref,
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          children: [
            /* @__PURE__ */ jsx("div", { className: "cx-module-device", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 20, scale: 0.98 },
                animate: { opacity: 1, y: 0, scale: 1 },
                exit: { opacity: 0, y: -14, scale: 0.99 },
                transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] },
                children: [
                  active === "crm" && /* @__PURE__ */ jsx(ScreenCrm, {}),
                  active === "chat" && /* @__PURE__ */ jsx(ScreenChat, { live }),
                  active === "agenda" && /* @__PURE__ */ jsx(ScreenAgenda, {}),
                  active === "auto" && /* @__PURE__ */ jsx(ScreenAuto, { live })
                ]
              },
              active
            ) }) }),
            /* @__PURE__ */ jsx("div", { className: "cx-module-copy", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, x: 18 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: -14 },
                transition: { duration: 0.35 },
                children: [
                  /* @__PURE__ */ jsx("h3", { children: current.title }),
                  /* @__PURE__ */ jsx("p", { children: current.text }),
                  /* @__PURE__ */ jsx("ul", { className: "cx-bullets good", children: current.points.map(
                    (point) => /* @__PURE__ */ jsxs("li", { children: [
                      /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(CheckCircle2, { size: 12 }) }),
                      point
                    ] }, point)
                  ) })
                ]
              },
              active
            ) }) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "cx-light-bottom" })
  ] });
}
function Count({ to, suffix = "", decimals = 0, run }) {
  const [value, setValue] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (!run || done.current) return;
    done.current = true;
    const start = performance.now();
    let frame = 0;
    const tick = (now) => {
      const progress = Math.min((now - start) / 1100, 1);
      setValue(to * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, to]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    value.toLocaleString("es", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    suffix
  ] });
}
const results = [
  { value: 72, suffix: " h", label: "para estar operando", text: "Configuramos tu cuenta, migramos contactos y conectamos canales.", tone: "#0891b2" },
  { value: 18, suffix: "%", label: "m\xE1s conversi\xF3n", text: "El seguimiento autom\xE1tico recupera los leads que antes se enfriaban.", tone: "#2563eb" },
  { value: 6, suffix: " h", label: "ahorradas por semana", text: "Se acaba el copiar y pegar datos entre herramientas distintas.", tone: "#7c3aed" },
  { value: 1, suffix: "", label: "plataforma en vez de 5", text: "Una sola suscripci\xF3n, un solo panel, un solo lugar donde buscar.", tone: "#16a34a" }
];
function ClientsResults({ go }) {
  const ref = useRef(null);
  const live = useInView(ref, { amount: 0.35, once: true });
  return /* @__PURE__ */ jsxs("section", { className: "cx-results", ref, children: [
    /* @__PURE__ */ jsx("div", { className: "cx-res-glow" }),
    /* @__PURE__ */ jsxs("div", { className: "cx-inner", children: [
      /* @__PURE__ */ jsxs(
        motion.header,
        {
          className: "cx-head tight",
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.7 },
          children: [
            /* @__PURE__ */ jsx("span", { className: "cx-eyebrow dark", children: "LO QUE CAMBIA" }),
            /* @__PURE__ */ jsxs("h2", { className: "light", children: [
              "Resultados que se notan ",
              /* @__PURE__ */ jsx("em", { children: "desde la primera semana." })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "cx-res-grid", children: results.map(
        (item, index) => /* @__PURE__ */ jsxs(
          motion.article,
          {
            className: "cx-res-card",
            style: { ["--t"]: item.tone },
            initial: { opacity: 0, y: 34 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, amount: 0.3 },
            transition: { duration: 0.6, delay: index * 0.09 },
            whileHover: { y: -6 },
            children: [
              /* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx(Count, { to: item.value, suffix: item.suffix, decimals: item.decimals, run: live }) }),
              /* @__PURE__ */ jsx("span", { children: item.label }),
              /* @__PURE__ */ jsx("p", { children: item.text }),
              /* @__PURE__ */ jsx("i", {})
            ]
          },
          item.label
        )
      ) }),
      /* @__PURE__ */ jsxs(
        motion.button,
        {
          type: "button",
          className: "cx-res-cta",
          onClick: () => go("registro-cliente"),
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.5 },
          transition: { duration: 0.55 },
          children: [
            "Quiero estos resultados ",
            /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
          ]
        }
      )
    ] })
  ] });
}
export {
  ClientsChaos,
  ClientsModules,
  ClientsResults
};
