import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Copy,
  CreditCard,
  Link2,
  Percent,
  ShieldCheck,
  Sparkles,
  Tag,
  UserPlus,
  Wallet,
  Zap
} from "lucide-react";
const PLANS = {
  esencial: { name: "NOVO Esencial", desc: "Impulsa y organiza tu negocio para crecer", cost: 47, suggested: 97 },
  avanzado: { name: "NOVO Avanzado", desc: "Automatiza, escala y lidera tu mercado", cost: 97, suggested: 197 }
};
const FEE_RATE = 0.07;
const steps = [
  {
    num: "01",
    icon: UserPlus,
    kicker: "Crea tu cuenta Partner",
    title: "Reg\xEDstrate sin costo",
    text: "Crea gratuitamente tu cuenta de NOVOeia Partners y accede a tu dashboard. Desde all\xED administras clientes, productos, enlaces de venta, pagos y ganancias.",
    micro: ["Sin pago de inscripci\xF3n", "Sin mensualidad para ser Partner"]
  },
  {
    num: "02",
    icon: Building2,
    kicker: "Configura a tu cliente",
    title: "Crea el cliente y elige su plan",
    text: "Agrega el cliente desde tu dashboard y selecciona el producto que necesita: NOVO Esencial o NOVO Avanzado.",
    micro: ["Cada cliente puede tener un producto y una configuraci\xF3n diferente"]
  },
  {
    num: "03",
    icon: Tag,
    kicker: "Define tu precio y comparte el enlace",
    title: "T\xFA decides cu\xE1nto cobrar",
    text: "Ves el costo base del producto, estableces el precio final que cobrar\xE1 tu negocio y generas un enlace de pago personalizado para tu cliente.",
    micro: ["T\xFA controlas tu oferta, tu precio y tu margen"]
  },
  {
    num: "04",
    icon: Zap,
    kicker: "El cliente paga y la cuenta se activa",
    title: "La venta activa todo autom\xE1ticamente",
    text: "Al completarse el pago, el sistema activa la cuenta de GoHighLevel, separa el valor correspondiente a NOVOeia y asigna al Partner la diferencia como ganancia.",
    micro: ["Sin inversi\xF3n inicial", "Primero vendes, luego el pago se distribuye autom\xE1ticamente"]
  }
];
const money = (value) => `$${value.toLocaleString("en-US", { minimumFractionDigits: value % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
function Amount({ value, decimals = 0 }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const origin = from.current;
    const delta = value - origin;
    let frame = 0;
    const tick = (now) => {
      const progress = Math.min((now - start) / 450, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(origin + delta * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else
        from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    "$",
    shown.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  ] });
}
function ScreenRegister() {
  return /* @__PURE__ */ jsxs("div", { className: "pm-screen", children: [
    /* @__PURE__ */ jsxs("div", { className: "pm-screen-head", children: [
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("em", { children: "partners.novoeia.com" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "pm-boot", children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          className: "pm-zero",
          initial: { scale: 0.7, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: "spring", stiffness: 240, damping: 16 },
          children: /* @__PURE__ */ jsx(Wallet, { size: 20 })
        }
      ),
      /* @__PURE__ */ jsx("strong", { children: "Tu inversi\xF3n inicial es $0" }),
      /* @__PURE__ */ jsx("small", { children: "Solo activas los servicios que necesitan tus clientes." }),
      /* @__PURE__ */ jsx("div", { className: "pm-boot-grid", children: [
        [Building2, "Dashboard"],
        [Link2, "Links de venta"],
        [BadgeCheck, "Cuentas GHL"],
        [Sparkles, "Tu marca"]
      ].map(([Icon, label], index) => {
        const Ico = Icon;
        return /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.25 + index * 0.09 },
            children: [
              /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Ico, { size: 14 }) }),
              /* @__PURE__ */ jsx("span", { children: label })
            ]
          },
          label
        );
      }) }),
      /* @__PURE__ */ jsxs(motion.div, { className: "pm-boot-chip", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.7 }, children: [
        /* @__PURE__ */ jsx(Check, { size: 12 }),
        " Cuenta Partner creada \xB7 sin mensualidad"
      ] })
    ] })
  ] });
}
function ScreenClient({ plan, onPlan }) {
  return /* @__PURE__ */ jsxs("div", { className: "pm-screen", children: [
    /* @__PURE__ */ jsxs("div", { className: "pm-screen-head", children: [
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("em", { children: "Nuevo cliente" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "pm-pane", children: [
      /* @__PURE__ */ jsxs("div", { className: "pm-client", children: [
        /* @__PURE__ */ jsx("i", { children: "DG" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Delta Group" }),
          /* @__PURE__ */ jsx("small", { children: "Cliente nuevo \xB7 Bogot\xE1" })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "pm-ok", children: [
          /* @__PURE__ */ jsx(Check, { size: 11 }),
          " Creado"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "pm-label", children: "Selecciona su plan" }),
      /* @__PURE__ */ jsx("div", { className: "pm-plans", children: Object.keys(PLANS).map((id) => {
        const item = PLANS[id];
        const on = plan === id;
        return /* @__PURE__ */ jsxs("button", { type: "button", className: on ? "pm-plan on" : "pm-plan", onClick: () => onPlan(id), children: [
          on && /* @__PURE__ */ jsx(motion.span, { className: "pm-plan-bg", layoutId: "pm-plan-bg", transition: { type: "spring", stiffness: 380, damping: 32 } }),
          /* @__PURE__ */ jsxs("span", { className: "pm-plan-top", children: [
            /* @__PURE__ */ jsx("strong", { children: item.name }),
            /* @__PURE__ */ jsx("i", { children: on ? /* @__PURE__ */ jsx(Check, { size: 12 }) : null })
          ] }),
          /* @__PURE__ */ jsx("small", { children: item.desc }),
          /* @__PURE__ */ jsxs("b", { children: [
            "Costo base ",
            money(item.cost),
            " /mes"
          ] })
        ] }, id);
      }) })
    ] })
  ] });
}
function ScreenPrice({
  plan,
  price,
  onPrice
}) {
  const cost = PLANS[plan].cost;
  const margin = price - cost;
  return /* @__PURE__ */ jsxs("div", { className: "pm-screen", children: [
    /* @__PURE__ */ jsxs("div", { className: "pm-screen-head", children: [
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("em", { children: "Configurar oferta" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "pm-pane", children: [
      /* @__PURE__ */ jsxs("div", { className: "pm-costline", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "Costo base \xB7 ",
          PLANS[plan].name
        ] }),
        /* @__PURE__ */ jsx("b", { children: money(cost) })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "pm-label", children: "Tu precio de venta" }),
      /* @__PURE__ */ jsxs("div", { className: "pm-priceview", children: [
        /* @__PURE__ */ jsx(Amount, { value: price }),
        /* @__PURE__ */ jsx("small", { children: "/mes" })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          className: "pm-range",
          type: "range",
          min: cost + 10,
          max: cost + 250,
          step: 1,
          value: price,
          onChange: (event) => onPrice(Number(event.target.value)),
          "aria-label": "Tu precio de venta"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "pm-marginbar", children: /* @__PURE__ */ jsx(motion.i, { animate: { width: `${cost / price * 100}%` }, transition: { type: "spring", stiffness: 200, damping: 28 } }) }),
      /* @__PURE__ */ jsxs("div", { className: "pm-marginrow", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("small", { children: "Costo NOVOeia" }),
          /* @__PURE__ */ jsx("b", { children: money(cost) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "win", children: [
          /* @__PURE__ */ jsx("small", { children: "Margen antes de cargos" }),
          /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx(Amount, { value: margin }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pm-link", children: [
        /* @__PURE__ */ jsx(Link2, { size: 13 }),
        /* @__PURE__ */ jsx("span", { children: "pagar.tumarca.com/delta-group" }),
        /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Copy, { size: 12 }) })
      ] })
    ] })
  ] });
}
function ScreenSplit({ plan, price, live }) {
  const cost = PLANS[plan].cost;
  const fee = price * FEE_RATE;
  const net = price - cost - fee;
  const parts = [
    { label: "NOVOeia", value: cost, tone: "#0d7fd4" },
    { label: "Procesamiento", value: fee, tone: "#8a7fb0" },
    { label: "Tu ganancia", value: net, tone: "#16a34a" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "pm-screen", children: [
    /* @__PURE__ */ jsxs("div", { className: "pm-screen-head", children: [
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("span", { className: "pm-dot" }),
      /* @__PURE__ */ jsx("em", { children: "Pago recibido" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "pm-pane", children: [
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "pm-paid",
          initial: { scale: 0.9, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: "spring", stiffness: 260, damping: 18 },
          children: [
            /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(CreditCard, { size: 15 }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("small", { children: "Delta Group pag\xF3" }),
              /* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx(Amount, { value: price }) })
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "pm-ok", children: [
              /* @__PURE__ */ jsx(Check, { size: 11 }),
              " Cuenta activada"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "pm-label", children: "El pago se distribuye autom\xE1ticamente" }),
      /* @__PURE__ */ jsx("div", { className: "pm-splitbar", children: parts.map(
        (part) => /* @__PURE__ */ jsx(
          motion.i,
          {
            style: { background: part.tone },
            initial: { width: 0 },
            animate: { width: live ? `${part.value / price * 100}%` : 0 },
            transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }
          },
          part.label
        )
      ) }),
      /* @__PURE__ */ jsx("div", { className: "pm-splitrows", children: parts.map(
        (part, index) => /* @__PURE__ */ jsxs(
          motion.div,
          {
            className: index === 2 ? "win" : "",
            initial: { opacity: 0, x: -10 },
            animate: { opacity: 1, x: 0 },
            transition: { delay: 0.15 + index * 0.12 },
            children: [
              /* @__PURE__ */ jsxs("span", { children: [
                /* @__PURE__ */ jsx("em", { style: { background: part.tone } }),
                part.label
              ] }),
              /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx(Amount, { value: part.value, decimals: 2 }) })
            ]
          },
          part.label
        )
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "pm-note-inline", children: [
        /* @__PURE__ */ jsx(ShieldCheck, { size: 12 }),
        " No adelantas dinero. La venta activa el servicio."
      ] })
    ] })
  ] });
}
function PartnerModel({ onRegister }) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState("esencial");
  const [price, setPrice] = useState(97);
  const exampleRef = useRef(null);
  const splitRef = useRef(null);
  const splitLive = useInView(splitRef, { amount: 0.4 });
  function choosePlan(next) {
    setPlan(next);
    setPrice(PLANS[next].suggested);
  }
  const cost = PLANS[plan].cost;
  const fee = price * FEE_RATE;
  const gross = price - cost;
  const net = gross - fee;
  return /* @__PURE__ */ jsxs("section", { className: "pm", id: "modelo", children: [
    /* @__PURE__ */ jsx("div", { className: "pm-glow one" }),
    /* @__PURE__ */ jsx("div", { className: "pm-glow two" }),
    /* @__PURE__ */ jsx("div", { className: "pm-grid-lines" }),
    /* @__PURE__ */ jsxs("div", { className: "pm-inner", children: [
      /* @__PURE__ */ jsxs(
        motion.header,
        {
          className: "pm-head",
          initial: { opacity: 0, y: 26 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.7 },
          children: [
            /* @__PURE__ */ jsx("span", { className: "pm-eyebrow", children: "MODELO NOVOeia PARTNERS" }),
            /* @__PURE__ */ jsxs("h2", { children: [
              "C\xF3mo ganas dinero con ",
              /* @__PURE__ */ jsx("em", { children: "NOVOeia Partners" })
            ] }),
            /* @__PURE__ */ jsx("p", { children: "No es un programa de referidos ni de comisiones. T\xFA defines el precio, atiendes a tus clientes y construyes un ingreso recurrente bajo tu propia operaci\xF3n." }),
            /* @__PURE__ */ jsxs("div", { className: "pm-hero-chip", children: [
              /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Wallet, { size: 16 }) }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Empieza ",
                /* @__PURE__ */ jsx("b", { children: "sin inscripci\xF3n" }),
                ", sin mensualidad fija y sin comprar cuentas por adelantado."
              ] })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "pm-stage", children: [
        /* @__PURE__ */ jsxs("div", { className: "pm-viewport", children: [
          /* @__PURE__ */ jsx("div", { className: "pm-device", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 22, scale: 0.98 },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: -16, scale: 0.99 },
              transition: { duration: 0.42, ease: [0.2, 0.8, 0.2, 1] },
              children: [
                step === 0 && /* @__PURE__ */ jsx(ScreenRegister, {}),
                step === 1 && /* @__PURE__ */ jsx(ScreenClient, { plan, onPlan: choosePlan }),
                step === 2 && /* @__PURE__ */ jsx(ScreenPrice, { plan, price, onPrice: setPrice }),
                step === 3 && /* @__PURE__ */ jsx("div", { ref: splitRef, children: /* @__PURE__ */ jsx(ScreenSplit, { plan, price, live: splitLive }) })
              ]
            },
            step
          ) }) }),
          /* @__PURE__ */ jsx("div", { className: "pm-progress", children: steps.map(
            (item, index) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: index === step ? "on" : index < step ? "done" : "",
                onClick: () => setStep(index),
                "aria-label": `Paso ${item.num}: ${item.title}`,
                children: index === step && /* @__PURE__ */ jsx(motion.i, { layoutId: "pm-progress", transition: { type: "spring", stiffness: 380, damping: 30 } })
              },
              item.num
            )
          ) })
        ] }),
        /* @__PURE__ */ jsxs("ol", { className: "pm-steps", children: [
          /* @__PURE__ */ jsx("span", { className: "pm-rail", children: /* @__PURE__ */ jsx(motion.i, { animate: { height: `${(step + 1) / steps.length * 100}%` }, transition: { duration: 0.5 } }) }),
          steps.map((item, index) => {
            const Icon = item.icon;
            const on = index === step;
            return /* @__PURE__ */ jsx(
              motion.li,
              {
                className: on ? "pm-step on" : "pm-step",
                initial: { opacity: 0, x: 26 },
                whileInView: { opacity: 1, x: 0 },
                viewport: { once: true, amount: 0.5 },
                transition: { duration: 0.55, delay: index * 0.07 },
                onMouseEnter: () => setStep(index),
                children: /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setStep(index), children: [
                  /* @__PURE__ */ jsxs("span", { className: "pm-step-num", children: [
                    /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Icon, { size: 14 }) }),
                    item.num
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "pm-step-kicker", children: item.kicker }),
                  /* @__PURE__ */ jsx("strong", { children: item.title }),
                  /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: on && /* @__PURE__ */ jsxs(
                    motion.span,
                    {
                      className: "pm-step-body",
                      initial: { height: 0, opacity: 0 },
                      animate: { height: "auto", opacity: 1 },
                      exit: { height: 0, opacity: 0 },
                      transition: { duration: 0.35 },
                      children: [
                        /* @__PURE__ */ jsx("p", { children: item.text }),
                        /* @__PURE__ */ jsx("div", { className: "pm-micro", children: item.micro.map(
                          (line) => /* @__PURE__ */ jsxs("em", { children: [
                            /* @__PURE__ */ jsx(Check, { size: 11 }),
                            line
                          ] }, line)
                        ) })
                      ]
                    }
                  ) })
                ] })
              },
              item.num
            );
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "pm-example",
          ref: exampleRef,
          id: "ejemplo-ganancias",
          initial: { opacity: 0, y: 34 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.25 },
          transition: { duration: 0.7 },
          children: [
            /* @__PURE__ */ jsxs("div", { className: "pm-example-head", children: [
              /* @__PURE__ */ jsx("span", { className: "pm-eyebrow sm", children: "EJEMPLO DE UNA VENTA" }),
              /* @__PURE__ */ jsx("h3", { children: "Lo que queda en tu bolsillo" }),
              /* @__PURE__ */ jsx("p", { children: "Los valores se ajustan con el plan y el precio que elegiste arriba." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "pm-example-body", children: [
              /* @__PURE__ */ jsxs("div", { className: "pm-calc", children: [
                /* @__PURE__ */ jsxs("div", { className: "pm-calc-row", children: [
                  /* @__PURE__ */ jsx("span", { children: "Precio cobrado al cliente" }),
                  /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx(Amount, { value: price }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "pm-calc-row", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Costo del plan ",
                    PLANS[plan].name
                  ] }),
                  /* @__PURE__ */ jsxs("b", { className: "neg", children: [
                    "\u2212",
                    /* @__PURE__ */ jsx(Amount, { value: cost })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "pm-calc-row sub", children: [
                  /* @__PURE__ */ jsx("span", { children: "Margen antes de cargos" }),
                  /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx(Amount, { value: gross }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "pm-calc-row", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    /* @__PURE__ */ jsx(Percent, { size: 12 }),
                    " Procesamiento y administraci\xF3n (7%)"
                  ] }),
                  /* @__PURE__ */ jsxs("b", { className: "neg", children: [
                    "\u2212",
                    /* @__PURE__ */ jsx(Amount, { value: fee, decimals: 2 })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "pm-calc-row total", children: [
                  /* @__PURE__ */ jsx("span", { children: "Ganancia estimada del Partner" }),
                  /* @__PURE__ */ jsxs("b", { children: [
                    /* @__PURE__ */ jsx(Amount, { value: net, decimals: 2 }),
                    " ",
                    /* @__PURE__ */ jsx("small", { children: "/mes" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "pm-fees", children: [
                /* @__PURE__ */ jsx("h4", { children: "\xBFQu\xE9 se descuenta de la venta?" }),
                [
                  ["Costo del producto NOVOeia", "Es el valor base del plan seleccionado para la cuenta del cliente."],
                  ["Procesamiento de pago", "Incluye los cargos de Stripe o de la pasarela utilizada."],
                  ["Administraci\xF3n de la transacci\xF3n", "Incluye la gesti\xF3n, distribuci\xF3n y operaci\xF3n autom\xE1tica del pago."]
                ].map(
                  ([title, text], index) => /* @__PURE__ */ jsxs("div", { className: "pm-fee", children: [
                    /* @__PURE__ */ jsx("i", { children: index + 1 }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("strong", { children: title }),
                      /* @__PURE__ */ jsx("small", { children: text })
                    ] })
                  ] }, title)
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "pm-legal", children: "El c\xE1lculo es ilustrativo. Los cargos finales pueden variar seg\xFAn la pasarela de pago, el pa\xEDs, los impuestos aplicables y las condiciones de procesamiento." })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.div,
        {
          className: "pm-close",
          initial: { opacity: 0, y: 26 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.6 },
          children: [
            /* @__PURE__ */ jsx("h3", { children: "No necesitas comprar inventario tecnol\xF3gico ni pagar cuentas antes de vender." }),
            /* @__PURE__ */ jsx("p", { children: "T\xFA consigues y atiendes al cliente. NOVOeia te entrega la infraestructura para operar." }),
            /* @__PURE__ */ jsxs("div", { className: "pm-close-actions", children: [
              /* @__PURE__ */ jsxs("button", { type: "button", className: "pm-cta", onClick: onRegister, children: [
                "Quiero crear mi cuenta Partner ",
                /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "pm-cta-line",
                  onClick: () => document.getElementById("ejemplo-ganancias")?.scrollIntoView({ behavior: "smooth", block: "center" }),
                  children: "Ver ejemplo de ganancias"
                }
              )
            ] })
          ]
        }
      )
    ] })
  ] });
}
export {
  PartnerModel
};
