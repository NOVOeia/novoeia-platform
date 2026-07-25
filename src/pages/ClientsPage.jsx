import { useEffect } from "react";
import { Building2, Workflow, MessageCircle, BarChart3, Check, ArrowRight, CalendarDays, Users, Zap } from "lucide-react";
import PublicHeader from "../components/PublicHeader.jsx";
import Footer from "../components/Footer.jsx";
import { Button, Badge } from "../components/ui.jsx";
import "../styles/site-wow.css";

export default function ClientsPage({ go }) {
  useEffect(() => {
    const nodes = document.querySelectorAll("[data-wow-reveal]");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: .14 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const items = [
    [Workflow,"Automatizaciones","Procesos que trabajan por ti y reducen tareas manuales."],
    [MessageCircle,"Comunicaciones","WhatsApp, email y seguimiento desde un solo lugar."],
    [BarChart3,"Control del negocio","Métricas claras para saber qué está funcionando."],
    [Users,"CRM y oportunidades","Organiza clientes, ventas y próximas acciones."],
    [CalendarDays,"Calendarios","Reservas y citas conectadas con tus automatizaciones."],
    [Zap,"Activación rápida","Empieza con una estructura lista para operar."],
  ];

  return <>
    <PublicHeader go={go}/>
    <section className="wow-page-hero clients-wow-hero">
      <div className="wow-grid-bg"/><div className="wow-orb wow-orb-a"/><div className="wow-orb wow-orb-b"/>
      <div className="wow-hero-copy">
        <Badge>PARA EMPRESAS</Badge>
        <h1>Administra tu negocio con <span>NOVO.</span></h1>
        <p>Ventas, seguimiento, automatización y atención al cliente en una experiencia centralizada.</p>
        <div className="wow-actions"><Button onClick={()=>go("registro-cliente")}>Comprar por USD 97/mes <ArrowRight size={17}/></Button><Button variant="secondary" onClick={()=>go("precios")}>Ver planes</Button></div>
      </div>
      <div className="client-live-stage">
        <div className="client-dashboard wow-float-panel">
          <header><b>N</b><span>NOVO Business</span><i>● En línea</i></header>
          <div className="client-layout">
            <aside>{["Dashboard","Contactos","Oportunidades","Automatizaciones","Reportes"].map((x,i)=><span className={i===0?"active":""} key={x}>{x}</span>)}</aside>
            <main>
              <div className="client-heading"><div><small>Resumen de hoy</small><strong>Tu negocio en movimiento</strong></div><button>+ Nueva oportunidad</button></div>
              <div className="client-kpis">{[["142","Leads"],["38","Oportunidades"],["USD 18k","Pipeline"],["91%","Seguimiento"]].map(([v,l],i)=><div style={{"--client-delay":`${i*.12}s`}} key={l}><small>{l}</small><strong>{v}</strong></div>)}</div>
              <div className="client-bottom"><div className="client-chart"><span>Actividad comercial</span><div>{[26,44,35,57,51,72,66,82,76,93].map((h,i)=><i key={i} style={{height:`${h}%`,"--bar-delay":`${i*.06}s`}}/>)}</div></div><div className="client-list"><span>Próximas acciones</span>{["Enviar propuesta","Confirmar cita","Seguimiento WhatsApp"].map(x=><p key={x}><i/>{x}</p>)}</div></div>
            </main>
          </div>
        </div>
      </div>
    </section>

    <section className="section wow-section" data-wow-reveal>
      <div className="wow-section-heading"><div><div className="eyebrow">TODO CONECTADO</div><h2>Una operación más clara y más rápida</h2></div><p>Menos herramientas separadas. Más control desde un solo lugar.</p></div>
      <div className="wow-card-grid">{items.map(([Icon,title,text],index)=><article className="wow-info-card" key={title}><div className="wow-card-glow"/><Icon/><span>{String(index+1).padStart(2,"0")}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className="section wow-feature-band wow-section" data-wow-reveal>
      <div><div className="eyebrow">INCLUIDO EN TU CUENTA</div><h2>Todo lo necesario para operar y crecer</h2></div>
      <div className="wow-check-grid">{["CRM y oportunidades","Calendarios y formularios","Email, SMS y WhatsApp","Automatizaciones","Reportes y métricas","Soporte NOVOeia"].map(x=><span key={x}><Check/>{x}</span>)}</div>
    </section>
    <Footer go={go}/>
  </>;
}