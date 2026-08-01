import { CheckCircle2, XCircle } from 'lucide-react';
import { Button, Logo } from '../components/ui.jsx';
import '../styles/site-wow.css';

export default function CheckoutPage({ go, status = 'success' }) {
  const isSuccess = status === 'success';

  return (
    <div className="wow-auth-page">
      <div className="wow-auth-grid" />
      <div className="auth-card card wow-auth-card wow-login-card" style={{ textAlign: 'center' }}>
        <Logo />
        {isSuccess ? (
          <>
            <CheckCircle2 size={48} color="#4ade80" style={{ margin: '12px auto' }} />
            <h2>Pago recibido</h2>
            <p className="auth-intro">
              Tu suscripción NOVO quedó registrada. El partner y el equipo NOVO procesarán la activación.
            </p>
          </>
        ) : (
          <>
            <XCircle size={48} color="#f87171" style={{ margin: '12px auto' }} />
            <h2>Pago cancelado</h2>
            <p className="auth-intro">
              No se completó el pago. Puedes volver a usar el link que te compartió tu partner.
            </p>
          </>
        )}
        <Button className="full" onClick={() => go('home')}>Volver al inicio</Button>
      </div>
    </div>
  );
}
