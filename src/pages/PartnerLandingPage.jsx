import { useEffect, useState } from 'react';
import PublicFunnelPage from '../../PublicFunnelPage.jsx';
import { platformApi } from '../lib/platformApi.js';

export default function PartnerLandingPage({ slug, go }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storefront, setStorefront] = useState(null);
  const [products, setProducts] = useState([]);
  const [published, setPublished] = useState(true);

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
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f7f8fc', color: '#64748b' }}>
        Cargando página del partner…
      </div>
    );
  }

  if (error || !storefront) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f7f8fc', color: '#0f172a' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8 }}>Página no disponible</h1>
          <p style={{ color: '#64748b', lineHeight: 1.6 }}>{error || 'No encontramos esta landing.'}</p>
          {error?.includes('activar') && (
            <p style={{ color: '#64748b', lineHeight: 1.6 }}>
              Si eres partner, pide al Super Admin que cambie tu estado a <strong>Activo</strong> en el panel de Partners.
            </p>
          )}
          <button
            type="button"
            onClick={() => go('home')}
            style={{ marginTop: 16, padding: '10px 16px', borderRadius: 10, border: 0, background: '#6d3af2', color: 'white', cursor: 'pointer' }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmitLead(payload) {
    await platformApi.submitPartnerLead(slug, {
      companyName: payload.company || payload.name,
      contactName: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message,
      productName: payload.product_name,
    });
  }

  return (
    <>
      {!published && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '10px 16px',
          background: '#fef3c7',
          color: '#92400e',
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 600,
        }}
        >
          Vista previa — tu landing será pública cuando el Super Admin active tu cuenta.
        </div>
      )}
      <PublicFunnelPage
        brandData={storefront.brand}
        funnelSettings={storefront.funnelSettings}
        products={products}
        partnerId={storefront.partnerId}
        funnelSlug={storefront.funnelSlug || slug}
        onSubmitLead={handleSubmitLead}
      />
    </>
  );
}
