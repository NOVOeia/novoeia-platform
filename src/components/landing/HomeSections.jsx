import { jsx, jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  Handshake,
  Headset,
  MonitorSmartphone,
  MoveRight,
  Rocket,
  Users,
  Workflow
} from "lucide-react";
const IMG = {
  founder: "/hey...png",
  criteria: "/Gemini_Generated_Image_6c6jgr6c6jgr6c6j.png",
  support: "/IT_Support.png",
  growth: "/Gemini_Generated_Image_48pu3348pu3348pu.png"
};
function HomeMarquee() {
  const items = ["CRM", "Automatizaciones", "Webs Inteligentes", "Marca Blanca", "Ingresos Recurrentes", "Soporte Real"];
  return /* @__PURE__ */ jsx("section", { className: "hx-marquee", "aria-hidden": "true", children: /* @__PURE__ */ jsx("div", { className: "hx-marquee-track", children: [...items, ...items, ...items].map(
    (item, index) => /* @__PURE__ */ jsxs("span", { children: [
      item,
      /* @__PURE__ */ jsx("i", {})
    ] }, `${item}-${index}`)
  ) }) });
}
function HomeSplitScene({ go }) {
  const [side, setSide] = useState("none");
  const panels = [
    {
      key: "left",
      num: "01",
      tone: "blue",
      title: "NOVO Platform",
      text: "CRM, automatizaciones, calendarios, comunicaciones y marketing en un solo lugar.",
      points: ["CRM y pipeline de ventas", "Automatizaciones multicanal", "WhatsApp, email y calendarios"],
      cta: "Conocer NOVO",
      icon: Workflow,
      onClick: () => go("clientes")
    },
    {
      key: "right",
      num: "02",
      tone: "violet",
      title: "Webs Inteligentes",
      text: "Sitios con panel propio para administrar contenido, productos y promociones.",
      points: ["Panel f\xE1cil de administrar", "Productos, precios y horarios", "Conexi\xF3n directa con NOVO"],
      cta: "Explorar Webs Inteligentes",
      icon: MonitorSmartphone,
      onClick: () => go("webs")
    }
  ];
  return /* @__PURE__ */ jsxs("section", { className: "hx-split", id: "productos", onMouseLeave: () => setSide("none"), children: [
    /* @__PURE__ */ jsxs("div", { className: "hx-split-head", children: [
      /* @__PURE__ */ jsx("span", { className: "hx-eyebrow", children: "DOS PRODUCTOS, UN ECOSISTEMA" }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Vende tecnolog\xEDa ",
        /* @__PURE__ */ jsx("em", { children: "sin construirla" }),
        " desde cero."
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `hx-split-stage side-${side}`, children: panels.map(
      ({ key, num, tone, title, text, points, cta, icon: Icon, onClick }) => /* @__PURE__ */ jsxs(
        motion.article,
        {
          className: `hx-panel hx-panel-${tone} ${side === key ? "is-open" : ""}`,
          onMouseEnter: () => setSide(key),
          onFocus: () => setSide(key),
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] },
          children: [
            /* @__PURE__ */ jsx("div", { className: "hx-panel-glow" }),
            /* @__PURE__ */ jsx("span", { className: "hx-panel-num", children: num }),
            /* @__PURE__ */ jsx("div", { className: "hx-panel-icon", children: /* @__PURE__ */ jsx(Icon, { size: 22 }) }),
            /* @__PURE__ */ jsx("h3", { children: title }),
            /* @__PURE__ */ jsx("p", { children: text }),
            /* @__PURE__ */ jsx("ul", { children: points.map((point) => /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx(Check, { size: 14 }),
              point
            ] }, point)) }),
            /* @__PURE__ */ jsxs("button", { type: "button", className: "hx-panel-cta", onClick, children: [
              cta,
              " ",
              /* @__PURE__ */ jsx(MoveRight, { size: 16 })
            ] })
          ]
        },
        key
      )
    ) })
  ] });
}
const steps = [
  ["01", "Eliges tu camino", "Empresa que quiere ordenar su operaci\xF3n, o partner que quiere vender tecnolog\xEDa."],
  ["02", "Configuramos tu base", "Activamos tu cuenta, tu marca y las herramientas que realmente necesitas."],
  ["03", "Operas todo en un lugar", "Clientes, conversaciones, sitio y automatizaciones desde un mismo panel."],
  ["04", "Creces por etapas", "Sumas funciones, clientes o servicios cuando el negocio lo pide."]
];
function HomeProcess() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.5"] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return /* @__PURE__ */ jsxs("section", { className: "hx-process", ref, children: [
    /* @__PURE__ */ jsx("div", { className: "hx-process-veil" }),
    /* @__PURE__ */ jsxs(motion.div, { className: "hx-process-head", initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, children: [
      /* @__PURE__ */ jsx("span", { className: "hx-eyebrow", children: "C\xD3MO FUNCIONA" }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "De la primera conversaci\xF3n ",
        /* @__PURE__ */ jsx("em", { children: "a una operaci\xF3n que fluye." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hx-steps", children: [
      /* @__PURE__ */ jsx(motion.div, { className: "hx-steps-line", style: { scaleX: line } }),
      steps.map(
        ([num, title, text], index) => /* @__PURE__ */ jsxs(
          motion.article,
          {
            initial: { opacity: 0, y: 28 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, amount: 0.5 },
            transition: { delay: index * 0.11, duration: 0.55 },
            children: [
              /* @__PURE__ */ jsx("span", { className: "hx-step-num", children: num }),
              /* @__PURE__ */ jsx("h3", { children: title }),
              /* @__PURE__ */ jsx("p", { children: text })
            ]
          },
          num
        )
      )
    ] })
  ] });
}
function HomeHuman({ go }) {
  return /* @__PURE__ */ jsxs("section", { className: "hx-human", children: [
    /* @__PURE__ */ jsx("div", { className: "hx-human-aura" }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        className: "hx-human-card",
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "hx-human-figure", children: [
            /* @__PURE__ */ jsx("div", { className: "hx-human-spot" }),
            /* @__PURE__ */ jsx("img", { src: IMG.founder, alt: "Equipo NOVOeia presentando la plataforma" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "hx-human-copy", children: [
            /* @__PURE__ */ jsx("span", { className: "hx-eyebrow dark", children: "DETR\xC1S DE LA PLATAFORMA" }),
            /* @__PURE__ */ jsxs("h2", { children: [
              "No hablas con un robot. ",
              /* @__PURE__ */ jsx("em", { children: "Hablas con nosotros." })
            ] }),
            /* @__PURE__ */ jsx("p", { children: "NOVOeia no es una herramienta que se compra y se abandona. Detr\xE1s de cada cuenta hay un equipo que configura, acompa\xF1a y responde cuando algo no est\xE1 claro." }),
            /* @__PURE__ */ jsx("div", { className: "hx-human-points", children: [
              [Handshake, "Acompa\xF1amiento real", "Te guiamos en la configuraci\xF3n inicial."],
              [Headset, "Soporte con nombre", "Personas que conocen tu cuenta."],
              [Rocket, "Avanzas por etapas", "Sin pagar por lo que a\xFAn no necesitas."]
            ].map(([Icon, title, text]) => {
              const Ico = Icon;
              return /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Ico, { size: 17 }) }),
                /* @__PURE__ */ jsx("strong", { children: title }),
                /* @__PURE__ */ jsx("span", { children: text })
              ] }, title);
            }) }),
            /* @__PURE__ */ jsxs("button", { type: "button", className: "hx-btn-dark", onClick: () => go("clientes"), children: [
              "Hablar con el equipo ",
              /* @__PURE__ */ jsx(ArrowUpRight, { size: 16 })
            ] })
          ] })
        ]
      }
    )
  ] });
}
function HomeProof() {
  const cards = [
    { img: IMG.criteria, tag: "EQUIPO", title: "Construimos con criterio", text: "Integramos CRM, marketing, web y automatizaci\xF3n con una l\xF3gica clara detr\xE1s de cada decisi\xF3n." },
    { img: IMG.support, tag: "SOPORTE", title: "Acompa\xF1amiento siempre activo", text: "Asistencia y automatizaciones que resuelven antes de que el problema crezca." },
    { img: IMG.growth, tag: "NEGOCIOS", title: "Descubren c\xF3mo funciona y crecen", text: "Entienden su operaci\xF3n en minutos y escalan con estructura, no con improvisaci\xF3n." }
  ];
  return /* @__PURE__ */ jsxs("section", { className: "hx-proof", children: [
    /* @__PURE__ */ jsxs(motion.div, { className: "hx-proof-head", initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, children: [
      /* @__PURE__ */ jsx("span", { className: "hx-eyebrow", children: "PERSONAS, NO SOLO SOFTWARE" }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Tecnolog\xEDa con ",
        /* @__PURE__ */ jsx("em", { children: "gente detr\xE1s." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "hx-proof-grid", children: cards.map(
      (card, index) => /* @__PURE__ */ jsxs(
        motion.article,
        {
          className: "hx-proof-card",
          initial: { opacity: 0, y: 34 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { delay: index * 0.1, duration: 0.6 },
          whileHover: { y: -8 },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "hx-proof-media", children: [
              /* @__PURE__ */ jsx("img", { src: card.img, alt: card.title }),
              /* @__PURE__ */ jsx("div", { className: "hx-proof-tint" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "hx-proof-tag", children: card.tag }),
            /* @__PURE__ */ jsx("h3", { children: card.title }),
            /* @__PURE__ */ jsx("p", { children: card.text })
          ]
        },
        card.title
      )
    ) })
  ] });
}
function HomePaths({ go }) {
  return /* @__PURE__ */ jsxs("section", { className: "hx-paths", children: [
    /* @__PURE__ */ jsx("div", { className: "hx-paths-aura" }),
    /* @__PURE__ */ jsxs(motion.div, { className: "hx-paths-head", initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, children: [
      /* @__PURE__ */ jsx("span", { className: "hx-eyebrow", children: "ELIGE TU CAMINO" }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "\xBFC\xF3mo quieres ",
        /* @__PURE__ */ jsx("em", { children: "crecer con NOVO?" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "hx-fork", children: [
        /* @__PURE__ */ jsx("i", {}),
        /* @__PURE__ */ jsx("b", {}),
        /* @__PURE__ */ jsx("i", {})
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "hx-paths-grid", children: [
      /* @__PURE__ */ jsxs(motion.article, { className: "hx-path hx-path-client", initial: { opacity: 0, x: -30 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true, amount: 0.3 }, transition: { duration: 0.6 }, children: [
        /* @__PURE__ */ jsx("div", { className: "hx-path-orbit" }),
        /* @__PURE__ */ jsx("div", { className: "hx-path-icon", children: /* @__PURE__ */ jsx(Building2, { size: 22 }) }),
        /* @__PURE__ */ jsx("span", { children: "PARA EMPRESAS" }),
        /* @__PURE__ */ jsx("h3", { children: "Administra todo desde una sola plataforma" }),
        /* @__PURE__ */ jsx("p", { children: "Obt\xE9n NOVO por USD 97 al mes y centraliza clientes, ventas, comunicaci\xF3n y marketing." }),
        /* @__PURE__ */ jsxs("button", { type: "button", className: "hx-btn-glow", onClick: () => go("registro-cliente"), children: [
          "Crear mi cuenta ",
          /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(motion.article, { className: "hx-path hx-path-partner", initial: { opacity: 0, x: 30 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true, amount: 0.3 }, transition: { duration: 0.6, delay: 0.08 }, children: [
        /* @__PURE__ */ jsx("div", { className: "hx-path-orbit violet" }),
        /* @__PURE__ */ jsx("div", { className: "hx-path-icon violet", children: /* @__PURE__ */ jsx(Users, { size: 22 }) }),
        /* @__PURE__ */ jsx("span", { children: "PARA PARTNERS" }),
        /* @__PURE__ */ jsx("h3", { children: "Crea una fuente de ingresos recurrentes" }),
        /* @__PURE__ */ jsx("p", { children: "Adquiere cuentas desde USD 47, define tu precio de reventa y administra clientes bajo tu marca." }),
        /* @__PURE__ */ jsxs("button", { type: "button", className: "hx-btn-outline", onClick: () => go("partners"), children: [
          "Ver c\xF3mo ser Partner ",
          /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
        ] })
      ] })
    ] })
  ] });
}
export {
  HomeHuman,
  HomeMarquee,
  HomePaths,
  HomeProcess,
  HomeProof,
  HomeSplitScene
};
