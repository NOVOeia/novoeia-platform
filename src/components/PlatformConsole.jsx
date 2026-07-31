import { useEffect, useMemo, useState } from 'react';
import {
  Settings, ShieldCheck, PlugZap, CreditCard, KeyRound, Webhook,
  RefreshCw, Save, ExternalLink, Package, Link2, Copy, Users,
  Building2, Palette, CheckCircle2, AlertCircle, Plus, LifeBuoy
} from 'lucide-react';
import { platformApi } from '../lib/platformApi.js';
import '../styles/platform-console.css';

const providers = [
  { id: 'ghl', label: 'HighLevel OAuth', icon: PlugZap },
  { id: 'stripe', label: 'Stripe', icon: CreditCard },
  { id: 'supabase', label: 'Supabase', icon: ShieldCheck },
  { id: 'mcp', label: 'MCP / SSO', icon: KeyRound },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
];

const defaults = {
  ghlClientId: '', ghlClientSecret: '', ghlRedirectUri: '', ghlScopes: '',
  stripeSecretKey: '', stripeWebhookSecret: '', stripePriceMode: 'platform',
  supabaseServiceRoleKey: '',
  oidcIssuer: '', oidcClientId: '', oidcClientSecret: '', mcpEndpoint: '',
  webhookBaseUrl: '', metaPixelId: '',
};

