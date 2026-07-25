import { useEffect, useRef, useState } from "react";
import { MonitorSmartphone, Check, ArrowRight, Globe2, MessageCircle, Megaphone, Package, Image, BarChart3 } from "lucide-react";
import PublicHeader from "../components/PublicHeader.jsx";
import Footer from "../components/Footer.jsx";
import { Button, Badge } from "../components/ui.jsx";
import "../styles/site-wow.css";

const features = [
  [Image, "Contenido editable", "Actualiza textos, imágenes y secciones desde un panel simple."],
  [Megaphone, "Promociones", "Activa pop-ups, banners y campañas sin tocar código."],
  [Package, "Productos y servicios", "Administra catálogo, precios y disponibilidad."],
  [MessageCircle, "WhatsApp y redes", "Centraliza enlaces, conversaciones y llamados a la acción."],
  [BarChart3, "Métricas", "Visualiza actividad, visitas y conversiones."],
  [Globe2, "Conexión con NOVO", "Integra formularios, CRM y automatizaciones."],
];

export default function WebsPage({ go }) {
  const heroRef = useRef(null);
  const [active, setActive] = useState(1);

  useEffect(() => {
    const nodes = document.querySelectorAll("[data-wow-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActive((value) => (value + 1) % 5), 1900);
    return () => clearInterval(timer);
  }, []);

  function move(event) {
    const node = heroRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    node.style.setProperty("--wow-x", `${x * 18}px`);
    node.style.setProperty("--wow-y", `${y * 18}px`);
    node.style.setProperty("--wow-rx", `${y * -4}deg`);
    node.style.setProperty("--wow-ry", `${x * 5}deg`);
  }

  return (
    <>
      <PublicHeader go={go} />
      <section ref={heroRef} className="wow-page-hero webs-wow-hero" onMouseMove={move}>
        <div className="wow-grid-bg" />
        <div className="wow-orb wow-orb-a" />
        <div className="wow-orb wow-orb-b" />

        <div className="wow-hero-copy">
          <Badge>WEBS INTELIGENTES</Badge>
          <h1>Una web que trabaja y <span>se administra sola.</span></h1>
          <p>
            Dale a cada negocio una página moderna con dashboard propio para
            actualizar productos, promociones, WhatsApp, redes y contenido.
          </p>
          <div className="wow-actions">
            <Button onClick={() => go("catalogo")}>Ver catálogo <ArrowRight size={17} /></Button>
            <Button variant="secondary" onClick={() => go("registro-cliente")}>Solicitar una web</Button>
          </div>
          <div className="wow-mini-points">
            <span><Check /> Sin depender de diseñadores</span>
            <span><Check /> Dashboard fácil</span>
            <span><Check /> Integrada con NOVO</span>
          </div>
        </div>

        <div className="webs-live-stage">
          <div className="wow-ring wow-ring-one" />
          <div className="wow-ring wow-ring-two" />
          <div className="webs-browser wow-float-panel">
            <div className="webs-browser-bar"><i/><i/><i/><span>www.tumarca.com</span></div>
            <div className="webs-browser-layout">
              <aside>
                <b>M</b>
                {["Inicio","Mi web","Promociones","Productos","Redes"].map((item,index) => (
                  <span className={active === index ? "active" : ""} key={item}>{item}</span>
                ))}
              </aside>
              <main>
                <header><div><small>Dashboard</small><strong>Administra tu sitio</strong></div><button>Publicar cambios</button></header>
                <div className="webs-stats">
                  {["1.248 visitas","84 leads","18 ventas"].map((item) => <div key={item}>{item}</div>)}
                </div>
                <div className="webs-editor">
                  <div className="webs-editor-preview">
                    <div className="fake-site-nav" />
                    <div className="fake-site-hero"><span/><i/></div>
                    <div className="fake-site-cards"><b/><b/><b/></div>
                  </div>
                  <div className="webs-editor-panel">
                    <label>Título principal<input value="Tu negocio, más cerca" readOnly /></label>
                    <label>Botón<input value="Hablar por WhatsApp" readOnly /></label>
                    <div className="webs-toggle"><span>Pop-up promocional</span><i /></div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </section>

      <section className="section wow-section" data-wow-reveal>
        <div className="wow-section-heading">
          <div><div className="eyebrow">TODO DESDE UN SOLO PANEL</div><h2>Más que una página web</h2></div>
          <p>Una herramienta comercial que cambia al ritmo del negocio.</p>
        </div>
        <div className="wow-card-grid">
          {features.map(([Icon,title,text],index) => (
            <article className="wow-info-card" key={title} style={{"--card-delay": `${index * .08}s`}}>
              <div className="wow-card-glow" /><Icon/><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section wow-cta wow-section" data-wow-reveal>
        <div><div className="eyebrow">LISTA PARA CRECER</div><h2>Una web viva, conectada y fácil de administrar.</h2></div>
        <Button onClick={() => go("registro-cliente")}>Solicitar mi Web Inteligente <ArrowRight size={17}/></Button>
      </section>
      <Footer go={go} />
    </>
  );
}