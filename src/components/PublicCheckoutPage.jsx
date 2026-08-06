import { useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import StripeEmbeddedCheckout from './StripeEmbeddedCheckout.jsx';
import {
  buildCheckoutServiceLineItem,
  calculateCheckoutDueToday,
  hasBillingIntervalMismatch,
  serviceBillingLabel,
} from '../lib/checkoutLineItems.js';

const DEMO_CHECKOUT_DATA = {
  partner: {
    businessName: 'Agencia Partner',
    logoUrl: '',
    supportEmail: 'soporte@partner.com',
    publicPhone: '+1 954 000 0000',
    whatsappNumber: '+1 954 000 0000',
    websiteUrl: 'https://partner.com',
  },

  theme: {
    primaryColor: '#6D3AF2',
    secondaryColor: '#111827',
    accentColor: '#22C55E',
    backgroundColor: '#F5F7FB',
    surfaceColor: '#FFFFFF',
    textColor: '#111827',
    mutedTextColor: '#64748B',
  },

  product: {
    name: 'NOVO CRM Crecimiento',
    description:
      'Una plataforma comercial para organizar clientes, automatizar seguimientos y centralizar tus procesos.',
    price: 147,
    currency: 'USD',
    interval: 'month',
    benefits: [
      'CRM para administrar clientes y oportunidades',
      'Automatizaciones de seguimiento',
      'Calendarios, formularios y conversaciones',
      'Acceso desde computadora y dispositivos móviles',
    ],
  },

  additionalServices: [
    {
      id: 'setup',
      title: 'Configuración inicial',
      description:
        'Configuración y preparación inicial de la plataforma.',
      price: 150,
      compareAtPrice: 199,
      billingType: 'one_time',
      active: true,
    },
    {
      id: 'integration',
      title: 'Integración adicional',
      description:
        'Conexión con una herramienta externa seleccionada.',
      price: 75,
      billingType: 'one_time',
      active: true,
    },
  ],

  terms: {
    title: 'Términos y condiciones',
    text:
      'El servicio será prestado y administrado por Agencia Partner. La suscripción se renueva automáticamente según la frecuencia indicada.',
    required: true,
  },

  checkout: {
    title: 'Activa tu plataforma comercial',
    subtitle:
      'Completa el pago para comenzar el proceso de implementación.',
    buttonText: 'Activar mi servicio',
  },
};

export default function PublicCheckoutPage({
  checkoutData,
  onCheckout,
  busy = false,
  stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  initialEmail = '',
  initialSelectedServices = [],
}) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [selectedServices, setSelectedServices] = useState(initialSelectedServices);
  const [email, setEmail] = useState(initialEmail);
  const [clientSecret, setClientSecret] = useState('');
  const [notice, setNotice] = useState({ text: '', type: '' });

  useEffect(() => {
    setEmail(initialEmail || '');
  }, [initialEmail]);

  useEffect(() => {
    setSelectedServices(initialSelectedServices || []);
  }, [initialSelectedServices]);

  if (!checkoutData) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f7fb', color: '#64748b' }}>
        Cargando checkout…
      </div>
    );
  }

  const {
    partner,
    theme,
    product,
    additionalServices = [],
    terms,
    checkout,
  } = checkoutData;

  const activeServices = additionalServices.filter(
    service => service.active !== false,
  );

  const selectedActiveServices = activeServices.filter(service =>
    selectedServices.includes(service.id),
  );

  const checkoutTotals = calculateCheckoutDueToday(product, selectedActiveServices);
  const { dueToday, subscriptionRecurringTotal, oneTimeTotal } = checkoutTotals;
  const recurringAddonsTotal = selectedActiveServices
    .filter(service => {
      const line = buildCheckoutServiceLineItem(service, product.interval);
      return !line.bundled && line.billingType !== 'one_time';
    })
    .reduce((sum, service) => sum + Number(service.price || 0), 0);

  useEffect(() => {
    setClientSecret('');
  }, [selectedServices]);

  function toggleService(serviceId) {
    setSelectedServices(current =>
      current.includes(serviceId)
        ? current.filter(id => id !== serviceId)
        : [...current, serviceId],
    );
  }

  async function handlePayment() {
    setNotice({ text: '', type: '' });
    if (!email.trim()) {
      setNotice({ text: 'Escribe tu correo electrónico.', type: 'error' });
      return;
    }

    if (terms?.required && !acceptedTerms) {
      setNotice({ text: 'Debes aceptar los términos y condiciones.', type: 'error' });
      return;
    }

    if (!stripePublishableKey || stripePublishableKey.startsWith('sk_')) {
      setNotice({
        text: 'Configura VITE_STRIPE_PUBLISHABLE_KEY con tu clave pk_test_... de Stripe (no uses la secret key sk_).',
        type: 'error',
      });
      return;
    }

    try {
      const result = await onCheckout?.({
        email: email.trim(),
        selectedServiceIds: selectedServices,
      });
      if (!result?.clientSecret) {
        throw new Error('No se pudo preparar el formulario de pago.');
      }
      setClientSecret(result.clientSecret);
    } catch (error) {
      setNotice({
        text: error?.message || 'No fue posible iniciar el pago.',
        type: 'error',
      });
    }
  }

  const cssVariables = {
    '--checkout-primary':
      theme.primaryColor || '#6D3AF2',

    '--checkout-secondary':
      theme.secondaryColor || '#111827',

    '--checkout-accent':
      theme.accentColor || '#22C55E',

    '--checkout-background':
      theme.backgroundColor || '#F5F7FB',

    '--checkout-surface':
      theme.surfaceColor || '#FFFFFF',

    '--checkout-text':
      theme.textColor || '#111827',

    '--checkout-muted':
      theme.mutedTextColor || '#64748B',
  };

  return (
    <div
      className="public-checkout"
      style={cssVariables}
    >
      <style>{checkoutStyles}</style>

      <header className="checkout-header">
        <div className="checkout-container checkout-header-inner">
          <PartnerLogo partner={partner} />

          <div className="checkout-secure-header">
            <Lock size={14} />
            Pago seguro
          </div>
        </div>
      </header>

      <main className="checkout-container checkout-layout">
        <section className="checkout-information">
          <div className="checkout-kicker">
            SERVICIO PREPARADO PARA TU EMPRESA
          </div>

          <h1>{checkout.title}</h1>

          <p className="checkout-subtitle">
            {checkout.subtitle}
          </p>

          <div className="checkout-product-card">
            <div className="checkout-product-name">
              {product.name}
            </div>

            <p>{product.description}</p>

            <div className="checkout-benefits">
              {(product.benefits || []).map(benefit => (
                <div
                  className="checkout-benefit"
                  key={benefit}
                >
                  <span className="checkout-check">
                    <Check size={13} />
                  </span>

                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {activeServices.length > 0 && (
            <div className="checkout-section">
              <h2>Servicios adicionales</h2>

              <p className="checkout-section-description">
                Selecciona los servicios que deseas agregar
                a esta contratación.
              </p>

              <div className="checkout-services">
                {activeServices.map(service => {
                  const selected =
                    selectedServices.includes(service.id);
                  const compareAtPrice = Number(service.compareAtPrice || 0);
                  const salePrice = Number(service.price || 0);
                  const showComparePrice = compareAtPrice > salePrice;
                  const intervalMismatch = hasBillingIntervalMismatch(service, product.interval);
                  const lineItem = buildCheckoutServiceLineItem(service, product.interval);

                  return (
                    <button
                      type="button"
                      className={`checkout-service ${
                        selected ? 'selected' : ''
                      }`}
                      key={service.id}
                      onClick={() =>
                        toggleService(service.id)
                      }
                    >
                      <span
                        className={`checkout-service-checkbox ${
                          selected ? 'selected' : ''
                        }`}
                      >
                        {selected && <Check size={13} />}
                      </span>

                      <span className="checkout-service-content">
                        <strong>{service.title}</strong>

                        <small>
                          {service.description}
                        </small>
                        {intervalMismatch && (
                          <small className="checkout-service-note">
                            Con plan {product.interval === 'year' ? 'anual' : 'mensual'}, se cobra {lineItem.summaryLabel} en este pago.
                          </small>
                        )}
                      </span>

                      <span className="checkout-service-price">
                        {showComparePrice && (
                          <small className="checkout-service-compare-price">
                            {formatMoney(
                              compareAtPrice,
                              product.currency,
                            )}
                          </small>
                        )}
                        {formatMoney(
                          salePrice,
                          product.currency,
                        )}

                        <small>
                          {service.billingType === 'month'
                            ? '/ mes'
                            : service.billingType === 'year'
                              ? '/ año'
                              : ' único'}
                        </small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="checkout-section">
            <button
              type="button"
              className="checkout-terms-toggle"
              onClick={() =>
                setShowTerms(current => !current)
              }
            >
              <span>{terms.title}</span>

              {showTerms ? (
                <ChevronUp size={17} />
              ) : (
                <ChevronDown size={17} />
              )}
            </button>

            {showTerms && (
              <div className="checkout-terms-content">
                {terms.text}
              </div>
            )}
          </div>

          <PartnerContact partner={partner} />
        </section>

        <aside className="checkout-payment-column">
          <div className="checkout-payment-card">
            <div className="checkout-summary-title">
              Resumen de compra
            </div>

            <div className="checkout-summary-product">
              <div>
                <strong>{product.name}</strong>

                <span>
                  Suscripción{' '}
                  {intervalLabel(product.interval)}
                </span>
              </div>

              <strong>
                {formatMoney(
                  product.price,
                  product.currency,
                )}
              </strong>
            </div>

            {selectedServices.length > 0 && (
              <div className="checkout-selected-services">
                {activeServices
                  .filter(service =>
                    selectedServices.includes(service.id),
                  )
                  .map(service => {
                    const lineItem = buildCheckoutServiceLineItem(service, product.interval);
                    return (
                    <div
                      className="checkout-summary-line"
                      key={service.id}
                    >
                      <span>
                        {service.title}
                        <small>{lineItem.summaryLabel}</small>
                      </span>

                      <span>
                        {formatMoney(
                          lineItem.dueToday,
                          product.currency,
                        )}
                      </span>
                    </div>
                  );})}
              </div>
            )}

            <div className="checkout-total">
              <div>
                <span>Total de hoy</span>

                <small>
                  {recurringAddonsTotal > 0
                    ? `Incluye suscripción (${formatMoney(subscriptionRecurringTotal, product.currency)}${subscriptionIntervalSuffix(product.interval)})`
                    : `La suscripción se renovará ${intervalLabel(product.interval)}.`}
                  {oneTimeTotal > 0 && recurringAddonsTotal > 0 && (
                    <> + {formatMoney(oneTimeTotal, product.currency)} en cargos únicos.</>
                  )}
                </small>
              </div>

              <strong>
                {formatMoney(
                  dueToday,
                  product.currency,
                )}
              </strong>
            </div>

            <div className="checkout-field">
              <label>Correo electrónico</label>

              <div className="checkout-input-wrapper">
                <Mail size={16} />

                <input
                  type="email"
                  value={email}
                  placeholder="nombre@empresa.com"
                  disabled={Boolean(clientSecret)}
                  onChange={event =>
                    setEmail(event.target.value)
                  }
                />
              </div>
            </div>

            {clientSecret ? (
              <StripeEmbeddedCheckout
                publishableKey={stripePublishableKey}
                clientSecret={clientSecret}
              />
            ) : (
              <div className="checkout-payment-placeholder">
                <CreditCard size={24} />

                <div>
                  <strong>Pago seguro con Stripe</strong>

                  <span>
                    Al continuar, el formulario de tarjeta aparecerá aquí mismo, sin salir de esta página.
                  </span>
                </div>
              </div>
            )}

            {!clientSecret && (
              <label className="checkout-acceptance">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={event =>
                    setAcceptedTerms(
                      event.target.checked,
                    )
                  }
                />

                <span>
                  Confirmo que he leído y acepto los{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                  >
                    términos y condiciones
                  </button>{' '}
                  establecidos por {partner.businessName}.
                </span>
              </label>
            )}

            {notice.text && (
              <div className={`checkout-notice checkout-notice-${notice.type}`}>
                {notice.text}
              </div>
            )}

            {!clientSecret && (
              <button
                type="button"
                className="checkout-pay-button"
                onClick={handlePayment}
                disabled={
                  busy || (terms?.required && !acceptedTerms)
                }
              >
                <Lock size={15} />
                {busy ? 'Preparando pago…' : 'Continuar al pago'}
              </button>
            )}

            <div className="checkout-security">
              <ShieldCheck size={15} />

              <span>
                Tus datos de pago serán procesados de
                forma segura.
              </span>
            </div>

            <div className="checkout-novo-notice">
              <strong>
                Información sobre el procesamiento
              </strong>

              <p>
                NOVO Enterprise proporciona la
                infraestructura tecnológica utilizada para
                procesar y administrar este pago. La
                prestación, implementación, soporte y
                cumplimiento del servicio adquirido son
                responsabilidad de{' '}
                <strong>{partner.businessName}</strong>.
              </p>

              <p>
                Para consultas relacionadas con el servicio,
                comunícate directamente con el Partner.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function PartnerLogo({ partner }) {
  if (partner.logoUrl) {
    return (
      <img
        className="checkout-logo"
        src={partner.logoUrl}
        alt={partner.businessName}
      />
    );
  }

  return (
    <div className="checkout-logo-fallback">
      {partner.businessName
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || 'P'}
    </div>
  );
}

function PartnerContact({ partner }) {
  const hasContact =
    partner.supportEmail
    || partner.publicPhone
    || partner.whatsappNumber;

  if (!hasContact) return null;

  return (
    <div className="checkout-contact">
      <h3>¿Necesitas ayuda con el servicio?</h3>

      <p>
        Comunícate directamente con{' '}
        <strong>{partner.businessName}</strong>.
      </p>

      <div className="checkout-contact-actions">
        {partner.supportEmail && (
          <a href={`mailto:${partner.supportEmail}`}>
            <Mail size={14} />
            {partner.supportEmail}
          </a>
        )}

        {partner.publicPhone && (
          <a href={`tel:${partner.publicPhone}`}>
            <Phone size={14} />
            {partner.publicPhone}
          </a>
        )}

        {partner.whatsappNumber && (
          <a
            href={`https://wa.me/${cleanPhone(
              partner.whatsappNumber,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}

function formatMoney(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(value || 0));
}

function intervalLabel(interval) {
  return {
    month: 'mensualmente',
    year: 'anualmente',
  }[interval] || interval;
}

function subscriptionIntervalSuffix(interval) {
  return interval === 'year' ? '/año' : '/mes';
}

function cleanPhone(value) {
  return String(value || '').replace(/\D/g, '');
}

const checkoutStyles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  .public-checkout {
    min-height: 100vh;
    background: var(--checkout-background);
    color: var(--checkout-text);
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .checkout-container {
    width: min(1180px, calc(100% - 40px));
    margin: 0 auto;
  }

  .checkout-header {
    background: var(--checkout-surface);
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }

  .checkout-header-inner {
    min-height: 82px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .checkout-logo {
    max-width: 180px;
    max-height: 52px;
    object-fit: contain;
  }

  .checkout-logo-fallback {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: var(--checkout-primary);
    color: #fff;
    font-size: 20px;
    font-weight: 800;
  }

  .checkout-secure-header {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--checkout-muted);
    font-size: 13px;
    font-weight: 600;
  }

  .checkout-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 430px;
    gap: 54px;
    padding-top: 58px;
    padding-bottom: 70px;
  }

  .checkout-information {
    min-width: 0;
  }

  .checkout-kicker {
    color: var(--checkout-primary);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.11em;
    margin-bottom: 14px;
  }

  .checkout-information h1 {
    max-width: 720px;
    font-size: clamp(34px, 5vw, 54px);
    line-height: 1.05;
    letter-spacing: -0.04em;
    margin: 0 0 18px;
  }

  .checkout-subtitle {
    max-width: 680px;
    color: var(--checkout-muted);
    font-size: 18px;
    line-height: 1.65;
    margin: 0 0 30px;
  }

  .checkout-product-card,
  .checkout-section,
  .checkout-contact {
    background: var(--checkout-surface);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 18px;
    padding: 25px;
    margin-bottom: 18px;
  }

  .checkout-product-name {
    font-size: 21px;
    font-weight: 800;
    margin-bottom: 9px;
  }

  .checkout-product-card > p,
  .checkout-section-description,
  .checkout-contact p {
    color: var(--checkout-muted);
    line-height: 1.6;
  }

  .checkout-benefits {
    display: grid;
    gap: 12px;
    margin-top: 22px;
  }

  .checkout-benefit {
    display: flex;
    gap: 11px;
    align-items: flex-start;
    line-height: 1.45;
  }

  .checkout-check {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border-radius: 50%;
    background: color-mix(in srgb, var(--checkout-primary) 13%, white);
    color: var(--checkout-primary);
  }

  .checkout-section h2 {
    margin: 0 0 7px;
    font-size: 19px;
  }

  .checkout-services {
    display: grid;
    gap: 10px;
    margin-top: 18px;
  }

  .checkout-service {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 13px;
    padding: 14px;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .checkout-service.selected {
    border-color: var(--checkout-primary);
    background: color-mix(in srgb, var(--checkout-primary) 6%, white);
  }

  .checkout-service-checkbox {
    width: 21px;
    height: 21px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(15, 23, 42, 0.2);
    border-radius: 6px;
    flex-shrink: 0;
  }

  .checkout-service-checkbox.selected {
    color: #fff;
    background: var(--checkout-primary);
    border-color: var(--checkout-primary);
  }

  .checkout-service-content {
    display: grid;
    gap: 4px;
    flex: 1;
  }

  .checkout-service-content small {
    color: var(--checkout-muted);
    line-height: 1.4;
  }

  .checkout-service-note {
    display: block;
    margin-top: 4px;
    color: #b45309 !important;
    font-size: 11px !important;
  }

  .checkout-service-price {
    display: grid;
    text-align: right;
    font-weight: 800;
  }

  .checkout-service-compare-price {
    color: var(--checkout-muted);
    font-size: 12px;
    font-weight: 500;
    text-decoration: line-through;
  }

  .checkout-service-price small {
    color: var(--checkout-muted);
    font-size: 10px;
    font-weight: 500;
  }

  .checkout-terms-toggle {
    width: 100%;
    display: flex;
    justify-content: space-between;
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--checkout-text);
    font-size: 15px;
    font-weight: 750;
    cursor: pointer;
  }

  .checkout-terms-content {
    color: var(--checkout-muted);
    line-height: 1.7;
    font-size: 13px;
    margin-top: 17px;
    padding-top: 17px;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
    white-space: pre-line;
  }

  .checkout-contact h3 {
    margin: 0 0 6px;
  }

  .checkout-contact-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 15px;
  }

  .checkout-contact-actions a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--checkout-primary);
    text-decoration: none;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 9px;
    padding: 8px 10px;
  }

  .checkout-payment-column {
    position: relative;
  }

  .checkout-payment-card {
    position: sticky;
    top: 24px;
    background: var(--checkout-surface);
    border: 1px solid rgba(15, 23, 42, 0.09);
    border-radius: 22px;
    padding: 25px;
    box-shadow: 0 22px 55px rgba(15, 23, 42, 0.1);
  }

  .checkout-summary-title {
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 20px;
  }

  .checkout-summary-product,
  .checkout-summary-line {
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .checkout-summary-product div {
    display: grid;
    gap: 4px;
  }

  .checkout-summary-product span,
  .checkout-summary-line {
    color: var(--checkout-muted);
    font-size: 12px;
  }

  .checkout-summary-line {
    color: var(--checkout-muted);
    font-size: 13px;
  }

  .checkout-summary-line span small {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    color: var(--checkout-muted);
  }

  .checkout-selected-services {
    display: grid;
    gap: 9px;
    padding: 18px 0;
    margin-top: 18px;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
  }

  .checkout-total {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    padding: 20px 0;
    margin-top: 18px;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
  }

  .checkout-total div {
    display: grid;
    gap: 5px;
  }

  .checkout-total strong {
    font-size: 22px;
  }

  .checkout-total small {
    color: var(--checkout-muted);
    font-size: 11px;
    line-height: 1.4;
  }

  .checkout-field {
    margin-top: 10px;
  }

  .checkout-field label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 7px;
  }

  .checkout-input-wrapper {
    display: flex;
    align-items: center;
    gap: 9px;
    border: 1px solid rgba(15, 23, 42, 0.14);
    border-radius: 11px;
    padding: 0 12px;
  }

  .checkout-input-wrapper svg {
    color: var(--checkout-muted);
  }

  .checkout-input-wrapper input {
    width: 100%;
    border: 0;
    outline: 0;
    padding: 13px 0;
    background: transparent;
    color: var(--checkout-text);
  }

  .checkout-payment-placeholder {
    display: flex;
    gap: 13px;
    align-items: center;
    padding: 17px;
    margin-top: 14px;
    border: 1px dashed rgba(15, 23, 42, 0.18);
    border-radius: 12px;
    color: var(--checkout-muted);
  }

  .checkout-payment-placeholder div {
    display: grid;
    gap: 3px;
  }

  .checkout-payment-placeholder strong {
    color: var(--checkout-text);
    font-size: 13px;
  }

  .checkout-payment-placeholder span {
    font-size: 11px;
  }

  .checkout-payment-placeholder span {
    display: block;
    line-height: 1.45;
  }

  .checkout-stripe-embed {
    margin: 8px 0 4px;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid rgba(15, 23, 42, 0.08);
    background: #fff;
    min-height: 420px;
  }

  .checkout-acceptance {
    display: flex;
    gap: 9px;
    align-items: flex-start;
    margin: 16px 0;
    color: var(--checkout-muted);
    font-size: 11px;
    line-height: 1.5;
  }

  .checkout-acceptance input {
    margin-top: 2px;
  }

  .checkout-acceptance button {
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--checkout-primary);
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }

  .checkout-notice {
    margin-bottom: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.45;
  }

  .checkout-notice-error {
    background: #fef2f2;
    color: #b91c1c;
  }

  .checkout-pay-button {
    width: 100%;
    min-height: 49px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    border: 0;
    border-radius: 12px;
    background: var(--checkout-primary);
    color: #fff;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
  }

  .checkout-pay-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkout-security {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    color: var(--checkout-muted);
    font-size: 10px;
    margin-top: 11px;
  }

  .checkout-novo-notice {
    color: var(--checkout-muted);
    font-size: 10px;
    line-height: 1.5;
    margin-top: 20px;
    padding-top: 17px;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
  }

  .checkout-novo-notice strong {
    color: var(--checkout-text);
  }

  .checkout-novo-notice p {
    margin: 6px 0 0;
  }

  @media (max-width: 900px) {
    .checkout-layout {
      grid-template-columns: 1fr;
      gap: 28px;
      padding-top: 34px;
    }

    .checkout-payment-column {
      order: -1;
    }

    .checkout-payment-card {
      position: static;
    }
  }

  @media (max-width: 600px) {
    .checkout-container {
      width: min(100% - 24px, 1180px);
    }

    .checkout-header-inner {
      min-height: 68px;
    }

    .checkout-information h1 {
      font-size: 34px;
    }

    .checkout-subtitle {
      font-size: 16px;
    }

    .checkout-product-card,
    .checkout-section,
    .checkout-contact,
    .checkout-payment-card {
      padding: 18px;
      border-radius: 16px;
    }

    .checkout-service {
      align-items: flex-start;
    }

    .checkout-service-price {
      font-size: 12px;
    }
  }
`;