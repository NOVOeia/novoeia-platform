import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, X } from 'lucide-react';
import { platformApi } from '../lib/platformApi.js';
import {
  EMPTY_BACKUP_BANK,
  EMPTY_LEGAL_PROFILE,
  EMPTY_US_BANK,
  EMPTY_WIZARD_STATE,
  LOCAL_METHODS,
  PAYMENT_COUNTRIES,
  PROVIDER_INFO,
  STEP_LABELS,
  canEditProfile,
  countryLabel,
  getProviderRules,
  paymentRouteFromSelection,
  statusLabel,
} from '../lib/partnerPaymentConfig.js';
import '../styles/partner-payments.css';

function mergeObject(base, incoming) {
  return { ...base, ...(incoming && typeof incoming === 'object' ? incoming : {}) };
}

function Field({ label, children, full = false }) {
  return (
    <div className={`pp-field${full ? ' full' : ''}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function CountrySelect({ value, onChange, disabled }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      <option value="">Seleccionar país</option>
      {PAYMENT_COUNTRIES.map(([code, label]) => (
        <option key={code} value={code}>{label}</option>
      ))}
    </select>
  );
}

export default function PartnerPaymentsModule() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileMeta, setProfileMeta] = useState(null);
  const [legal, setLegal] = useState(EMPTY_LEGAL_PROFILE);
  const [backup, setBackup] = useState(EMPTY_BACKUP_BANK);
  const [hasUSBank, setHasUSBank] = useState(false);
  const [usBank, setUsBank] = useState(EMPTY_US_BANK);
  const [wizard, setWizard] = useState(EMPTY_WIZARD_STATE);
  const [finalConfirmation, setFinalConfirmation] = useState(false);
  const [toast, setToast] = useState(null);
  const [infoProvider, setInfoProvider] = useState(null);

  const editable = canEditProfile(profileMeta?.status);
  const currentStep = Number(wizard.currentStep || 1);

  const showToast = useCallback((text, type = 'ok') => {
    setToast({ text, type });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const hydrate = useCallback((profile) => {
    setProfileMeta(profile || null);
    setLegal(mergeObject(EMPTY_LEGAL_PROFILE, profile?.legal_profile));
    setBackup(mergeObject(EMPTY_BACKUP_BANK, profile?.backup_bank));
    setHasUSBank(Boolean(profile?.has_us_bank));
    setUsBank(mergeObject(EMPTY_US_BANK, profile?.us_bank));
    setWizard(mergeObject(EMPTY_WIZARD_STATE, profile?.wizard_state));
    setFinalConfirmation(false);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await platformApi.getPaymentProfile();
      hydrate(data?.profile || null);
    } catch (error) {
      showToast(error.message || 'No se pudo cargar el perfil de pagos', 'error');
    } finally {
      setLoading(false);
    }
  }, [hydrate, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const rules = useMemo(
    () => getProviderRules({
      country: legal.country,
      partnerType: legal.partnerType,
      hasUSBank,
    }),
    [legal.country, legal.partnerType, hasUSBank],
  );

  const localMethod = LOCAL_METHODS[backup.bankCountry] || null;
  const progress = Math.min(100, Math.max(25, currentStep * 25));

  const completed = {
    1: Boolean(legal.firstName && legal.lastName && legal.partnerType && legal.country && legal.email),
    2: Boolean(backup.bankCountry && backup.bankName && backup.bankHolder && backup.bankAccount),
    3: Boolean(
      wizard.selectedProvider
      && (wizard.selectedProvider !== 'wise' || wizard.selectedWiseDestination),
    ),
    4: Boolean(profileMeta?.status === 'pending_review' || profileMeta?.status === 'approved'),
  };

  function patchLegal(key, value) {
    setLegal((prev) => ({ ...prev, [key]: value }));
  }

  function patchBackup(key, value) {
    setBackup((prev) => ({ ...prev, [key]: value }));
  }

  function patchUsBank(key, value) {
    setUsBank((prev) => ({ ...prev, [key]: value }));
  }

  function patchWizard(key, value) {
    setWizard((prev) => ({ ...prev, [key]: value }));
  }

  function buildPayload(extra = {}) {
    return {
      legal_profile: legal,
      backup_bank: backup,
      has_us_bank: hasUSBank,
      us_bank: usBank,
      provider_details: {
        airwallexEmail: wizard.airwallexEmail || '',
        airwallexAccountId: wizard.airwallexAccountId || '',
        wiseEmail: wizard.wiseEmail || '',
        wiseTag: wizard.wiseTag || '',
        wisePhone: wizard.wisePhone || '',
        accountCreationStatus: wizard.accountCreationStatus || '',
      },
      wizard_state: {
        ...wizard,
        currentStep,
      },
      payment_route: paymentRouteFromSelection(
        wizard.selectedProvider,
        wizard.selectedWiseDestination,
      ),
      ...extra,
    };
  }

  async function saveDraft(nextStep = currentStep) {
    if (!editable) return profileMeta;
    try {
      setSaving(true);
      const payload = buildPayload({
        wizard_state: {
          ...wizard,
          currentStep: nextStep,
        },
      });
      const data = await platformApi.savePaymentProfile(payload);
      setProfileMeta(data.profile);
      setWizard((prev) => ({ ...prev, currentStep: nextStep }));
      return data.profile;
    } catch (error) {
      showToast(error.message || 'No se pudo guardar', 'error');
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function goToStep(step) {
    if (step < 1 || step > 4) return;
    if (!editable && step !== currentStep) {
      setWizard((prev) => ({ ...prev, currentStep: step }));
      return;
    }
    try {
      await saveDraft(step);
    } catch {
      /* toast already shown */
    }
  }

  async function chooseProvider(provider) {
    if (!editable) return;
    if (provider === 'airwallex' && !rules.airwallex.enabled) return;
    if (provider === 'wise' && !rules.wise.enabled) return;
    if (provider === 'usbank' && !rules.usbank.enabled) return;

    if (provider === 'usbank') {
      const hasDetails = Boolean(
        usBank.usBankName
        && usBank.usBankHolder
        && usBank.usBankRouting
        && usBank.usBankAccount,
      );
      if (!hasDetails) {
        showToast('Primero registra tu cuenta bancaria USA en el Paso 2', 'error');
        return;
      }
    }

    setWizard((prev) => ({
      ...prev,
      selectedProvider: provider,
      selectedWiseDestination: provider === 'wise' ? (prev.selectedWiseDestination || 'account') : '',
      accountCreationStatus: provider === 'wise' ? (prev.accountCreationStatus || '') : prev.accountCreationStatus,
    }));
  }

  async function submitProfile() {
    if (!editable) return;
    if (!finalConfirmation) {
      showToast('Confirma que los datos son correctos', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const data = await platformApi.submitPaymentProfile({
        ...buildPayload(),
        finalConfirmation: true,
      });
      hydrate(data.profile);
      showToast('Cuenta de pagos enviada para activación');
    } catch (error) {
      showToast(error.message || 'No se pudo enviar', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const statusClass = profileMeta?.status || 'draft';

  return (
    <div className="novo-page novo-partner-payments">
      <div className="novo-page-header">
        <span className="kicker">LIQUIDACIONES</span>
        <h1>Activación de cuenta de pagos</h1>
        <p>Configura dónde quieres recibir tus ganancias como Partner NOVO.</p>
      </div>

      <div className="pp-module">
        <div className="pp-header">
          <div className="pp-header-row">
            <div className="pp-brand">
              <h1><span>NOVO</span> Partners</h1>
              <p>Activación de tu cuenta de pagos</p>
            </div>
            <div className="pp-status">
              <div className="pp-status-top">
                <span>Configuración</span>
                <strong>{progress}%</strong>
              </div>
              <div className="pp-progress-track">
                <div className="pp-progress-bar" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="pp-steps">
            {STEP_LABELS.map((item) => (
              <button
                key={item.step}
                type="button"
                className={`pp-step-tab${currentStep === item.step ? ' active' : ''}${completed[item.step] ? ' done' : ''}`}
                onClick={() => goToStep(item.step)}
              >
                <span className="pp-step-number">{item.step}</span>
                <strong>{item.title}</strong>
                <small>{item.subtitle}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="pp-content">
          {loading && (
            <div className="novo-empty" style={{ padding: 40 }}>
              <Loader2 size={18} style={{ animation: 'novoSpin .8s linear infinite' }} /> Cargando perfil de pagos…
            </div>
          )}

          {!loading && profileMeta?.status && profileMeta.status !== 'draft' && (
            <div className={`pp-banner ${statusClass}`}>
              <strong>Estado: {statusLabel(profileMeta.status)}</strong>
              <span>
                {profileMeta.status === 'pending_review' && 'NOVO está validando tu cuenta de pagos. Te avisaremos cuando esté lista.'}
                {profileMeta.status === 'approved' && 'Tu cuenta de pagos está activa para liquidaciones.'}
                {profileMeta.status === 'rejected' && (profileMeta.review_notes || 'Tu solicitud fue rechazada. Corrige los datos y vuelve a enviar.')}
                {profileMeta.status === 'needs_changes' && (profileMeta.review_notes || 'Se requieren cambios. Actualiza la información y reenvía.')}
              </span>
            </div>
          )}

          {!loading && currentStep === 1 && (
            <section>
              <div className="pp-hero">
                <div className="pp-kicker">Paso 1 · Perfil de pagos</div>
                <h2>Primero, confirmemos quién recibirá las ganancias.</h2>
                <p>
                  Ya eres Partner de NOVO. Esta información adicional nos permitirá organizar
                  correctamente tus liquidaciones y mostrarte las opciones disponibles.
                </p>
              </div>

              <div className="pp-card">
                <h3 className="pp-card-title">Información del titular</h3>
                <p className="pp-card-desc">Usa la información legal de la persona o empresa que recibirá los pagos.</p>
                <div className="pp-form-grid">
                  <Field label="Nombre">
                    <input value={legal.firstName} disabled={!editable} onChange={(e) => patchLegal('firstName', e.target.value)} placeholder="Ej. Laura" />
                  </Field>
                  <Field label="Apellido">
                    <input value={legal.lastName} disabled={!editable} onChange={(e) => patchLegal('lastName', e.target.value)} placeholder="Ej. Martínez" />
                  </Field>
                  <Field label="Tipo de Partner">
                    <select value={legal.partnerType} disabled={!editable} onChange={(e) => patchLegal('partnerType', e.target.value)}>
                      <option value="">Seleccionar</option>
                      <option value="individual">Persona natural</option>
                      <option value="company">Empresa registrada</option>
                    </select>
                  </Field>
                  <Field label="País donde resides">
                    <CountrySelect value={legal.country} disabled={!editable} onChange={(v) => patchLegal('country', v)} />
                  </Field>
                  <Field label="Correo de liquidaciones">
                    <input type="email" value={legal.email} disabled={!editable} onChange={(e) => patchLegal('email', e.target.value)} placeholder="pagos@empresa.com" />
                  </Field>
                  <Field label="Teléfono">
                    <input value={legal.phone} disabled={!editable} onChange={(e) => patchLegal('phone', e.target.value)} placeholder="+1 305 000 0000" />
                  </Field>
                  {legal.partnerType === 'company' && (
                    <>
                      <Field label="Razón social" full>
                        <input value={legal.companyLegalName} disabled={!editable} onChange={(e) => patchLegal('companyLegalName', e.target.value)} placeholder="Nombre legal de la empresa" />
                      </Field>
                      <Field label="Tax ID / NIT / RFC" full>
                        <input value={legal.taxId} disabled={!editable} onChange={(e) => patchLegal('taxId', e.target.value)} placeholder="Identificación fiscal" />
                      </Field>
                    </>
                  )}
                </div>

                <label className="pp-check-card">
                  <input
                    type="checkbox"
                    checked={hasUSBank}
                    disabled={!editable}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHasUSBank(checked);
                      if (!checked && wizard.selectedProvider === 'usbank') {
                        setWizard((prev) => ({
                          ...prev,
                          selectedProvider: '',
                          selectedWiseDestination: '',
                        }));
                      }
                    }}
                  />
                  <div>
                    <strong>Resido en Estados Unidos o tengo una cuenta bancaria en USA</strong>
                    <span>
                      Marca esta opción aunque vivas en otro país. Muchas personas trabajan
                      internacionalmente pero tienen una cuenta bancaria estadounidense. Si es
                      tu caso, podremos mostrarte una tercera alternativa para recibir tus ganancias.
                    </span>
                  </div>
                </label>
              </div>
            </section>
          )}

          {!loading && currentStep === 2 && (
            <section>
              <div className="pp-hero">
                <div className="pp-kicker">Paso 2 · Información bancaria</div>
                <h2>Registra una cuenta bancaria de respaldo.</h2>
                <p>
                  Esta información nos ayuda a validar tus datos y ofrece una vía alternativa
                  si una liquidación requiere revisión.
                </p>
              </div>

              <div className="pp-card">
                <h3 className="pp-card-title">Cuenta de respaldo</h3>
                <p className="pp-card-desc">Puede ser local o internacional. No es necesariamente tu método principal de cobro.</p>
                <div className="pp-form-grid">
                  <Field label="País del banco">
                    <CountrySelect value={backup.bankCountry} disabled={!editable} onChange={(v) => patchBackup('bankCountry', v)} />
                  </Field>
                  <Field label="Nombre del banco">
                    <input value={backup.bankName} disabled={!editable} onChange={(e) => patchBackup('bankName', e.target.value)} placeholder="Ej. Bank of America" />
                  </Field>
                  <Field label="Titular de la cuenta">
                    <input value={backup.bankHolder} disabled={!editable} onChange={(e) => patchBackup('bankHolder', e.target.value)} placeholder="Nombre del titular" />
                  </Field>
                  <Field label="Tipo de cuenta">
                    <select value={backup.bankType} disabled={!editable} onChange={(e) => patchBackup('bankType', e.target.value)}>
                      <option value="">Seleccionar</option>
                      <option value="checking">Corriente / Checking</option>
                      <option value="savings">Ahorros / Savings</option>
                    </select>
                  </Field>
                  <Field label="Número de cuenta / IBAN">
                    <input value={backup.bankAccount} disabled={!editable} onChange={(e) => patchBackup('bankAccount', e.target.value)} placeholder="Número de cuenta" />
                  </Field>
                  <Field label="SWIFT / BIC (opcional)">
                    <input value={backup.bankSwift} disabled={!editable} onChange={(e) => patchBackup('bankSwift', e.target.value)} placeholder="SWIFT" />
                  </Field>
                  {backup.bankCountry === 'US' && (
                    <Field label="Routing / ABA">
                      <input value={backup.mainBankRouting} disabled={!editable} onChange={(e) => patchBackup('mainBankRouting', e.target.value)} placeholder="9 dígitos" />
                    </Field>
                  )}
                  {['ES', 'PT', 'FR', 'DE', 'IT'].includes(backup.bankCountry) && (
                    <Field label="IBAN">
                      <input value={backup.mainBankIban} disabled={!editable} onChange={(e) => patchBackup('mainBankIban', e.target.value)} placeholder="IBAN" />
                    </Field>
                  )}
                </div>

                {localMethod && (
                  <div className="pp-local-method">
                    <div className="pp-local-method-head">
                      <div className="pp-local-icon">$</div>
                      <div>
                        <h4>{localMethod.name}</h4>
                        <p>{localMethod.description}</p>
                      </div>
                    </div>
                    <Field label={localMethod.label}>
                      <input
                        value={backup.localPaymentId}
                        disabled={!editable}
                        onChange={(e) => patchBackup('localPaymentId', e.target.value)}
                        placeholder={localMethod.placeholder}
                      />
                    </Field>
                  </div>
                )}

                {hasUSBank && (
                  <div className="pp-local-method">
                    <div className="pp-local-method-head">
                      <div className="pp-local-icon">US</div>
                      <div>
                        <h4>Cuenta bancaria en Estados Unidos</h4>
                        <p>
                          Como indicaste que resides o tienes una cuenta bancaria en USA,
                          registra aquí esa información. En el siguiente paso podrás elegirla
                          como método oficial de pago.
                        </p>
                      </div>
                    </div>
                    <div className="pp-form-grid">
                      <Field label="Banco USA">
                        <input
                          value={usBank.usBankName}
                          disabled={!editable}
                          onChange={(e) => patchUsBank('usBankName', e.target.value)}
                          placeholder="Ej. Chase"
                        />
                      </Field>
                      <Field label="Titular">
                        <input
                          value={usBank.usBankHolder}
                          disabled={!editable}
                          onChange={(e) => patchUsBank('usBankHolder', e.target.value)}
                          placeholder="Ej. Laura Martínez"
                        />
                      </Field>
                      <Field label="Routing / ABA">
                        <input
                          value={usBank.usBankRouting}
                          disabled={!editable}
                          onChange={(e) => patchUsBank('usBankRouting', e.target.value)}
                          placeholder="9 dígitos"
                        />
                      </Field>
                      <Field label="Número de cuenta">
                        <input
                          value={usBank.usBankAccount}
                          disabled={!editable}
                          onChange={(e) => patchUsBank('usBankAccount', e.target.value)}
                          placeholder="Número de cuenta"
                        />
                      </Field>
                      <Field label="Tipo de cuenta">
                        <select
                          value={usBank.usBankType}
                          disabled={!editable}
                          onChange={(e) => patchUsBank('usBankType', e.target.value)}
                        >
                          <option value="">Seleccionar</option>
                          <option value="checking">Checking</option>
                          <option value="savings">Savings</option>
                        </select>
                      </Field>
                      <Field label="Zelle">
                        <input
                          value={usBank.usBankZelle}
                          disabled={!editable}
                          onChange={(e) => patchUsBank('usBankZelle', e.target.value)}
                          placeholder="Email o teléfono asociado"
                        />
                        <div className="pp-field-help">Opcional. Lo conservaremos como información adicional de respaldo.</div>
                      </Field>
                    </div>
                  </div>
                )}

                {!hasUSBank && (
                  <div className="pp-info">
                    <strong>Tip: </strong>
                    Si tienes una cuenta bancaria en USA, vuelve al Paso 1 y marca esa opción.
                    Así habilitaremos una tercera alternativa de cobro en el siguiente paso.
                  </div>
                )}

                <div className="pp-info">
                  <strong>Importante: </strong>
                  esta información bancaria queda registrada como respaldo. En el siguiente
                  paso seleccionarás el <strong>método oficial de pago</strong> que NOVO
                  utilizará para enviarte tus ganancias.
                </div>
              </div>
            </section>
          )}

          {!loading && currentStep === 3 && (
            <section>
              <div className="pp-hero">
                <div className="pp-kicker">Paso 3 · Método oficial de pago</div>
                <h2>Elige dónde quieres recibir tus ganancias.</h2>
                <p>
                  Siempre verás las tres alternativas. Según tu perfil pueden estar disponibles una,
                  dos o las tres. NOVO te recomienda una, pero tú decides.
                </p>
              </div>

              <div className="pp-location-banner">
                {!legal.country ? (
                  <>
                    <strong>Primero indícanos tu país.</strong>
                    <span>
                      Utilizamos tu ubicación, tu perfil y si dispones de una cuenta bancaria
                      en Estados Unidos para determinar qué opciones pueden utilizarse.
                    </span>
                  </>
                ) : (
                  <>
                    <strong>Opciones disponibles para {countryLabel(legal.country)}</strong>
                    <span>
                      {[
                        rules.airwallex.enabled && 'Airwallex',
                        rules.wise.enabled && 'Wise',
                        rules.usbank.enabled && 'Banco USA',
                      ].filter(Boolean).length}{' '}
                      {[
                        rules.airwallex.enabled && 'Airwallex',
                        rules.wise.enabled && 'Wise',
                        rules.usbank.enabled && 'Banco USA',
                      ].filter(Boolean).length === 1
                        ? 'alternativa disponible'
                        : 'alternativas disponibles'}
                      :{' '}
                      <strong>
                        {[
                          rules.airwallex.enabled && 'Airwallex',
                          rules.wise.enabled && 'Wise',
                          rules.usbank.enabled && 'Banco USA',
                        ].filter(Boolean).join(', ') || 'Pendiente de revisión'}
                      </strong>
                      . NOVO destacará una recomendación, pero tú decides cuál utilizar.
                      {!hasUSBank && (
                        <>
                          {' '}
                          Si tienes cuenta en USA, márcalo en el Paso 1 para habilitar la tercera opción.
                        </>
                      )}
                    </span>
                  </>
                )}
              </div>

              <div className="pp-provider-grid">
                {[
                  {
                    id: 'airwallex',
                    title: 'Airwallex',
                    copy: 'Recibe tus ganancias en una cuenta Airwallex y administra fondos, monedas y retiros desde allí.',
                    points: ['Cuenta financiera internacional', 'Múltiples monedas', 'Costos posteriores a cargo del Partner'],
                    enabled: rules.airwallex.enabled,
                    reason: rules.airwallex.reason,
                  },
                  {
                    id: 'wise',
                    title: 'Wise',
                    copy: 'Recibe en Wise o úsala como vía hacia tu banco de respaldo.',
                    points: ['Cuenta Wise o banco vía Wise', 'Identificación flexible', 'Tarifas según ruta y moneda'],
                    enabled: rules.wise.enabled,
                    reason: rules.wise.reason,
                  },
                  {
                    id: 'usbank',
                    title: 'Cuenta bancaria USA',
                    copy: 'NOVO liquida directamente a tu cuenta bancaria estadounidense.',
                    points: ['Sin cuenta financiera extra', 'Routing + cuenta USA', 'Zelle opcional'],
                    enabled: rules.usbank.enabled,
                    reason: rules.usbank.reason,
                  },
                ].map((provider) => {
                  const selected = wizard.selectedProvider === provider.id;
                  const recommended = rules.recommended === provider.id;
                  return (
                    <article
                      key={provider.id}
                      className={`pp-provider${provider.enabled ? '' : ' disabled'}${selected ? ' selected' : ''}${recommended ? ' recommended' : ''}`}
                    >
                      <div className="pp-provider-top">
                        <div className="pp-provider-logo">{provider.title}</div>
                        {recommended && <span className="pp-badge rec">Recomendado</span>}
                      </div>
                      <span className={`pp-badge ${provider.enabled ? 'available' : 'unavailable'}`}>
                        {provider.enabled ? 'Disponible' : 'No disponible'}
                      </span>
                      <p className="pp-provider-copy">{provider.copy}</p>
                      {provider.points.map((point) => (
                        <div key={point} className="pp-provider-point">{point}</div>
                      ))}
                      {!provider.enabled && (
                        <p className="pp-provider-copy">{provider.reason}</p>
                      )}
                      <div className="pp-provider-actions">
                        <button type="button" className="pp-btn pp-btn-ghost" onClick={() => setInfoProvider(provider.id)}>
                          Cómo funciona
                        </button>
                        <button
                          type="button"
                          className={`pp-btn pp-btn-choose${selected ? ' selected' : ''}`}
                          disabled={!editable || !provider.enabled}
                          onClick={() => chooseProvider(provider.id)}
                        >
                          {selected ? 'Seleccionado' : `Elegir ${provider.title}`}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {wizard.selectedProvider === 'airwallex' && (
                <div className="pp-card" style={{ marginTop: 14 }}>
                  <h3 className="pp-card-title">Datos Airwallex</h3>
                  <div className="pp-form-grid">
                    <Field label="Email de la cuenta Airwallex">
                      <input
                        value={wizard.airwallexEmail}
                        disabled={!editable}
                        onChange={(e) => patchWizard('airwallexEmail', e.target.value)}
                        placeholder="cuenta@airwallex.com"
                      />
                    </Field>
                    <Field label="Account ID (si ya la tienes)">
                      <input
                        value={wizard.airwallexAccountId}
                        disabled={!editable}
                        onChange={(e) => patchWizard('airwallexAccountId', e.target.value)}
                      />
                    </Field>
                    <Field label="Estado de la cuenta" full>
                      <select
                        value={wizard.accountCreationStatus}
                        disabled={!editable}
                        onChange={(e) => patchWizard('accountCreationStatus', e.target.value)}
                      >
                        <option value="">Seleccionar</option>
                        <option value="existing">Ya tengo cuenta</option>
                        <option value="will_create">La crearé con la guía de NOVO</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {wizard.selectedProvider === 'wise' && (
                <div className="pp-card" style={{ marginTop: 14 }}>
                  <h3 className="pp-card-title">Cómo quieres usar Wise</h3>
                  <div className="pp-wise-options">
                    <button
                      type="button"
                      className={`pp-wise-option${wizard.selectedWiseDestination === 'account' ? ' active' : ''}`}
                      disabled={!editable}
                      onClick={() => patchWizard('selectedWiseDestination', 'account')}
                    >
                      <strong>Recibir en mi cuenta Wise</strong>
                      <div className="pp-card-desc">NOVO envía a tu cuenta Wise.</div>
                    </button>
                    <button
                      type="button"
                      className={`pp-wise-option${wizard.selectedWiseDestination === 'bank' ? ' active' : ''}`}
                      disabled={!editable}
                      onClick={() => patchWizard('selectedWiseDestination', 'bank')}
                    >
                      <strong>Wise hacia mi banco</strong>
                      <div className="pp-card-desc">Wise como vía hacia tu banco de respaldo.</div>
                    </button>
                  </div>
                  <div className="pp-form-grid" style={{ marginTop: 14 }}>
                    <Field label="Email Wise">
                      <input value={wizard.wiseEmail} disabled={!editable} onChange={(e) => patchWizard('wiseEmail', e.target.value)} />
                    </Field>
                    <Field label="Wisetag (opcional)">
                      <input value={wizard.wiseTag} disabled={!editable} onChange={(e) => patchWizard('wiseTag', e.target.value)} />
                    </Field>
                    <Field label="Teléfono Wise (opcional)" full>
                      <input value={wizard.wisePhone} disabled={!editable} onChange={(e) => patchWizard('wisePhone', e.target.value)} />
                    </Field>
                  </div>
                </div>
              )}

              {wizard.selectedProvider === 'usbank' && (
                <div className="pp-card" style={{ marginTop: 14 }}>
                  <h3 className="pp-card-title">Confirma tu cuenta bancaria USA</h3>
                  <div className="pp-info" style={{ marginTop: 0, marginBottom: 12 }}>
                    Utilizaremos la cuenta bancaria estadounidense registrada en el Paso 2
                    como tu vía oficial de liquidación.{' '}
                    <strong>NOVO no añade un fee adicional por utilizar esta opción.</strong>
                  </div>
                  <div className="pp-review-row"><span>Banco</span><strong>{usBank.usBankName || 'Sin registrar'}</strong></div>
                  <div className="pp-review-row"><span>Titular</span><strong>{usBank.usBankHolder || 'Sin registrar'}</strong></div>
                  <div className="pp-review-row"><span>Cuenta</span><strong>{usBank.usBankAccount ? `••••${String(usBank.usBankAccount).slice(-4)}` : '—'}</strong></div>
                  <div className="pp-review-row"><span>Routing</span><strong>{usBank.usBankRouting || '—'}</strong></div>
                  <div className="pp-review-row"><span>Zelle</span><strong>{usBank.usBankZelle || 'No indicado'}</strong></div>
                  {(!usBank.usBankName || !usBank.usBankAccount) && (
                    <div className="pp-info" style={{ marginTop: 12, borderColor: '#ffc1cb', background: '#fff1f4' }}>
                      Falta completar la cuenta USA en el Paso 2 antes de enviar.
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {!loading && currentStep === 4 && (
            <section>
              <div className="pp-hero">
                <div className="pp-kicker">Paso 4 · Revisión</div>
                <h2>Revisa y envía tu cuenta de pagos.</h2>
                <p>NOVO validará la información antes de activar tus liquidaciones.</p>
              </div>

              <div className="pp-review-grid">
                <div className="pp-card">
                  <h3 className="pp-card-title">Titular</h3>
                  <div className="pp-review-row"><span>Nombre</span><strong>{legal.firstName} {legal.lastName}</strong></div>
                  <div className="pp-review-row"><span>Tipo</span><strong>{legal.partnerType === 'company' ? 'Empresa' : legal.partnerType === 'individual' ? 'Persona natural' : '—'}</strong></div>
                  <div className="pp-review-row"><span>País</span><strong>{countryLabel(legal.country)}</strong></div>
                  <div className="pp-review-row"><span>Email</span><strong>{legal.email || '—'}</strong></div>
                  <div className="pp-review-row"><span>Teléfono</span><strong>{legal.phone || '—'}</strong></div>
                </div>

                <div className="pp-card">
                  <h3 className="pp-card-title">Banco de respaldo</h3>
                  <div className="pp-review-row"><span>País</span><strong>{countryLabel(backup.bankCountry)}</strong></div>
                  <div className="pp-review-row"><span>Banco</span><strong>{backup.bankName || '—'}</strong></div>
                  <div className="pp-review-row"><span>Titular</span><strong>{backup.bankHolder || '—'}</strong></div>
                  <div className="pp-review-row"><span>Cuenta</span><strong>{backup.bankAccount || '—'}</strong></div>
                  <div className="pp-review-row"><span>Cuenta USA</span><strong>{hasUSBank ? 'Sí' : 'No'}</strong></div>
                </div>

                <div className="pp-card" style={{ gridColumn: '1 / -1' }}>
                  <h3 className="pp-card-title">Método oficial</h3>
                  <div className="pp-review-row">
                    <span>Proveedor</span>
                    <strong>
                      {wizard.selectedProvider === 'airwallex' && 'Airwallex'}
                      {wizard.selectedProvider === 'wise' && 'Wise'}
                      {wizard.selectedProvider === 'usbank' && 'Cuenta bancaria USA'}
                      {!wizard.selectedProvider && '—'}
                    </strong>
                  </div>
                  <div className="pp-review-row">
                    <span>Ruta</span>
                    <strong>{paymentRouteFromSelection(wizard.selectedProvider, wizard.selectedWiseDestination) || '—'}</strong>
                  </div>
                  <div className="pp-review-row">
                    <span>Estado</span>
                    <strong style={{ color: '#13a878' }}>
                      {profileMeta?.status === 'pending_review' ? 'Lista para revisión' : statusLabel(profileMeta?.status || 'draft')}
                    </strong>
                  </div>
                </div>
              </div>

              {editable && (
                <label className="pp-check" style={{ marginTop: 14 }}>
                  <input
                    type="checkbox"
                    checked={finalConfirmation}
                    onChange={(e) => setFinalConfirmation(e.target.checked)}
                  />
                  <span>
                    Confirmo que los datos son correctos y entiendo que los costos de retiro,
                    conversión o transferencia son responsabilidad del Partner.
                  </span>
                </label>
              )}
            </section>
          )}

          {!loading && (
            <div className="pp-footer-nav">
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="pp-btn pp-btn-ghost"
                  disabled={currentStep <= 1 || saving || submitting}
                  onClick={() => goToStep(currentStep - 1)}
                >
                  Anterior
                </button>
                <button type="button" className="pp-btn pp-btn-ghost" onClick={load} disabled={loading}>
                  <RefreshCw size={14} /> Recargar
                </button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {editable && currentStep < 4 && (
                  <button
                    type="button"
                    className="pp-btn pp-btn-primary"
                    disabled={saving || submitting}
                    onClick={() => goToStep(currentStep + 1)}
                  >
                    {saving ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : null}
                    Guardar y continuar
                  </button>
                )}
                {editable && currentStep === 4 && (
                  <button
                    type="button"
                    className="pp-btn pp-btn-primary"
                    disabled={saving || submitting}
                    onClick={submitProfile}
                  >
                    {submitting ? <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : null}
                    Enviar para activación
                  </button>
                )}
                {editable && currentStep < 4 && (
                  <button
                    type="button"
                    className="pp-btn pp-btn-ghost"
                    disabled={saving || submitting}
                    onClick={() => saveDraft(currentStep).then(() => showToast('Borrador guardado')).catch(() => {})}
                  >
                    Guardar borrador
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`pp-toast${toast.type === 'error' ? ' error' : ''}`}>
          {toast.text}
        </div>
      )}

      {infoProvider && PROVIDER_INFO[infoProvider] && (
        <div className="pp-modal-backdrop" onClick={(e) => e.target === e.currentTarget && setInfoProvider(null)}>
          <div className="pp-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{PROVIDER_INFO[infoProvider].title}</h3>
              <button type="button" className="pp-btn pp-btn-ghost" style={{ padding: 6 }} onClick={() => setInfoProvider(null)}>
                <X size={14} />
              </button>
            </div>
            <ul>
              {PROVIDER_INFO[infoProvider].points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div className="pp-modal-actions">
              <button type="button" className="pp-btn pp-btn-primary" onClick={() => setInfoProvider(null)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
