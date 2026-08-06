import { useEffect, useState } from 'react';
import PublicCheckoutPage from '../components/PublicCheckoutPage.jsx';
import { platformApi } from '../lib/platformApi.js';

export default function PartnerCheckoutPage({ slug, productId, go }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [published, setPublished] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await platformApi.getPartnerCheckout(slug, productId);
        setCheckoutData(data?.checkout || null);
        setPublished(data?.published !== false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug && productId) load();
  }, [slug, productId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f7fb', color: '#64748b' }}>
        Cargando checkout…
      </div>
    );
  }

  if (error || !checkoutData) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f5f7fb', color: '#0f172a' }}>
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8 }}>Checkout no disponible</h1>
          <p style={{ color: '#64748b', lineHeight: 1.6 }}>{error || 'No encontramos este producto.'}</p>
          <button
            type="button"
            onClick={() => go('p', slug)}
            style={{ marginTop: 16, padding: '10px 16px', borderRadius: 10, border: 0, background: '#6d3af2', color: 'white', cursor: 'pointer' }}
          >
            Volver a la landing
          </button>
        </div>
      </div>
    );
  }

  async function startCheckout({ email, selectedServiceIds }) {
    setBusy(true);
    try {
      const result = await platformApi.createPartnerCheckoutSession({
        slug,
        productId,
        email,
        selectedServiceIds,
      });
      if (!result?.url) {
        throw new Error('Stripe no devolvió una URL de pago.');
      }
      window.location.href = result.url;
    } finally {
      setBusy(false);
    }
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
          Vista previa — el checkout será público cuando el Super Admin active tu cuenta.
        </div>
      )}
      <PublicCheckoutPage
        checkoutData={checkoutData}
        onCheckout={startCheckout}
        busy={busy}
      />
    </>
  );
}
