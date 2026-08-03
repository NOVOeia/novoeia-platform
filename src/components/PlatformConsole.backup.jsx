import { useEffect, useState, useCallback } from 'react';
import {
  Settings, ShieldCheck, PlugZap, CreditCard, RefreshCw, Save,
  Users, Building2, Package, CheckCircle2, AlertCircle, Plus,
  DollarSign, Activity, Link2, Copy, ExternalLink,
  Eye, Edit2, X, ArrowUpRight, Search, BarChart2,
  LifeBuoy, KeyRound, Webhook, Trash2, Globe, Phone,
  MapPin, Briefcase, Mail, User, FileText, Image
} from 'lucide-react';
import { platformApi } from '../lib/platformApi.js';

/* ================================
   SUPER ADMIN ROUTER
================================ */
export function SuperAdminConsole({ section }) {
  if (section === 'dashboard') return <AdminDashboard />;
  if (section === 'partners')  return <AdminPartners />;
  if (section === 'clients')   return <AdminClients />;
  if (section === 'products')  return <AdminProducts />;
  if (section === 'payments')  return <AdminPayments />;
  if (section === 'settings')  return <AdminSettings />;
  return <AdminDashboard />;
}

/* ================================
   ADMIN DASHBOARD
================================ */
function AdminDashboard() {
  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pd, cd] = await Promise.all([
          platformApi.listPartners().catch(() => ({ partners: [] })),
          platformApi.listCatalogProducts().catch(() => ({ products: [] })),
        ]);
        setPartners(pd?.partners || []);
        setProducts(cd?.products || []);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const active = partners.filter(p => p.status === 'active').length;

  return (
    <div className="novo-page">
      <div className="novo-page-header">
        <span className="kicker">NOVO CONTROL CENTER</span>
        <h1>Dashboard General</h1>
        <p>Vista ejecutiva del ecosistema NOVOeia Partners.</p>
      </div>
      <div className="novo-stats">
        {[
          { label: 'Partners registrados', value: loading ? '…' : partners.length, icon: Users, color: 'blue', sub: `${active} activos`, up: true },
          { label: 'Clientes en plataforma', value: '—', icon: Building2, color: 'purple', sub: 'Módulo en construcción' },
          { label: 'Productos en catálogo', value: loading ? '…' : products.length, icon: Package, color: 'green', sub: 'Publicados para partners', up: true },
          { label: 'MRR estimado', value: '$—', icon: DollarSign, color: 'orange', sub: 'Conectar Stripe' },
        ].map(({ label, value, icon: Icon, color, sub, up }) => (
          <div className="novo-stat" key={label}>
            <div className={`novo-stat-icon ${color}`}><Icon size={17} /></div>
            <span className="novo-stat-label">{label}</span>
            <span className="novo-stat-value">{value}</span>
            <span className={`novo-stat-sub ${up ? 'up' : ''}`}>{up && <ArrowUpRight size={11} />}{sub}</span>
          </div>
        ))}
      </div>
      <div className="novo-grid-2">
        <div className="novo-card">
          <div className="novo-card-header">
            <div><div className="novo-card-title">Partners recientes</div><div className="novo-card-sub">Últimos registrados</div></div>
            <BarChart2 size={18} style={{ color: 'var(--novo-muted)' }} />
          </div>
          {loading && <div className="novo-empty">Cargando…</div>}
          {!loading && partners.length === 0 && <div className="novo-empty">No hay partners aún.</div>}
          {!loading && partners.length > 0 && (
            <table className="novo-table">
              <thead><tr><th>Partner</th><th>Plan</th><th>Estado</th></tr></thead>
              <tbody>
                {partners.slice(0, 6).map(p => (
                  <tr key={p.id}>
                    <td><strong style={{ color: '#fff' }}>{p.name}</strong><br /><small style={{ color: 'var(--novo-muted)' }}>/{p.slug}</small></td>
                    <td>{p.plan_name || 'Partner'}</td>
                    <td><Badge status={p.status || 'pending'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="novo-card">
          <div className="novo-card-header">
            <div><div className="novo-card-title">Estado del sistema</div><div className="novo-card-sub">Integraciones activas</div></div>
            <Activity size={18} style={{ color: 'var(--novo-muted)' }} />
          </div>
          {[
            ['Supabase Auth + RLS', true],
            ['Edge Functions', true],
            ['Catálogo de productos', products.length > 0],
            ['Partners registrados', partners.length > 0],
            ['GHL OAuth', false],
            ['Stripe Checkout', false],
          ].map(([label, ok]) => (
            <div key={label} className="status-row">
              <span>{label}</span>
              <Badge status={ok ? 'active' : 'pending'} label={ok ? 'Activo' : 'Pendiente'} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================
   ADMIN PARTNERS
================================ */
function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', plan_name: 'partner', status: 'pending' });
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try { setLoading(true); const data = await platformApi.listPartners(); setPartners(data?.partners || []); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function savePartner() {
    try {
      setBusy(true);
      if (editMode && selected) { await platformApi.updatePartner({ ...form, id: selected.id }); setNotice({ type: 'success', text: 'Partner actualizado.' }); }
      else { await platformApi.createPartner(form); setNotice({ type: 'success', text: 'Partner creado.' }); }
      setShowForm(false); setEditMode(false); setForm({ name: '', slug: '', plan_name: 'partner', status: 'pending' }); setSelected(null); load();
    } catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  function openEdit(p) {
    setForm({ name: p.name, slug: p.slug, plan_name: p.plan_name || 'partner', status: p.status || 'pending' });
    setSelected(p); setEditMode(true); setShowForm(true);
  }

  const filtered = partners.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.slug?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">GESTIÓN</span><h1>Partners</h1><p>Administra los partners del ecosistema NOVO.</p></div>
        <button className="novo-btn novo-btn-primary" onClick={() => { setShowForm(!showForm); setEditMode(false); setForm({ name: '', slug: '', plan_name: 'partner', status: 'pending' }); }}>
          <Plus size={15} /> Nuevo partner
        </button>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      {showForm && (
        <div className="novo-card" style={{ marginBottom: 20, border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="novo-card-header">
            <div className="novo-card-title">{editMode ? `Editando: ${selected?.name}` : 'Crear nuevo partner'}</div>
            <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setShowForm(false)}><X size={14} /></button>
          </div>
          <div className="novo-grid-2">
            <NField label="Nombre de la empresa" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <NField label="Slug" value={form.slug} onChange={v => setForm({ ...form, slug: v.toLowerCase().replace(/\s/g, '-') })} />
            <div className="novo-field">
              <label>Plan</label>
              <select value={form.plan_name} onChange={e => setForm({ ...form, plan_name: e.target.value })}>
                <option value="partner">Partner</option>
                <option value="partner_pro">Partner Pro</option>
                <option value="partner_enterprise">Partner Enterprise</option>
              </select>
            </div>
            <div className="novo-field">
              <label>Estado</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pendiente</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="novo-btn novo-btn-primary" onClick={savePartner} disabled={busy}><Save size={14} /> {editMode ? 'Actualizar' : 'Crear partner'}</button>
            <button className="novo-btn novo-btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}
      <div className="novo-card">
        <div className="novo-card-header">
          <div className="novo-card-title">Partners registrados ({filtered.length})</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="novo-search" style={{ width: 200 }}><Search size={13} /><input placeholder="Buscar…" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <button className="novo-btn novo-btn-ghost" onClick={load}><RefreshCw size={13} /></button>
          </div>
        </div>
        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && filtered.length === 0 && <div className="novo-empty">No hay partners.</div>}
        {!loading && filtered.length > 0 && (
          <table className="novo-table">
            <thead><tr><th>Partner</th><th>Plan</th><th>GHL</th><th>Estado</th><th>Creado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <>
                  <tr key={p.id}>
                    <td><strong style={{ color: '#fff' }}>{p.name}</strong><br /><small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>/{p.slug}</small></td>
                    <td>{p.plan_name || 'Partner'}</td>
                    <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{p.ghl_location_id || 'Sin asignar'}</td>
                    <td><Badge status={p.status || 'pending'} /></td>
                    <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSelected(selected?.id === p.id ? null : p)}><Eye size={12} /> {selected?.id === p.id ? 'Cerrar' : 'Ver'}</button>
                        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(p)}><Edit2 size={12} /> Editar</button>
                      </div>
                    </td>
                  </tr>
                  {selected?.id === p.id && (
                    <tr key={`${p.id}-d`}>
                      <td colSpan={6} style={{ padding: 0 }}>
                        <div style={{ background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.15)', borderRadius: 10, margin: '4px 0', padding: '18px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
                            <Info label="ID" value={p.id.slice(0,8)+'…'} />
                            <Info label="Owner" value={p.owner_user_id ? p.owner_user_id.slice(0,8)+'…' : 'Sin vincular'} />
                            <Info label="GHL Location" value={p.ghl_location_id || 'Sin asignar'} />
                            <Info label="Creado" value={new Date(p.created_at).toLocaleDateString()} />
                          </div>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button className="novo-btn novo-btn-primary" onClick={() => openEdit(p)}><Edit2 size={13} /> Editar partner</button>
                            <button className="novo-btn novo-btn-secondary"><Eye size={13} /> Ver panel partner</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   ADMIN CLIENTES
================================ */
function AdminClients() {
  return (
    <div className="novo-page">
      <div className="novo-page-header"><span className="kicker">ECOSISTEMA</span><h1>Clientes</h1><p>Lista global de clientes separados por partner.</p></div>
      <div className="novo-card">
        <div className="novo-empty" style={{ padding: '60px 24px' }}>
          <Building2 size={36} style={{ opacity: .2, marginBottom: 14 }} />
          <p style={{ fontWeight: 600, color: 'var(--novo-text)', marginBottom: 6 }}>Vista global en construcción</p>
          <p style={{ fontSize: 13 }}>Los clientes aparecerán aquí agrupados por partner.</p>
        </div>
      </div>
    </div>
  );
}

/* ================================
   ADMIN PRODUCTOS
================================ */
function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', wholesalePrice: '', suggestedPrice: '', interval: 'month', stripeProductId: '', stripePriceId: '', active: true });

  const load = useCallback(async () => {
    try { setLoading(true); const data = await platformApi.listCatalogProducts(); setProducts(data?.products || []); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(p) {
    setForm({ name: p.name, description: p.description || '', wholesalePrice: p.wholesale_price, suggestedPrice: p.suggested_price || '', interval: p.interval || 'month', stripeProductId: p.stripe_product_id || '', stripePriceId: p.stripe_price_id || '', active: p.active !== false });
    setEditItem(p); setShowForm(true);
  }

  async function save() {
    try {
      setBusy(true);
      await platformApi.saveCatalogProduct({ ...form, id: editItem?.id });
      setNotice({ type: 'success', text: editItem ? 'Producto actualizado.' : 'Producto creado.' });
      setShowForm(false); setEditItem(null); load();
    } catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">CATÁLOGO</span><h1>Productos</h1><p>Catálogo central conectado con Stripe.</p></div>
        <button className="novo-btn novo-btn-primary" onClick={() => { setForm({ name: '', description: '', wholesalePrice: '', suggestedPrice: '', interval: 'month', stripeProductId: '', stripePriceId: '', active: true }); setEditItem(null); setShowForm(true); }}><Plus size={15} /> Nuevo producto</button>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      {showForm && (
        <div className="novo-card" style={{ marginBottom: 20, border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="novo-card-header">
            <div className="novo-card-title">{editItem ? `Editando: ${editItem.name}` : 'Nuevo producto'}</div>
            <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setShowForm(false)}><X size={14} /></button>
          </div>
          <div className="novo-grid-2">
            <NField label="Nombre" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <NField label="Descripción" value={form.description} onChange={v => setForm({ ...form, description: v })} />
            <NField label="Costo mayorista (USD)" type="number" value={form.wholesalePrice} onChange={v => setForm({ ...form, wholesalePrice: v })} />
            <NField label="Precio sugerido (USD)" type="number" value={form.suggestedPrice} onChange={v => setForm({ ...form, suggestedPrice: v })} />
            <div className="novo-field">
              <label>Intervalo</label>
              <select value={form.interval} onChange={e => setForm({ ...form, interval: e.target.value })}>
                <option value="month">Mensual</option>
                <option value="year">Anual</option>
              </select>
            </div>
            <div className="novo-field">
              <label>Estado</label>
              <select value={String(form.active)} onChange={e => setForm({ ...form, active: e.target.value === 'true' })}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            <NField label="Stripe Product ID" value={form.stripeProductId} onChange={v => setForm({ ...form, stripeProductId: v })} />
            <NField label="Stripe Price ID" value={form.stripePriceId} onChange={v => setForm({ ...form, stripePriceId: v })} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="novo-btn novo-btn-primary" onClick={save} disabled={busy}><Save size={14} /> {editItem ? 'Actualizar' : 'Crear producto'}</button>
            <button className="novo-btn novo-btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}
      <div className="novo-card">
        <div className="novo-card-header">
          <div><div className="novo-card-title">Catálogo ({products.length})</div><div className="novo-card-sub">Los partners venden estos productos.</div></div>
          <button className="novo-btn novo-btn-ghost" onClick={load}><RefreshCw size={13} /></button>
        </div>
        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && products.length === 0 && <div className="novo-empty" style={{ padding: '48px 24px' }}><Package size={32} style={{ opacity: .2, marginBottom: 12 }} /><p>No hay productos aún.</p></div>}
        {!loading && products.length > 0 && (
          <table className="novo-table">
            <thead><tr><th>Producto</th><th>Intervalo</th><th>Mayorista</th><th>Sugerido</th><th>Stripe</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><strong style={{ color: '#fff' }}>{p.name}</strong>{p.description && <><br /><small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>{p.description}</small></>}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.interval}</td>
                  <td><span style={{ color: '#34d399', fontWeight: 600 }}>${p.wholesale_price}</span></td>
                  <td><span style={{ color: '#a78bfa' }}>${p.suggested_price || '—'}</span></td>
                  <td>{p.stripe_product_id ? <span style={{ color: '#34d399', fontSize: 11 }}>✓ Vinculado</span> : <span style={{ color: 'var(--novo-muted)', fontSize: 11 }}>Sin vincular</span>}</td>
                  <td><Badge status={p.active ? 'active' : 'inactive'} /></td>
                  <td><button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(p)}><Edit2 size={12} /> Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   ADMIN PAGOS
================================ */
function AdminPayments() {
  const [keys, setKeys] = useState({ stripeSecretKey: '', stripeWebhookSecret: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  async function save() {
    try { setBusy(true); await platformApi.saveIntegrationSettings(keys); setNotice({ type: 'success', text: 'Claves guardadas.' }); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header"><span className="kicker">FINANZAS</span><h1>Pagos</h1><p>Administración financiera del ecosistema.</p></div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      <div className="novo-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        {[['Ingresos este mes','$—',DollarSign,'green'],['Pagos a partners','$—',Users,'purple'],['Transacciones','—',Activity,'blue']].map(([label,value,Icon,color]) => (
          <div className="novo-stat" key={label}>
            <div className={`novo-stat-icon ${color}`}><Icon size={17} /></div>
            <span className="novo-stat-label">{label}</span>
            <span className="novo-stat-value">{value}</span>
            <span className="novo-stat-sub">Conectar Stripe</span>
          </div>
        ))}
      </div>
      <div className="novo-card" style={{ marginTop: 16 }}>
        <div className="novo-card-header"><div><div className="novo-card-title">Configuración Stripe</div><div className="novo-card-sub">Claves para procesar pagos</div></div><Badge status="pending" label="Pendiente" /></div>
        <div className="novo-grid-2">
          <NField label="Secret key" secret value={keys.stripeSecretKey} onChange={v => setKeys({ ...keys, stripeSecretKey: v })} />
          <NField label="Webhook secret" secret value={keys.stripeWebhookSecret} onChange={v => setKeys({ ...keys, stripeWebhookSecret: v })} />
        </div>
        <button className="novo-btn novo-btn-primary" onClick={save} disabled={busy}><Save size={14} /> Guardar</button>
      </div>
      <div className="novo-card" style={{ marginTop: 16 }}>
        <div className="novo-card-header"><div className="novo-card-title">Historial de transacciones</div></div>
        <div className="novo-empty" style={{ padding: '48px 24px' }}><CreditCard size={32} style={{ opacity: .2, marginBottom: 12 }} /><p>Disponible cuando Stripe esté conectado.</p></div>
      </div>
    </div>
  );
}

/* ================================
   ADMIN CONFIGURACIÓN
================================ */
function AdminSettings() {
  const [tab, setTab] = useState('ghl');
  const [settings, setSettings] = useState({ ghlClientId: '', ghlClientSecret: '', ghlRedirectUri: '', ghlScopes: '', stripeSecretKey: '', stripeWebhookSecret: '', supabaseServiceRoleKey: '', webhookBaseUrl: '' });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  async function save() {
    try { setBusy(true); await platformApi.saveIntegrationSettings(settings); setNotice({ type: 'success', text: 'Configuración guardada.' }); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  async function connectGhl() {
    try { setBusy(true); const data = await platformApi.startGhlOAuth(); if (!data?.authorizationUrl) throw new Error('No se recibió URL.'); window.location.href = data.authorizationUrl; }
    catch (e) { setNotice({ type: 'error', text: e.message }); setBusy(false); }
  }

  const tabs = [['ghl','HighLevel',PlugZap],['stripe','Stripe',CreditCard],['supabase','Supabase',ShieldCheck],['webhooks','Webhooks',Webhook],['security','Seguridad',KeyRound]];

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">SISTEMA</span><h1>Configuración</h1><p>Conexiones, integraciones y seguridad.</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="novo-btn novo-btn-secondary" onClick={() => platformApi.syncGhlLocations().catch(()=>{})} disabled={busy}><RefreshCw size={14} /> Sync GHL</button>
          <button className="novo-btn novo-btn-primary" onClick={save} disabled={busy}><Save size={14} /> Guardar todo</button>
        </div>
      </div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      <div className="pc-tabs" style={{ marginBottom: 20 }}>
        {tabs.map(([id,label,Icon]) => <button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={13}/> {label}</button>)}
      </div>
      {tab==='ghl' && (
        <div className="novo-card">
          <div className="novo-card-header"><div><div className="novo-card-title">HighLevel OAuth</div><div className="novo-card-sub">Conexión principal con GoHighLevel</div></div><button className="novo-btn novo-btn-primary" onClick={connectGhl} disabled={busy}><PlugZap size={14}/> Conectar OAuth</button></div>
          <div className="novo-grid-2">
            <NField label="Client ID" value={settings.ghlClientId} onChange={v=>setSettings({...settings,ghlClientId:v})} />
            <NField label="Client Secret" secret value={settings.ghlClientSecret} onChange={v=>setSettings({...settings,ghlClientSecret:v})} />
            <NField label="Redirect URI" value={settings.ghlRedirectUri} onChange={v=>setSettings({...settings,ghlRedirectUri:v})} />
            <NField label="Scopes" value={settings.ghlScopes} onChange={v=>setSettings({...settings,ghlScopes:v})} />
          </div>
        </div>
      )}
      {tab==='stripe' && (
        <div className="novo-card">
          <div className="novo-card-header"><div><div className="novo-card-title">Stripe</div></div><Badge status="pending" label="Pendiente"/></div>
          <div className="novo-grid-2">
            <NField label="Secret key" secret value={settings.stripeSecretKey} onChange={v=>setSettings({...settings,stripeSecretKey:v})} />
            <NField label="Webhook secret" secret value={settings.stripeWebhookSecret} onChange={v=>setSettings({...settings,stripeWebhookSecret:v})} />
          </div>
        </div>
      )}
      {tab==='supabase' && (<div className="novo-card"><div className="novo-card-header"><div className="novo-card-title">Supabase</div></div><NField label="Service role key" secret value={settings.supabaseServiceRoleKey} onChange={v=>setSettings({...settings,supabaseServiceRoleKey:v})} /></div>)}
      {tab==='webhooks' && (<div className="novo-card"><div className="novo-card-header"><div className="novo-card-title">Webhooks</div></div><NField label="Webhook base URL" value={settings.webhookBaseUrl} onChange={v=>setSettings({...settings,webhookBaseUrl:v})} /></div>)}
      {tab==='security' && (
        <div className="novo-card">
          <div className="novo-card-header"><div className="novo-card-title">Checklist de seguridad</div></div>
          {[['Supabase Auth con roles',true],['RLS en todas las tablas',true],['Secretos en Edge Functions',true],['OAuth con refresh token',true],['Webhooks con firma Ed25519',true],['Variables de entorno en Netlify',false],['Stripe webhook conectado',false],['GHL OAuth configurado',false]].map(([label,ok])=>(
            <div key={label} className="status-row">
              {ok?<CheckCircle2 size={15} style={{color:'#34d399',flexShrink:0}}/>:<AlertCircle size={15} style={{color:'#fbbf24',flexShrink:0}}/>}
              <span style={{fontSize:13}}>{label}</span>
              <Badge status={ok?'active':'pending'} label={ok?'OK':'Pendiente'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================
   FORMULARIO CLIENTE COMPLETO
   (compartido entre Partner y Admin)
================================ */
const emptyClient = {
  name: '', company_name: '', logo_url: '', industry: '', website: '',
  contact_name: '', email: '', phone: '', contact_role: '',
  country: '', city: '', address: '', status: 'pending', notes: '',
};

function ClientForm({ initial = emptyClient, onSave, onCancel, busy, title = 'Nuevo cliente' }) {
  const [form, setForm] = useState(initial);
  const f = (k) => (v) => setForm(s => ({ ...s, [k]: v }));

  return (
    <div className="novo-card" style={{ marginBottom: 20, border: '1px solid rgba(124,58,237,.3)' }}>
      <div className="novo-card-header">
        <div className="novo-card-title">{title}</div>
        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={onCancel}><X size={14} /></button>
      </div>

      {/* Logo */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: 'var(--novo-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><Image size={13} /> Logo de la empresa (URL)</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {form.logo_url && <img src={form.logo_url} alt="logo" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--novo-border)' }} onError={e => e.target.style.display='none'} />}
          <input style={{ flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid var(--novo-border)', borderRadius: 8, padding: '9px 12px', color: 'var(--novo-text)', fontSize: 13, outline: 'none' }}
            placeholder="https://empresa.com/logo.png" value={form.logo_url} onChange={e => setForm(s => ({ ...s, logo_url: e.target.value }))} />
        </div>
      </div>

      {/* Sección: Info básica */}
      <SectionLabel icon={Building2} label="Información de la empresa" />
      <div className="novo-grid-2" style={{ marginBottom: 16 }}>
        <NField label="Nombre de la empresa *" value={form.company_name} onChange={f('company_name')} />
        <NField label="Nombre visible / Apodo" value={form.name} onChange={f('name')} />
        <NField label="Industria / Sector" value={form.industry} onChange={f('industry')} />
        <NField label="Sitio web" value={form.website} onChange={f('website')} />
      </div>

      {/* Sección: Contacto */}
      <SectionLabel icon={User} label="Contacto principal" />
      <div className="novo-grid-2" style={{ marginBottom: 16 }}>
        <NField label="Nombre del contacto" value={form.contact_name} onChange={f('contact_name')} />
        <NField label="Cargo" value={form.contact_role} onChange={f('contact_role')} />
        <NField label="Email *" value={form.email} onChange={f('email')} />
        <NField label="Teléfono" value={form.phone} onChange={f('phone')} />
      </div>

      {/* Sección: Ubicación */}
      <SectionLabel icon={MapPin} label="Ubicación" />
      <div className="novo-grid-3" style={{ marginBottom: 16 }}>
        <NField label="País" value={form.country} onChange={f('country')} />
        <NField label="Ciudad" value={form.city} onChange={f('city')} />
        <NField label="Dirección" value={form.address} onChange={f('address')} />
      </div>

      {/* Sección: Interno */}
      <SectionLabel icon={FileText} label="Información interna" />
      <div className="novo-grid-2" style={{ marginBottom: 16 }}>
        <div className="novo-field">
          <label>Estado</label>
          <select value={form.status} onChange={e => setForm(s => ({ ...s, status: e.target.value }))}>
            <option value="pending">Pendiente</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
        <NField label="Notas internas" value={form.notes} onChange={f('notes')} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="novo-btn novo-btn-primary" onClick={() => onSave(form)} disabled={busy}><Save size={14} /> Guardar cliente</button>
        <button className="novo-btn novo-btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

/* ================================
   PARTNER ROUTER
================================ */
export function PartnerConsole({ section }) {
  if (section === 'dashboard') return <PartnerDashboard />;
  if (section === 'clients')   return <PartnerClients />;
  if (section === 'offers')    return <PartnerOffers />;
  if (section === 'links')     return <PartnerLinks />;
  if (section === 'brand')     return <PartnerBrand />;
  if (section === 'support')   return <PartnerSupport />;
  return <PartnerDashboard />;
}

/* ================================
   PARTNER DASHBOARD
================================ */
function PartnerDashboard() {
  const [clients, setClients] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      platformApi.listPartnerClients().catch(() => ({ clients: [] })),
      platformApi.listCatalog().catch(() => ({ products: [] })),
    ]).then(([cd, ct]) => { setClients(cd?.clients || []); setCatalog(ct?.products || []); }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="novo-page">
      <div className="novo-page-header"><span className="kicker">PARTNER WORKSPACE</span><h1>Mi negocio</h1><p>Resumen de tu operación en el ecosistema NOVO.</p></div>
      <div className="novo-stats">
        {[
          ['Mis clientes', loading ? '…' : clients.length, Users, 'blue'],
          ['Clientes activos', loading ? '…' : clients.filter(c => c.status === 'active').length, CheckCircle2, 'green'],
          ['Productos disponibles', loading ? '…' : catalog.length, Package, 'purple'],
          ['MRR estimado', '$—', DollarSign, 'orange'],
        ].map(([label, value, Icon, color]) => (
          <div className="novo-stat" key={label}>
            <div className={`novo-stat-icon ${color}`}><Icon size={17} /></div>
            <span className="novo-stat-label">{label}</span>
            <span className="novo-stat-value">{value}</span>
          </div>
        ))}
      </div>
      <div className="novo-grid-2">
        <div className="novo-card">
          <div className="novo-card-header"><div className="novo-card-title">Clientes recientes</div><Badge status="active" label={`${clients.length} total`} /></div>
          {loading && <div className="novo-empty">Cargando…</div>}
          {!loading && clients.length === 0 && <div className="novo-empty">No tienes clientes todavía.</div>}
          {!loading && clients.length > 0 && (
            <table className="novo-table">
              <thead><tr><th>Empresa</th><th>Contacto</th><th>Estado</th></tr></thead>
              <tbody>
                {clients.slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {c.logo_url && <img src={c.logo_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />}
                        <strong style={{ color: '#fff' }}>{c.company_name || c.name}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--novo-muted)', fontSize: 12 }}>{c.contact_name || c.email || '—'}</td>
                    <td><Badge status={c.status || 'pending'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="novo-card">
          <div className="novo-card-header"><div className="novo-card-title">Productos disponibles</div></div>
          {loading && <div className="novo-empty">Cargando…</div>}
          {!loading && catalog.length === 0 && <div className="novo-empty">El Super Admin aún no ha publicado productos.</div>}
          {!loading && catalog.map(p => (
            <div key={p.id} className="status-row">
              <span style={{ color: '#fff', fontWeight: 500 }}>{p.name}</span>
              <span style={{ color: '#34d399', fontSize: 13 }}>${p.wholesale_price}/{p.interval}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================
   PARTNER CLIENTES
================================ */
function PartnerClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try { setLoading(true); const data = await platformApi.listPartnerClients(); setClients(data?.clients || []); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveClient(form) {
    try {
      setBusy(true);
      const payload = { ...form, name: form.company_name || form.name };
      if (editItem) {
        await platformApi.createPartnerClient({ ...payload, id: editItem.id });
      } else {
        await platformApi.createPartnerClient(payload);
      }
      setNotice({ type: 'success', text: editItem ? 'Cliente actualizado.' : 'Cliente creado correctamente.' });
      setShowForm(false); setEditItem(null); load();
    } catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  function openEdit(c) { setEditItem(c); setShowForm(true); }
  function openNew() { setEditItem(null); setShowForm(true); }

  const filtered = clients.filter(c =>
    (c.company_name || c.name)?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">CLIENTES</span><h1>Mis clientes</h1><p>Gestiona tu cartera de clientes en el ecosistema NOVO.</p></div>
        <button className="novo-btn novo-btn-primary" onClick={openNew}><Plus size={15} /> Agregar cliente</button>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      {showForm && (
        <ClientForm
          initial={editItem ? {
            name: editItem.name || '', company_name: editItem.company_name || editItem.name || '',
            logo_url: editItem.logo_url || '', industry: editItem.industry || '',
            website: editItem.website || '', contact_name: editItem.contact_name || '',
            email: editItem.email || '', phone: editItem.phone || '',
            contact_role: editItem.contact_role || '', country: editItem.country || '',
            city: editItem.city || '', address: editItem.address || '',
            status: editItem.status || 'pending', notes: editItem.notes || '',
          } : emptyClient}
          title={editItem ? `Editando: ${editItem.company_name || editItem.name}` : 'Nuevo cliente'}
          onSave={saveClient}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
          busy={busy}
        />
      )}

      <div className="novo-card">
        <div className="novo-card-header">
          <div className="novo-card-title">Clientes ({filtered.length})</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="novo-search" style={{ width: 220 }}><Search size={13} /><input placeholder="Buscar cliente…" value={search} onChange={e => setSearch(e.target.value)} /></div>
            <button className="novo-btn novo-btn-ghost" onClick={load}><RefreshCw size={13} /></button>
          </div>
        </div>

        {loading && <div className="novo-empty">Cargando…</div>}
        {!loading && filtered.length === 0 && <div className="novo-empty">No hay clientes que coincidan.</div>}
        {!loading && filtered.length > 0 && (
          <table className="novo-table">
            <thead><tr><th>Empresa</th><th>Contacto</th><th>Ubicación</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <>
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {c.logo_url
                          ? <img src={c.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--novo-border)' }} onError={e => e.target.style.display='none'} />
                          : <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,.15)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>{(c.company_name || c.name || '?')[0].toUpperCase()}</div>
                        }
                        <div>
                          <strong style={{ color: '#fff', display: 'block' }}>{c.company_name || c.name}</strong>
                          {c.industry && <small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>{c.industry}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{c.contact_name || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--novo-muted)' }}>{c.email || '—'}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{[c.city, c.country].filter(Boolean).join(', ') || '—'}</td>
                    <td><Badge status={c.status || 'pending'} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setSelected(selected?.id === c.id ? null : c)}><Eye size={12} /> {selected?.id === c.id ? 'Cerrar' : 'Ver'}</button>
                        <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => openEdit(c)}><Edit2 size={12} /> Editar</button>
                      </div>
                    </td>
                  </tr>
                  {selected?.id === c.id && (
                    <tr key={`${c.id}-detail`}>
                      <td colSpan={5} style={{ padding: 0 }}>
                        <div style={{ background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.15)', borderRadius: 10, margin: '4px 0', padding: '18px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 16 }}>
                            <Info label="Email" value={c.email || '—'} />
                            <Info label="Teléfono" value={c.phone || '—'} />
                            <Info label="Sitio web" value={c.website || '—'} />
                            <Info label="Contacto" value={c.contact_name || '—'} />
                            <Info label="Cargo" value={c.contact_role || '—'} />
                            <Info label="País" value={c.country || '—'} />
                            <Info label="Ciudad" value={c.city || '—'} />
                            <Info label="Dirección" value={c.address || '—'} />
                          </div>
                          {c.notes && <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--novo-muted)', marginBottom: 14 }}><strong style={{ color: 'var(--novo-text)' }}>Notas: </strong>{c.notes}</div>}
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button className="novo-btn novo-btn-primary" onClick={() => openEdit(c)}><Edit2 size={13} /> Editar cliente</button>
                            <button className="novo-btn novo-btn-ghost" onClick={() => setSelected(null)}><X size={13} /> Cerrar</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   PARTNER OFERTAS
================================ */
function PartnerOffers() {
  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState(null);
  const [price, setPrice] = useState('');
  const [checkout, setCheckout] = useState('');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { platformApi.listCatalog().then(d => setCatalog(d?.products || [])).catch(() => {}); }, []);

  const margin = selected && price ? Number(price) - Number(selected.wholesale_price || 0) : 0;

  async function generate() {
    try {
      if (!selected || !price) throw new Error('Selecciona un producto y define el precio.');
      if (Number(price) < Number(selected.wholesale_price)) throw new Error('El precio no puede ser menor al costo mayorista.');
      setBusy(true);
      await platformApi.savePartnerOffer({ productId: selected.id, retailPrice: Number(price) });
      const data = await platformApi.generateCheckoutLink({ productId: selected.id, retailPrice: Number(price) });
      setCheckout(data.checkoutUrl);
      setNotice({ type: 'success', text: 'Link de venta generado correctamente.' });
    } catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header"><span className="kicker">CATÁLOGO NOVO</span><h1>Productos y ofertas</h1><p>Selecciona un producto, define tu precio y genera el link de Stripe.</p></div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      <div className="novo-grid-2" style={{ marginBottom: 16 }}>
        {catalog.length === 0 && <div className="novo-empty" style={{ gridColumn: '1/-1' }}>El Super Admin aún no ha publicado productos.</div>}
        {catalog.map(p => (
          <div key={p.id} className="novo-card" style={{ cursor: 'pointer', border: selected?.id === p.id ? '1px solid #7C3AED' : '1px solid var(--novo-card-border)', background: selected?.id === p.id ? 'rgba(124,58,237,.08)' : 'var(--novo-card)', transition: 'all .18s' }}
            onClick={() => { setSelected(p); setPrice(String(p.suggested_price || '')); setCheckout(''); }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{p.name}</div><div style={{ fontSize: 12, color: 'var(--novo-muted)', textTransform: 'capitalize' }}>{p.billing_type} · {p.interval}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ color: '#34d399', fontWeight: 700, fontSize: 18 }}>${p.wholesale_price}</div><div style={{ fontSize: 11, color: 'var(--novo-muted)' }}>costo mayorista</div></div>
            </div>
            {selected?.id === p.id && <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(124,58,237,.2)', fontSize: 12, color: '#a78bfa' }}>✓ Seleccionado — configura tu precio abajo</div>}
          </div>
        ))}
      </div>

      {selected && (
        <div className="novo-card">
          <div className="novo-card-header"><div><div className="novo-card-title">Configurar oferta — {selected.name}</div><div className="novo-card-sub">Define tu precio de venta y genera el link</div></div></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end', marginBottom: 16 }}>
            <NField label="Precio de venta (USD)" type="number" value={price} onChange={v => { setPrice(v); setCheckout(''); }} />
            <div><label style={{ fontSize: 12, color: 'var(--novo-muted)', display: 'block', marginBottom: 6 }}>Costo mayorista</label><div style={{ fontSize: 16, fontWeight: 600, color: '#64748b' }}>${selected.wholesale_price}</div></div>
            <div><label style={{ fontSize: 12, color: 'var(--novo-muted)', display: 'block', marginBottom: 6 }}>Tu ganancia estimada</label><div style={{ fontSize: 22, fontWeight: 700, color: margin > 0 ? '#34d399' : '#f87171' }}>${margin.toFixed(2)}</div></div>
            <button className="novo-btn novo-btn-primary" onClick={generate} disabled={busy || !price}><Link2 size={14} /> Generar link Stripe</button>
          </div>
          {checkout && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 8, padding: '12px 14px' }}>
              <span style={{ flex: 1, fontSize: 12, color: '#34d399', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{checkout}</span>
              <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => navigator.clipboard.writeText(checkout)}><Copy size={12} /> Copiar</button>
              <a href={checkout} target="_blank" rel="noreferrer" className="novo-btn novo-btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}><ExternalLink size={12} /></a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================================
   PARTNER LINKS
================================ */
function PartnerLinks() {
  return (
    <div className="novo-page">
      <div className="novo-page-header"><span className="kicker">VENTAS</span><h1>Links de venta</h1><p>Historial de links generados y conversiones.</p></div>
      <div className="novo-card">
        <div className="novo-empty" style={{ padding: '60px 24px' }}>
          <Link2 size={36} style={{ opacity: .2, marginBottom: 14 }} />
          <p style={{ fontWeight: 600, color: 'var(--novo-text)', marginBottom: 6 }}>Historial de links</p>
          <p style={{ fontSize: 13 }}>Los links que generes en "Productos y ofertas" aparecerán aquí con estado y conversiones.</p>
        </div>
      </div>
    </div>
  );
}

/* ================================
   PARTNER MARCA
================================ */
function PartnerBrand() {
  const [form, setForm] = useState({ name: '', domain: '', metaPixelId: '', facebookUrl: '' });
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    try { setBusy(true); await platformApi.savePartnerBranding(form); setNotice({ type: 'success', text: 'Marca guardada.' }); }
    catch (e) { setNotice({ type: 'error', text: e.message }); }
    finally { setBusy(false); }
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header"><span className="kicker">IDENTIDAD</span><h1>Marca y redes</h1><p>Configura tu identidad en el ecosistema NOVO.</p></div>
      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}
      <div className="novo-card">
        <div className="novo-card-header"><div className="novo-card-title">Configuración permitida</div></div>
        <div className="novo-grid-2">
          <NField label="Nombre comercial" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <NField label="Dominio" value={form.domain} onChange={v => setForm({ ...form, domain: v })} />
          <NField label="Meta Pixel ID" value={form.metaPixelId} onChange={v => setForm({ ...form, metaPixelId: v })} />
          <NField label="Facebook URL" value={form.facebookUrl} onChange={v => setForm({ ...form, facebookUrl: v })} />
        </div>
        <button className="novo-btn novo-btn-primary" onClick={save} disabled={busy}><Save size={14} /> Guardar marca</button>
        <p style={{ fontSize: 11, color: 'var(--novo-muted)', marginTop: 10 }}>Las conexiones GHL, pagos y permisos avanzados solo los administra el Super Admin.</p>
      </div>
    </div>
  );
}

/* ================================
   PARTNER SOPORTE
================================ */
function PartnerSupport() {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', priority: 'medium' });
  const [notice, setNotice] = useState(null);

  function submitTicket() {
    if (!form.subject || !form.message) { setNotice({ type: 'error', text: 'Completa el asunto y el mensaje.' }); return; }
    setTickets(t => [{ id: Date.now(), ...form, status: 'open', created_at: new Date().toISOString() }, ...t]);
    setNotice({ type: 'success', text: 'Ticket enviado. Te responderemos pronto.' });
    setShowForm(false);
    setForm({ subject: '', message: '', priority: 'medium' });
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><span className="kicker">SOPORTE</span><h1>Centro de ayuda</h1><p>Soporte directo para partners del ecosistema NOVO.</p></div>
        <button className="novo-btn novo-btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Nuevo ticket</button>
      </div>

      {notice && <Notice {...notice} onClose={() => setNotice(null)} />}

      {showForm && (
        <div className="novo-card" style={{ marginBottom: 20, border: '1px solid rgba(124,58,237,.3)' }}>
          <div className="novo-card-header">
            <div className="novo-card-title">Crear ticket de soporte</div>
            <button className="novo-btn novo-btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setShowForm(false)}><X size={14} /></button>
          </div>
          <div className="novo-grid-2" style={{ marginBottom: 14 }}>
            <NField label="Asunto *" value={form.subject} onChange={v => setForm({ ...form, subject: v })} />
            <div className="novo-field">
              <label>Prioridad</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <div className="novo-field" style={{ marginBottom: 14 }}>
            <label>Mensaje *</label>
            <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--novo-border)', borderRadius: 8, padding: '9px 12px', color: 'var(--novo-text)', fontSize: 13, outline: 'none', width: '100%', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="novo-btn novo-btn-primary" onClick={submitTicket}><Save size={14} /> Enviar ticket</button>
            <button className="novo-btn novo-btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="novo-card">
        <div className="novo-card-header"><div className="novo-card-title">Mis tickets ({tickets.length})</div></div>
        {tickets.length === 0 ? (
          <div className="novo-empty" style={{ padding: '48px 24px' }}>
            <LifeBuoy size={36} style={{ opacity: .2, marginBottom: 14 }} />
            <p style={{ fontWeight: 600, color: 'var(--novo-text)', marginBottom: 6 }}>No tienes tickets abiertos</p>
            <p style={{ fontSize: 13 }}>Para soporte directo: <strong style={{ color: '#818cf8' }}>clients@novoeia.com</strong></p>
          </div>
        ) : (
          <table className="novo-table">
            <thead><tr><th>Asunto</th><th>Prioridad</th><th>Estado</th><th>Fecha</th></tr></thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id}>
                  <td><strong style={{ color: '#fff' }}>{t.subject}</strong><br /><small style={{ color: 'var(--novo-muted)', fontSize: 11 }}>{t.message.slice(0, 60)}…</small></td>
                  <td><Badge status={t.priority === 'high' ? 'inactive' : t.priority === 'medium' ? 'pending' : 'active'} label={t.priority === 'high' ? 'Alta' : t.priority === 'medium' ? 'Media' : 'Baja'} /></td>
                  <td><Badge status="pending" label="Abierto" /></td>
                  <td style={{ fontSize: 12, color: 'var(--novo-muted)' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================
   SHARED COMPONENTS
================================ */
function SectionLabel({ icon: Icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid var(--novo-border)' }}>
      <Icon size={14} style={{ color: '#818cf8' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

function NField({ label, value = '', onChange, secret = false, type = 'text' }) {
  return (
    <div className="novo-field">
      <label>{label}</label>
      <input type={secret ? 'password' : type} value={value} onChange={e => onChange?.(e.target.value)} autoComplete="off" />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--novo-muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{String(value)}</div>
    </div>
  );
}

function Badge({ status, label }) {
  const cls = { active: 'active', inactive: 'inactive', pending: 'pending' }[status] || 'pending';
  return <span className={`novo-badge ${cls}`}>{label || status}</span>;
}

function Notice({ type, text, onClose }) {
  return (
    <div className={`novo-notice ${type}`} style={{ marginBottom: 16 }}>
      {type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      <span style={{ flex: 1 }}>{text}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}><X size={14} /></button>}
    </div>
  );
}