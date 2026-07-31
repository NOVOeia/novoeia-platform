import { useEffect, useState } from 'react';
import { LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Logo, Button } from '../components/ui.jsx';
import { platformApi } from '../lib/platformApi.js';
import '../styles/site-wow.css';

const callbackTasks = new Map();

function runGhlCallback(code, state) {
  const key = `${code}:${state}`;
  if (!callbackTasks.has(key)) {
    callbackTasks.set(
      key,
      (async () => {
        const result = await platformApi.completeGhlOAuth({ code, state });
        if (result?.purpose === 'connect') return { type: 'connect', result };
        if (!result?.tokenHash) throw new Error('No se recibió sesión de login.');
        await platformApi.establishGhlSession(result.tokenHash);
        return { type: 'login', result };
      })(),
    );
  }
  return callbackTasks.get(key);
}

export default function GhlCallbackPage({ go, code, state }) {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Completando autorización con HighLevel…');

  useEffect(() => {
    if (!code) {
      setStatus('error');
      setMessage('Falta el código OAuth de HighLevel.');
      return;
    }
    if (!state) {
      setStatus('error');
      setMessage('Falta el state OAuth. Vuelve a iniciar sesión con HighLevel.');
      return;
    }

    let cancelled = false;

    runGhlCallback(code, state)
      .then(({ type, result }) => {
        if (cancelled) return;
        setStatus('success');
        if (type === 'connect') {
          setMessage('HighLevel conectado. Volviendo al Control Center…');
          setTimeout(() => go('admin-dashboard'), 900);
          return;
        }
        setMessage('Sesión iniciada. Entrando a tu panel…');
        setTimeout(() => go(platformApi.roleToDashboard(result.role)), 900);
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(error.message || 'No se pudo completar el acceso con HighLevel.');
      });

    return () => {
      cancelled = true;
    };
  }, [code, state, go]);

  return (
    <div className="wow-auth-page">
      <div className="wow-auth-grid" />
      <div className="auth-card card wow-auth-card wow-login-card ghl-callback-card">
        <Logo />
        <div className="eyebrow">HIGHLEVEL OAUTH</div>
        <h2>{status === 'error' ? 'No se pudo completar' : 'Conectando tu cuenta'}</h2>
        <div className={`ghl-callback-status ${status}`}>
          {status === 'loading' && <LoaderCircle className="spin" size={28} />}
          {status === 'success' && <CheckCircle2 size={28} />}
          {status === 'error' && <AlertCircle size={28} />}
          <p>{message}</p>
        </div>
        {status === 'error' && (
          <Button className="full" onClick={() => go('login')}>
            Volver al login
          </Button>
        )}
      </div>
    </div>
  );
}
