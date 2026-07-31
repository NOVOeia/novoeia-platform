import { useState } from 'react';
import {
  ArrowLeft, CheckCircle2, Building2, UserRound, Mail, Phone, Palette, DollarSign, LockKeyhole,
} from 'lucide-react';
import { Button, Logo, Field } from '../components/ui.jsx';
import { platformApi } from '../lib/platformApi.js';
import '../styles/site-wow.css';

const emptyForm = {
  companyName: '',
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  primaryColor: '#188eff',
  basicPrice: '',
  proPrice: '',
};

export default function RegistrationPage({ go }) {
  const [form, setForm] = useState(emptyForm);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    try {
      setBusy(true);
      setError('');

      if (!form.companyName || !form.fullName || !form.email) {
        throw new Error('Completa empresa, responsable y correo.');
      }
      if (form.password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres.');
      }
      if (form.password !== form.confirmPassword) {
        throw new Error('Las contraseñas no coinciden.');
      }
      if (!accepted) {
        throw new Error('Debes aceptar los términos y condiciones.');
      }

      await platformApi.registerAccount({
        type: 'partner',
        companyName: form.companyName,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        primaryColor: form.primaryColor,
        basicPrice: form.basicPrice,
        proPrice: form.proPrice,
      });

      await platformApi.signInWithPassword(form.email, form.password);
      setDone(true);
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro.');
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="wow-auth-page">
        <div className="wow-auth-grid" />
        <div className="wow-auth-orb auth-orb-a" />
        <div className="auth-card card success wow-auth-card">
          <CheckCircle2 size={56} />
          <h2>Partner registrado</h2>
          <p>
            Tu cuenta quedó creada con estado <strong>pending</strong>. El Super Admin te sincronizará
            en HighLevel. Tus clientes los registrarás tú desde tu panel (ellos no entran a la plataforma).
          </p>
          <Button onClick={() => go('partner-dashboard/dashboard')}>Ir a mi panel partner</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="wow-auth-page">
      <div className="wow-auth-grid" />
      <div className="wow-auth-orb auth-orb-a" />
      <div className="wow-auth-orb auth-orb-b" />
      <button className="back wow-back" onClick={() => go('home')}><ArrowLeft /> Volver</button>

      <div className="auth-card card wow-auth-card">
        <Logo />
        <div className="eyebrow">REGISTRO PARTNER</div>
        <h2>Crea tu negocio de reventa</h2>
        <p className="auth-intro">
          Solo partners crean cuenta aquí. Tus clientes finales los das de alta en tu dashboard;
          ellos no acceden a NOVOeia.
        </p>

        {error && <div className="login-error">{error}</div>}

        <div className="form-grid">
          <Field label="Empresa">
            <div className="wow-input-wrap"><Building2 /><input value={form.companyName} onChange={(e) => update('companyName', e.target.value)} placeholder="Nombre comercial" autoComplete="organization" /></div>
          </Field>
          <Field label="Responsable">
            <div className="wow-input-wrap"><UserRound /><input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Nombre completo" autoComplete="name" /></div>
          </Field>
          <Field label="Correo">
            <div className="wow-input-wrap"><Mail /><input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="correo@empresa.com" autoComplete="email" /></div>
          </Field>
          <Field label="Teléfono">
            <div className="wow-input-wrap"><Phone /><input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 000 000 0000" autoComplete="tel" /></div>
          </Field>
          <Field label="Contraseña">
            <div className="wow-input-wrap"><LockKeyhole /><input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" /></div>
          </Field>
          <Field label="Confirmar contraseña">
            <div className="wow-input-wrap"><LockKeyhole /><input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="Repite la contraseña" autoComplete="new-password" /></div>
          </Field>
          <Field label="Color principal">
            <div className="wow-input-wrap"><Palette /><input type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} /></div>
          </Field>
          <Field label="Precio Basic">
            <div className="wow-input-wrap"><DollarSign /><input type="number" min="0" step="1" value={form.basicPrice} onChange={(e) => update('basicPrice', e.target.value)} placeholder="Ej. 150" /></div>
          </Field>
          <Field label="Precio Pro">
            <div className="wow-input-wrap"><DollarSign /><input type="number" min="0" step="1" value={form.proPrice} onChange={(e) => update('proPrice', e.target.value)} placeholder="Ej. 500" /></div>
          </Field>
        </div>

        <label className="checkbox">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          Acepto los términos y condiciones.
        </label>

        <Button className="full" onClick={submit} disabled={busy}>
          {busy ? 'Creando cuenta…' : 'Registrarme como partner'}
        </Button>

        <p className="auth-intro" style={{ marginTop: 16 }}>
          ¿Ya tienes cuenta? <button type="button" className="text-link" onClick={() => go('login')}>Inicia sesión</button>
        </p>
      </div>
    </div>
  );
}