export function SuperAdminConsole({ section = 'dashboard' }) {
  const tab = {
    dashboard: 'integrations',
    partners: 'partners',
    settings: 'security',
    clients: 'clients',
    catalog: 'catalog',
    payments: 'payments',
  }[section] || 'integrations';

  const [settings, setSettings] = useState(defaults);
  const [partners, setPartners] = useState([]);
  const [partnersError, setPartnersError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (tab === 'partners') loadPartners();
  }, [tab]);

  async function loadPartners() {
    try {
      setBusy(true);
      setPartnersError('');
      const data = await platformApi.listPartners();
      setPartners(data?.partners || []);
    } catch (error) {
      setPartners([]);
      setPartnersError(error.message);
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  function partnerContact(partner) {
    return partner?.branding?.contactEmail || partner?.branding?.contact_email || '—';
  }

  async function saveSettings() {
    try {
      setBusy(true);
      await platformApi.saveIntegrationSettings(settings);
      setNotice({ type: 'success', text: 'Configuración guardada de forma segura.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function connectGhl() {
    try {
      setBusy(true);
      const data = await platformApi.startGhlOAuth('connect', 'Company');
      if (!data?.authorizationUrl) throw new Error('No se recibió URL de autorización.');
      window.location.href = data.authorizationUrl;
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
      setBusy(false);
    }
  }

  async function syncLocations() {
    try {
      setBusy(true);
      const data = await platformApi.syncGhlLocations();
      setNotice({ type: 'success', text: `${data?.count || 0} subcuentas sincronizadas.` });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="platform-console">
      <header className="pc-header">
        <div>
          <span className="pc-kicker">NOVO CONTROL CENTER</span>
          <h1>Super Admin</h1>
          <p>Configuración central, conexiones, partners, productos y seguridad.</p>
        </div>
        <div className="pc-actions">
          <button className="pc-secondary" onClick={syncLocations} disabled={busy}>
            <RefreshCw size={16} /> Sincronizar GHL
          </button>
          <button className="pc-primary" onClick={saveSettings} disabled={busy}>
            <Save size={16} /> Guardar configuración
          </button>
        </div>
      </header>

      {notice && <Notice {...notice} />}

      {tab === 'integrations' && (
        <div className="pc-grid">
          <section className="pc-card pc-span-2">
            <div className="pc-card-title">
              <div><span>CONEXIÓN PRINCIPAL</span><h3>HighLevel</h3></div>
              <button className="pc-primary" onClick={connectGhl}><PlugZap size={15} /> Conectar con OAuth</button>
            </div>
            <div className="pc-form-grid">
              <Field label="Client ID" value={settings.ghlClientId} onChange={v => setSettings({ ...settings, ghlClientId: v })} />
              <Field label="Client Secret" secret value={settings.ghlClientSecret} onChange={v => setSettings({ ...settings, ghlClientSecret: v })} />
              <Field label="Redirect URI" value={settings.ghlRedirectUri} onChange={v => setSettings({ ...settings, ghlRedirectUri: v })} />
              <Field label="Scopes" value={settings.ghlScopes} onChange={v => setSettings({ ...settings, ghlScopes: v })} />
            </div>
            <p className="pc-help">Los secretos se envían a una Edge Function y se almacenan cifrados. Nunca se guardan en el navegador.</p>
          </section>

          {providers.slice(1).map(({ id, label, icon: Icon }) => (
            <section className="pc-card" key={id}>
              <div className="pc-provider"><Icon size={19} /><strong>{label}</strong><span className="pc-status">Pendiente</span></div>
              {id === 'stripe' && <>
                <Field label="Secret key" secret value={settings.stripeSecretKey} onChange={v => setSettings({ ...settings, stripeSecretKey: v })} />
                <Field label="Webhook secret" secret value={settings.stripeWebhookSecret} onChange={v => setSettings({ ...settings, stripeWebhookSecret: v })} />
              </>}
              {id === 'supabase' && <Field label="Service role key" secret value={settings.supabaseServiceRoleKey} onChange={v => setSettings({ ...settings, supabaseServiceRoleKey: v })} />}
              {id === 'mcp' && <>
                <Field label="OIDC issuer" value={settings.oidcIssuer} onChange={v => setSettings({ ...settings, oidcIssuer: v })} />
                <Field label="MCP endpoint" value={settings.mcpEndpoint} onChange={v => setSettings({ ...settings, mcpEndpoint: v })} />
              </>}
              {id === 'webhooks' && <Field label="Webhook base URL" value={settings.webhookBaseUrl} onChange={v => setSettings({ ...settings, webhookBaseUrl: v })} />}
            </section>
          ))}
        </div>
      )}

      {tab === 'partners' && (
        <section className="pc-card">
          <div className="pc-card-title">
            <div><span>GESTIÓN CENTRAL</span><h3>Partners ({partners.length})</h3></div>
            <div className="pc-actions">
              <button className="pc-secondary" onClick={loadPartners} disabled={busy}>
                <RefreshCw size={15} /> Actualizar
              </button>
              <button className="pc-primary" type="button"><Plus size={15} /> Nuevo partner</button>
            </div>
          </div>
          {partnersError && !busy && (
            <div className="pc-empty" style={{ color: '#ff8a8a', marginBottom: 12 }}>
              {partnersError}
            </div>
          )}
          <div className="pc-table">
            <div className="pc-row pc-head"><span>Partner</span><span>Contacto</span><span>Plan</span><span>GHL</span><span>Estado</span></div>
            {busy && <div className="pc-empty">Cargando partners...</div>}
            {!busy && !partnersError && partners.length === 0 && (
              <div className="pc-empty">No hay partners registrados todavía. Los nuevos registros aparecerán aquí.</div>
            )}
            {!busy && partners.map(partner => <div className="pc-row" key={partner.id}>
              <span><Building2 size={15} /> {partner.name}</span>
              <span>{partnerContact(partner)}</span>
              <span>{partner.plan_name || 'Sin plan'}</span>
              <span>{partner.ghl_location_id || 'Sin asignar'}</span>
              <span>{partner.status || 'pending'}</span>
            </div>)}
          </div>
        </section>
      )}

      {tab === 'security' && <SecurityPanel />}

      {tab === 'clients' && (
        <section className="pc-card">
          <div className="pc-card-title"><div><span>CLIENTES</span><h3>Clientes de la plataforma</h3></div><Building2 size={20} /></div>
          <div className="pc-empty">Vista de clientes globales en construcción.</div>
        </section>
      )}

      {tab === 'catalog' && (
        <section className="pc-card">
          <div className="pc-card-title"><div><span>PRODUCTOS</span><h3>Catálogo central</h3></div><Package size={20} /></div>
          <div className="pc-empty">Gestión de productos desde el catálogo central en construcción.</div>
        </section>
      )}

      {tab === 'payments' && (
        <section className="pc-card">
          <div className="pc-card-title"><div><span>PAGOS</span><h3>Stripe y checkout</h3></div><CreditCard size={20} /></div>
          <div className="pc-form-grid">
            <Field label="Secret key" secret value={settings.stripeSecretKey} onChange={v => setSettings({ ...settings, stripeSecretKey: v })} />
            <Field label="Webhook secret" secret value={settings.stripeWebhookSecret} onChange={v => setSettings({ ...settings, stripeWebhookSecret: v })} />
          </div>
        </section>
      )}
    </div>
  );
}

export function PartnerConsole({ section = 'dashboard' }) {
  const [catalog, setCatalog] = useState([]);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [price, setPrice] = useState('');
  const [checkout, setCheckout] = useState('');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });

  async function loadClients() {
    const data = await platformApi.listPartnerClients();
    setClients(data?.clients || []);
  }

  useEffect(() => {
    Promise.all([platformApi.listCatalog(), platformApi.listPartnerClients()])
      .then(([a, b]) => {
        setCatalog(a?.products || []);
        setClients(b?.clients || []);
      })
      .catch(error => setNotice({ type: 'error', text: error.message }));
  }, []);

  async function createClient() {
    try {
      if (!newClient.name.trim()) throw new Error('El nombre del cliente es obligatorio.');
      setBusy(true);
      await platformApi.createPartnerClient(newClient);
      setNewClient({ name: '', email: '', phone: '' });
      await loadClients();
      setNotice({ type: 'success', text: 'Cliente creado. Se sincronizará en GHL cuando el Super Admin lo procese.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  const margin = useMemo(() => {
    if (!selected || !price) return 0;
    return Number(price) - Number(selected.wholesale_price || 0);
  }, [selected, price]);

  async function generateLink() {
    try {
      if (!selected || !price) throw new Error('Selecciona un producto y define el precio de venta.');
      setBusy(true);
      await platformApi.savePartnerOffer({ productId: selected.id, retailPrice: Number(price) });
      const data = await platformApi.generateCheckoutLink({ productId: selected.id, retailPrice: Number(price) });
      setCheckout(data.checkoutUrl);
      setNotice({ type: 'success', text: 'Link de venta generado correctamente.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="platform-console">
      <header className="pc-header">
        <div><span className="pc-kicker">PARTNER WORKSPACE</span><h1>Panel Partner</h1><p>Clientes, productos, precios, links de venta y marca.</p></div>
      </header>
      {notice && <Notice {...notice} />}

      {(section === 'dashboard' || section === 'offers' || section === 'links') && (
      <div className="pc-grid">
        <section className="pc-card pc-span-2">
          <div className="pc-card-title"><div><span>CATÁLOGO NOVO</span><h3>Crear oferta y link de venta</h3></div><Package size={20} /></div>
          <div className="pc-product-grid">
            {catalog.length === 0 && <div className="pc-empty">El catálogo aparecerá cuando el Super Admin publique productos.</div>}
            {catalog.map(product => <button key={product.id} className={`pc-product ${selected?.id === product.id ? 'active' : ''}`} onClick={() => { setSelected(product); setPrice(String(product.suggested_price || '')); }}>
              <strong>{product.name}</strong>
              <span>Costo: ${product.wholesale_price || 0}</span>
            </button>)}
          </div>

          <div className="pc-offer-builder">
            <div><label>Producto seleccionado</label><strong>{selected?.name || 'Selecciona uno'}</strong></div>
            <Field label="Precio de venta" type="number" value={price} onChange={setPrice} />
            <div><label>Ganancia estimada</label><strong className="pc-profit">${margin.toFixed(2)}</strong></div>
            <button className="pc-primary" onClick={generateLink} disabled={busy}><Link2 size={16} /> Generar link</button>
          </div>

          {checkout && <div className="pc-link-box"><span>{checkout}</span><button onClick={() => navigator.clipboard.writeText(checkout)}><Copy size={15} /> Copiar</button><a href={checkout} target="_blank" rel="noreferrer"><ExternalLink size={15} /></a></div>}
        </section>
      </div>
      )}

      {section === 'clients' && (
        <div className="pc-grid">
          <section className="pc-card">
            <div className="pc-card-title"><div><span>NUEVO CLIENTE</span><h3>Agregar a tu cartera</h3></div><Users size={20} /></div>
            <Field label="Nombre" value={newClient.name} onChange={(v) => setNewClient({ ...newClient, name: v })} />
            <Field label="Correo" value={newClient.email} onChange={(v) => setNewClient({ ...newClient, email: v })} />
            <Field label="Teléfono" value={newClient.phone} onChange={(v) => setNewClient({ ...newClient, phone: v })} />
            <button className="pc-primary" onClick={createClient} disabled={busy}><Plus size={15} /> Crear cliente</button>
            <p className="pc-help">El cliente queda en estado pending hasta crearse en GHL bajo tu subcuenta.</p>
          </section>
          <section className="pc-card">
            <div className="pc-card-title"><div><span>CLIENTES</span><h3>Mis clientes</h3></div><Users size={20} /></div>
            {clients.length === 0 ? <div className="pc-empty">No hay clientes todavía.</div> : clients.map(c => (
              <div className="pc-mini-row" key={c.id}>
                <span>{c.name}</span>
                <small>{c.status}{c.ghl_sync_status ? ` · GHL: ${c.ghl_sync_status}` : ''}</small>
              </div>
            ))}
          </section>
        </div>
      )}

      {section === 'brand' && (
        <section className="pc-card">
          <div className="pc-card-title"><div><span>MARCA Y TRACKING</span><h3>Configuración permitida</h3></div><Palette size={20} /></div>
          <Field label="Nombre comercial" value="" onChange={() => {}} />
          <Field label="Dominio" value="" onChange={() => {}} />
          <Field label="Meta Pixel ID" value="" onChange={() => {}} />
          <Field label="Facebook URL" value="" onChange={() => {}} />
          <button className="pc-primary"><Save size={15} /> Guardar marca</button>
          <p className="pc-help">Las conexiones GHL, pagos y permisos solo las administra el Super Admin.</p>
        </section>
      )}

      {section === 'support' && (
        <section className="pc-card">
          <div className="pc-card-title"><div><span>SOPORTE</span><h3>Centro de ayuda</h3></div><LifeBuoy size={20} /></div>
          <div className="pc-empty">Canal de soporte partner en construcción.</div>
        </section>
      )}
    </div>
  );
}

function SecurityPanel() {
  const items = [
    'Supabase Auth con roles super_admin, partner y client',
    'RLS obligatoria en todas las tablas',
    'Secretos únicamente en Edge Functions',
    'OAuth con refresh token automático',
    'Webhooks con firma X-GHL-Signature Ed25519',
    'Registro de auditoría e idempotencia',
  ];
  return <section className="pc-card"><div className="pc-card-title"><div><span>PRODUCCIÓN</span><h3>Checklist de seguridad</h3></div><ShieldCheck size={20} /></div>{items.map(item => <div className="pc-security-item" key={item}><CheckCircle2 size={16} /><span>{item}</span></div>)}</section>;
}

function Field({ label, value, onChange, secret = false, type = 'text' }) {
  return <label className="pc-field"><span>{label}</span><input type={secret ? 'password' : type} value={value} onChange={e => onChange(e.target.value)} autoComplete="off" /></label>;
}

function Notice({ type, text }) {
  return <div className={`pc-notice ${type}`}>{type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}<span>{text}</span></div>;
}
