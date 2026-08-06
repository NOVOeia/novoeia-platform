import { useEffect, useState } from 'react';
import {
  Building2, Check, ChevronRight, CreditCard, Copy, Eye, Globe, Image,
  MapPin, Palette, Phone, Plus, RefreshCw, Save, Settings, ShoppingCart, Trash2,
} from 'lucide-react';
import FunnelAdminPanel from './FunnelAdminPanel.jsx';
import { platformApi } from '../lib/platformApi.js';
import {
  DEFAULT_CHECKOUT,
  DEFAULT_TERMS,
  mapOfferToAdminProduct,
  normalizeStoredFunnel,
} from '../lib/storefrontDefaults.js';

const INITIAL_BRAND = {
  businessName: '',
  legalName: '',
  tagline: '',
  description: '',
  websiteUrl: '',
  logoUrl: '',
  coverImageUrl: '',
  partnerAccountEmail: '',
  partnerContactPhone: '',
  supportEmail: '',
  publicContactPhone: '',
  whatsappNumber: '',
  address: '',
  city: '',
  state: '',
  country: '',
  primaryColor: '#7C3AED',
  secondaryColor: '#111827',
  accentColor: '#22C55E',
  backgroundColor: '#F8FAFC',
  textColor: '#111827',
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  tiktokUrl: '',
};

const INITIAL_CHECKOUT = { ...DEFAULT_CHECKOUT };

const INITIAL_TERMS = { ...DEFAULT_TERMS };

function mergeBrand(source = {}) {
  return { ...INITIAL_BRAND, ...source };
}

function mergeCheckout(source = {}) {
  return { ...INITIAL_CHECKOUT, ...source };
}

function mergeTerms(source = {}) {
  return { ...INITIAL_TERMS, ...source };
}

