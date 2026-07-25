import { useEffect, useRef } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Check,
  Globe2,
  Layers3,
  Palette,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Workflow,
} from "lucide-react";
import PublicHeader from "../components/PublicHeader.jsx";
import Footer from "../components/Footer.jsx";
import PartnerModule from "../components/PartnerModule.jsx";
import { Button, Badge } from "../components/ui.jsx";
import "../styles/partners-wow.css";

const benefits = [
  {
    icon: BadgeDollarSign,
    title: "Ingresos recurrentes",
    text: "Compra cuentas desde USD 47 y define libremente tu precio de venta mensual.",
  },
  {
    icon: Palette,
    title: "Tu propia marca",
    text: "Personaliza logo, colores, presentación comercial y experiencia del cliente.",
  },
  {
    icon: Users,
    title: "Administra tus clientes",
    text: "Controla cuentas, planes, solicitudes y estado comercial desde un solo panel.",
  },
  {
    icon: Globe2,
    title: "Webs Inteligentes",
    text: "Revende páginas administrables con dashboard, promociones, redes y WhatsApp.",
  },
  {
    icon: Workflow,
    title: "Automatización",
    text: "Activa CRM, seguimiento, calendarios y comunicaciones sin construir desde cero.",
  },
  {
    icon: ShieldCheck,
    title: "Operación respaldada",
    text: "NOVO administra la infraestructura mientras tú desarrollas tu negocio.",
  },
];

const steps = [
  "Crea tu cuenta Partner",
  "Configura tu marca",
  "Define tus precios",
  "Genera tu link de venta",
  "Registra nuevos clientes",
  "Recibe ingresos mensuales",
];

