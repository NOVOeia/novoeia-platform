import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  MessageCircle,
  PencilLine,
  Sparkles
} from "lucide-react";
import { Button } from "../ui.jsx";
const initialData = {
  businessName: "",
  industry: "",
  location: "",
  websiteStatus: "",
  websiteUrl: "",
  socialStatus: "",
  instagram: "",
  facebook: "",
  otherDigitalAssets: [],
  priorities: [],
  investment: "",
  name: "",
  email: "",
  phone: "",
  contactMethod: "WhatsApp",
  note: ""
};
const priorities = [
  "Actualizar mi informaci\xF3n sin depender de terceros",
  "Recibir y organizar solicitudes",
  "Mostrar productos o servicios",
  "Facilitar reservas o citas",
  "Dar seguimiento a clientes",
  "Conectar conversaciones por WhatsApp",
  "Ordenar comunicaciones y procesos"
];
const assets = [
  "WhatsApp Business",
  "Reservas o agenda",
  "Cat\xE1logo o productos",
  "Pagos en l\xEDnea",
  "Google Business",
  "Ninguno por ahora"
];
const projectMessages = [
  "Vemos una base con mucho potencial. El siguiente paso no es sumar m\xE1s herramientas: es darle a tu presencia digital una estructura que acompa\xF1e la calidad de tu negocio.",
  "Tu proyecto ya tiene una intenci\xF3n clara. Con una experiencia digital ordenada, cada visita puede entender mejor lo que haces y cada solicitud puede llegar al lugar correcto.",
  "Hay valor en lo que est\xE1s construyendo. Cuando la informaci\xF3n, las solicitudes y las conversaciones dejan de vivir dispersas, el negocio gana claridad para avanzar.",
  "Esto no se trata de parecer m\xE1s grande: se trata de construir una operaci\xF3n digital a la altura de lo que tu negocio ya representa para sus clientes.",
  "Vemos una oportunidad real para quitar fricci\xF3n. Menos tiempo buscando informaci\xF3n o respondiendo lo mismo; m\xE1s espacio para atender, decidir y crecer con intenci\xF3n.",
  "Tu negocio merece una presencia que no se quede quieta. Una buena base digital te permite actualizar, responder y mejorar sin empezar de cero cada vez.",
  "El potencial est\xE1 en convertir lo que hoy depende de memoria, mensajes sueltos o terceros en un sistema claro que tu equipo pueda entender y usar.",
  "Ya identificaste una prioridad importante. Resolverla con una estructura sencilla puede hacer que la experiencia de tus clientes sea m\xE1s clara y que tu operaci\xF3n se sienta m\xE1s ligera.",
  "Hay una historia de negocio que vale la pena hacer visible. El objetivo es que tu sitio no solo la cuente, sino que ayude a sostener las siguientes conversaciones.",
  "Tu proyecto tiene espacio para crecer con orden. Empezar por lo esencial hoy permite que las pr\xF3ximas decisiones digitales sean m\xE1s simples, no m\xE1s pesadas."
];
function SmartSiteInquiry() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const progress = (step + 1) / 5 * 100;
  const selectedPlan = data.investment || "Quiero una recomendaci\xF3n";
  const messageIndex = (data.businessName.length + data.industry.length + data.priorities.length) % projectMessages.length;
  const projectMessage = projectMessages[messageIndex];
  const whatsappMessage = useMemo(
    () => `Hola, soy ${data.name || "un interesado"} de ${data.businessName || "mi negocio"}. Acabo de completar la evaluaci\xF3n de NOVO Sitios Inteligentes.

Mi prioridad principal: ${data.priorities[0] || "conocer la mejor opci\xF3n"}.
Nivel de inter\xE9s: ${selectedPlan}.
Activos actuales: ${[data.websiteStatus, data.socialStatus, ...data.otherDigitalAssets].filter(Boolean).join(", ") || "por evaluar"}.

Me gustar\xEDa continuar por ${data.contactMethod.toLowerCase()}.`,
    [data, selectedPlan]
  );
  function update(key, value) {
    setData((current) => ({ ...current, [key]: value }));
  }
  function toggle(key, value) {
    setData((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value]
    }));
  }
  function validate() {
    if (step === 0 && (!data.businessName || !data.industry)) {
      return "Cu\xE9ntanos el nombre de tu negocio y su industria para continuar.";
    }
    if (step === 1 && (!data.websiteStatus || !data.socialStatus)) {
      return "Selecciona c\xF3mo est\xE1s hoy en web y redes. No importa si a\xFAn no tienes nada activo.";
    }
    if (step === 2 && !data.priorities.length) {
      return "Elige al menos una prioridad para que podamos orientarte mejor.";
    }
    if (step === 3 && !data.investment) {
      return "Elige un punto de partida o pide que te recomendemos una opci\xF3n.";
    }
    if (step === 4 && (!data.name || !data.email || !data.phone)) {
      return "D\xE9janos tus datos b\xE1sicos para poder acompa\xF1arte.";
    }
    return "";
  }
  function next() {
    const issue = validate();
    if (issue) {
      setError(issue);
      return;
    }
    setError("");
    if (step < 4) setStep(step + 1);
    else
      setReviewing(true);
  }
  async function copyMessage() {
    await navigator.clipboard?.writeText(whatsappMessage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }
  function restart() {
    setReviewing(false);
    setCompleted(false);
    setStep(0);
    setData(initialData);
    setError("");
  }
  if (completed) {
    return /* @__PURE__ */ jsx("section", { className: "smart-inquiry-section", id: "evaluacion", children: /* @__PURE__ */ jsx("div", { className: "section", children: /* @__PURE__ */ jsxs("div", { className: "smart-inquiry-success", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { size: 48 }),
      /* @__PURE__ */ jsx("div", { className: "eyebrow", children: "TU EVALUACI\xD3N EST\xC1 LISTA" }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Gracias, ",
        data.name.split(" ")[0] || "bienvenido",
        "."
      ] }),
      /* @__PURE__ */ jsx("p", { className: "smart-project-message", children: projectMessage }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Ya tenemos el contexto de ",
        /* @__PURE__ */ jsx("strong", { children: data.businessName }),
        ". Revisaremos tu proyecto para proponerte una forma clara de empezar, cuidando lo que hoy es importante para tu operaci\xF3n."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "smart-success-next", children: [
        /* @__PURE__ */ jsx(MessageCircle, { size: 19 }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { children: "\xBFQu\xE9 hace \u201CCopiar mensaje para WhatsApp\u201D?" }),
          /* @__PURE__ */ jsx("span", { children: "Copia un resumen listo para pegar en una conversaci\xF3n con NOVOeia." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "smart-success-actions", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: copyMessage, children: [
          /* @__PURE__ */ jsx(Copy, { size: 17 }),
          copied ? "Resumen copiado" : "Copiar mensaje para WhatsApp"
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: restart, children: "Iniciar otra evaluaci\xF3n" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "smart-success-note", children: [
        /* @__PURE__ */ jsx(MessageCircle, { size: 16 }),
        " Al configurar el enlace oficial, este mismo paso abrir\xE1 WhatsApp con el resumen ya preparado."
      ] })
    ] }) }) });
  }
  if (reviewing) {
    const digitalSummary = [
      data.websiteStatus,
      data.socialStatus,
      data.instagram && `Instagram: ${data.instagram}`,
      data.facebook && `Otra red: ${data.facebook}`,
      ...data.otherDigitalAssets
    ].filter(Boolean);
    return /* @__PURE__ */ jsx("section", { className: "smart-inquiry-section", id: "evaluacion", children: /* @__PURE__ */ jsx("div", { className: "section", children: /* @__PURE__ */ jsxs("div", { className: "smart-review-card", children: [
      /* @__PURE__ */ jsx(ClipboardCheck, { size: 43 }),
      /* @__PURE__ */ jsx("div", { className: "eyebrow", children: "REVISI\xD3N FINAL" }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Esto es lo que entendimos de ",
        data.businessName,
        "."
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Rev\xEDsalo con calma. Si algo no representa bien tu proyecto, puedes volver y corregirlo antes de enviarlo." }),
      /* @__PURE__ */ jsxs("div", { className: "smart-review-grid", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Tu negocio" }),
          /* @__PURE__ */ jsx("strong", { children: data.businessName }),
          /* @__PURE__ */ jsxs("small", { children: [
            data.industry,
            data.location ? ` \xB7 ${data.location}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Presencia actual" }),
          /* @__PURE__ */ jsx("strong", { children: data.websiteStatus }),
          /* @__PURE__ */ jsx("small", { children: digitalSummary.slice(1).join(" \xB7 ") || "Sin otros activos indicados" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Lo que quieres resolver" }),
          /* @__PURE__ */ jsx("strong", { children: data.priorities[0] }),
          /* @__PURE__ */ jsx("small", { children: data.priorities.slice(1).join(" \xB7 ") || "Una prioridad principal" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Punto de partida" }),
          /* @__PURE__ */ jsx("strong", { children: selectedPlan }),
          /* @__PURE__ */ jsx("small", { children: "Desarrollo inicial evaluado por separado" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "C\xF3mo acompa\xF1arte" }),
          /* @__PURE__ */ jsx("strong", { children: data.contactMethod }),
          /* @__PURE__ */ jsxs("small", { children: [
            data.name,
            " \xB7 ",
            data.email
          ] })
        ] }),
        data.note && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Algo importante para ti" }),
          /* @__PURE__ */ jsx("strong", { children: data.note }),
          /* @__PURE__ */ jsx("small", { children: "Contexto adicional del proyecto" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "smart-review-message", children: [
        /* @__PURE__ */ jsx(Sparkles, { size: 19 }),
        /* @__PURE__ */ jsx("p", { children: projectMessage })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "smart-review-actions", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "ghost", onClick: () => {
          setReviewing(false);
          setStep(0);
        }, children: [
          /* @__PURE__ */ jsx(PencilLine, { size: 16 }),
          " Corregir mi evaluaci\xF3n"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => setCompleted(true), children: [
          "S\xED, esta evaluaci\xF3n refleja mi proyecto ",
          /* @__PURE__ */ jsx(ArrowRight, { size: 17 })
        ] })
      ] })
    ] }) }) });
  }
  return /* @__PURE__ */ jsx("section", { className: "smart-inquiry-section", id: "evaluacion", children: /* @__PURE__ */ jsx("div", { className: "section", children: /* @__PURE__ */ jsxs("div", { className: "smart-inquiry-layout", children: [
    /* @__PURE__ */ jsxs("div", { className: "smart-inquiry-intro", children: [
      /* @__PURE__ */ jsx("div", { className: "eyebrow", children: "SOLICITA UNA EVALUACI\xD3N" }),
      /* @__PURE__ */ jsx("h2", { children: "Empecemos por entender lo que hoy te har\xEDa la vida m\xE1s f\xE1cil." }),
      /* @__PURE__ */ jsx("p", { children: "Son solo algunas preguntas. No necesitas tener todo listo ni saber de tecnolog\xEDa: cu\xE9ntanos desde d\xF3nde partes y te orientamos." }),
      /* @__PURE__ */ jsxs("div", { className: "smart-inquiry-benefits", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx(Check, { size: 16 }),
          " Toma menos de dos minutos"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx(Check, { size: 16 }),
          " Sin compromiso de compra"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx(Check, { size: 16 }),
          " Te recomendamos un punto de partida"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "smart-inquiry-card", children: [
      /* @__PURE__ */ jsxs("div", { className: "smart-step-top", children: [
        /* @__PURE__ */ jsxs("span", { children: [
          "Paso ",
          step + 1,
          " de 5"
        ] }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("i", { style: { width: `${progress}%` } }) })
      ] }),
      step === 0 && /* @__PURE__ */ jsxs("div", { className: "smart-form-step", children: [
        /* @__PURE__ */ jsx("span", { className: "smart-step-label", children: "CONOZCAMOS TU NEGOCIO" }),
        /* @__PURE__ */ jsx("h3", { children: "Cu\xE9ntanos lo esencial." }),
        /* @__PURE__ */ jsx("p", { children: "Nosotros nos encargamos de ordenar el resto." }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Nombre del negocio",
          /* @__PURE__ */ jsx("input", { value: data.businessName, onChange: (event) => update("businessName", event.target.value), placeholder: "Ej. Caf\xE9 del Parque" })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Industria o tipo de negocio",
          /* @__PURE__ */ jsxs("select", { value: data.industry, onChange: (event) => update("industry", event.target.value), children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "Selecciona una opci\xF3n" }),
            /* @__PURE__ */ jsx("option", { children: "Restaurante o alimentos" }),
            /* @__PURE__ */ jsx("option", { children: "Salud y bienestar" }),
            /* @__PURE__ */ jsx("option", { children: "Servicios profesionales" }),
            /* @__PURE__ */ jsx("option", { children: "Bienes ra\xEDces" }),
            /* @__PURE__ */ jsx("option", { children: "Comercio o tienda" }),
            /* @__PURE__ */ jsx("option", { children: "Educaci\xF3n u organizaci\xF3n" }),
            /* @__PURE__ */ jsx("option", { children: "Otra industria" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Ciudad, pa\xEDs o mercado principal ",
          /* @__PURE__ */ jsx("em", { children: "opcional" }),
          /* @__PURE__ */ jsx("input", { value: data.location, onChange: (event) => update("location", event.target.value), placeholder: "Ej. Miami, Estados Unidos" })
        ] })
      ] }),
      step === 1 && /* @__PURE__ */ jsxs("div", { className: "smart-form-step", children: [
        /* @__PURE__ */ jsx("span", { className: "smart-step-label", children: "TUS ACTIVOS DIGITALES" }),
        /* @__PURE__ */ jsx("h3", { children: "Partimos de lo que ya tienes." }),
        /* @__PURE__ */ jsx("p", { children: "No necesitas tener todo activo. Esta informaci\xF3n nos ayuda a acompa\xF1arte mejor." }),
        /* @__PURE__ */ jsxs("fieldset", { children: [
          /* @__PURE__ */ jsx("legend", { children: "\xBFTienes sitio web hoy?" }),
          /* @__PURE__ */ jsx("div", { className: "smart-option-grid", children: ["S\xED, est\xE1 activo", "S\xED, pero necesita cambios", "No tengo sitio web"].map(
            (option) => /* @__PURE__ */ jsx("button", { type: "button", className: data.websiteStatus === option ? "selected" : "", onClick: () => update("websiteStatus", option), children: option }, option)
          ) })
        ] }),
        data.websiteStatus !== "No tengo sitio web" && /* @__PURE__ */ jsxs("label", { children: [
          "Enlace de tu sitio ",
          /* @__PURE__ */ jsx("em", { children: "opcional" }),
          /* @__PURE__ */ jsx("input", { value: data.websiteUrl, onChange: (event) => update("websiteUrl", event.target.value), placeholder: "https://..." })
        ] }),
        /* @__PURE__ */ jsxs("fieldset", { children: [
          /* @__PURE__ */ jsx("legend", { children: "\xBFTu negocio usa redes sociales?" }),
          /* @__PURE__ */ jsx("div", { className: "smart-option-grid", children: ["S\xED, las usamos", "Tenemos algunas, pero poco activas", "No todav\xEDa"].map(
            (option) => /* @__PURE__ */ jsx("button", { type: "button", className: data.socialStatus === option ? "selected" : "", onClick: () => update("socialStatus", option), children: option }, option)
          ) })
        ] }),
        data.socialStatus !== "No todav\xEDa" && /* @__PURE__ */ jsxs("div", { className: "smart-handle-grid", children: [
          /* @__PURE__ */ jsxs("label", { children: [
            "Instagram ",
            /* @__PURE__ */ jsx("em", { children: "opcional" }),
            /* @__PURE__ */ jsx("input", { value: data.instagram, onChange: (event) => update("instagram", event.target.value), placeholder: "@tuempresa" })
          ] }),
          /* @__PURE__ */ jsxs("label", { children: [
            "Facebook u otra red ",
            /* @__PURE__ */ jsx("em", { children: "opcional" }),
            /* @__PURE__ */ jsx("input", { value: data.facebook, onChange: (event) => update("facebook", event.target.value), placeholder: "@tuempresa" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("fieldset", { children: [
          /* @__PURE__ */ jsxs("legend", { children: [
            "\xBFQu\xE9 m\xE1s utilizas hoy? ",
            /* @__PURE__ */ jsx("em", { children: "opcional" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "smart-check-grid", children: assets.map(
            (asset) => /* @__PURE__ */ jsxs("button", { type: "button", className: data.otherDigitalAssets.includes(asset) ? "selected" : "", onClick: () => toggle("otherDigitalAssets", asset), children: [
              /* @__PURE__ */ jsx(Check, { size: 15 }),
              asset
            ] }, asset)
          ) })
        ] })
      ] }),
      step === 2 && /* @__PURE__ */ jsxs("div", { className: "smart-form-step", children: [
        /* @__PURE__ */ jsx("span", { className: "smart-step-label", children: "TU PRIORIDAD" }),
        /* @__PURE__ */ jsx("h3", { children: "\xBFQu\xE9 te gustar\xEDa simplificar primero?" }),
        /* @__PURE__ */ jsx("p", { children: "Elige todas las opciones que hoy tendr\xEDan un impacto real en tu operaci\xF3n." }),
        /* @__PURE__ */ jsx("div", { className: "smart-priority-list", children: priorities.map(
          (priority) => /* @__PURE__ */ jsxs("button", { type: "button", className: data.priorities.includes(priority) ? "selected" : "", onClick: () => toggle("priorities", priority), children: [
            /* @__PURE__ */ jsx("i", { children: /* @__PURE__ */ jsx(Check, { size: 15 }) }),
            priority
          ] }, priority)
        ) })
      ] }),
      step === 3 && /* @__PURE__ */ jsxs("div", { className: "smart-form-step", children: [
        /* @__PURE__ */ jsx("span", { className: "smart-step-label", children: "TU PUNTO DE PARTIDA" }),
        /* @__PURE__ */ jsx("h3", { children: "Una inversi\xF3n que acompa\xF1e tu momento." }),
        /* @__PURE__ */ jsx("p", { children: "Los valores son mensuales en USD. El desarrollo inicial se eval\xFAa aparte seg\xFAn el alcance de tu proyecto." }),
        /* @__PURE__ */ jsx("div", { className: "smart-investment-options", children: [
          ["Presencia", "USD 87/mes", "Administrar tu sitio y organizar contactos."],
          ["Conexi\xF3n", "USD 167/mes", "Sumar WhatsApp y seguimientos b\xE1sicos."],
          ["Expansi\xF3n", "USD 347/mes", "Centralizar m\xE1s procesos y redes compatibles."],
          ["Quiero una recomendaci\xF3n", "Sin decidir todav\xEDa", "Cu\xE9ntennos qu\xE9 conviene para mi negocio."]
        ].map(
          ([name, price, detail]) => /* @__PURE__ */ jsxs("button", { type: "button", className: data.investment === name ? "selected" : "", onClick: () => update("investment", name), children: [
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("b", { children: name }),
              /* @__PURE__ */ jsx("small", { children: detail })
            ] }),
            /* @__PURE__ */ jsx("strong", { children: price })
          ] }, name)
        ) }),
        /* @__PURE__ */ jsx("div", { className: "smart-form-disclaimer", children: "Los consumos de mensajes, telefon\xEDa, servicios de terceros y pasarelas de pago se cotizan o cobran por separado seg\xFAn el proyecto." })
      ] }),
      step === 4 && /* @__PURE__ */ jsxs("div", { className: "smart-form-step", children: [
        /* @__PURE__ */ jsx("span", { className: "smart-step-label", children: "CERRAMOS CON LO ESENCIAL" }),
        /* @__PURE__ */ jsx("h3", { children: "\xBFC\xF3mo prefieres que te acompa\xF1emos?" }),
        /* @__PURE__ */ jsx("p", { children: "Con estos datos podemos revisar tu caso y continuar por el canal que te resulte m\xE1s c\xF3modo." }),
        /* @__PURE__ */ jsxs("label", { children: [
          "Tu nombre",
          /* @__PURE__ */ jsx("input", { value: data.name, onChange: (event) => update("name", event.target.value), placeholder: "Nombre y apellido" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "smart-handle-grid", children: [
          /* @__PURE__ */ jsxs("label", { children: [
            "Correo",
            /* @__PURE__ */ jsx("input", { type: "email", value: data.email, onChange: (event) => update("email", event.target.value), placeholder: "tu@empresa.com" })
          ] }),
          /* @__PURE__ */ jsxs("label", { children: [
            "Tel\xE9fono",
            /* @__PURE__ */ jsx("input", { value: data.phone, onChange: (event) => update("phone", event.target.value), placeholder: "+1 000 000 0000" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("fieldset", { children: [
          /* @__PURE__ */ jsx("legend", { children: "Canal que prefieres" }),
          /* @__PURE__ */ jsx("div", { className: "smart-option-grid two-options", children: ["WhatsApp", "Llamada", "Correo"].map(
            (option) => /* @__PURE__ */ jsx("button", { type: "button", className: data.contactMethod === option ? "selected" : "", onClick: () => update("contactMethod", option), children: option }, option)
          ) })
        ] }),
        /* @__PURE__ */ jsxs("label", { children: [
          "\xBFQu\xE9 cambiar\xEDas primero si pudieras? ",
          /* @__PURE__ */ jsx("em", { children: "opcional" }),
          /* @__PURE__ */ jsx("textarea", { value: data.note, onChange: (event) => update("note", event.target.value), placeholder: "Cu\xE9ntanos en una frase qu\xE9 te har\xEDa la operaci\xF3n m\xE1s f\xE1cil.", rows: 3 })
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "smart-form-error", children: error }),
      /* @__PURE__ */ jsxs("div", { className: "smart-form-actions", children: [
        step > 0 ? /* @__PURE__ */ jsxs("button", { className: "smart-back-button", onClick: () => {
          setError("");
          setStep(step - 1);
        }, children: [
          /* @__PURE__ */ jsx(ArrowLeft, { size: 17 }),
          "Atr\xE1s"
        ] }) : /* @__PURE__ */ jsx("span", {}),
        step < 4 ? /* @__PURE__ */ jsxs(Button, { onClick: next, children: [
          "Continuar ",
          /* @__PURE__ */ jsx(ArrowRight, { size: 17 })
        ] }) : /* @__PURE__ */ jsxs(Button, { onClick: next, children: [
          "Revisar mi evaluaci\xF3n ",
          /* @__PURE__ */ jsx(ClipboardCheck, { size: 17 })
        ] })
      ] })
    ] })
  ] }) }) });
}
export {
  SmartSiteInquiry
};
