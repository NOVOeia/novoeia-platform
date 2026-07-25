import { useState } from "react";
import { ArrowLeft, CheckCircle2, Building2, UserRound, Mail, Phone, Palette, DollarSign } from "lucide-react";
import { Button, Logo, Field } from "../components/ui.jsx";
import "../styles/site-wow.css";

export default function RegistrationPage({ type, go }) {
  const [done,setDone]=useState(false);
  const partner=type==="partner";

  if(done) return <div className="wow-auth-page"><div className="wow-auth-grid"/><div className="wow-auth-orb auth-orb-a"/><div className="auth-card card success wow-auth-card"><CheckCircle2 size={56}/><h2>Registro recibido</h2><p>Tu solicitud quedó preparada para conectarse con Supabase y el proceso de activación.</p><Button onClick={()=>go("login")}>Ir al login</Button></div></div>;

  return <div className="wow-auth-page">
    <div className="wow-auth-grid"/><div className="wow-auth-orb auth-orb-a"/><div className="wow-auth-orb auth-orb-b"/>
    <button className="back wow-back" onClick={()=>go("home")}><ArrowLeft/> Volver</button>
    <div className="auth-card card wow-auth-card">
      <Logo/><div className="eyebrow">{partner?"REGISTRO PARTNER":"REGISTRO CLIENTE"}</div><h2>{partner?"Crea tu negocio de reventa":"Activa NOVO para tu empresa"}</h2><p className="auth-intro">{partner?"Configura tu marca, tus precios y tu futura operación.":"Cuéntanos los datos básicos para preparar tu cuenta."}</p>
      <div className="form-grid">
        <Field label="Empresa"><div className="wow-input-wrap"><Building2/><input placeholder="Nombre comercial"/></div></Field>
        <Field label="Responsable"><div className="wow-input-wrap"><UserRound/><input placeholder="Nombre completo"/></div></Field>
        <Field label="Correo"><div className="wow-input-wrap"><Mail/><input type="email" placeholder="correo@empresa.com"/></div></Field>
        <Field label="Teléfono"><div className="wow-input-wrap"><Phone/><input placeholder="+1 000 000 0000"/></div></Field>
        {partner&&<><Field label="Logo"><input type="file"/></Field><Field label="Color principal"><div className="wow-input-wrap"><Palette/><input type="color" defaultValue="#1e90ff"/></div></Field><Field label="Precio Basic"><div className="wow-input-wrap"><DollarSign/><input defaultValue="127"/></div></Field><Field label="Precio Pro"><div className="wow-input-wrap"><DollarSign/><input defaultValue="197"/></div></Field></>}
      </div>
      <label className="checkbox"><input type="checkbox"/> Acepto los términos y condiciones.</label>
      <Button className="full" onClick={()=>setDone(true)}>Continuar</Button>
    </div>
  </div>;
}