import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
} from 'lucide-react';
import { Button, Logo, Field } from '../components/ui.jsx';
import { platformApi } from '../lib/platformApi.js';
import { supabase } from '../lib/supabase.js';
import '../styles/site-wow.css';

export default function ResetPasswordPage({ go }) {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) {
        setError('El enlace no es válido o ya expiró. Solicita uno nuevo desde el login.');
        setReady(false);
        return;
      }
      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
        setError('');
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function savePassword() {
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setBusy(true);
      setError('');
      await platformApi.updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wow-auth-page">
      <div className="wow-auth-grid" />
      <div className="wow-auth-orb auth-orb-a" />
      <div className="wow-auth-orb auth-orb-b" />

      <button className="back wow-back" onClick={() => go('login')}>
        <ArrowLeft />
        Volver al login
      </button>

      <div className="auth-card card wow-auth-card wow-login-card">
        <Logo />
        <div className="eyebrow">ACCESO NOVO</div>
        <h2>{done ? 'Contraseña actualizada' : 'Nueva contraseña'}</h2>
        <p className="auth-intro">
          {done
            ? 'Ya puedes entrar con tu nueva contraseña.'
            : 'Elige una contraseña segura para tu cuenta.'}
        </p>

        <div className="login-security">
          <ShieldCheck />
          <span>Enlace de recuperación seguro</span>
        </div>

        {error && <div className="login-error">{error}</div>}

        {done ? (
          <Button className="full" onClick={() => go('login')}>
            Ir al login
          </Button>
        ) : ready ? (
          <>
            <Field label="Nueva contraseña">
              <div className="wow-input-wrap">
                <LockKeyhole />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>
            </Field>

            <Field label="Confirmar contraseña">
              <div className="wow-input-wrap">
                <LockKeyhole />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                  autoComplete="new-password"
                />
              </div>
            </Field>

            <Button className="full" onClick={savePassword} disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar contraseña'}
            </Button>
          </>
        ) : (
          <Button className="full" variant="ghost" onClick={() => go('login')}>
            Solicitar nuevo enlace
          </Button>
        )}
      </div>
    </div>
  );
}
