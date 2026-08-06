import { useEffect, useMemo, useState } from 'react';
import PublicCheckoutPage from '../components/PublicCheckoutPage.jsx';
import { platformApi } from '../lib/platformApi.js';

function readCheckoutLinkToken() {
  const hash = location.hash.slice(1);
  if (!hash.includes('?')) return null;
  const query = hash.split('?').slice(1).join('?');
  return new URLSearchParams(query).get('link');
}

export default function PartnerCheckoutPage({ slug, productId, go }) {
  const linkToken = useMemo(() => readCheckoutLinkToken(), [slug, productId]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [salesLink, setSalesLink] = useState(null);
  const [published, setPublished] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await platformApi.getPartnerCheckout(slug, productId, linkToken);
        setCheckoutData(data?.checkout || null);
        setSalesLink(data?.salesLink || null);
        setPublished(data?.published !== false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug && productId) load();
  }, [slug, productId, linkToken]);

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
        salesLinkId: salesLink?.id || null,
        linkToken,
      });
      if (!result?.clientSecret) {
        if (result?.url) {
          throw new Error(
            'El backend aún devuelve checkout por redirección. Despliega la función partner-storefront actualizada en Supabase.',
          );
        }
        throw new Error('Stripe no devolvió el formulario de pago.');
      }
      return result;
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
        initialEmail={salesLink?.clientEmail || ''}
        initialSelectedServices={salesLink?.preselectedServiceIds || []}
      />
    </>
  );
}
