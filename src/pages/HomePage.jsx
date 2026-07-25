import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Users,
  ArrowRight,
  Check,
  MonitorSmartphone,
  Layers3,
  Sparkles,
  ShieldCheck,
  Zap,
  MoveRight,
  Activity,
  Workflow,
  Globe2,
} from "lucide-react";
import PublicHeader from "../components/PublicHeader.jsx";
import Footer from "../components/Footer.jsx";
import PartnerModule from "../components/PartnerModule.jsx";
import { Button, Badge } from "../components/ui.jsx";
import "../styles/home-wow.css";

const rotatingWords = [
  "inteligentes",
  "autónomas",
  "que venden",
  "con dashboard",
];

export default function HomePage({ go }) {
  const [wordIndex, setWordIndex] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWordIndex((index) => (index + 1) % rotatingWords.length);
    }, 2300);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  function handleHeroMove(event) {
    const hero = heroRef.current;
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    hero.style.setProperty("--mouse-x", `${x * 18}px`);
    hero.style.setProperty("--mouse-y", `${y * 18}px`);
    hero.style.setProperty("--mouse-rx", `${y * -4}deg`);
    hero.style.setProperty("--mouse-ry", `${x * 5}deg`);
  }

  function resetHeroMove() {
    const hero = heroRef.current;
    if (!hero) return;

    hero.style.setProperty("--mouse-x", "0px");
    hero.style.setProperty("--mouse-y", "0px");
    hero.style.setProperty("--mouse-rx", "0deg");
    hero.style.setProperty("--mouse-ry", "0deg");
  }

  return (
    <>
      <PublicHeader go={go} />

      <section
        ref={heroRef}
        className="home-hero home-hero-wow"
        onMouseMove={handleHeroMove}
        onMouseLeave={resetHeroMove}
      >
        <div className="hero-noise" />
        <div className="hero-grid-lines" />
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-orb hero-orb-three" />

        <div className="hero-copy wow-hero-copy">
          <Badge>PLATAFORMA SAAS MARCA BLANCA</Badge>

          <h1>
            Tu negocio digital,
            <br />
            <span className="hero-gradient">bajo tu propia marca.</span>
          </h1>

          <p className="hero-rotating-line">
            Plataformas y webs{" "}
            <strong key={wordIndex}>{rotatingWords[wordIndex]}</strong>.
          </p>

          <p className="hero-description">
            Administra tu empresa con NOVO o conviértete en Partner y genera
            ingresos recurrentes vendiendo tecnología, automatización y páginas
            web inteligentes.
          </p>

          <div className="hero-actions">
            <Button onClick={() => go("clientes")}>
              Quiero NOVO para mi empresa
              <ArrowRight size={17} />
            </Button>

            <Button variant="secondary" onClick={() => go("partners")}>
              Quiero ser Partner
            </Button>
          </div>

          <div className="hero-trust">
            <span>
              <ShieldCheck /> Marca blanca
            </span>
            <span>
              <Zap /> Activación rápida
            </span>
            <span>
              <Sparkles /> Sin depender de diseñadores
            </span>
          </div>

          <div className="hero-live-row">
            <div>
              <i />
              <span>Plataforma activa</span>
            </div>
            <strong>+127 automatizaciones ejecutadas hoy</strong>
          </div>
        </div>

        <div className="hero-visual-stage">
          <div className="hero-ring hero-ring-one" />
          <div className="hero-ring hero-ring-two" />

          <div className="floating-chip chip-one">
            <Workflow size={15} />
            <span>Automatización activa</span>
          </div>

          <div className="floating-chip chip-two">
            <Globe2 size={15} />
            <span>Web publicada</span>
          </div>

          <div className="floating-chip chip-three">
            <Activity size={15} />
            <span>+18% conversión</span>
          </div>

          <div
            className="floating-dashboard wow-floating-dashboard"
            aria-label="Vista previa del dashboard NOVO"
          >
            <div className="floating-screen">
              <div className="screen-shine" />

              <div className="floating-browser">
                <i />
                <i />
                <i />
                <span>app.tumarca.com</span>
              </div>

              <div className="floating-layout">
                <aside>
                  <b>N</b>
                  {[
                    "Inicio",
                    "Clientes",
                    "Automatizaciones",
                    "Marketing",
                    "Reportes",
                  ].map((item, index) => (
                    <span className={index === 0 ? "active" : ""} key={item}>
                      {item}
                    </span>
                  ))}
                </aside>

                <main>
                  <header>
                    <div>
                      <small>Resumen general</small>
                      <strong>Hola, Daniel 👋</strong>
                    </div>
                    <button>+ Nuevo cliente</button>
                  </header>

                  <div className="floating-kpis">
                    {[
                      ["USD 12.8k", "Ingresos"],
                      ["28", "Clientes"],
                      ["91%", "Renovación"],
                      ["142", "Leads"],
                    ].map(([value, label], index) => (
                      <div key={label} style={{ "--delay": `${index * 0.14}s` }}>
                        <small>{label}</small>
                        <strong>{value}</strong>
                        <i />
                      </div>
                    ))}
                  </div>

                  <div className="floating-lower">
                    <div className="floating-graph">
                      <span>Ingresos recurrentes</span>
                      <div className="graph-grid" />
                      <div className="graph-line" />
                      <div className="graph-dot graph-dot-one" />
                      <div className="graph-dot graph-dot-two" />
                      <div className="graph-dot graph-dot-three" />
                    </div>

                    <div className="floating-activity">
                      <span>Actividad reciente</span>

                      {[1, 2, 3].map((item) => (
                        <p key={item}>
                          <i />
                          Nueva cuenta activada
                        </p>
                      ))}
                    </div>
                  </div>
                </main>
              </div>
            </div>

            <div className="dashboard-glow" />
          </div>
        </div>
      </section>

      <section className="home-proof-strip wow-proof-strip">
        <div className="proof-track">
          {[
            "CRM",
            "Automatizaciones",
            "Webs Inteligentes",
            "Marca Blanca",
            "Ingresos Recurrentes",
            "CRM",
            "Automatizaciones",
            "Webs Inteligentes",
            "Marca Blanca",
            "Ingresos Recurrentes",
          ].map((item, index) => (
            <span key={`${item}-${index}`}>
              {item}
              <i />
            </span>
          ))}
        </div>
      </section>

      <section
        className="section home-products wow-section"
        data-reveal
      >
        <div className="section-heading-row">
          <div>
            <div className="eyebrow">DOS PRODUCTOS, UN ECOSISTEMA</div>
            <h2>Vende tecnología sin tener que construirla desde cero</h2>
          </div>

          <p>
            NOVO centraliza la operación mientras las Webs Inteligentes dan
            autonomía real a cada negocio.
          </p>
        </div>

        <div className="grid-2">
          <article className="product product-premium card wow-product-card">
            <div className="card-light" />
            <div className="product-icon">
              <Layers3 />
            </div>

            <span className="product-number">01</span>
            <h3>NOVO Platform</h3>

            <p>
              CRM, automatizaciones, calendarios, seguimiento, comunicaciones y
              marketing en una sola plataforma.
            </p>

            <ul>
              {[
                "CRM y pipeline de ventas",
                "Automatizaciones multicanal",
                "WhatsApp, email y calendarios",
                "Panel administrativo centralizado",
              ].map((item) => (
                <li key={item}>
                  <Check />
                  {item}
                </li>
              ))}
            </ul>

            <button className="text-link" onClick={() => go("clientes")}>
              Conocer NOVO
              <MoveRight />
            </button>
          </article>

          <article className="product product-premium purple card wow-product-card">
            <div className="card-light purple-light" />
            <div className="product-icon">
              <MonitorSmartphone />
            </div>

            <span className="product-number">02</span>
            <h3>Webs Inteligentes</h3>

            <p>
              Páginas con dashboard propio para actualizar contenido,
              promociones, redes, WhatsApp y productos sin depender de un
              diseñador.
            </p>

            <ul>
              {[
                "Dashboard fácil de administrar",
                "Pop-ups promocionales",
                "Productos, precios y ubicaciones",
                "Conexión directa con NOVO",
              ].map((item) => (
                <li key={item}>
                  <Check />
                  {item}
                </li>
              ))}
            </ul>

            <button className="text-link" onClick={() => go("webs")}>
              Explorar Webs Inteligentes
              <MoveRight />
            </button>
          </article>
        </div>
      </section>

      <section
        className="section calculator-section wow-section"
        data-reveal
      >
        <div className="calculator-copy">
          <div className="eyebrow">MODELO PARTNER</div>
          <h2>Visualiza el negocio antes de empezar</h2>
          <p>
            Ajusta el plan, tu precio de venta, el número de clientes y la
            identidad de tu marca. Todo cambia en tiempo real.
          </p>
        </div>

        <PartnerModule />
      </section>

      <section className="home-paths">
        <div className="section path-heading wow-section" data-reveal>
          <div className="eyebrow">ELIGE TU CAMINO</div>
          <h2>¿Cómo quieres crecer con NOVO?</h2>
        </div>

        <div
          className="section grid-2 paths-grid wow-section"
          data-reveal
        >
          <article className="path-card client-path wow-path-card">
            <div className="path-orbit" />
            <div className="path-icon">
              <Building2 />
            </div>

            <span>PARA EMPRESAS</span>
            <h3>Administra todo desde una sola plataforma</h3>

            <p>
              Obtén NOVO por USD 97 al mes y centraliza clientes, ventas,
              comunicación y marketing.
            </p>

            <Button onClick={() => go("registro-cliente")}>
              Crear mi cuenta
              <ArrowRight size={17} />
            </Button>
          </article>

          <article className="path-card partner-path wow-path-card">
            <div className="path-orbit purple-orbit" />
            <div className="path-icon">
              <Users />
            </div>

            <span>PARA PARTNERS</span>
            <h3>Crea una nueva fuente de ingresos recurrentes</h3>

            <p>
              Adquiere cuentas desde USD 47, define tu precio de reventa y
              administra a tus clientes bajo tu propia marca.
            </p>

            <Button
              variant="secondary"
              onClick={() => go("registro-partner")}
            >
              Convertirme en Partner
              <ArrowRight size={17} />
            </Button>
          </article>
        </div>
      </section>

      <Footer go={go} />
    </>
  );
}