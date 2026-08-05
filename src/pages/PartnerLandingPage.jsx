import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, MessageCircle, Phone } from 'lucide-react';
import { platformApi } from '../lib/platformApi.js';
import '../styles/partner-landing.css';

function money(value, currency = 'USD') {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function whatsappLink(number, text) {
  const digits = String(number || '').replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default function PartnerLandingPage({ slug, go }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storefront, setStorefront] = useState(null);
  const [products, setProducts] = useState([]);
  const [published, setPublished] = useState(true);
  const [leadForm, setLeadForm] = useState({ companyName: '', contactName: '', email: '', phone: '', message: '', productName: '' });
  const [leadBusy, setLeadBusy] = useState(false);
  const [leadNotice, setLeadNotice] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await platformApi.getPartnerStorefront(slug);
        setStorefront(data?.storefront || null);
        setProducts(data?.products || []);
        setPublished(data?.published !== false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
    return <div className="partner-landing-shell"><div className="partner-landing-empty">Cargando página del partner…</div></div>;
  }

  if (error || !storefront) {
    return (
      <div className="partner-landing-shell">
        <div className="partner-landing-empty">
          <h1>Página no disponible</h1>
          <p>{error || 'No encontramos esta landing.'}</p>
          {error?.includes('activar') && (
            <p style={{ maxWidth: 420, lineHeight: 1.6, opacity: 0.8 }}>
              Si eres partner, pide al Super Admin que cambie tu estado a <strong>Activo</strong> en el panel de Partners.
            </p>
          )}
          <button type="button" className="partner-landing-btn" onClick={() => go('home')}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  const { brand, funnel } = storefront;
  const cssVars = {
    '--pl-primary': brand.primaryColor,
    '--pl-secondary': brand.secondaryColor,
    '--pl-accent': brand.accentColor,
    '--pl-bg': brand.backgroundColor,
    '--pl-text': brand.textColor,
  };

  async function submitLead(event) {
    event.preventDefault();
    if (!leadForm.companyName.trim() || !leadForm.email.trim()) {
      setLeadNotice({ type: 'error', text: 'Completa empresa y correo.' });
      return;
    }
    try {
      setLeadBusy(true);
      await platformApi.submitPartnerLead(slug, leadForm);
      setLeadNotice({ type: 'success', text: 'Gracias. Tu solicitud fue enviada y el partner te contactará pronto.' });
      setLeadForm({ companyName: '', contactName: '', email: '', phone: '', message: '', productName: '' });
    } catch (err) {
      setLeadNotice({ type: 'error', text: err.message });
    } finally {
      setLeadBusy(false);
    }
  }

  function openLead(product) {
    setLeadForm(current => ({
      ...current,
      productName: product?.name || '',
      message: product ? `Me interesa ${product.name}` : current.message,
    }));
    document.getElementById('partner-lead-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  const wa = whatsappLink(
    brand.whatsappNumber,
    `Hola, me interesa conocer sus soluciones digitales.`,
  );

  return (
    <div className="partner-landing-shell" style={cssVars}>
      {!published && (
        <div className="partner-landing-draft-bar">
          Vista previa — tu landing será pública cuando el Super Admin active tu cuenta.
        </div>
      )}
      <header className="partner-landing-header">
        <div className="partner-landing-brand">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.businessName} className="partner-landing-logo" />
          ) : (
            <div className="partner-landing-logo-fallback">{brand.businessName?.charAt(0) || 'P'}</div>
          )}
          <div>
            <strong>{brand.businessName}</strong>
            {brand.tagline && <span>{brand.tagline}</span>}
          </div>
        </div>
        <div className="partner-landing-header-actions">
          {brand.supportEmail && (
            <a href={`mailto:${brand.supportEmail}`} className="partner-landing-link"><Mail size={15} /> Contacto</a>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer" className="partner-landing-btn secondary"><MessageCircle size={15} /> WhatsApp</a>
          )}
        </div>
      </header>

      <section className="partner-landing-hero">
        <div className="partner-landing-hero-copy">
          <p className="partner-landing-kicker">Soluciones NOVO</p>
          <h1>{funnel.title}</h1>
          <p>{funnel.subtitle}</p>
          {brand.description && <p className="partner-landing-description">{brand.description}</p>}
          <div className="partner-landing-hero-actions">
            <button type="button" className="partner-landing-btn" onClick={() => document.getElementById('partner-products')?.scrollIntoView({ behavior: 'smooth' })}>
              {funnel.buttonText || 'Conocer soluciones'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
        {(funnel.heroImageUrl || brand.coverImageUrl) && (
          <div className="partner-landing-hero-media">
            <img src={funnel.heroImageUrl || brand.coverImageUrl} alt="" />
          </div>
        )}
      </section>

      <section id="partner-products" className="partner-landing-section">
        <div className="partner-landing-section-head">
          <h2>Productos disponibles</h2>
          <p>Soluciones listas para activar con acompañamiento del partner.</p>
        </div>
        {products.length === 0 ? (
          <div className="partner-landing-card empty">Este partner aún no tiene productos publicados con precio.</div>
        ) : (
          <div className="partner-landing-product-grid">
            {products.map(product => {
              const showPrice = funnel.showProductPrices && product.retailPrice != null;
              return (
                <article className="partner-landing-card product" key={product.id}>
                  <h3>{product.name}</h3>
                  {product.description && <p>{product.description}</p>}
                  <div className="partner-landing-product-meta">
                    <span>{product.interval === 'year' ? 'Plan anual' : 'Plan mensual'}</span>
                    {showPrice && <strong>{money(product.retailPrice, product.currency)}</strong>}
                  </div>
                  {showPrice ? (
                    <button type="button" className="partner-landing-btn full" onClick={() => openLead(product)}>
                      Solicitar activación
                    </button>
                  ) : funnel.showContactFormWithoutPrice ? (
                    <button type="button" className="partner-landing-btn full secondary" onClick={() => openLead(product)}>
                      Solicitar información
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="partner-lead-form" className="partner-landing-section">
        <div className="partner-landing-card lead">
          <h2>Hablemos de tu negocio</h2>
          <p>Déjanos tus datos y {brand.businessName} te contactará para activar el servicio.</p>
          {leadNotice && (
            <div className={`partner-landing-notice ${leadNotice.type}`}>{leadNotice.text}</div>
          )}
          <form onSubmit={submitLead} className="partner-landing-form">
            <input placeholder="Empresa *" value={leadForm.companyName} onChange={e => setLeadForm({ ...leadForm, companyName: e.target.value })} />
            <input placeholder="Nombre de contacto" value={leadForm.contactName} onChange={e => setLeadForm({ ...leadForm, contactName: e.target.value })} />
            <input type="email" placeholder="Correo *" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} />
            <input placeholder="Teléfono" value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} />
            <textarea rows={4} placeholder="Mensaje" value={leadForm.message} onChange={e => setLeadForm({ ...leadForm, message: e.target.value })} />
            <button type="submit" className="partner-landing-btn full" disabled={leadBusy}>
              {leadBusy ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </form>
        </div>
      </section>

      <footer className="partner-landing-footer">
        <div>
          <strong>{brand.businessName}</strong>
          {[brand.city, brand.country].filter(Boolean).join(', ') && (
            <p>{[brand.address, brand.city, brand.state, brand.country].filter(Boolean).join(', ')}</p>
          )}
        </div>
        <div className="partner-landing-footer-contact">
          {brand.supportEmail && <span><Mail size={14} /> {brand.supportEmail}</span>}
          {brand.publicContactPhone && <span><Phone size={14} /> {brand.publicContactPhone}</span>}
          {leadNotice?.type === 'success' && <span><CheckCircle2 size={14} /> Solicitud enviada</span>}
        </div>
      </footer>
    </div>
  );
}
