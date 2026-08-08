import { useEffect, useRef, useState } from 'react';
import { Logo } from '../ui.jsx';
import { platformApi } from '../../lib/platformApi.js';
import {
  ACTIVITIES,
  COUNTRIES,
  GOALS,
  INITIAL_FORM,
  STEP_CONTENT,
  STEP_NAV,
} from './partnerRegistrationConfig.js';
import { PartnerPrivacyModal, PartnerTermsModal } from './PartnerRegistrationLegalModals.jsx';
import '../../styles/partner-registration.css';

function Required() {
  return <span className="required">*</span>;
}

export default function PartnerRegistrationForm({ go }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showForm, setShowForm] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add('partner-registration-active');
    document.body.classList.add('partner-registration-active');
    return () => {
      document.documentElement.classList.remove('partner-registration-active');
      document.body.classList.remove('partner-registration-active');
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('pr-partner-reg-modal-open', termsOpen || privacyOpen);
    return () => document.body.classList.remove('pr-partner-reg-modal-open');
  }, [termsOpen, privacyOpen]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleGoal(value) {
    setForm((current) => ({
      ...current,
      goals: current.goals.includes(value)
        ? current.goals.filter((item) => item !== value)
        : [...current.goals, value],
    }));
  }

  function validateStep(index = step) {
    setError('');
    const section = formRef.current?.querySelectorAll('.form-step')?.[index];
    if (!section) return true;

    const required = section.querySelectorAll('input[required], select[required], textarea[required]');
    for (const field of required) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }

    if (index === 1 && !form.activity) {
      setError('Selecciona la actividad que mejor describe tu negocio.');
      return false;
    }

    if (index === 3) {
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return false;
      }
      if (!form.truth || !form.terms || !form.fees || !form.privacy) {
        setError('Debes confirmar todas las casillas legales para continuar.');
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

      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const payload = {
        type: 'partner',
        companyName: form.businessName.trim(),
        fullName,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        primaryColor: '#5b5df0',
        onboarding: {
          country: form.country,
          partnerType: form.partnerType,
          website: form.website || null,
          social: form.social || null,
          activity: form.activity,
          hasClients: form.hasClients,
          clientCount: form.clientCount,
          crmExperience: form.crmExperience,
          ghlExperience: form.ghlExperience,
          experienceLevel: form.experienceLevel,
          goals: form.goals,
          targetClients: form.targetClients,
          targetMarket: form.targetMarket,
          estimatedClients: form.estimatedClients,
          source: form.source,
          referralCode: form.referralCode || null,
          acceptances: {
            truthfulInformation: form.truth,
            acceptedTerms: form.terms,
            understoodTransactionFees: form.fees,
            acceptedPrivacy: form.privacy,
          },
          termsVersion: 'NOVO-PARTNERS-1.0',
          privacyVersion: 'NOVO-PRIVACY-1.0',
          acceptedAt: new Date().toISOString(),
        },
      };

      await platformApi.registerAccount(payload);
      await platformApi.signInWithPassword(payload.email, payload.password);
      setShowForm(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro.');
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (!validateStep()) return;
    if (step < STEP_CONTENT.length - 1) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    submit();
  }

  function back() {
    if (step > 0) {
      setStep((current) => current - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goToStep(index) {
    if (index <= step) setStep(index);
  }

  const progress = Math.round(((step + 1) / STEP_CONTENT.length) * 100);

  return (
    <div className="partner-registration-page">
      <main className="page">
        <header className="topbar">
          <button type="button" className="brand" onClick={() => go('partners')} style={{ border: 0, background: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <Logo small />
          </button>
          <div className="secure-label">🔒 Registro seguro de Partner</div>
        </header>

        <div className="shell">
          <aside className="sidebar">
            <div className="sidebar-content">
              <div className="sidebar-badge">● Nuevo Partner</div>
              <h1 className="sidebar-title">Construye tu negocio con NOVO Partners</h1>
              <p className="sidebar-description">
                Queremos conocerte antes de activar tu cuenta. Este registro toma solo unos minutos y no solicita
                información bancaria ni documentación financiera.
              </p>

              <nav className="steps">
                {STEP_NAV.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    className={`step-nav${index === step ? ' active' : ''}${index < step ? ' completed' : ''}`}
                    onClick={() => goToStep(index)}
                  >
                    <div className="step-number">{index + 1}</div>
                    <div className="step-text">
                      <strong>{item.title}</strong>
                      <span>{item.subtitle}</span>
                    </div>
                  </button>
                ))}
              </nav>

              <div className="mobile-step-label">
                Paso {step + 1} de {STEP_CONTENT.length} · {STEP_CONTENT[step].short}
              </div>

              <div className="sidebar-note">
                La verificación de identidad, información fiscal, métodos de pago y configuración de desembolsos se
                realizará posteriormente mediante un proceso independiente dentro de tu cuenta.
              </div>
            </div>
          </aside>

          <section className="form-card">
            {showForm ? (
              <div className="form-content">
                <div className="form-header">
                  <div className="form-kicker">Paso {step + 1} de {STEP_CONTENT.length}</div>
                  <h2>{STEP_CONTENT[step].title}</h2>
                  <p>{STEP_CONTENT[step].subtitle}</p>
                </div>

                <div className="progress-wrap">
                  <div className="progress-meta">
                    <span>Tu progreso</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {error && (
                  <div style={{ margin: '0 38px', padding: '12px 14px', borderRadius: 12, background: '#fef2f2', color: '#b42318', fontSize: 13 }}>
                    {error}
                  </div>
                )}

                <form
                  ref={formRef}
                  id="partnerForm"
                  onSubmit={(event) => {
                    event.preventDefault();
                    next();
                  }}
                >
                  <section className={`form-step${step === 0 ? ' active' : ''}`}>
                    <div className="section-title">
                      <h3>Información personal</h3>
                      <p>Usaremos estos datos para identificar tu cuenta, conocer quién se está registrando y poder comunicarnos contigo.</p>
                    </div>
                    <div className="grid-2">
                      <div className="field">
                        <label>Nombre <Required /></label>
                        <input type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Daniel" required />
                      </div>
                      <div className="field">
                        <label>Apellido <Required /></label>
                        <input type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Cortes" required />
                      </div>
                      <div className="field">
                        <label>Correo electrónico <Required /></label>
                        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="nombre@empresa.com" required autoComplete="email" />
                      </div>
                      <div className="field">
                        <label>Teléfono / WhatsApp <Required /></label>
                        <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 305 000 0000" required autoComplete="tel" />
                      </div>
                      <div className="field">
                        <label>País de residencia <Required /></label>
                        <select value={form.country} onChange={(e) => update('country', e.target.value)} required>
                          <option value="">Seleccionar país</option>
                          {COUNTRIES.map((country) => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                      <div className="field">
                        <label>¿Cómo participarás? <Required /></label>
                        <select value={form.partnerType} onChange={(e) => update('partnerType', e.target.value)} required>
                          <option value="">Seleccionar</option>
                          <option value="individual">Persona / profesional independiente</option>
                          <option value="business">Empresa / agencia</option>
                        </select>
                      </div>
                      <div className="field full">
                        <label>Nombre comercial o empresa <Required /></label>
                        <input type="text" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="Nombre de tu agencia, empresa o marca" required />
                        <div className="hint">Si trabajas como profesional independiente, puedes utilizar tu nombre o marca comercial.</div>
                      </div>
                      <div className="field">
                        <label>Sitio web</label>
                        <input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://tuempresa.com" />
                      </div>
                      <div className="field">
                        <label>Instagram / red social principal</label>
                        <input type="text" value={form.social} onChange={(e) => update('social', e.target.value)} placeholder="@tuempresa" />
                      </div>
                    </div>
                  </section>

                  <section className={`form-step${step === 1 ? ' active' : ''}`}>
                    <div className="section-title">
                      <h3>Cuéntanos sobre tu negocio</h3>
                      <p>Esto nos ayuda a entender qué tipo de Partner eres, tu experiencia comercial y tu familiaridad con plataformas CRM.</p>
                    </div>
                    <div className="field">
                      <label>¿Cuál describe mejor tu actividad? <Required /></label>
                      <div className="choice-grid">
                        {ACTIVITIES.map((item) => (
                          <div className="choice" key={item.id}>
                            <input type="radio" id={item.id} name="activity" value={item.value} checked={form.activity === item.value} onChange={() => update('activity', item.value)} required={step === 1} />
                            <label htmlFor={item.id}>
                              <span className="choice-icon">{item.icon}</span>
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="divider" />
                    <div className="grid-2">
                      <div className="field">
                        <label>¿Actualmente trabajas con clientes? <Required /></label>
                        <select value={form.hasClients} onChange={(e) => update('hasClients', e.target.value)} required={step === 1}>
                          <option value="">Seleccionar</option>
                          <option value="yes">Sí</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Cantidad aproximada de clientes</label>
                        <select value={form.clientCount} onChange={(e) => update('clientCount', e.target.value)}>
                          <option>Aún no tengo clientes</option>
                          <option>1 - 5</option>
                          <option>6 - 15</option>
                          <option>16 - 50</option>
                          <option>Más de 50</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>¿Has trabajado con un CRM? <Required /></label>
                        <select value={form.crmExperience} onChange={(e) => update('crmExperience', e.target.value)} required={step === 1}>
                          <option value="">Seleccionar</option>
                          <option value="yes">Sí</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Experiencia con HighLevel / GHL <Required /></label>
                        <select value={form.ghlExperience} onChange={(e) => update('ghlExperience', e.target.value)} required={step === 1}>
                          <option value="">Seleccionar</option>
                          <option>Lo utilizo actualmente</option>
                          <option>Lo utilicé anteriormente</option>
                          <option>Lo conozco, pero no lo he utilizado</option>
                          <option>No lo conozco</option>
                        </select>
                      </div>
                      <div className="field full">
                        <label>Nivel general de experiencia</label>
                        <select value={form.experienceLevel} onChange={(e) => update('experienceLevel', e.target.value)}>
                          <option>Estoy comenzando</option>
                          <option>Básico</option>
                          <option>Intermedio</option>
                          <option>Avanzado</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <section className={`form-step${step === 2 ? ' active' : ''}`}>
                    <div className="section-title">
                      <h3>¿Qué quieres construir con NOVO?</h3>
                      <p>Selecciona las opciones que mejor representen cómo quieres utilizar NOVO Partners. Esto no limita posteriormente tu operación.</p>
                    </div>
                    <div className="field">
                      <div className="choice-grid">
                        {GOALS.map((item) => (
                          <div className="choice" key={item.id}>
                            <input type="checkbox" id={item.id} checked={form.goals.includes(item.value)} onChange={() => toggleGoal(item.value)} />
                            <label htmlFor={item.id}>
                              <span className="choice-icon">{item.icon}</span>
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="divider" />
                    <div className="grid-2">
                      <div className="field">
                        <label>Tipo de clientes que quieres atender</label>
                        <select value={form.targetClients} onChange={(e) => update('targetClients', e.target.value)}>
                          <option>Empresas en crecimiento</option>
                          <option>Pequeños negocios</option>
                          <option>Profesionales independientes</option>
                          <option>Empresas medianas</option>
                          <option>Agencias</option>
                          <option>Diferentes tipos de negocios</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>Mercado principal <Required /></label>
                        <input type="text" value={form.targetMarket} onChange={(e) => update('targetMarket', e.target.value)} placeholder="Ej. Estados Unidos y Latinoamérica" required={step === 2} />
                      </div>
                      <div className="field">
                        <label>Clientes estimados en los próximos 6 meses</label>
                        <select value={form.estimatedClients} onChange={(e) => update('estimatedClients', e.target.value)}>
                          <option>1 - 5</option>
                          <option>6 - 10</option>
                          <option>11 - 25</option>
                          <option>26 - 50</option>
                          <option>Más de 50</option>
                          <option>Todavía no lo sé</option>
                        </select>
                      </div>
                      <div className="field">
                        <label>¿Cómo conociste NOVO Partners?</label>
                        <select value={form.source} onChange={(e) => update('source', e.target.value)}>
                          <option>Redes sociales</option>
                          <option>Recomendación</option>
                          <option>NOVOeia</option>
                          <option>Evento / capacitación</option>
                          <option>Google</option>
                          <option>Otro Partner</option>
                          <option>Otro</option>
                        </select>
                      </div>
                      <div className="field full">
                        <label>Código de referido</label>
                        <input type="text" value={form.referralCode} onChange={(e) => update('referralCode', e.target.value)} placeholder="Opcional" />
                      </div>
                    </div>
                  </section>

                  <section className={`form-step${step === 3 ? ' active' : ''}`}>
                    <div className="section-title">
                      <h3>Confirma tu participación</h3>
                      <p>Antes de crear tu cuenta queremos asegurarnos de que comprendes cómo funciona NOVO Partners y dónde consultar las condiciones completas.</p>
                    </div>

                    <div className="free-box">
                      <div className="free-badge">Registro sin costo</div>
                      <h4>Pertenecer a NOVO Partners es gratuito.</h4>
                      <p><strong>No tienes que pagar una inscripción ni una mensualidad simplemente por crear y mantener tu cuenta como Partner.</strong></p>
                      <p>NOVO funciona bajo un modelo donde determinados cargos se generan cuando realizas ventas u operaciones con tus propios clientes utilizando la infraestructura del Programa.</p>
                      <p>Dependiendo de la operación podrán aplicarse cargos de administración de NOVO, infraestructura digital y costos de procesamiento financiero cobrados por proveedores como Stripe.</p>
                      <p>Esto significa que puedes conocer estos costos de antemano y tenerlos en cuenta cuando establezcas cuánto deseas cobrar a tus clientes y cuánto margen quieres obtener por tus propios servicios.</p>
                      <p>Los porcentajes, costos de procesamiento, condiciones especiales y demás reglas están explicados detalladamente dentro de los Términos y Condiciones.</p>
                      <button type="button" className="free-box-link" onClick={() => setTermsOpen(true)}>
                        Leer Términos y Condiciones completos →
                      </button>
                    </div>

                    <div className="legal-heading">Confirmaciones necesarias</div>

                    <div className="checkbox-line">
                      <input type="checkbox" id="truth" checked={form.truth} onChange={(e) => update('truth', e.target.checked)} required={step === 3} />
                      <label htmlFor="truth">Declaro que la información proporcionada en este registro es verdadera, completa y actualizada.</label>
                    </div>
                    <div className="checkbox-line">
                      <input type="checkbox" id="terms" checked={form.terms} onChange={(e) => update('terms', e.target.checked)} required={step === 3} />
                      <label htmlFor="terms">
                        He leído, comprendido y acepto los{' '}
                        <button type="button" className="legal-link" onClick={() => setTermsOpen(true)}>Términos y Condiciones de NOVO Partners</button>
                        {' '}y las reglas de buen uso del Programa.
                      </label>
                    </div>
                    <div className="checkbox-line">
                      <input type="checkbox" id="fees" checked={form.fees} onChange={(e) => update('fees', e.target.checked)} required={step === 3} />
                      <label htmlFor="fees">
                        Entiendo que registrarme y pertenecer a NOVO Partners es gratuito y que determinados cargos y costos de procesamiento se generan cuando realizo operaciones o ventas a mis clientes. He tenido acceso a las condiciones donde se detallan dichos cargos.
                      </label>
                    </div>
                    <div className="checkbox-line">
                      <input type="checkbox" id="privacy" checked={form.privacy} onChange={(e) => update('privacy', e.target.checked)} required={step === 3} />
                      <label htmlFor="privacy">
                        He leído y acepto la{' '}
                        <button type="button" className="legal-link" onClick={() => setPrivacyOpen(true)}>Política de Privacidad</button>.
                      </label>
                    </div>

                    <div className="divider" />

                    <div className="grid-2">
                      <div className="field">
                        <label>Crear contraseña <Required /></label>
                        <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} minLength={8} placeholder="Mínimo 8 caracteres" required={step === 3} autoComplete="new-password" />
                      </div>
                      <div className="field">
                        <label>Confirmar contraseña <Required /></label>
                        <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} minLength={8} placeholder="Repite tu contraseña" required={step === 3} autoComplete="new-password" />
                      </div>
                    </div>
                  </section>

                  <div className="actions">
                    <button type="button" className={`btn btn-secondary${step === 0 ? ' hidden' : ''}`} onClick={back}>
                      ← Atrás
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={busy}>
                      {busy ? 'Creando cuenta…' : step === STEP_CONTENT.length - 1 ? 'Crear mi cuenta de Partner' : 'Continuar →'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="final-message show">
                <div className="success-icon">✓</div>
                <h3>Tu registro fue recibido</h3>
                <p>
                  Tu perfil inicial de NOVO Partners ha sido creado. Desde tu Dashboard podrás continuar con las
                  siguientes etapas de configuración del Programa.
                </p>
                <div className="next-step-box">
                  <strong>Tu registro financiero se realiza después</strong>
                  <p>
                    La verificación de identidad, documentos, información fiscal, método de pago y configuración de
                    desembolsos formarán parte de un proceso separado cuando actives las funcionalidades financieras.
                  </p>
                </div>
                <div style={{ marginTop: 28 }}>
                  <button type="button" className="btn btn-primary" onClick={() => go('partner-dashboard/dashboard')}>
                    Ir a mi panel Partner
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <PartnerTermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
      <PartnerPrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}
