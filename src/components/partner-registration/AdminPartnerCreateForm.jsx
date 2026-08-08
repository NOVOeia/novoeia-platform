import { useState } from 'react';
import { ChevronRight, Save, X } from 'lucide-react';
import { platformApi } from '../../lib/platformApi.js';
import { buildPartnerRegistrationPayload } from '../../lib/partnerRegistrationPayload.js';
import {
  ACTIVITIES,
  COUNTRIES,
  GOALS,
  INITIAL_FORM,
  STEP_CONTENT,
  STEP_NAV,
} from './partnerRegistrationConfig.js';

function Field({ label, required, children, hint }) {
  return (
    <div className="novo-field">
      <label>{label}{required ? ' *' : ''}</label>
      {children}
      {hint && <small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>{hint}</small>}
    </div>
  );
}

function TextInput(props) {
  return <input className="novo-input" {...props} />;
}

function SelectInput({ children, ...props }) {
  return <select className="novo-input" {...props}>{children}</select>;
}

const ADMIN_FORM_DEFAULTS = {
  ...INITIAL_FORM,
  plan_name: 'partner',
  status: 'active',
  source: 'Creado por Super Admin',
};

export default function AdminPartnerCreateForm({ onCancel, onSuccess }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(ADMIN_FORM_DEFAULTS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function toggleGoal(value) {
    setForm(current => ({
      ...current,
      goals: current.goals.includes(value)
        ? current.goals.filter(item => item !== value)
        : [...current.goals, value],
    }));
  }

  function validateStep(index = step) {
    setError('');

    if (index === 0) {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
        setError('Completa nombre, apellido, email y teléfono.');
        return false;
      }
      if (!form.country || !form.partnerType || !form.businessName.trim()) {
        setError('Completa país, tipo de participación y nombre comercial.');
        return false;
      }
    }

    if (index === 1) {
      if (!form.activity || !form.hasClients || !form.crmExperience || !form.ghlExperience) {
        setError('Completa la información de negocio y experiencia.');
        return false;
      }
    }

    if (index === 2) {
      if (!form.targetMarket.trim()) {
        setError('Indica el mercado principal.');
        return false;
      }
    }

    if (index === 3) {
      if (!form.password || form.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return false;
      }
    }

    return true;
  }

  async function submit() {
    if (!validateStep(3)) return;

    try {
      setBusy(true);
      setError('');
      const payload = buildPartnerRegistrationPayload(form, {
        planName: form.plan_name,
        status: form.status,
        adminCreated: true,
      });
      await platformApi.createPartnerAccount(payload);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'No se pudo crear el partner.');
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (!validateStep()) return;
    if (step < STEP_CONTENT.length - 1) {
      setStep(current => current + 1);
      return;
    }
    submit();
  }

  function back() {
    if (step > 0) setStep(current => current - 1);
  }

  const progress = Math.round(((step + 1) / STEP_CONTENT.length) * 100);

  return (
    <div className="novo-card" style={{ marginBottom: 20, border: '1px solid rgba(124,58,237,.3)' }}>
      <div className="novo-card-header">
        <div>
          <div className="novo-card-title">Crear nuevo partner</div>
          <div className="novo-card-sub">Mismo flujo que el registro público — se crea cuenta, perfil y partner</div>
        </div>
        <button type="button" className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={onCancel}>
          <X size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {STEP_NAV.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`novo-btn ${index === step ? 'novo-btn-primary' : 'novo-btn-ghost'}`}
            style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={() => { if (index <= step) setStep(index); }}
          >
            {index + 1}. {item.title}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--novo-muted)', marginBottom: 6 }}>
          <span>Paso {step + 1} de {STEP_CONTENT.length} · {STEP_CONTENT[step].short}</span>
          <span>{progress}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: 'rgba(124,58,237,.12)', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#7c3aed,#6366f1)' }} />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 6px', color: 'var(--novo-text)' }}>{STEP_CONTENT[step].title}</h3>
        <p style={{ margin: 0, color: 'var(--novo-muted)', fontSize: 13 }}>{STEP_CONTENT[step].subtitle}</p>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,.08)', color: '#dc2626', fontSize: 13 }}>
          {error}
        </div>
      )}

      {step === 0 && (
        <div className="novo-grid-2" style={{ marginBottom: 16 }}>
          <Field label="Nombre" required>
            <TextInput value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Daniel" />
          </Field>
          <Field label="Apellido" required>
            <TextInput value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Cortes" />
          </Field>
          <Field label="Correo electrónico" required>
            <TextInput type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="nombre@empresa.com" autoComplete="email" />
          </Field>
          <Field label="Teléfono / WhatsApp" required>
            <TextInput type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+57 300 000 0000" autoComplete="tel" />
          </Field>
          <Field label="País de residencia" required>
            <SelectInput value={form.country} onChange={e => update('country', e.target.value)}>
              <option value="">Seleccionar país</option>
              {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
            </SelectInput>
          </Field>
          <Field label="¿Cómo participará?" required>
            <SelectInput value={form.partnerType} onChange={e => update('partnerType', e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="individual">Persona / profesional independiente</option>
              <option value="business">Empresa / agencia</option>
            </SelectInput>
          </Field>
          <Field label="Nombre comercial o empresa" required hint="Se usará para generar el slug del partner.">
            <TextInput value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Nombre de agencia, empresa o marca" />
          </Field>
          <Field label="Sitio web">
            <TextInput type="url" value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://tuempresa.com" />
          </Field>
          <Field label="Instagram / red social principal">
            <TextInput value={form.social} onChange={e => update('social', e.target.value)} placeholder="@tuempresa" />
          </Field>
        </div>
      )}

      {step === 1 && (
        <>
          <Field label="¿Cuál describe mejor su actividad?" required>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginTop: 8 }}>
              {ACTIVITIES.map(item => (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: form.activity === item.value ? '1px solid rgba(124,58,237,.45)' : '1px solid var(--novo-border)',
                    background: form.activity === item.value ? 'rgba(124,58,237,.06)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  <input type="radio" name="activity" checked={form.activity === item.value} onChange={() => update('activity', item.value)} />
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </Field>
          <div className="novo-grid-2" style={{ marginTop: 16 }}>
            <Field label="¿Trabaja con clientes?" required>
              <SelectInput value={form.hasClients} onChange={e => update('hasClients', e.target.value)}>
                <option value="">Seleccionar</option>
                <option value="yes">Sí</option>
                <option value="no">No</option>
              </SelectInput>
            </Field>
            <Field label="Cantidad aproximada de clientes">
              <SelectInput value={form.clientCount} onChange={e => update('clientCount', e.target.value)}>
                <option>Aún no tengo clientes</option>
                <option>1 - 5</option>
                <option>6 - 15</option>
                <option>16 - 50</option>
                <option>Más de 50</option>
              </SelectInput>
            </Field>
            <Field label="¿Ha trabajado con un CRM?" required>
              <SelectInput value={form.crmExperience} onChange={e => update('crmExperience', e.target.value)}>
                <option value="">Seleccionar</option>
                <option value="yes">Sí</option>
                <option value="no">No</option>
              </SelectInput>
            </Field>
            <Field label="Experiencia con HighLevel / GHL" required>
              <SelectInput value={form.ghlExperience} onChange={e => update('ghlExperience', e.target.value)}>
                <option value="">Seleccionar</option>
                <option>Lo utilizo actualmente</option>
                <option>Lo utilicé anteriormente</option>
                <option>Lo conozco, pero no lo he utilizado</option>
                <option>No lo conozco</option>
              </SelectInput>
            </Field>
            <Field label="Nivel general de experiencia">
              <SelectInput value={form.experienceLevel} onChange={e => update('experienceLevel', e.target.value)}>
                <option>Estoy comenzando</option>
                <option>Básico</option>
                <option>Intermedio</option>
                <option>Avanzado</option>
              </SelectInput>
            </Field>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <Field label="Objetivos con NOVO">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginTop: 8 }}>
              {GOALS.map(item => (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: form.goals.includes(item.value) ? '1px solid rgba(124,58,237,.45)' : '1px solid var(--novo-border)',
                    background: form.goals.includes(item.value) ? 'rgba(124,58,237,.06)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  <input type="checkbox" checked={form.goals.includes(item.value)} onChange={() => toggleGoal(item.value)} />
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </Field>
          <div className="novo-grid-2" style={{ marginTop: 16 }}>
            <Field label="Tipo de clientes que quiere atender">
              <SelectInput value={form.targetClients} onChange={e => update('targetClients', e.target.value)}>
                <option>Empresas en crecimiento</option>
                <option>Pequeños negocios</option>
                <option>Profesionales independientes</option>
                <option>Empresas medianas</option>
                <option>Agencias</option>
                <option>Diferentes tipos de negocios</option>
              </SelectInput>
            </Field>
            <Field label="Mercado principal" required>
              <TextInput value={form.targetMarket} onChange={e => update('targetMarket', e.target.value)} placeholder="Ej. Colombia y Latinoamérica" />
            </Field>
            <Field label="Clientes estimados (6 meses)">
              <SelectInput value={form.estimatedClients} onChange={e => update('estimatedClients', e.target.value)}>
                <option>1 - 5</option>
                <option>6 - 10</option>
                <option>11 - 25</option>
                <option>26 - 50</option>
                <option>Más de 50</option>
                <option>Todavía no lo sé</option>
              </SelectInput>
            </Field>
            <Field label="¿Cómo conoció NOVO Partners?">
              <SelectInput value={form.source} onChange={e => update('source', e.target.value)}>
                <option>Redes sociales</option>
                <option>Recomendación</option>
                <option>NOVOeia</option>
                <option>Evento / capacitación</option>
                <option>Google</option>
                <option>Otro Partner</option>
                <option>Otro</option>
                <option>Creado por Super Admin</option>
              </SelectInput>
            </Field>
            <Field label="Código de referido">
              <TextInput value={form.referralCode} onChange={e => update('referralCode', e.target.value)} placeholder="Opcional" />
            </Field>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p style={{ margin: '0 0 16px', color: 'var(--novo-muted)', fontSize: 13, lineHeight: 1.6 }}>
            Define la contraseña inicial del partner y el estado de la cuenta. El slug se generará automáticamente desde el nombre comercial.
          </p>
          <div className="novo-grid-2" style={{ marginBottom: 16 }}>
            <Field label="Plan">
              <SelectInput value={form.plan_name} onChange={e => update('plan_name', e.target.value)}>
                <option value="partner">Partner</option>
                <option value="partner_pro">Partner Pro</option>
                <option value="partner_enterprise">Partner Enterprise</option>
              </SelectInput>
            </Field>
            <Field label="Estado inicial">
              <SelectInput value={form.status} onChange={e => update('status', e.target.value)}>
                <option value="active">Activo</option>
                <option value="pending">Pendiente</option>
                <option value="inactive">Inactivo</option>
              </SelectInput>
            </Field>
            <Field label="Contraseña inicial" required>
              <TextInput type="password" value={form.password} onChange={e => update('password', e.target.value)} minLength={8} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            </Field>
            <Field label="Confirmar contraseña" required>
              <TextInput type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} minLength={8} placeholder="Repite la contraseña" autoComplete="new-password" />
            </Field>
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <button type="button" className="novo-btn novo-btn-ghost" onClick={step === 0 ? onCancel : back} disabled={busy}>
          {step === 0 ? 'Cancelar' : '← Atrás'}
        </button>
        <button type="button" className="novo-btn novo-btn-primary" onClick={next} disabled={busy}>
          {busy ? 'Creando…' : step === STEP_CONTENT.length - 1 ? <><Save size={14} /> Crear partner</> : <>Continuar <ChevronRight size={14} /></>}
        </button>
      </div>
    </div>
  );
}
