import '../styles/nx-page.css';
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  Banknote,
  Building2,
  Calculator,
  Layers,
  Palette,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Users
} from "lucide-react";
import PublicHeader from "../components/PublicHeader.jsx";
import Footer from "../components/Footer.jsx";
import { PageHero } from "../components/landing/site/PageHero.jsx";
import { PartnersHeroVisual } from "../components/landing/site/HeroVisuals.jsx";
import {
  BillingToggle,
  CtaBand,
  FaqList,
  IconGrid,
  NxButton,
  PriceCard,
  Reveal,
  SectionHead,
  StatBand
} from "../components/landing/site/Sections.jsx";
import { PartnerModel } from "../components/landing/PartnerModel.jsx";
import { money } from "../lib/format.js";
const tiers = [
  {
    name: "NOVO Esencial",
    tagline: "Impulsa y organiza tu negocio para crecer.",
    monthly: 47,
    annual: 39,
    unit: "cuenta/mes",
    features: ["CRM y pipeline por cliente", "Bandeja unificada", "Calendarios y formularios", "Panel Partner y link de venta", "Precio de reventa libre"],
    cta: "Activar NOVO Esencial",
    note: "Costo base para el Partner. Solo pagas las cuentas que vendes."
  },
  {
    name: "NOVO Avanzado",
    tagline: "Automatiza, escala y lidera tu mercado.",
    monthly: 97,
    annual: 81,
    unit: "cuenta/mes",
    features: ["Todo lo de NOVO Esencial", "Automatizaciones avanzadas", "WhatsApp conectado", "Web Inteligente integrable", "Marca blanca completa con dominio", "Prioridad en soporte"],
    cta: "Activar NOVO Avanzado",
    featured: true,
    note: "Recomendado para clientes que ya operan con varios canales."
  },
  {
    name: "NOVO Profesional",
    tagline: "Dise\xF1ado a la medida del cliente, la empresa o el proyecto.",
    monthly: 0,
    annual: 0,
    unit: "cuenta/mes",
    custom: "Se cotiza seg\xFAn el alcance",
    features: [
      "Levantamiento previo de necesidades",
      "M\xF3dulos y automatizaciones a medida",
      "Integraciones con sistemas propios del cliente",
      "Migraci\xF3n de datos y procesos existentes",
      "Acompa\xF1amiento en la implementaci\xF3n",
      "Costo base y tu margen definidos por proyecto"
    ],
    cta: "Cotizar un proyecto",
    note: "Ideal para empresas con operaciones complejas o varias sedes."
  }
];
export default function PartnersPage({ go }) {
  const [billing, setBilling] = useState("monthly");
  const [clients, setClients] = useState(20);
  const [price, setPrice] = useState(97);
  const [tier, setTier] = useState("esencial");
  const cost = tier === "esencial" ? billing === "monthly" ? 47 : 39 : billing === "monthly" ? 97 : 81;
  const safePrice = Math.max(price, cost + 10);
  const fee = safePrice * 0.07;
  const margin = safePrice - cost - fee;
  const monthly = margin * clients;
  const projection = useMemo(() => {
    return [3, 6, 12, 24].map((month) => {
      const growth = Math.round(clients * (1 + month / 14));
      return { month, clients: growth, profit: margin * growth };
    });
  }, [clients, margin]);
  return <div className="nx-page nx-page-partners">
      <PublicHeader go={go} active="partners" />

      <PageHero
    tone="violet"
    eyebrow="PARA PARTNERS"
    title={<>Vende tecnología<br /><em>bajo tu propia marca.</em></>}
    text="Tu inversión inicial es cero. Creas tu cuenta gratis, defines tu precio y la venta activa el servicio. Nosotros ponemos la plataforma, el soporte técnico y las actualizaciones. Tú pones la marca y la relación con el cliente."
    actions={<>
          <NxButton onClick={() => go("registro-partner")}>Quiero ser Partner <ArrowRight size={16} /></NxButton>
          <NxButton tone="line" onClick={() => {
      document.getElementById("modelo")?.scrollIntoView({ behavior: "smooth" });
    }}>
            Ver cómo funciona el modelo
          </NxButton>
        </>}
    chips={[[Palette, "Marca blanca"], [Banknote, "Sin inversi\xF3n inicial"], [ShieldCheck, "Sin desarrollo propio"]]}
    visual={<PartnersHeroVisual />}
    mirrored
  />
      

      <StatBand items={[["USD 0", "de inversi\xF3n inicial"], ["100%", "de la relaci\xF3n es tuya"], ["0", "l\xEDneas de c\xF3digo"], ["USD 47", "costo base por cuenta"]]} />

      <PartnerModel onRegister={() => go("registro-partner")} />

      <section className="nx-section tint-violet" id="calculadora">
        <SectionHead
    eyebrow="PROYECCIÓN"
    title={<>Calcula tu negocio <em>antes de empezar.</em></>}
    text="Ajusta el nivel, tu precio de venta y el número de clientes para ver tu ganancia real."
  />
        

        <Reveal>
          <div className="nx-calc">
            <div className="nx-calc-controls">
              <div className="nx-calc-field">
                <label>Plan del cliente</label>
                <div className="nx-seg">
                  <button type="button" className={tier === "esencial" ? "on" : ""} onClick={() => setTier("esencial")}>NOVO Esencial</button>
                  <button type="button" className={tier === "avanzado" ? "on" : ""} onClick={() => setTier("avanzado")}>NOVO Avanzado</button>
                </div>
              </div>

              <div className="nx-calc-field">
                <label>Ciclo de pago</label>
                <BillingToggle value={billing} onChange={setBilling} save="ahorra 17%" />
              </div>

              <div className="nx-calc-field">
                <label>Tu precio de venta <b>{money(safePrice)}</b></label>
                <input type="range" min={cost + 10} max={297} step={5} value={safePrice} onChange={(event) => setPrice(Number(event.target.value))} />
              </div>

              <div className="nx-calc-field">
                <label>Clientes activos <b>{clients}</b></label>
                <input type="range" min={1} max={100} value={clients} onChange={(event) => setClients(Number(event.target.value))} />
              </div>
            </div>

            <div className="nx-calc-result">
              <div className="nx-calc-main">
                <small>Ganancia mensual</small>
                <strong>{money(monthly)}</strong>
                <i><TrendingUp size={14} /> {money(margin)} netos por cliente</i>
              </div>

              <div className="nx-calc-rows">
                <div><span>Cobras a tus clientes</span><b>{money(safePrice * clients)}</b></div>
                <div><span>Costo NOVOeia</span><b>{money(cost * clients)}</b></div>
                <div><span>Procesamiento (7%)</span><b>{money(fee * clients)}</b></div>
                <div className="win"><span>Te queda</span><b>{money(monthly)}</b></div>
                <div><span>Al año</span><b>{money(monthly * 12)}</b></div>
              </div>

              <div className="nx-calc-proj">
                <span className="nx-calc-proj-title">Proyección estimada</span>
                {projection.map(
    (row) => <div key={row.month}>
                    <small>{row.month} meses</small>
                    <i style={{ width: `${Math.min(100, row.profit / (projection[3].profit || 1) * 100)}%` }} />
                    <b>{money(row.profit)}</b>
                  </div>
  )}
                <p>Estimación referencial basada en crecimiento sostenido de cartera. No constituye una garantía de ingresos.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="nx-section">
        <SectionHead eyebrow="QUÉ RECIBES" title={<>Todo lo que necesitas <em>para operar.</em></>} />
        <IconGrid
    items={[
      [Palette, "Marca blanca real", "Tu logo, tus colores y tu dominio. El cliente nunca ve NOVOeia."],
      [Layers, "Panel de control", "Gestiona clientes, precios, cuentas y links desde un solo lugar."],
      [Banknote, "Precio libre", "Nadie te impone tarifas. El margen lo defines t\xFA."],
      [Rocket, "Producto listo", "Sin desarrollo, sin servidores, sin mantenimiento."],
      [Users, "Soporte t\xE9cnico", "Nosotros resolvemos lo t\xE9cnico mientras t\xFA vendes."],
      [Award, "Materiales de venta", "Demos, argumentos y ejemplos listos para presentar."]
    ]}
  />
        
      </section>

      <div className="nx-seam wave" />

      <section className="nx-section tint-cyan" id="niveles">
        <SectionHead
    eyebrow="PLANES QUE PUEDES VENDER"
    title={<>Dos productos, <em>tu precio.</em></>}
    text="Estos son los costos base para el Partner. Solo pagas por las cuentas que vendes: si un mes no activas cuentas, no pagas por ellas."
  />
        
        <Reveal><div className="nx-billing-wrap"><BillingToggle value={billing} onChange={setBilling} save="ahorra 17%" /></div></Reveal>
        <div className="nx-prices">
          {tiers.map(
    (tierData, index) => <Reveal key={tierData.name} delay={index * 0.08}>
              <PriceCard data={tierData} billing={billing} onSelect={() => go("registro-partner")} />
            </Reveal>
  )}
        </div>
      </section>

      <section className="nx-section">
        <SectionHead eyebrow="QUIÉN SE VUELVE PARTNER" title={<>Perfiles que <em>ya lo están haciendo.</em></>} />
        <div className="nx-profiles">
          {[
    [Building2, "Agencias de marketing", "Suman un ingreso recurrente a servicios que hoy cobran por proyecto."],
    [Users, "Consultores independientes", "Convierten su cartera de contactos en clientes con suscripci\xF3n."],
    [Calculator, "Contadores y gestores", "Ofrecen tecnolog\xEDa a los negocios que ya asesoran cada mes."],
    [Rocket, "Emprendedores digitales", "Arrancan un negocio SaaS sin construir el producto."]
  ].map(([Icon, title, text], index) => {
    const Ico = Icon;
    return <Reveal key={title} delay={index * 0.07}>
                <article className="nx-profile"><i><Ico size={18} /></i><h3>{title}</h3><p>{text}</p></article>
              </Reveal>;
  })}
        </div>
      </section>

      <section className="nx-section">
        <SectionHead eyebrow="PREGUNTAS FRECUENTES" title={<>Lo que <em>siempre nos preguntan.</em></>} />
        <Reveal>
          <FaqList items={[
    ["\xBFCu\xE1nto necesito invertir para empezar?", `Nada. Crear tu cuenta Partner es gratis y no tiene mensualidad. Solo se descuenta el costo del plan cuando la venta se concreta: ${money(47)} al mes en NOVO Esencial.`],
    ["\xBFPuedo cobrar el precio que yo quiera?", "S\xED. T\xFA defines el precio de reventa. De cada venta se descuenta el costo del plan y un 7% estimado de procesamiento y administraci\xF3n; el resto es tu ganancia."],
    ["\xBFMi cliente sabe que existe NOVOeia?", "No. La plataforma opera con tu marca, tu logo y tu dominio. La relaci\xF3n comercial es tuya."],
    ["\xBFQui\xE9n atiende los problemas t\xE9cnicos?", "Nosotros. T\xFA acompa\xF1as comercialmente y escalas los casos t\xE9cnicos a nuestro equipo."],
    ["\xBFPuedo pagar anual?", "S\xED. Si activas la cuenta de un cliente en ciclo anual, el costo base baja alrededor de un 17% y tu margen sube."],
    ["\xBFQu\xE9 pasa si un cliente cancela?", "Desactivas su cuenta y dejas de pagarla en el siguiente ciclo. No hay penalidad."]
  ]} />
        </Reveal>
      </section>

      <CtaBand
    eyebrow="EMPIEZA A VENDER"
    title={<>Tu propio negocio de tecnología, <em>sin construir el producto.</em></>}
    text="Activa tu cuenta Partner y empieza con tu primer cliente esta semana."
    actions={<>
          <NxButton onClick={() => go("registro-partner")}>Quiero ser Partner <ArrowRight size={16} /></NxButton>
          <NxButton tone="line" onClick={() => document.getElementById("niveles")?.scrollIntoView({ behavior: "smooth" })}>Comparar niveles</NxButton>
        </>}
  />
      

      <Footer go={go} />
    </div>;
}
