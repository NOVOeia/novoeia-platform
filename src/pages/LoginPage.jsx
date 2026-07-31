import { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  LockKeyhole,
  PlugZap,
} from 'lucide-react';
import { Button, Logo, Field } from '../components/ui.jsx';
import { platformApi } from '../lib/platformApi.js';
import '../styles/site-wow.css';

export default function LoginPage({ go }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loginWithGhl() {
    try {
      setBusy(true);
      setError('');
      const data = await platformApi.startGhlLogin();
      if (!data?.authorizationUrl) throw new Error('No se recibió URL de HighLevel.');
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err.message || 'No se pudo iniciar el login con HighLevel.');
      setBusy(false);
    }
  }

  async function loginWithPassword() {
    try {
      setBusy(true);
      setError('');
      const { profile } = await platformApi.signInWithPassword(email.trim(), password);
      const dashboard = platformApi.roleToDashboard(profile?.role || 'client');
      go(`${dashboard}/dashboard`);
    } catch (err) {
      setError(err.message || 'Correo o contraseña incorrectos.');
      setBusy(false);
    }
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

        <h2>Entra a tu experiencia NOVO</h2>

        <p className="auth-intro">
          Acceso para partners y Super Admin. Los clientes finales no ingresan aquí.
        </p>

        <div className="login-security">
          <ShieldCheck />
          <span>Sesión segura Supabase + OAuth HighLevel</span>
        </div>

        {error && <div className="login-error">{error}</div>}

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

        <Field label="Contraseña">
          <div className="wow-input-wrap">
            <LockKeyhole />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />
          </div>
        </Field>

        <Button className="full" onClick={loginWithPassword} disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar con correo'}
        </Button>

        <div className="login-divider"><span>o</span></div>

        <Button className="full ghl-login-btn" variant="ghost" onClick={loginWithGhl} disabled={busy}>
          <PlugZap size={18} />
          Continuar con HighLevel
        </Button>

        <p className="auth-intro" style={{ marginTop: 16 }}>
          ¿Eres partner?{' '}
          <button type="button" className="text-link" onClick={() => go('registro-partner')}>Regístrate aquí</button>
        </p>
      </div>
    </div>
  );
}