export default function PartnerBrandConsole() {
  const [activeTab, setActiveTab] = useState('brand');
  const [brand, setBrand] = useState(INITIAL_BRAND);
  const [funnel, setFunnel] = useState(() => normalizeStoredFunnel());
  const [checkout, setCheckout] = useState(INITIAL_CHECKOUT);
  const [terms, setTerms] = useState(INITIAL_TERMS);
  const [additionalServices, setAdditionalServices] = useState([]);
  const [productOverrides, setProductOverrides] = useState({});
  const [partnerProducts, setPartnerProducts] = useState([]);
  const [slug, setSlug] = useState('');
  const [partnerStatus, setPartnerStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await platformApi.getPartnerBranding();
        const partner = data?.partner;
        const branding = partner?.branding || {};
        setSlug(partner?.slug || '');
        setPartnerStatus(partner?.status || '');
        setBrand(mergeBrand(branding.brand || {
          businessName: branding.name || partner?.name || '',
          logoUrl: branding.logoUrl || '',
          primaryColor: branding.primaryColor || INITIAL_BRAND.primaryColor,
          facebookUrl: partner?.social_settings?.facebookUrl || '',
          instagramUrl: partner?.social_settings?.instagramUrl || '',
          tiktokUrl: partner?.social_settings?.tiktokUrl || '',
        }));
        setFunnel(normalizeStoredFunnel(branding.funnel));
        setCheckout(mergeCheckout(branding.checkout));
        setTerms(mergeTerms(branding.terms));
        setAdditionalServices(Array.isArray(branding.additionalServices) ? branding.additionalServices : []);
        setProductOverrides(branding.productOverrides || {});

        const offersData = await platformApi.listPartnerOffers().catch(() => ({ offers: [] }));
        const products = (offersData?.offers || [])
          .map(mapOfferToAdminProduct)
          .filter(Boolean);
        setPartnerProducts(products);
      } catch (error) {
        setNotice({ type: 'error', text: error.message });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updateBrand(field, value) {
    setBrand(current => ({ ...current, [field]: value }));
  }

  function updateCheckout(field, value) {
    setCheckout(current => ({ ...current, [field]: value }));
  }

  function updateTerms(field, value) {
    setTerms(current => ({ ...current, [field]: value }));
  }

  function updateProductOverride(productId, field, value) {
    setProductOverrides(current => ({
      ...current,
      [productId]: {
        ...(current[productId] || {}),
        [field]: value,
      },
    }));
  }

  function addAdditionalService() {
    setAdditionalServices(current => [
      ...current,
      {
        id: `svc-${Date.now()}`,
        title: '',
        description: '',
        price: 0,
        billingType: 'one_time',
        active: true,
      },
    ]);
  }

  function updateAdditionalService(index, field, value) {
    setAdditionalServices(current => current.map((item, i) => (
      i === index ? { ...item, [field]: value } : item
    )));
  }

  function removeAdditionalService(index) {
    setAdditionalServices(current => current.filter((_, i) => i !== index));
  }

  async function persistBranding(nextFunnel = funnel) {
    await platformApi.savePartnerBranding({
      brand,
      funnel: nextFunnel,
      checkout,
      terms,
      additionalServices,
      productOverrides,
    });
  }

  const landingUrl = slug
    ? `${window.location.origin}${window.location.pathname}#p/${slug}`
    : '';

  async function saveCurrentSection() {
    try {
      setBusy(true);
      await persistBranding();
      setNotice({ type: 'success', text: 'Configuración guardada correctamente.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function saveFunnelSettings(nextFunnel) {
    setFunnel(nextFunnel);
    try {
      setBusy(true);
      await persistBranding(nextFunnel);
      setNotice({ type: 'success', text: 'Configuración del funnel guardada correctamente.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
      throw error;
    } finally {
      setBusy(false);
    }
  }

  async function copyLandingUrl() {
    if (!landingUrl) return;
    try {
      await navigator.clipboard.writeText(landingUrl);
      setNotice({ type: 'success', text: 'Link de tu landing copiado.' });
    } catch {
      setNotice({ type: 'error', text: 'No se pudo copiar el link.' });
    }
  }

  function openPreview() {
    if (!slug) return;
    window.open(`#p/${slug}`, '_blank', 'noopener,noreferrer');
  }

  function openCheckoutPreview(productId) {
    if (!slug) return;
    const targetId = productId || partnerProducts.find(product => product.price != null)?.id;
    if (!targetId) {
      setNotice({
        type: 'error',
        text: 'Configura al menos un producto con precio para previsualizar el checkout.',
      });
      return;
    }
    window.open(`#p/${slug}/checkout/${targetId}`, '_blank', 'noopener,noreferrer');
  }

  if (loading) {
    return (
      <div className="novo-page">
        <div className="novo-empty">Cargando configuración de marca…</div>
      </div>
    );
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header">
        <span className="kicker">IDENTIDAD WHITE LABEL</span>
        <h1>Mi marca y páginas</h1>
        <p>Configura tu marca, tu página de ventas y la experiencia de pago que verán tus clientes.</p>
      </div>

      {notice && (
        <div className={`novo-notice ${notice.type}`} style={{ marginBottom: 18 }}>
          {notice.type === 'success' ? <Check size={15} /> : null}
          <span style={{ flex: 1 }}>{notice.text}</span>
        </div>
      )}

      {slug && (
        <div className="novo-card" style={{ marginBottom: 20 }}>
          <div className="novo-card-header">
            <div>
              <div className="novo-card-title">Tu landing pública</div>
              <div className="novo-card-sub">
                {partnerStatus === 'active'
                  ? 'Comparte este link para promocionar tus productos'
                  : partnerStatus === 'pending'
                    ? 'Puedes previsualizar mientras el Super Admin activa tu cuenta'
                    : 'Tu landing no está publicada — contacta al Super Admin'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <code style={{ flex: 1, minWidth: 220, padding: '10px 12px', borderRadius: 8, background: 'var(--novo-card-hover)', fontSize: 12, wordBreak: 'break-all' }}>
              {landingUrl}
            </code>
            <button type="button" className="novo-btn novo-btn-ghost" onClick={copyLandingUrl}><Copy size={14} /> Copiar</button>
            <button type="button" className="novo-btn novo-btn-secondary" onClick={openPreview}><Eye size={14} /> Vista previa</button>
          </div>
        </div>
      )}

      <div className="novo-card" style={{ marginBottom: 20, padding: 10 }}>
        <div className="brand-page-tabs">
          <TabButton active={activeTab === 'brand'} icon={Palette} title="Mi marca" description="Logo, colores y contacto" onClick={() => setActiveTab('brand')} />
          <TabButton active={activeTab === 'funnel'} icon={ShoppingCart} title="Funnel de ventas" description="Página estándar de ventas" onClick={() => setActiveTab('funnel')} />
          <TabButton active={activeTab === 'checkout'} icon={CreditCard} title="Página de checkout" description="Experiencia de pago" onClick={() => setActiveTab('checkout')} />
        </div>
      </div>

      {activeTab === 'brand' && <BrandForm brand={brand} updateBrand={updateBrand} onSave={saveCurrentSection} busy={busy} />}
      {activeTab === 'funnel' && (
        <FunnelAdminPanel
          embedded
          settings={funnel}
          onChange={setFunnel}
          products={partnerProducts}
          onSave={saveFunnelSettings}
          onPreview={openPreview}
          busy={busy}
        />
      )}
      {activeTab === 'checkout' && (
        <CheckoutForm
          checkout={checkout}
          terms={terms}
          additionalServices={additionalServices}
          partnerProducts={partnerProducts}
          productOverrides={productOverrides}
          updateCheckout={updateCheckout}
          updateTerms={updateTerms}
          updateProductOverride={updateProductOverride}
          addAdditionalService={addAdditionalService}
          updateAdditionalService={updateAdditionalService}
          removeAdditionalService={removeAdditionalService}
          onSave={saveCurrentSection}
          onPreviewCheckout={openCheckoutPreview}
          busy={busy}
        />
      )}

      <style>{styles}</style>
    </div>
  );
}

function BrandForm({ brand, updateBrand, onSave, busy }) {
  return (
    <>
      <FormSection icon={Building2} title="Información de la empresa" description="Datos principales de tu marca.">
        <div className="novo-grid-2">
          <Field label="Nombre comercial *" value={brand.businessName} onChange={value => updateBrand('businessName', value)} />
          <Field label="Nombre legal" value={brand.legalName} onChange={value => updateBrand('legalName', value)} />
          <Field label="Frase de marca" value={brand.tagline} onChange={value => updateBrand('tagline', value)} />
          <Field label="Sitio web" value={brand.websiteUrl} placeholder="https://..." onChange={value => updateBrand('websiteUrl', value)} />
        </div>
        <TextArea label="Descripción de la empresa" value={brand.description} onChange={value => updateBrand('description', value)} />
      </FormSection>

      <FormSection icon={Image} title="Identidad visual" description="Estas imágenes se utilizarán en el checkout y el funnel.">
        <div className="novo-grid-2">
          <Field label="URL del logo *" value={brand.logoUrl} placeholder="https://..." onChange={value => updateBrand('logoUrl', value)} />
          <Field label="URL de imagen de portada" value={brand.coverImageUrl} placeholder="https://..." onChange={value => updateBrand('coverImageUrl', value)} />
        </div>
        <div className="brand-preview-row">
          <LogoPreview brand={brand} />
          <div className="brand-color-grid">
            <ColorField label="Color principal" value={brand.primaryColor} onChange={value => updateBrand('primaryColor', value)} />
            <ColorField label="Color secundario" value={brand.secondaryColor} onChange={value => updateBrand('secondaryColor', value)} />
            <ColorField label="Color de acento" value={brand.accentColor} onChange={value => updateBrand('accentColor', value)} />
            <ColorField label="Color de fondo" value={brand.backgroundColor} onChange={value => updateBrand('backgroundColor', value)} />
            <ColorField label="Color del texto" value={brand.textColor} onChange={value => updateBrand('textColor', value)} />
          </div>
        </div>
      </FormSection>

      <FormSection icon={Phone} title="Información de contacto" description="Separa los datos internos de los que verán tus clientes.">
        <div className="novo-grid-2">
          <Field label="Correo público de soporte *" value={brand.supportEmail} type="email" helper="Visible en checkout y funnel." onChange={value => updateBrand('supportEmail', value)} />
          <Field label="Número de contacto público" value={brand.publicContactPhone} helper="Visible para los clientes." onChange={value => updateBrand('publicContactPhone', value)} />
          <Field label="WhatsApp público" value={brand.whatsappNumber} helper="Se utilizará en el botón de WhatsApp." onChange={value => updateBrand('whatsappNumber', value)} />
        </div>
      </FormSection>

      <FormSection icon={MapPin} title="Ubicación" description="Información opcional para pie de página y contacto.">
        <div className="novo-grid-2">
          <Field label="Dirección" value={brand.address} onChange={value => updateBrand('address', value)} />
          <Field label="Ciudad" value={brand.city} onChange={value => updateBrand('city', value)} />
          <Field label="Estado" value={brand.state} onChange={value => updateBrand('state', value)} />
          <Field label="País" value={brand.country} onChange={value => updateBrand('country', value)} />
        </div>
      </FormSection>

      <FormSection icon={Globe} title="Redes sociales" description="Solo se mostrarán los enlaces que completes.">
        <div className="novo-grid-2">
          <Field label="Facebook" value={brand.facebookUrl} placeholder="https://..." onChange={value => updateBrand('facebookUrl', value)} />
          <Field label="Instagram" value={brand.instagramUrl} placeholder="https://..." onChange={value => updateBrand('instagramUrl', value)} />
          <Field label="LinkedIn" value={brand.linkedinUrl} placeholder="https://..." onChange={value => updateBrand('linkedinUrl', value)} />
          <Field label="TikTok" value={brand.tiktokUrl} placeholder="https://..." onChange={value => updateBrand('tiktokUrl', value)} />
        </div>
      </FormSection>

      <ActionBar onSave={onSave} busy={busy} label="Guardar mi marca" />
    </>
  );
}

function CheckoutForm({
  checkout,
  terms,
  additionalServices,
  partnerProducts,
  productOverrides,
  updateCheckout,
  updateTerms,
  updateProductOverride,
  addAdditionalService,
  updateAdditionalService,
  removeAdditionalService,
  onSave,
  onPreviewCheckout,
  busy,
}) {
  const previewableProducts = partnerProducts.filter(product => product.price != null);
  const [previewProductId, setPreviewProductId] = useState(
    () => previewableProducts[0]?.id || '',
  );

  useEffect(() => {
    setPreviewProductId(current => {
      if (current && previewableProducts.some(product => product.id === current)) {
        return current;
      }
      return previewableProducts[0]?.id || '';
    });
  }, [partnerProducts]);

  return (
    <>
      <FormSection icon={CreditCard} title="Configuración de checkout" description="Esta configuración se aplicará a la página estándar de pago.">
        <div className="novo-grid-2">
          <Field label="Título del checkout" value={checkout.title} onChange={value => updateCheckout('title', value)} />
          <Field label="Subtítulo" value={checkout.subtitle} onChange={value => updateCheckout('subtitle', value)} />
          <Field label="Texto del botón de pago" value={checkout.buttonText} onChange={value => updateCheckout('buttonText', value)} />
        </div>

        {previewableProducts.length > 0 ? (
          <div className="checkout-preview-row">
            <div className="novo-field" style={{ marginBottom: 0 }}>
              <label>Producto para vista previa</label>
              <select
                value={previewProductId}
                onChange={event => setPreviewProductId(event.target.value)}
              >
                {previewableProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                    {product.price ? ` — $${product.price}/${product.interval === 'year' ? 'año' : 'mes'}` : ''}
                  </option>
                ))}
              </select>
              <small className="brand-field-helper">
                Abre el checkout white-label tal como lo verá tu cliente al pagar ese plan.
              </small>
            </div>
            <button
              type="button"
              className="novo-btn novo-btn-secondary"
              onClick={() => onPreviewCheckout?.(previewProductId)}
            >
              <Eye size={14} /> Vista previa del checkout
            </button>
          </div>
        ) : (
          <p className="brand-empty-copy">
            Publica al menos un producto con precio en tu catálogo de partner para previsualizar el checkout.
          </p>
        )}
      </FormSection>

      <FormSection icon={Settings} title="Servicios adicionales" description="Upsells opcionales que el cliente puede agregar durante el pago.">
        {additionalServices.length === 0 ? (
          <p className="brand-empty-copy">Aún no tienes servicios adicionales. Agrega configuración inicial, integraciones u otros cargos únicos.</p>
        ) : (
          additionalServices.map((service, index) => (
            <div key={service.id || index} className="brand-inline-card">
              <div className="brand-inline-card-head">
                <strong>Servicio {index + 1}</strong>
                <button type="button" className="brand-icon-btn" onClick={() => removeAdditionalService(index)} aria-label="Eliminar servicio">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="novo-grid-2">
                <Field label="Nombre" value={service.title} onChange={value => updateAdditionalService(index, 'title', value)} />
                <Field label="Precio (USD)" value={service.price} type="number" onChange={value => updateAdditionalService(index, 'price', Number(value))} />
                <Field label="Descripción" value={service.description} onChange={value => updateAdditionalService(index, 'description', value)} />
                <div className="novo-field">
                  <label>Tipo de cobro</label>
                  <select value={service.billingType || 'one_time'} onChange={event => updateAdditionalService(index, 'billingType', event.target.value)}>
                    <option value="one_time">Pago único</option>
                    <option value="month">Mensual</option>
                    <option value="year">Anual</option>
                  </select>
                </div>
              </div>
              <ToggleField
                label="Servicio activo"
                description="Si lo desactivas, no aparecerá en el checkout."
                checked={service.active !== false}
                onChange={value => updateAdditionalService(index, 'active', value)}
              />
            </div>
          ))
        )}
        <button type="button" className="novo-btn novo-btn-ghost" onClick={addAdditionalService}>
          <Plus size={14} /> Agregar servicio adicional
        </button>
      </FormSection>

      <FormSection icon={Settings} title="Términos y condiciones" description="Texto legal que el cliente debe aceptar antes de pagar.">
        <div className="novo-grid-2">
          <Field label="Título" value={terms.title} onChange={value => updateTerms('title', value)} />
          <ToggleField
            label="Aceptación obligatoria"
            description="El cliente no podrá pagar sin marcar la casilla."
            checked={terms.required !== false}
            onChange={value => updateTerms('required', value)}
          />
        </div>
        <TextArea label="Texto de términos" value={terms.text} onChange={value => updateTerms('text', value)} />
      </FormSection>

      {partnerProducts.length > 0 && (
        <FormSection icon={ShoppingCart} title="Presentación por producto" description="Personaliza badge, descripción y beneficios que verán tus clientes en el funnel y checkout.">
          {partnerProducts.map(product => {
            const override = productOverrides[product.id] || {};
            const featuresText = (override.features || []).join('\n');
            return (
              <div key={product.id} className="brand-inline-card">
                <div className="brand-inline-card-head">
                  <strong>{product.name}</strong>
                  <div className="brand-inline-card-actions">
                    <span>{product.price ? `$${product.price}/${product.interval === 'year' ? 'año' : 'mes'}` : 'Precio personalizado'}</span>
                    {product.price != null && (
                      <button
                        type="button"
                        className="novo-btn novo-btn-ghost"
                        onClick={() => onPreviewCheckout?.(product.id)}
                      >
                        <Eye size={13} /> Preview
                      </button>
                    )}
                  </div>
                </div>
                <div className="novo-grid-2">
                  <Field label="Badge / etiqueta" value={override.badge || ''} placeholder="El más elegido" onChange={value => updateProductOverride(product.id, 'badge', value)} />
                  <ToggleField
                    label="Mostrar precio"
                    description="Desactívalo para captar leads antes del pago."
                    checked={override.showPrice !== false}
                    onChange={value => updateProductOverride(product.id, 'showPrice', value)}
                  />
                  <Field label="Descripción personalizada" value={override.description || ''} onChange={value => updateProductOverride(product.id, 'description', value)} />
                  <Field label="URL de checkout (opcional)" value={override.checkoutUrl || ''} placeholder="#p/tu-slug/checkout/..." onChange={value => updateProductOverride(product.id, 'checkoutUrl', value)} />
                </div>
                <TextArea
                  label="Beneficios (uno por línea)"
                  value={featuresText}
                  onChange={value => updateProductOverride(
                    product.id,
                    'features',
                    value.split('\n').map(line => line.trim()).filter(Boolean),
                  )}
                />
              </div>
            );
          })}
        </FormSection>
      )}

      <ActionBar
        onSave={onSave}
        busy={busy}
        label="Guardar configuración del checkout"
        previewLabel="Vista previa del checkout"
        onPreview={previewableProducts.length > 0 ? () => onPreviewCheckout?.(previewProductId) : null}
      />
    </>
  );
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <div className="novo-card brand-form-section">
      <div className="brand-section-header">
        <div className="brand-section-icon"><Icon size={18} /></div>
        <div>
          <div className="novo-card-title">{title}</div>
          <div className="novo-card-sub">{description}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder = '', helper = '' }) {
  return (
    <div className="novo-field">
      <label>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} />
      {helper && <small className="brand-field-helper">{helper}</small>}
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="novo-field">
      <label>{label}</label>
      <textarea rows={4} value={value} onChange={event => onChange(event.target.value)} className="brand-textarea" />
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="brand-color-field">
      <label>{label}</label>
      <div>
        <input type="color" value={value} onChange={event => onChange(event.target.value)} />
        <input type="text" value={value} onChange={event => onChange(event.target.value)} />
      </div>
    </div>
  );
}

function ToggleField({ label, description, checked, onChange }) {
  return (
    <label className="brand-toggle-row">
      <div><strong>{label}</strong><span>{description}</span></div>
      <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />
    </label>
  );
}

function LogoPreview({ brand }) {
  return (
    <div className="brand-logo-preview" style={{ background: brand.backgroundColor, color: brand.textColor }}>
      {brand.logoUrl ? (
        <img src={brand.logoUrl} alt={brand.businessName || 'Logo'} />
      ) : (
        <div className="brand-logo-fallback" style={{ background: brand.primaryColor }}>
          {brand.businessName?.trim()?.charAt(0)?.toUpperCase() || 'P'}
        </div>
      )}
      <strong>{brand.businessName || 'Nombre de tu marca'}</strong>
      <span>{brand.tagline || 'Tu frase de marca'}</span>
    </div>
  );
}

function ActionBar({ onSave, busy, label, previewLabel = 'Vista previa', onPreview }) {
  return (
    <div className="brand-action-bar">
      <button type="button" className="novo-btn novo-btn-primary" onClick={onSave} disabled={busy}>
        {busy ? <RefreshCw size={14} style={{ animation: 'novoSpin .8s linear infinite' }} /> : <Save size={14} />}
        {label}
      </button>
      {onPreview && (
        <button type="button" className="novo-btn novo-btn-secondary" onClick={onPreview}>
          <Eye size={14} /> {previewLabel}
        </button>
      )}
    </div>
  );
}

function TabButton({ active, icon: Icon, title, description, onClick }) {
  return (
    <button type="button" className={`brand-page-tab ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="brand-page-tab-icon"><Icon size={18} /></span>
      <span><strong>{title}</strong><small>{description}</small></span>
      <ChevronRight size={15} />
    </button>
  );
}

const styles = `
  .brand-page-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .brand-page-tab { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 11px; padding: 14px; border: 1px solid var(--novo-border); border-radius: 12px; background: transparent; color: var(--novo-text); text-align: left; cursor: pointer; }
  .brand-page-tab.active { border-color: var(--novo-purple); background: rgba(124, 58, 237, 0.08); }
  .brand-page-tab-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; background: var(--novo-card-hover); color: var(--novo-purple); }
  .brand-page-tab span:nth-child(2) { display: grid; gap: 3px; }
  .brand-page-tab small { color: var(--novo-muted); font-size: 11px; }
  .brand-form-section { margin-bottom: 18px; }
  .brand-section-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--novo-border); }
  .brand-section-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 10px; color: var(--novo-purple); background: rgba(124, 58, 237, 0.1); }
  .brand-field-helper { display: block; margin-top: 5px; color: var(--novo-muted); font-size: 10px; }
  .brand-textarea { width: 100%; resize: vertical; background: var(--novo-card-hover); border: 1px solid var(--novo-border); border-radius: 8px; padding: 10px 12px; color: var(--novo-text); font-size: 13px; outline: none; }
  .brand-preview-row { display: grid; grid-template-columns: 280px 1fr; gap: 22px; }
  .brand-logo-preview { min-height: 190px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px; border: 1px solid var(--novo-border); border-radius: 14px; padding: 20px; text-align: center; }
  .brand-logo-preview img { max-width: 180px; max-height: 70px; object-fit: contain; }
  .brand-logo-preview span { opacity: 0.65; font-size: 12px; }
  .brand-logo-fallback { width: 54px; height: 54px; display: grid; place-items: center; border-radius: 13px; color: white; font-size: 21px; font-weight: 800; }
  .brand-color-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 13px; }
  .brand-color-field label { display: block; margin-bottom: 6px; color: var(--novo-muted); font-size: 11px; font-weight: 600; }
  .brand-color-field > div { display: flex; gap: 7px; }
  .brand-color-field input[type="color"] { width: 42px; height: 39px; border: 1px solid var(--novo-border); border-radius: 8px; background: transparent; cursor: pointer; }
  .brand-color-field input[type="text"] { min-width: 0; flex: 1; background: var(--novo-card-hover); border: 1px solid var(--novo-border); border-radius: 8px; padding: 9px 10px; color: var(--novo-text); }
  .brand-toggle-row { display: flex; justify-content: space-between; gap: 20px; padding: 15px 0; border-bottom: 1px solid var(--novo-border); cursor: pointer; }
  .brand-toggle-row > div { display: grid; gap: 4px; }
  .brand-toggle-row span { color: var(--novo-muted); font-size: 12px; }
  .checkout-info-box { display: flex; gap: 12px; margin-top: 18px; padding: 15px; border-radius: 11px; background: rgba(124, 58, 237, 0.07); color: var(--novo-text); }
  .checkout-info-box svg { flex-shrink: 0; color: var(--novo-purple); }
  .checkout-info-box p { margin: 5px 0 0; color: var(--novo-muted); font-size: 12px; line-height: 1.5; }
  .brand-empty-copy { margin: 0 0 14px; color: var(--novo-muted); font-size: 12px; line-height: 1.55; }
  .brand-inline-card { margin-bottom: 16px; padding: 16px; border: 1px solid var(--novo-border); border-radius: 12px; background: var(--novo-card-hover); }
  .brand-inline-card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  .brand-inline-card-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .brand-inline-card-head span { color: var(--novo-muted); font-size: 11px; }
  .checkout-preview-row { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: end; margin-top: 8px; padding-top: 18px; border-top: 1px solid var(--novo-border); }
  .brand-icon-btn { display: inline-grid; place-items: center; width: 32px; height: 32px; border: 1px solid var(--novo-border); border-radius: 8px; background: transparent; color: var(--novo-muted); cursor: pointer; }
  .brand-action-bar { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }
  @media (max-width: 900px) { .brand-page-tabs, .brand-preview-row, .checkout-preview-row { grid-template-columns: 1fr; } }
  @media (max-width: 600px) { .brand-color-grid, .brand-action-bar { grid-template-columns: 1fr; flex-direction: column; } .brand-action-bar button { width: 100%; justify-content: center; } }
`;