export default function PartnersPage({ go }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-partner-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  function handleMouseMove(event) {
    const hero = heroRef.current;
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    hero.style.setProperty("--partner-x", `${x * 18}px`);
    hero.style.setProperty("--partner-y", `${y * 18}px`);
    hero.style.setProperty("--partner-rx", `${y * -3.5}deg`);
    hero.style.setProperty("--partner-ry", `${x * 4.5}deg`);
  }

  function resetMouseMove() {
    const hero = heroRef.current;
    if (!hero) return;

    hero.style.setProperty("--partner-x", "0px");
    hero.style.setProperty("--partner-y", "0px");
    hero.style.setProperty("--partner-rx", "0deg");
    hero.style.setProperty("--partner-ry", "0deg");
  }

  return (
    <>
      <PublicHeader go={go} />

      <section
        ref={heroRef}
        className="partners-hero"
        onMouseMove={handleMouseMove}
        onMouseLeave={resetMouseMove}
      >
        <div className="partners-noise" />
        <div className="partners-grid" />
        <div className="partners-orb partners-orb-one" />
        <div className="partners-orb partners-orb-two" />

        <div className="partners-hero-copy">
          <Badge>PROGRAMA PARTNER NOVO</Badge>

          <h1>
            Crea una nueva línea de negocio
            <span> bajo tu propia marca.</span>
          </h1>

          <p>
            Revende plataformas, automatización y Webs Inteligentes sin tener
            que desarrollar toda la tecnología desde cero.
          </p>

          <div className="partners-actions">
            <Button onClick={() => go("registro-partner")}>
              Empezar como Partner
              <ArrowRight size={17} />
            </Button>

            <Button variant="secondary" onClick={() => go("precios")}>
              Ver planes
            </Button>
          </div>

          <div className="partners-trust">
            <span>
              <Check /> Precio mayorista
            </span>
            <span>
              <Check /> Marca blanca
            </span>
            <span>
              <Check /> Ingresos recurrentes
            </span>
          </div>
        </div>

        <div className="partners-hero-visual">
          <div className="partner-ring partner-ring-one" />
          <div className="partner-ring partner-ring-two" />

          <div className="partner-floating-card partner-float-one">
            <BarChart3 />
            <div>
              <small>Margen mensual</small>
              <strong>USD 1.200</strong>
            </div>
          </div>

          <div className="partner-floating-card partner-float-two">
            <Store />
            <div>
              <small>Clientes activos</small>
              <strong>18</strong>
            </div>
          </div>

          <div className="partner-floating-card partner-float-three">
            <Rocket />
            <div>
              <small>Cuenta nueva</small>
              <strong>Activada</strong>
            </div>
          </div>

          <div className="partner-business-screen">
            <div className="partner-screen-shine" />

            <header>
              <div className="partner-screen-brand">
                <b>N</b>
                <span>Tu Agencia</span>
              </div>

              <div className="partner-screen-status">
                <i />
                Plataforma activa
              </div>
            </header>

            <div className="partner-screen-layout">
              <aside>
                {[
                  "Dashboard",
                  "Clientes",
                  "Cuentas",
                  "Ingresos",
                  "Links de venta",
                ].map((item, index) => (
                  <span className={index === 0 ? "active" : ""} key={item}>
                    {item}
                  </span>
                ))}
              </aside>

              <main>
                <div className="partner-screen-heading">
                  <div>
                    <small>Resumen del negocio</small>
                    <strong>Panel Partner</strong>
                  </div>

                  <button>+ Crear cliente</button>
                </div>

                <div className="partner-screen-kpis">
                  {[
                    ["USD 4.8k", "Ingresos"],
                    ["18", "Clientes"],
                    ["22", "Subcuentas"],
                    ["91%", "Retención"],
                  ].map(([value, label], index) => (
                    <div
                      key={label}
                      style={{ "--partner-kpi-delay": `${index * 0.12}s` }}
                    >
                      <small>{label}</small>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>

                <div className="partner-screen-bottom">
                  <div className="partner-income-chart">
                    <span>Ingresos recurrentes</span>
                    <div className="partner-chart-grid" />

                    <div className="partner-chart-bars">
                      {[28, 43, 38, 57, 52, 69, 62, 76, 71, 86, 81, 94].map(
                        (height, index) => (
                          <i
                            key={`${height}-${index}`}
                            style={{
                              height: `${height}%`,
                              "--chart-delay": `${index * 0.06}s`,
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  <div className="partner-latest-sales">
                    <span>Ventas recientes</span>

                    {[
                      ["Basic", "USD 97"],
                      ["Pro", "USD 147"],
                      ["Web Inteligente", "USD 997"],
                    ].map(([name, price]) => (
                      <p key={name}>
                        <i />
                        <b>{name}</b>
                        <small>{price}</small>
                      </p>
                    ))}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section partner-intro partner-reveal"
        data-partner-reveal
      >
        <div>
          <div className="eyebrow">TU MODELO DE NEGOCIO</div>
          <h2>Tú vendes la solución. NOVO opera la tecnología.</h2>
        </div>

        <p>
          Define tu precio, presenta la plataforma bajo tu marca y administra
          toda tu cartera de clientes desde un panel central.
        </p>
      </section>

      <section
        className="section partner-benefits partner-reveal"
        data-partner-reveal
      >
        {benefits.map(({ icon: Icon, title, text }, index) => (
          <article
            key={title}
            className="partner-benefit-card"
            style={{ "--benefit-delay": `${index * 0.08}s` }}
          >
            <div className="benefit-glow" />
            <Icon />
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section
        className="section partner-calculator-section partner-reveal"
        data-partner-reveal
      >
        <div className="partner-calculator-copy">
          <div className="eyebrow">SIMULADOR EN VIVO</div>
          <h2>Calcula tu margen y visualiza tu plataforma</h2>
          <p>
            Cambia el plan, el precio de reventa, la cantidad de clientes, el
            nombre y el color de tu marca. El dashboard se actualiza en tiempo
            real.
          </p>

          <div className="partner-calculator-points">
            <span>
              <Sparkles /> Experiencia interactiva
            </span>
            <span>
              <Layers3 /> Dashboard marca blanca
            </span>
            <span>
              <BadgeDollarSign /> Ganancia estimada
            </span>
          </div>
        </div>

        <PartnerModule />
      </section>

      <section
        className="section partner-process partner-reveal"
        data-partner-reveal
      >
        <div className="partner-process-heading">
          <div className="eyebrow">CÓMO FUNCIONA</div>
          <h2>De tu registro a tu primera venta</h2>
        </div>

        <div className="partner-process-track">
          {steps.map((step, index) => (
            <article key={step}>
              <div>
                <span>{index + 1}</span>
                <i />
              </div>

              <strong>{step}</strong>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section partner-final-cta partner-reveal"
        data-partner-reveal
      >
        <div className="partner-cta-orb" />

        <div>
          <div className="eyebrow">EMPIEZA A CONSTRUIR TU NEGOCIO</div>
          <h2>Tu marca. Tus precios. Tus clientes.</h2>
          <p>
            Crea tu cuenta Partner y comienza a vender tecnología con ingresos
            recurrentes.
          </p>
        </div>

        <Button onClick={() => go("registro-partner")}>
          Crear cuenta Partner
          <ArrowRight size={17} />
        </Button>
      </section>

      <Footer go={go} />
    </>
  );
}