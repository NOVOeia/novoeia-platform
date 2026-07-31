import { ArrowLeft, Building2, Users } from 'lucide-react';
import { Button, Logo } from '../components/ui.jsx';
import '../styles/site-wow.css';

export default function ClientInterestPage({ go }) {
  return (
    <div className="wow-auth-page">
      <div className="wow-auth-grid" />
      <div className="wow-auth-orb auth-orb-a" />
      <button className="back wow-back" onClick={() => go('home')}><ArrowLeft /> Volver</button>

      <div className="auth-card card wow-auth-card wow-login-card">
        <Logo />
        <div className="eyebrow">CLIENTES NOVO</div>
        <h2>Tu partner te activa en NOVO</h2>
        <p className="auth-intro">
          Los clientes finales <strong>no crean cuenta</strong> en esta plataforma.
          Tu partner te registra en su panel y gestiona tu servicio en HighLevel.
        </p>

        <div className="client-interest-points">
          <div><Building2 size={18} /><span>Tu empresa queda en la cartera del partner</span></div>
          <div><Users size={18} /><span>El partner administra tu plan, web y automatizaciones</span></div>
        </div>

        <Button className="full" onClick={() => go('partners')}>Conocer partners NOVO</Button>
        <Button className="full" variant="ghost" onClick={() => go('precios')}>Ver planes</Button>
      </div>
    </div>
  );
}
