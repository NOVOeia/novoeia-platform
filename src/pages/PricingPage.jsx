import { useEffect } from "react";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import PublicHeader from "../components/PublicHeader.jsx";
import Footer from "../components/Footer.jsx";
import { Button, Badge } from "../components/ui.jsx";
import { plans } from "../data/mockData.js";
import "../styles/site-wow.css";

export default function PricingPage({ go }) {
  useEffect(()=>{const nodes=document.querySelectorAll("[data-wow-reveal]");const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}),{threshold:.14});nodes.forEach((node)=>observer.observe(node));return()=>observer.disconnect()},[]);
  return <>
    <PublicHeader go={go}/>
    <section className="wow-page-hero pricing-wow-hero"><div className="wow-grid-bg"/><div className="wow-orb wow-orb-a"/><div className="wow-orb wow-orb-b"/><div className="wow-hero-copy"><Badge>PRECIOS</Badge><h1>Planes simples para <span>crecer.</span></h1><p>Compra para tu empresa o accede a precios mayoristas como Partner.</p></div><div className="pricing-hero-visual"><div className="pricing-orbit"><span>USD 97<small>/mes</small></span></div><div className="pricing-chip chip-a">Sin contratos largos</div><div className="pricing-chip chip-b">Activación rápida</div><div className="pricing-chip chip-c">Marca blanca</div></div></section>
    <section className="section wow-section" data-wow-reveal><div className="pricing-grid wow-pricing-grid">{plans.map((p,i)=><article className={`price-card card wow-price-card ${i===1?"featured":""}`} key={p.name}><div className="price-card-glow"/>{i===1&&<div className="popular-pill"><Sparkles size={13}/>Más popular</div>}<Badge tone={i===1?"purple":"blue"}>{p.badge}</Badge><h3>{p.name}</h3><div className="price">USD {p.price}<small>/mes</small></div><ul>{p.features.map(f=><li key={f}><Check/>{f}</li>)}</ul><Button className="full" variant={i===1?"secondary":"primary"} onClick={()=>go(i===0?"registro-cliente":"registro-partner")}>Elegir plan <ArrowRight size={16}/></Button></article>)}</div></section>
    <section className="section wow-feature-band wow-section" data-wow-reveal><div><div className="eyebrow">SIN LETRA PEQUEÑA</div><h2>Una estructura clara para empezar y escalar</h2></div><div className="wow-check-grid">{["Panel centralizado","Soporte NOVOeia","Actualizaciones incluidas","Experiencia marca blanca"].map(x=><span key={x}><Check/>{x}</span>)}</div></section>
    <Footer go={go}/>
  </>;
}