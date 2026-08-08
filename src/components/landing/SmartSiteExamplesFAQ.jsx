import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Minus, Plus } from "lucide-react";
const faqs = [
  ["\xBFEl desarrollo del sitio est\xE1 incluido en el fee mensual?", "No. El desarrollo inicial se cotiza por separado seg\xFAn dise\xF1o, p\xE1ginas, contenido, integraciones y funciones. El fee mensual cubre el nivel contratado una vez la plataforma est\xE1 activa."],
  ["\xBFPuedo cambiar textos, im\xE1genes o productos?", "S\xED. Administras campos, im\xE1genes, productos, horarios y \xE1reas habilitadas durante el desarrollo, sin tocar c\xF3digo. Los cambios estructurales se cotizan aparte."],
  ["\xBFIncluye gesti\xF3n de clientes?", "Todos los niveles incluyen contactos, formularios y organizaci\xF3n comercial b\xE1sica. Conversaciones, seguimientos y automatizaciones dependen del nivel."],
  ["\xBFWhatsApp est\xE1 incluido?", "Conexi\xF3n y Expansi\xF3n contemplan una conexi\xF3n principal cuando es t\xE9cnicamente posible. Consumos de mensajes, costos de Meta y telefon\xEDa se cobran por separado."],
  ["\xBFNOVOeia administra mis redes sociales?", "No. Expansi\xF3n puede incluir la conexi\xF3n inicial de redes compatibles y herramientas para organizar contenido. No incluye piezas, respuestas ni community management."],
  ["\xBFPuedo cambiar de nivel despu\xE9s?", "S\xED. La plataforma crece por etapas. Revisamos compatibilidad, alcance y costos antes de activar funciones adicionales."],
  ["\xBFQu\xE9 cubre el soporte?", "Errores t\xE9cnicos, acceso, revisi\xF3n de funciones incluidas y orientaci\xF3n b\xE1sica. Nuevas p\xE1ginas, redise\xF1os e integraciones se cotizan por separado."]
];
function SmartSiteExamplesFAQ({ onEvaluate }) {
  const [open, setOpen] = useState(0);
  return /* @__PURE__ */ jsxs("section", { className: "faq-shell", id: "preguntas", children: [
    /* @__PURE__ */ jsx("div", { className: "faq-aura" }),
    /* @__PURE__ */ jsxs("div", { className: "faq-inner", children: [
      /* @__PURE__ */ jsxs(motion.div, { className: "faq-head", initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.4 }, children: [
        /* @__PURE__ */ jsx("span", { className: "section-eyebrow", children: "SIN LETRA PEQUE\xD1A" }),
        /* @__PURE__ */ jsxs("h2", { children: [
          "Lo importante, ",
          /* @__PURE__ */ jsx("em", { children: "dicho de frente." })
        ] }),
        /* @__PURE__ */ jsx("p", { children: "Preferimos que sepas exactamente qu\xE9 incluye cada etapa antes de decidir." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "faq-list", children: faqs.map(([question, answer], index) => {
        const isOpen = open === index;
        return /* @__PURE__ */ jsxs(
          motion.article,
          {
            className: isOpen ? "faq-item open" : "faq-item",
            initial: { opacity: 0, y: 18 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, amount: 0.5 },
            transition: { delay: Math.min(index * 0.05, 0.3) },
            children: [
              /* @__PURE__ */ jsxs("button", { onClick: () => setOpen(isOpen ? null : index), "aria-expanded": isOpen, children: [
                /* @__PURE__ */ jsx("span", { children: question }),
                /* @__PURE__ */ jsx("i", { children: isOpen ? /* @__PURE__ */ jsx(Minus, { size: 15 }) : /* @__PURE__ */ jsx(Plus, { size: 15 }) })
              ] }),
              /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: isOpen && /* @__PURE__ */ jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }, children: /* @__PURE__ */ jsx("p", { children: answer }) }) })
            ]
          },
          question
        );
      }) }),
      /* @__PURE__ */ jsxs(motion.div, { className: "faq-note", initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, children: [
        /* @__PURE__ */ jsx(Info, { size: 16 }),
        /* @__PURE__ */ jsx("p", { children: "Dominios, mensajer\xEDa, telefon\xEDa, WhatsApp Business, pasarelas de pago, IA o apps de terceros pueden pagarse directamente o refacturarse seg\xFAn el proyecto." }),
        /* @__PURE__ */ jsx("button", { onClick: onEvaluate, children: "Resolver mi caso" })
      ] })
    ] })
  ] });
}
export {
  SmartSiteExamplesFAQ
};
