import { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  LockKeyhole,
} from 'lucide-react';
import { Button, Logo, Field } from '../components/ui.jsx';
import { platformApi } from '../lib/platformApi.js';
import '../styles/site-wow.css';

export default function LoginPage({ go }) {
  const [mode, setMode] = useState('login'); // login | forgot | sent
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loginWithPassword() {
    try {
      setBusy(true);
      setError('');
      const { profile } = await platformApi.signInWithPassword(email.trim(), password);
      const dashboard = platformApi.roleToDashboard(profile?.role || 'client');
      go(`${dashboard}/${platformApi.defaultDashboardSection(profile?.role || 'client')}`);
    } catch (err) {
      setError(err.message || 'Correo o contraseña incorrectos.');
      setBusy(false);
    }
  }

  async function requestReset() {
    try {
      setBusy(true);
      setError('');
      setNotice('');
      const data = await platformApi.requestPasswordReset(email.trim());
      setNotice(data?.message || 'Si el correo está registrado, te enviamos un enlace.');
      setMode('sent');
    } catch (err) {
      setError(err.message || 'No se pudo enviar el enlace de recuperación.');
    } finally {
      setBusy(false);
    }
  }

  function backToLogin() {
    setMode('login');
    setError('');
    setNotice('');
    setPassword('');
  }

  return (
    <div className="wow-auth-page">
      <div className="wow-auth-grid" />
      <div className="wow-auth-orb auth-orb-a" />
      <div className="wow-auth-orb auth-orb-b" />

      <button className="back wow-back" onClick={() => go('home')}>
        <ArrowLeft />
        Volver
      </button>

      <div className="auth-card card wow-auth-card wow-login-card">
        <Logo />

        <div className="eyebrow">ACCESO NOVO</div>

        <h2>
          {mode === 'login' && 'Entra a tu experiencia NOVO'}
          {mode === 'forgot' && 'Recuperar contraseña'}
          {mode === 'sent' && 'Revisa tu correo'}
        </h2>

        <p className="auth-intro">
          {mode === 'login' && 'Acceso para partners y Super Admin. Los clientes finales no ingresan aquí.'}
          {mode === 'forgot' && 'Te enviaremos un enlace para crear una nueva contraseña.'}
          {mode === 'sent' && 'Si el correo está registrado, el enlace llegará en unos minutos. Revisa también spam.'}
        </p>

        <div className="login-security">
          <ShieldCheck />
          <span>Sesión segura con Supabase</span>
        </div>

        {error && <div className="login-error">{error}</div>}
        {notice && <div className="login-notice">{notice}</div>}

        {mode !== 'sent' && (
          <Field label="Correo">
            <div className="wow-input-wrap">
              <Mail />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                autoComplete="email"
              />
            </div>
          </Field>
        )}

        {mode === 'login' && (
          <>
            <div className="login-password-label">
              <span>Contraseña</span>
              <button
                type="button"
                className="text-link login-forgot-link"
                onClick={() => {
                  setMode('forgot');
                  setError('');
                  setNotice('');
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Field label="">
              <div className="wow-input-wrap">
                <LockKeyhole />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') loginWithPassword();
                  }}
                />
              </div>
            </Field>

            <Button className="full" onClick={loginWithPassword} disabled={busy}>
              {busy ? 'Entrando…' : 'Entrar con correo'}
            </Button>
          </>
        )}

        {mode === 'forgot' && (
          <Button className="full" onClick={requestReset} disabled={busy || !email.trim()}>
            {busy ? 'Enviando…' : 'Enviar enlace'}
          </Button>
        )}

        {mode === 'sent' && (
          <Button className="full" onClick={backToLogin}>
            Volver al login
          </Button>
        )}

        {mode === 'forgot' && (
          <div className="login-register-row">
            <button type="button" className="text-link" onClick={backToLogin}>
              Volver al login
            </button>
          </div>
        )}

        {mode === 'login' && (
          <div className="login-register-row">
            <span>¿Eres partner?</span>
            <button type="button" className="text-link" onClick={() => go('registro-partner')}>
              Regístrate aquí
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
