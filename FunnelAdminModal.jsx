import { useEffect, useState } from 'react';
import {
  Check, Eye, LayoutTemplate, Mail, MessageCircle,
  Package, Play, Plus, Save, Settings2, Star, Trash2, X,
} from 'lucide-react';

// Import defaults from the single source of truth
import { DEFAULT_FUNNEL_SETTINGS } from './PublicFunnelPage';

// ─── TABS ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'hero',         label: 'Hero',         icon: LayoutTemplate },
  { id: 'video',        label: 'Video',         icon: Play },
  { id: 'products',     label: 'Productos',     icon: Package },
  { id: 'contact',      label: 'Contacto',      icon: MessageCircle },
  { id: 'testimonials', label: 'Testimonios',   icon: Star },
];

// ─── CLONE SETTINGS ──────────────────────────────────────────────────────────

function cloneSettings(settings) {
  const src = settings || {};
  const def = DEFAULT_FUNNEL_SETTINGS;

  return {
    hero: { ...def.hero, ...(src.hero || {}) },
    video: { ...def.video, ...(src.video || {}) },
    products: {
      ...def.products,
      ...(src.products || {}),
      visibleProductIds: [...(src.products?.visibleProductIds || [])],
    },
    contact: { ...def.contact, ...(src.contact || {}) },
    testimonials: {
      ...def.testimonials,
      ...(src.testimonials || {}),
      items: src.testimonials?.items
        ? src.testimonials.items.map(t => ({ ...t }))
        : def.testimonials.items.map(t => ({ ...t })),
    },
    noRisk: { ...def.noRisk, ...(src.noRisk || {}) },
  };
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function FunnelAdminModal({
  open,
  initialSettings,
  products = [],
  onClose,
  onSave,
  onPreview,
}) {
  const [activeTab, setActiveTab] = useState('hero');
  const [settings, setSettings] = useState(() => cloneSettings(initialSettings));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!open) return;
    setSettings(cloneSettings(initialSettings));
    setNotice({ text: '', type: '' });
    setActiveTab('hero');
  }, [open, initialSettings]);

  if (!open) return null;

  function updateSection(section, field, value) {
    setSettings(c => ({
      ...c,
      [section]: { ...c[section], [field]: value },
    }));
  }

  function toggleProduct(productId) {
    const ids = settings.products.visibleProductIds || [];
    const next = ids.includes(productId)
      ? ids.filter(id => id !== productId)
      : [...ids, productId];
    updateSection('products', 'visibleProductIds', next);
  }

  function updateTestimonial(index, field, value) {
    const items = settings.testimonials.items.map((t, i) =>
      i === index ? { ...t, [field]: value } : t,
    );
    updateSection('testimonials', 'items', items);
  }

  function addTestimonial() {
    const items = [
      ...settings.testimonials.items,
      {
        id: `t${Date.now()}`,
        name: '',
        role: '',
        company: '',
        text: '',
        result: '',
        avatar: '',
      },
    ];
    updateSection('testimonials', 'items', items);
  }

  function removeTestimonial(index) {
    const items = settings.testimonials.items.filter((_, i) => i !== index);
    updateSection('testimonials', 'items', items);
  }

  async function saveSettings() {
    setSaving(true);
    setNotice({ text: '', type: '' });
    try {
      await onSave?.(settings);
      setNotice({ text: 'Configuración guardada correctamente.', type: 'success' });
    } catch (err) {
      console.error(err);
      setNotice({ text: err?.message || 'No fue posible guardar la configuración.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fam-overlay"
      role="presentation"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <style>{CSS}</style>

      <section className="fam-modal" role="dialog" aria-modal="true" aria-label="Administración del funnel">

        {/* HEADER */}
        <header className="fam-header">
          <div className="fam-header-left">
            <span className="fam-header-icon"><Settings2 size={20} /></span>
            <div>
              <h2>Administrar página de ventas</h2>
              <p>Personaliza el contenido sin modificar la información principal de tu marca.</p>
            </div>
          </div>
          <button type="button" className="fam-close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </header>

        {/* BODY */}
        <div className="fam-body">

          {/* SIDEBAR TABS */}
          <aside className="fam-tabs">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`fam-tab ${activeTab === tab.id ? 'fam-tab-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </aside>

          {/* CONTENT */}
          <main className="fam-content">
            {activeTab === 'hero' && (
              <HeroTab
                values={settings.hero}
                update={(f, v) => updateSection('hero', f, v)}
              />
            )}
            {activeTab === 'video' && (
              <VideoTab
                values={settings.video}
                update={(f, v) => updateSection('video', f, v)}
              />
            )}
            {activeTab === 'products' && (
              <ProductsTab
                values={settings.products}
                products={products}
                update={(f, v) => updateSection('products', f, v)}
                toggleProduct={toggleProduct}
              />
            )}
            {activeTab === 'contact' && (
              <ContactTab
                values={settings.contact}
                update={(f, v) => updateSection('contact', f, v)}
              />
            )}
            {activeTab === 'testimonials' && (
              <TestimonialsTab
                values={settings.testimonials}
                update={(f, v) => updateSection('testimonials', f, v)}
                updateItem={updateTestimonial}
                addItem={addTestimonial}
                removeItem={removeTestimonial}
              />
            )}
          </main>
        </div>

        {/* FOOTER */}
        <footer className="fam-footer">
          <div className="fam-footer-left">
            {notice.text && (
              <span className={`fam-notice fam-notice-${notice.type}`}>
                {notice.type === 'success' ? <Check size={13} /> : null}
                {notice.text}
              </span>
            )}
          </div>
          <div className="fam-footer-actions">
            {onPreview && (
              <button type="button" className="fam-btn-secondary" onClick={() => onPreview(settings)}>
                <Eye size={15} /> Vista previa
              </button>
            )}
            <button type="button" className="fam-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="fam-btn-primary" disabled={saving} onClick={saveSettings}>
              <Save size={15} />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

// ─── TAB SECTIONS ─────────────────────────────────────────────────────────────

function HeroTab({ values, update }) {
  return (
    <div className="fam-section">
      <SectionHead
        title="Contenido principal"
        description="La primera sección que verá tu visitante. Hazla directa y poderosa."
      />
      <Grid>
        <Field label="Texto de eyebrow / kicker" full>
          <input value={values.eyebrow} onChange={e => update('eyebrow', e.target.value)} />
        </Field>
        <Field label="Inicio del título">
          <input value={values.titlePrefix} onChange={e => update('titlePrefix', e.target.value)} placeholder="Tu negocio merece un sistema que" />
        </Field>
        <Field label="Frase destacada (en color primario)">
          <input value={values.titleHighlight} onChange={e => update('titleHighlight', e.target.value)} placeholder="cierre más ventas" />
        </Field>
        <Field label="Final del título" full>
          <input value={values.titleSuffix} onChange={e => update('titleSuffix', e.target.value)} placeholder="sin depender del caos" />
        </Field>
        <Field label="Subtítulo / descripción corta" full>
          <textarea rows={3} value={values.subtitle} onChange={e => update('subtitle', e.target.value)} />
        </Field>
        <Field label="Texto botón principal">
          <input value={values.primaryButtonText} onChange={e => update('primaryButtonText', e.target.value)} />
        </Field>
        <Field label="Texto botón secundario">
          <input value={values.secondaryButtonText} onChange={e => update('secondaryButtonText', e.target.value)} />
        </Field>
      </Grid>

      <Divider label="Imagen de fondo (opcional)" />
      <Grid>
        <Field label="URL de la imagen de fondo" full>
          <input value={values.backgroundImageUrl} onChange={e => update('backgroundImageUrl', e.target.value)} placeholder="https://..." />
        </Field>
        <Field label="Posición de la imagen">
          <select value={values.backgroundPosition} onChange={e => update('backgroundPosition', e.target.value)}>
            <option value="center center">Centro</option>
            <option value="center top">Centro superior</option>
            <option value="center bottom">Centro inferior</option>
            <option value="left center">Izquierda</option>
            <option value="right center">Derecha</option>
          </select>
        </Field>
        <Field label={`Intensidad del overlay: ${values.backgroundOverlay}%`}>
          <input
            type="range" min={20} max={95} step={1}
            value={values.backgroundOverlay}
            onChange={e => update('backgroundOverlay', Number(e.target.value))}
          />
          <small className="fam-range-hint">A mayor valor, el texto se lee mejor sobre la imagen.</small>
        </Field>
      </Grid>
      <Switch
        label="Mostrar panel visual del CRM"
        description="Muestra el dashboard ilustrativo animado en el hero. Se oculta si configuras una imagen de fondo."
        checked={values.showDashboardPreview}
        onChange={v => update('showDashboardPreview', v)}
      />
    </div>
  );
}

function VideoTab({ values, update }) {
  return (
    <div className="fam-section">
      <SectionHead
        title="Video explicativo"
        description="Un video bien hecho puede aumentar la conversión hasta un 80%. Ponlo aquí."
      />
      <Switch
        label="Mostrar sección de video"
        description="Oculta esta sección si todavía no tienes el video listo."
        checked={values.enabled}
        onChange={v => update('enabled', v)}
      />
      <Grid>
        <Field label="URL del video" full>
          <input
            value={values.url}
            onChange={e => update('url', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... o Vimeo, Loom"
          />
          <small className="fam-field-hint">Soporta YouTube, Vimeo y Loom. Puedes pegar el link normal, lo convertimos automáticamente.</small>
        </Field>
        <Field label="Inicio del título">
          <input value={values.titlePrefix} onChange={e => update('titlePrefix', e.target.value)} />
        </Field>
        <Field label="Frase destacada">
          <input value={values.titleHighlight} onChange={e => update('titleHighlight', e.target.value)} />
        </Field>
        <Field label="Final del título" full>
          <input value={values.titleSuffix} onChange={e => update('titleSuffix', e.target.value)} />
        </Field>
        <Field label="Descripción" full>
          <textarea rows={3} value={values.description} onChange={e => update('description', e.target.value)} />
        </Field>
      </Grid>
    </div>
  );
}

function ProductsTab({ values, products, update, toggleProduct }) {
  return (
    <div className="fam-section">
      <SectionHead
        title="Planes y productos"
        description="Elige qué planes aparecen y cómo se presentan en tu página de ventas."
      />
      <Grid>
        <Field label="Inicio del título de la sección">
          <input value={values.sectionTitlePrefix} onChange={e => update('sectionTitlePrefix', e.target.value)} />
        </Field>
        <Field label="Frase destacada">
          <input value={values.sectionTitleHighlight} onChange={e => update('sectionTitleHighlight', e.target.value)} />
        </Field>
        <Field label="Final del título" full>
          <input value={values.sectionTitleSuffix} onChange={e => update('sectionTitleSuffix', e.target.value)} />
        </Field>
        <Field label="Descripción de la sección" full>
          <textarea rows={2} value={values.sectionDescription} onChange={e => update('sectionDescription', e.target.value)} />
        </Field>
      </Grid>

      <Switch
        label="Mostrar precios"
        description="Desactívalo si prefieres captar el lead antes de mostrar el precio."
        checked={values.showPrices}
        onChange={v => update('showPrices', v)}
      />

      <div className="fam-product-list">
        <div className="fam-product-list-head">
          <div>
            <strong>Productos visibles</strong>
            <span>Sin selección = se muestran todos</span>
          </div>
          <div>
            <strong>Destacado</strong>
          </div>
        </div>
        {products.length === 0 ? (
          <div className="fam-empty">No hay productos configurados aún. Agrégalos desde la sección de productos.</div>
        ) : (
          products.map(p => {
            const visible = values.visibleProductIds?.includes(p.id);
            const featured = values.featuredProductId === p.id;
            return (
              <div key={p.id} className="fam-product-row">
                <label className="fam-product-check">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={() => toggleProduct(p.id)}
                  />
                  <span className="fam-product-info">
                    <strong>{p.name}</strong>
                    <small>
                      {p.price
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency || 'USD', maximumFractionDigits: 0 }).format(p.price) + `/${p.interval === 'year' ? 'año' : 'mes'}`
                        : 'Precio personalizado'}
                    </small>
                  </span>
                </label>
                <label className="fam-radio-label">
                  <input
                    type="radio"
                    name="featured"
                    checked={featured}
                    onChange={() => update('featuredProductId', p.id)}
                  />
                  <span className={`fam-radio-star ${featured ? 'fam-radio-star-active' : ''}`}>
                    <Star size={14} fill={featured ? 'currentColor' : 'none'} />
                  </span>
                </label>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ContactTab({ values, update }) {
  return (
    <div className="fam-section">
      <SectionHead
        title="Contacto y canales"
        description="Define cómo tus visitantes se comunican contigo y qué canal aparece primero."
      />
      <Switch
        label="Mostrar formulario de contacto"
        description="El formulario captura leads directamente desde el funnel."
        checked={values.showForm}
        onChange={v => update('showForm', v)}
      />
      <Switch
        label="Mostrar botón flotante"
        description="Mantiene el canal de contacto visible durante toda la navegación."
        checked={values.showFloatingContact}
        onChange={v => update('showFloatingContact', v)}
      />
      <Grid>
        <Field label="Canal principal (aparece primero en el widget)" full>
          <select value={values.preferredChannel} onChange={e => update('preferredChannel', e.target.value)}>
            <option value="whatsapp">WhatsApp — aparece primero si está configurado</option>
            <option value="email">Correo electrónico — aparece primero</option>
          </select>
        </Field>

        <Divider label="Título de la sección de contacto" />

        <Field label="Inicio del título">
          <input value={values.titlePrefix} onChange={e => update('titlePrefix', e.target.value)} />
        </Field>
        <Field label="Frase destacada">
          <input value={values.titleHighlight} onChange={e => update('titleHighlight', e.target.value)} />
        </Field>
        <Field label="Final del título" full>
          <input value={values.titleSuffix} onChange={e => update('titleSuffix', e.target.value)} />
        </Field>
      </Grid>

      <div className="fam-info-box">
        <Mail size={14} />
        <div>
          <strong>Datos de contacto automáticos</strong>
          <p>El correo, WhatsApp y teléfono que aparecen en el funnel se toman directamente de <strong>Mi marca</strong>. Para actualizarlos, ve a la sección de configuración de tu negocio.</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsTab({ values, update, updateItem, addItem, removeItem }) {
  return (
    <div className="fam-section">
      <SectionHead
        title="Testimonios y resultados"
        description="La prueba social es el cierre más poderoso. Agrega 2 o 3 casos reales de tus clientes."
      />
      <Switch
        label="Mostrar sección de testimonios"
        description="Si no tienes los tuyos todavía, los testimonios por defecto te sirven de partida."
        checked={values.enabled}
        onChange={v => update('enabled', v)}
      />

      {values.items.map((item, i) => (
        <div key={item.id} className="fam-testimonial-editor">
          <div className="fam-testimonial-editor-head">
            <strong>Testimonio {i + 1}</strong>
            {values.items.length > 1 && (
              <button type="button" className="fam-btn-remove" onClick={() => removeItem(i)}>
                <Trash2 size={14} /> Eliminar
              </button>
            )}
          </div>
          <Grid>
            <Field label="Nombre del cliente">
              <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Carlos Mendoza" />
            </Field>
            <Field label="Cargo / rol">
              <input value={item.role} onChange={e => updateItem(i, 'role', e.target.value)} placeholder="Director Comercial" />
            </Field>
            <Field label="Empresa" full>
              <input value={item.company} onChange={e => updateItem(i, 'company', e.target.value)} placeholder="Nombre de la empresa" />
            </Field>
            <Field label="Resultado destacado (aparece como chip)" full>
              <input value={item.result} onChange={e => updateItem(i, 'result', e.target.value)} placeholder="+127% en cierres · 3x más conversiones · 15 hrs ahorradas" />
            </Field>
            <Field label="Testimonio" full>
              <textarea
                rows={3}
                value={item.text}
                onChange={e => updateItem(i, 'text', e.target.value)}
                placeholder="Describe el resultado que obtuvo este cliente con tu servicio..."
              />
            </Field>
            <Field label="Iniciales para el avatar (máx 2 caracteres)">
              <input
                value={item.avatar}
                onChange={e => updateItem(i, 'avatar', e.target.value.slice(0, 2).toUpperCase())}
                placeholder="CM"
                maxLength={2}
              />
            </Field>
          </Grid>
        </div>
      ))}

      {values.items.length < 6 && (
        <button type="button" className="fam-btn-add" onClick={addItem}>
          <Plus size={15} /> Agregar testimonio
        </button>
      )}

      <div className="fam-info-box">
        <Star size={14} />
        <div>
          <strong>Consejo</strong>
          <p>Los mejores testimonios incluyen un resultado específico ("pasé de 12 a 47 cierres al mes"), el contexto del problema que tenían y por qué eligieron trabajar contigo.</p>
        </div>
      </div>
    </div>
  );
}

// ─── REUSABLE UI ATOMS ────────────────────────────────────────────────────────

function SectionHead({ title, description }) {
  return (
    <div className="fam-section-head">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Grid({ children }) {
  return <div className="fam-grid">{children}</div>;
}

function Field({ label, children, full = false, hint }) {
  return (
    <label className={`fam-field ${full ? 'fam-field-full' : ''}`}>
      <span>{label}</span>
      {children}
      {hint && <small className="fam-field-hint">{hint}</small>}
    </label>
  );
}

function Divider({ label }) {
  return (
    <div className="fam-divider">
      {label && <span>{label}</span>}
    </div>
  );
}

function Switch({ label, description, checked, onChange }) {
  return (
    <label className="fam-switch">
      <div className="fam-switch-text">
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </div>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={e => onChange(e.target.checked)}
      />
      <i className="fam-switch-track" />
    </label>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  .fam-overlay {
    position: fixed; inset: 0; z-index: 200;
    display: grid; place-items: center;
    padding: 20px;
    background: rgba(10,15,30,.6);
    backdrop-filter: blur(10px);
  }

  .fam-modal {
    width: min(1100px, 100%);
    max-height: min(880px, calc(100vh - 40px));
    display: grid;
    grid-template-rows: auto 1fr auto;
    overflow: hidden;
    border-radius: 22px;
    background: #f8fafc;
    border: 1px solid rgba(148,163,184,.15);
    box-shadow: 0 40px 120px rgba(10,15,30,.35);
  }

  /* HEADER */
  .fam-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
  }
  .fam-header-left { display: flex; align-items: center; gap: 14px; }
  .fam-header-icon {
    width: 42px; height: 42px;
    display: grid; place-items: center;
    border-radius: 12px;
    background: #ede9fe;
    color: #6d3af2;
    flex-shrink: 0;
  }
  .fam-header h2 { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 3px; }
  .fam-header p { font-size: 11px; color: #94a3b8; margin: 0; }
  .fam-close {
    width: 36px; height: 36px;
    display: grid; place-items: center;
    border: 1px solid #e2e8f0; border-radius: 10px;
    background: white; color: #64748b; cursor: pointer;
    transition: .2s;
  }
  .fam-close:hover { background: #f1f5f9; color: #334155; }

  /* BODY */
  .fam-body { display: grid; grid-template-columns: 200px 1fr; overflow: hidden; }

  /* TABS */
  .fam-tabs {
    display: flex; flex-direction: column; gap: 3px;
    padding: 14px 10px;
    background: white;
    border-right: 1px solid #e2e8f0;
    overflow-y: auto;
  }
  .fam-tab {
    display: flex; align-items: center; gap: 9px;
    padding: 10px 12px;
    border: 0; border-radius: 10px;
    background: transparent;
    color: #64748b; font-size: 13px; font-weight: 600;
    text-align: left; cursor: pointer;
    transition: .15s;
  }
  .fam-tab:hover { background: #f8fafc; color: #334155; }
  .fam-tab-active { background: #ede9fe !important; color: #6d3af2 !important; }

  /* CONTENT */
  .fam-content { overflow-y: auto; padding: 28px; }

  /* SECTION */
  .fam-section { max-width: 820px; display: flex; flex-direction: column; gap: 0; }
  .fam-section-head { margin-bottom: 24px; }
  .fam-section-head h3 { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 5px; }
  .fam-section-head p { font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0; }

  /* GRID */
  .fam-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 4px; }

  /* FIELD */
  .fam-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .fam-field-full { grid-column: 1 / -1; }
  .fam-field > span { font-size: 10px; font-weight: 800; color: #334155; letter-spacing: .03em; }
  .fam-field input, .fam-field textarea, .fam-field select {
    width: 100%; padding: 10px 12px;
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    background: white; color: #0f172a;
    font-size: 13px; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .fam-field input:focus, .fam-field textarea:focus, .fam-field select:focus {
    border-color: #6d3af2;
    box-shadow: 0 0 0 3px rgba(109,58,242,.1);
  }
  .fam-field textarea { resize: vertical; }
  .fam-field input[type="range"] { padding: 4px 0; accent-color: #6d3af2; border: 0; box-shadow: none; }
  .fam-field-hint, .fam-range-hint { font-size: 10px; color: #94a3b8; line-height: 1.45; }

  /* DIVIDER */
  .fam-divider {
    grid-column: 1 / -1;
    display: flex; align-items: center; gap: 10px;
    margin: 8px 0 4px;
  }
  .fam-divider::before, .fam-divider::after {
    content: ''; flex: 1; height: 1px; background: #e2e8f0;
  }
  .fam-divider span { font-size: 10px; font-weight: 700; color: #94a3b8; white-space: nowrap; letter-spacing: .04em; }

  /* SWITCH */
  .fam-switch {
    display: flex; align-items: center; justify-content: space-between; gap: 20px;
    padding: 14px 16px;
    margin-bottom: 16px;
    border: 1.5px solid #e2e8f0; border-radius: 12px;
    background: white; cursor: pointer;
    transition: border-color .2s;
  }
  .fam-switch:hover { border-color: #c4b5fd; }
  .fam-switch-text { display: flex; flex-direction: column; gap: 3px; }
  .fam-switch-text strong { font-size: 13px; color: #0f172a; }
  .fam-switch-text span { font-size: 11px; color: #94a3b8; line-height: 1.4; }
  .fam-switch input { position: absolute; opacity: 0; width: 0; height: 0; }
  .fam-switch-track {
    position: relative; width: 44px; height: 24px; flex-shrink: 0;
    border-radius: 999px; background: #cbd5e1;
    transition: background .2s;
  }
  .fam-switch-track::after {
    content: ''; position: absolute;
    top: 3px; left: 3px;
    width: 18px; height: 18px;
    border-radius: 50%; background: white;
    transition: transform .2s, box-shadow .2s;
    box-shadow: 0 1px 4px rgba(0,0,0,.2);
  }
  .fam-switch input:checked ~ .fam-switch-track { background: #6d3af2; }
  .fam-switch input:checked ~ .fam-switch-track::after { transform: translateX(20px); }

  /* PRODUCT LIST */
  .fam-product-list {
    border: 1.5px solid #e2e8f0; border-radius: 14px;
    overflow: hidden; background: white; margin-bottom: 16px;
  }
  .fam-product-list-head {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 16px;
    background: #f8fafc; border-bottom: 1px solid #e2e8f0;
  }
  .fam-product-list-head > div { display: flex; flex-direction: column; gap: 2px; }
  .fam-product-list-head strong { font-size: 12px; color: #0f172a; }
  .fam-product-list-head span { font-size: 10px; color: #94a3b8; }
  .fam-product-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 16px; border-bottom: 1px solid #f1f5f9;
  }
  .fam-product-row:last-child { border-bottom: 0; }
  .fam-product-check { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .fam-product-check input { accent-color: #6d3af2; width: 15px; height: 15px; cursor: pointer; }
  .fam-product-info { display: flex; flex-direction: column; gap: 2px; }
  .fam-product-info strong { font-size: 13px; color: #0f172a; }
  .fam-product-info small { font-size: 10px; color: #94a3b8; }
  .fam-radio-label { display: flex; align-items: center; cursor: pointer; }
  .fam-radio-label input { position: absolute; opacity: 0; }
  .fam-radio-star { color: #cbd5e1; transition: color .2s; }
  .fam-radio-star-active { color: #f59e0b; }

  /* INFO BOX */
  .fam-info-box {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 14px 16px;
    border-radius: 12px;
    background: #ede9fe;
    color: #5b21b6;
    margin-top: 8px;
  }
  .fam-info-box svg { flex-shrink: 0; margin-top: 1px; }
  .fam-info-box strong { display: block; font-size: 12px; margin-bottom: 3px; }
  .fam-info-box p { font-size: 11px; line-height: 1.55; margin: 0; color: #6d28d9; }

  /* TESTIMONIALS EDITOR */
  .fam-testimonial-editor {
    border: 1.5px solid #e2e8f0; border-radius: 14px;
    padding: 20px; background: white; margin-bottom: 14px;
  }
  .fam-testimonial-editor-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .fam-testimonial-editor-head strong { font-size: 13px; font-weight: 800; color: #0f172a; }
  .fam-btn-remove {
    display: flex; align-items: center; gap: 5px;
    padding: 6px 10px; border-radius: 8px;
    border: 1px solid #fecaca; background: #fef2f2;
    color: #dc2626; font-size: 11px; font-weight: 700;
    cursor: pointer; transition: .15s;
  }
  .fam-btn-remove:hover { background: #fee2e2; }
  .fam-btn-add {
    display: flex; align-items: center; gap: 8px;
    width: 100%; padding: 12px;
    border: 2px dashed #cbd5e1; border-radius: 12px;
    background: transparent; color: #64748b;
    font-size: 13px; font-weight: 700;
    cursor: pointer; justify-content: center;
    transition: .2s; margin-top: 4px;
  }
  .fam-btn-add:hover { border-color: #6d3af2; color: #6d3af2; background: #ede9fe; }

  /* EMPTY */
  .fam-empty {
    padding: 20px; color: #94a3b8; font-size: 12px;
    text-align: center; line-height: 1.5;
  }

  /* FOOTER */
  .fam-footer {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; padding: 16px 24px;
    background: white; border-top: 1px solid #e2e8f0;
    min-height: 72px;
  }
  .fam-footer-left { flex: 1; }
  .fam-footer-actions { display: flex; gap: 8px; }
  .fam-notice {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 600;
  }
  .fam-notice-success { color: #15803d; }
  .fam-notice-error { color: #dc2626; }
  .fam-btn-secondary {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 16px; border-radius: 10px;
    border: 1.5px solid #e2e8f0; background: white;
    color: #334155; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: .15s;
  }
  .fam-btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
  .fam-btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 10px;
    border: 0; background: #6d3af2;
    color: white; font-size: 12px; font-weight: 800;
    cursor: pointer; transition: .15s;
    box-shadow: 0 8px 24px rgba(109,58,242,.3);
  }
  .fam-btn-primary:hover { filter: brightness(1.08); }
  .fam-btn-primary:disabled { opacity: .65; cursor: wait; }

  /* RESPONSIVE */
  @media (max-width: 760px) {
    .fam-overlay { padding: 0; }
    .fam-modal { width: 100%; height: 100dvh; max-height: none; border-radius: 0; }
    .fam-body { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
    .fam-tabs { flex-direction: row; overflow-x: auto; padding: 8px; border-right: 0; border-bottom: 1px solid #e2e8f0; }
    .fam-tab { flex-shrink: 0; }
    .fam-grid { grid-template-columns: 1fr; }
    .fam-field-full { grid-column: auto; }
    .fam-footer { flex-direction: column; align-items: stretch; }
    .fam-footer-actions { flex-wrap: wrap; }
    .fam-footer-actions button { flex: 1; justify-content: center; }
  }
`;
