import { useEffect, useState } from "react";
import { ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import PublicHeader from "../components/PublicHeader.jsx";
import Footer from "../components/Footer.jsx";
import { Button, Badge } from "../components/ui.jsx";
import { templates } from "../data/mockData.js";
import "../styles/site-wow.css";

export default function CatalogPage({ go }) {
  const [filter,setFilter] = useState("Todos");
  useEffect(() => {
    const nodes = document.querySelectorAll("[data-wow-reveal]");
    const observer = new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}),{threshold:.12});
    nodes.forEach((node)=>observer.observe(node)); return()=>observer.disconnect();
  },[]);

  const filters = ["Todos", ...new Set(templates.map((t)=>t.type))];
  const visible = filter === "Todos" ? templates : templates.filter((t)=>t.type===filter);

  return <>
    <PublicHeader go={go}/>
    <section className="wow-page-hero catalog-wow-hero">
      <div className="wow-grid-bg"/><div className="wow-orb wow-orb-a"/><div className="wow-orb wow-orb-b"/>
      <div className="wow-hero-copy">
        <Badge>CATÁLOGO</Badge>
        <h1>Diseños que se sienten <span>vivos.</span></h1>
        <p>Explora experiencias por industria y personaliza cada una con la marca del cliente.</p>
        <div className="wow-actions"><Button onClick={()=>go("registro-cliente")}>Solicitar una Web Inteligente <ArrowRight size={17}/></Button></div>
      </div>
      <div className="catalog-collage">
        {templates.slice(0,3).map((t,index)=><div className={`catalog-float-card catalog-float-${index+1}`} key={t.name}><div className="template-shot" style={{"--accent":t.accent}}><div className="fake-nav"/><div className="fake-hero"><span/><i/></div><div className="fake-cards"><b/><b/><b/></div></div><strong>{t.name}</strong></div>)}
      </div>
    </section>

    <section className="section wow-section" data-wow-reveal>
      <div className="catalog-toolbar"><div><div className="eyebrow">EXPLORA POR INDUSTRIA</div><h2>Encuentra una base y hazla tuya</h2></div><div className="catalog-filters">{filters.map((item)=><button className={filter===item?"active":""} onClick={()=>setFilter(item)} key={item}>{item}</button>)}</div></div>
      <div className="template-grid wow-template-grid">{visible.map((t,index)=><article className="template-card card wow-template-card" key={t.name} style={{"--template-delay":`${index*.08}s`}}><div className="template-shot" style={{"--accent":t.accent}}><div className="template-shine"/><div className="fake-nav"/><div className="fake-hero"><span/><i/></div><div className="fake-cards"><b/><b/><b/></div></div><Badge>{t.type}</Badge><h3>{t.name}</h3><p>Diseño adaptable con dashboard de administración.</p><Button variant="ghost">Ver ejemplo <ExternalLink size={16}/></Button></article>)}</div>
    </section>

    <section className="section wow-cta wow-section" data-wow-reveal><div><div className="eyebrow">TU MARCA, TU EXPERIENCIA</div><h2>Elige una base y conviértela en algo único.</h2></div><Button onClick={()=>go("registro-cliente")}>Solicitar una web <Sparkles size={17}/></Button></section>
    <Footer go={go}/>
  </>;
}