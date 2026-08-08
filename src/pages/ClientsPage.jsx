import '../styles/nx-page.css';
import { useState } from "react";
import { ArrowRight, ShieldCheck, Users, Zap } from "lucide-react";
import PublicHeader from "../components/PublicHeader.jsx";
import Footer from "../components/Footer.jsx";
import { PageHero } from "../components/landing/site/PageHero.jsx";
import { ClientsHeroVisual } from "../components/landing/site/HeroVisuals.jsx";
import { ClientsChaos, ClientsModules, ClientsResults } from "../components/landing/ClientsSections.jsx";
import {
  BillingToggle,
  CtaBand,
  FaqList,
  NxButton,
  PriceCard,
  Reveal,
  SectionHead,
  StatBand,
  StepFlow
} from "../components/landing/site/Sections.jsx";
const plans = [
  {
    name: "NOVO Esencial",
    tagline: "Impulsa y organiza tu negocio para crecer.",
    monthly: 97,
    annual: 81,
    features: ["CRM y pipeline de ventas", "Bandeja unificada", "Calendarios y formularios", "Email y SMS", "Reportes b\xE1sicos", "Hasta 2 usuarios"],
    cta: "Empezar con Esencial"
  },
  {
    name: "NOVO Avanzado",
    tagline: "Automatiza, escala y lidera tu mercado.",
    monthly: 197,
    annual: 164,
    features: ["Todo lo de NOVO Esencial", "Automatizaciones ilimitadas", "WhatsApp conectado", "Campa\xF1as de marketing", "Reportes avanzados", "Permisos por rol y m\xE1s usuarios"],
    cta: "Elegir NOVO Avanzado",
    featured: true
  },
  {
    name: "NOVO Profesional",
    tagline: "Dise\xF1ado a la medida de tu empresa o proyecto.",
    monthly: 0,
    annual: 0,
    custom: "Se cotiza seg\xFAn el alcance",
    features: [
      "Levantamiento previo de tus necesidades",
      "M\xF3dulos y automatizaciones a medida",
      "Integraciones con los sistemas que ya usas",
      "Migraci\xF3n de datos y procesos existentes",
      "Acompa\xF1amiento en la implementaci\xF3n",
      "Usuarios y sedes seg\xFAn tu operaci\xF3n"
    ],
    cta: "Cotizar mi proyecto",
    note: "Ideal para empresas con operaciones complejas o varias sedes."
  }
];
export default function ClientsPage({ go }) {
  const [billing, setBilling] = useState("monthly");
  return <div className="nx-page nx-page-clients">
      <PublicHeader go={go} active="clientes" />

      <PageHero
    tone="cyan"
    eyebrow="PARA EMPRESAS"
    title={<>Toda tu operación<br /><em>en una sola pantalla.</em></>}
    text="Clientes, conversaciones, citas, cobros y seguimiento en un mismo lugar. Sin cinco herramientas distintas ni información perdida en WhatsApp."
    actions={<>
          <NxButton onClick={() => go("registro-cliente")}>Crear mi cuenta <ArrowRight size={16} /></NxButton>
          <NxButton tone="line" onClick={() => document.getElementById("planes")?.scrollIntoView({ behavior: "smooth" })}>Ver planes y precios</NxButton>
        </>}
    chips={[[ShieldCheck, "Sin permanencia"], [Zap, "Activaci\xF3n en 72 h"], [Users, "Soporte en espa\xF1ol"]]}
    visual={<ClientsHeroVisual />}
  />
      

      <StatBand items={[["1", "plataforma en vez de 5"], ["72 h", "para estar operando"], ["+18%", "conversi\xF3n promedio"], ["24/7", "atenci\xF3n automatizada"]]} />

      <ClientsChaos />

      <section className="nx-section tint-cyan">
        <SectionHead eyebrow="CÓMO FUNCIONA" title={<>De la primera conversación <em>al cliente que vuelve.</em></>} />
        <StepFlow steps={[
    ["01", "Conectamos tus canales", "WhatsApp, formularios, redes y correo llegan a una sola bandeja."],
    ["02", "Ordenamos tus contactos", "Cada persona con su historial, etapa y responsable asignado."],
    ["03", "Automatizamos el seguimiento", "Respuestas, recordatorios y avisos que salen solos."],
    ["04", "Mides lo que importa", "Ves qu\xE9 canal vende, qu\xE9 se cae y d\xF3nde crecer."]
  ]} />
      </section>

      <ClientsModules />

      <ClientsResults go={go} />

      <div className="nx-seam wave" />

      <section className="nx-section tint-violet" id="planes">
        <SectionHead
    eyebrow="INVERSIÓN"
    title={<>Un plan que <em>crece contigo.</em></>}
    text="Todos incluyen configuración inicial acompañada, migración de contactos y soporte en español."
  />
        
        <Reveal><div className="nx-billing-wrap"><BillingToggle value={billing} onChange={setBilling} /></div></Reveal>
        <div className="nx-prices">
          {plans.map(
    (plan, index) => <Reveal key={plan.name} delay={index * 0.08}>
              <PriceCard data={plan} billing={billing} onSelect={() => go("registro-cliente")} />
            </Reveal>
  )}
        </div>
        <Reveal><p className="nx-price-foot"><ShieldCheck size={15} /> Sin permanencia. Cancelas cuando quieras y conservas tus datos.</p></Reveal>
      </section>

      <section className="nx-section">
        <SectionHead eyebrow="PREGUNTAS FRECUENTES" title={<>Antes de <em>decidir.</em></>} />
        <Reveal>
          <FaqList items={[
    ["\xBFCu\xE1nto tarda la puesta en marcha?", "Entre 48 y 72 horas h\xE1biles. Configuramos tu cuenta, migramos contactos y dejamos los canales conectados antes de entreg\xE1rtela."],
    ["\xBFNecesito conocimientos t\xE9cnicos?", "No. La configuraci\xF3n inicial la hacemos nosotros y el panel est\xE1 pensado para usarse sin capacitaci\xF3n t\xE9cnica."],
    ["\xBFPuedo cambiar de plan despu\xE9s?", "S\xED, en cualquier momento y sin perder informaci\xF3n. El cobro se ajusta de forma proporcional."],
    ["\xBFWhatsApp est\xE1 incluido?", "La conexi\xF3n s\xED. Los costos de la API oficial de WhatsApp los factura Meta directamente seg\xFAn tu volumen de mensajes."],
    ["\xBFQu\xE9 pasa si cancelo?", "Puedes exportar tus contactos y conversaciones en cualquier momento. No hay cl\xE1usula de permanencia."]
  ]} />
        </Reveal>
      </section>

      <CtaBand
    eyebrow="EMPIEZA HOY"
    title={<>Ordena tu operación <em>esta semana.</em></>}
    text="Creamos tu cuenta, conectamos tus canales y te acompañamos en la puesta en marcha."
    actions={<>
          <NxButton onClick={() => go("registro-cliente")}>Crear mi cuenta <ArrowRight size={16} /></NxButton>
          <NxButton tone="line" onClick={() => go("webs")}>Ver Webs Inteligentes</NxButton>
        </>}
  />
      

      <Footer go={go} />
    </div>;
}
