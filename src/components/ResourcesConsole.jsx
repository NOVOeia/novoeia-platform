import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  FileText,
  Image,
  ImagePlus,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Share2,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
  X,
} from 'lucide-react';

import { platformApi } from '../lib/platformApi.js';

const EMPTY_FORM = {
  id: '',
  title: '',
  description: '',
  resourceType: 'video',
  sourceType: 'url',
  category: '',
  mediaUrl: '',
  thumbnailUrl: '',
  shareText: '',
  status: 'draft',
  isFeatured: false,
  sortOrder: 0,
  metadata: {},
};

const RESOURCE_TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Imagen' },
  { value: 'document', label: 'Documento' },
  { value: 'link', label: 'Enlace' },
];

const RESOURCE_STATUSES = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
];

/* =================================
   RECURSOS — SUPER ADMIN
================================= */
export function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [mediaFile, setMediaFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [notice, setNotice] = useState(null);

  const [filters, setFilters] = useState({
    status: 'all',
    resourceType: 'all',
    category: '',
    search: '',
  });

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);

      const response = await platformApi.listPartnerResources({
        status: filters.status,
        resourceType: filters.resourceType,
        category: filters.category || undefined,
      });

      setResources(normalizeResourceList(response));
    } catch (error) {
      setNotice({
        type: 'error',
        text: error.message || 'No se pudieron cargar los recursos.',
      });
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.resourceType, filters.category]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const visibleResources = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return resources
      .filter((resource) => {
        if (
          filters.status !== 'all'
          && resource.status !== filters.status
        ) {
          return false;
        }

        if (
          filters.resourceType !== 'all'
          && resource.resource_type !== filters.resourceType
        ) {
          return false;
        }

        if (
          filters.category
          && resource.category !== filters.category
        ) {
          return false;
        }

        if (!search) return true;

        return [
          resource.title,
          resource.description,
          resource.category,
          resource.share_text,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(search)
          );
      })
      .sort((a, b) => {
        const featuredDifference =
          Number(b.is_featured) - Number(a.is_featured);

        if (featuredDifference !== 0) return featuredDifference;

        const orderDifference =
          Number(a.sort_order || 0) - Number(b.sort_order || 0);

        if (orderDifference !== 0) return orderDifference;

        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [resources, filters]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        resources
          .map((resource) => resource.category)
          .filter(Boolean)
      )
    ).sort();
  }, [resources]);

  function openNewResource() {
    setForm({ ...EMPTY_FORM, metadata: {} });
    setMediaFile(null);
    setThumbnailFile(null);
    setShowForm(true);
    setNotice(null);
  }

  function openEditResource(resource) {
    setForm(resourceToForm(resource));
    setMediaFile(null);
    setThumbnailFile(null);
    setShowForm(true);
    setNotice(null);
  }

  function closeForm() {
    if (busy) return;

    setShowForm(false);
    setForm({ ...EMPTY_FORM, metadata: {} });
    setMediaFile(null);
    setThumbnailFile(null);
  }

  async function saveResource() {
    if (!form.title.trim()) {
      setNotice({
        type: 'error',
        text: 'Escribe el título del recurso.',
      });
      return;
    }

    if (
      form.sourceType === 'url'
      && !form.mediaUrl.trim()
    ) {
      setNotice({
        type: 'error',
        text: 'Agrega la URL principal del recurso.',
      });
      return;
    }

    if (
      form.sourceType === 'upload'
      && !form.mediaUrl
      && !mediaFile
    ) {
      setNotice({
        type: 'error',
        text: 'Selecciona el archivo que deseas subir.',
      });
      return;
    }

    try {
      setBusy(true);
      setNotice(null);

      let mediaUrl = form.mediaUrl.trim();
      let thumbnailUrl = form.thumbnailUrl.trim();
      const metadata = {
        ...(form.metadata || {}),
      };

      if (mediaFile) {
        const uploadedMedia =
          await platformApi.uploadPartnerResource(mediaFile, {
            folder: `media/${form.resourceType}`,
          });

        mediaUrl = getUploadedUrl(uploadedMedia);

        const mediaPath = getUploadedPath(uploadedMedia);

        if (!mediaUrl) {
          throw new Error(
            'La subida terminó, pero no se recibió la URL del archivo.'
          );
        }

        if (mediaPath) {
          metadata.media_path = mediaPath;
        }

        metadata.original_file_name = mediaFile.name;
        metadata.media_mime_type = mediaFile.type;
        metadata.media_size = mediaFile.size;
      }

      if (thumbnailFile) {
        const uploadedThumbnail =
          await platformApi.uploadPartnerResource(thumbnailFile, {
            folder: 'thumbnails',
          });

        thumbnailUrl = getUploadedUrl(uploadedThumbnail);

        const thumbnailPath = getUploadedPath(uploadedThumbnail);

        if (!thumbnailUrl) {
          throw new Error(
            'La portada se subió, pero no se recibió su URL.'
          );
        }

        if (thumbnailPath) {
          metadata.thumbnail_path = thumbnailPath;
        }
      }

      await platformApi.savePartnerResource({
        id: form.id || undefined,
        title: form.title.trim(),
        description: form.description.trim(),
        resourceType: form.resourceType,
        sourceType: form.sourceType,
        category: form.category.trim(),
        mediaUrl,
        thumbnailUrl,
        shareText: form.shareText.trim(),
        status: form.status,
        isFeatured: Boolean(form.isFeatured),
        sortOrder: Number(form.sortOrder || 0),
        metadata,
      });

      setNotice({
        type: 'success',
        text: form.id
          ? 'Recurso actualizado correctamente.'
          : 'Recurso creado correctamente.',
      });

      closeForm();
      await loadResources();
    } catch (error) {
      setNotice({
        type: 'error',
        text: error.message || 'No se pudo guardar el recurso.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(resource, status) {
    try {
      setBusy(true);

      await platformApi.updatePartnerResourceStatus(
        resource.id,
        status
      );

      setNotice({
        type: 'success',
        text:
          status === 'published'
            ? 'Recurso publicado.'
            : status === 'archived'
              ? 'Recurso archivado.'
              : 'Recurso guardado como borrador.',
      });

      await loadResources();
    } catch (error) {
      setNotice({
        type: 'error',
        text: error.message || 'No se pudo cambiar el estado.',
      });
    } finally {
      setBusy(false);
    }
  }

  async function removeResource(resource) {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente "${resource.title}"?`
    );

    if (!confirmed) return;

    try {
      setBusy(true);

      const mediaPath =
        resource.metadata?.media_path
        || resource.metadata?.mediaPath;

      const thumbnailPath =
        resource.metadata?.thumbnail_path
        || resource.metadata?.thumbnailPath;

      if (mediaPath) {
        await platformApi
          .deletePartnerResourceFile(mediaPath)
          .catch(() => {});
      }

      if (thumbnailPath) {
        await platformApi
          .deletePartnerResourceFile(thumbnailPath)
          .catch(() => {});
      }

      await platformApi.deletePartnerResource(resource.id);

      setNotice({
        type: 'success',
        text: 'Recurso eliminado.',
      });

      await loadResources();
    } catch (error) {
      setNotice({
        type: 'error',
        text: error.message || 'No se pudo eliminar el recurso.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="novo-page">
      <div
        className="novo-page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 18,
        }}
      >
        <div>
          <span className="kicker">BIBLIOTECA PARTNER</span>
          <h1>Recursos</h1>
          <p>
            Publica videos, imágenes, documentos y materiales
            comerciales para todos los Partners.
          </p>
        </div>

        <button
          className="novo-btn novo-btn-primary"
          onClick={openNewResource}
        >
          <Plus size={15} />
          Nuevo recurso
        </button>
      </div>

      {notice && (
        <ResourceNotice
          {...notice}
          onClose={() => setNotice(null)}
        />
      )}

      {showForm && (
        <ResourceEditor
          form={form}
          setForm={setForm}
          mediaFile={mediaFile}
          setMediaFile={setMediaFile}
          thumbnailFile={thumbnailFile}
          setThumbnailFile={setThumbnailFile}
          busy={busy}
          onSave={saveResource}
          onCancel={closeForm}
        />
      )}

      <div
        className="novo-card"
        style={{ marginBottom: 18 }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(200px, 1.4fr) repeat(3, minmax(150px, .7fr)) auto',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <div className="novo-field">
            <label>Buscar</label>

            <div
              className="novo-search"
              style={{ width: '100%' }}
            >
              <Search size={13} />

              <input
                value={filters.search}
                placeholder="Título, categoría o descripción"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <ResourceSelect
            label="Estado"
            value={filters.status}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                status: value,
              }))
            }
          >
            <option value="all">Todos</option>

            {RESOURCE_STATUSES.map((status) => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </option>
            ))}
          </ResourceSelect>

          <ResourceSelect
            label="Tipo"
            value={filters.resourceType}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                resourceType: value,
              }))
            }
          >
            <option value="all">Todos</option>

            {RESOURCE_TYPES.map((type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ))}
          </ResourceSelect>

          <ResourceSelect
            label="Categoría"
            value={filters.category}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                category: value,
              }))
            }
          >
            <option value="">Todas</option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </ResourceSelect>

          <button
            className="novo-btn novo-btn-ghost"
            onClick={loadResources}
            disabled={loading}
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>
      </div>

      {loading && (
        <div className="novo-card">
          <ResourceEmpty
            icon={Loader2}
            title="Cargando recursos…"
            spinning
          />
        </div>
      )}

      {!loading && visibleResources.length === 0 && (
        <div className="novo-card">
          <ResourceEmpty
            icon={ImagePlus}
            title="No hay recursos disponibles"
            description="Crea el primer recurso para la biblioteca de Partners."
          />
        </div>
      )}

      {!loading && visibleResources.length > 0 && (
        <div style={resourceGridStyle}>
          {visibleResources.map((resource) => (
            <AdminResourceCard
              key={resource.id}
              resource={resource}
              busy={busy}
              onEdit={() => openEditResource(resource)}
              onStatusChange={(status) =>
                changeStatus(resource, status)
              }
              onDelete={() => removeResource(resource)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =================================
   RECURSOS — PARTNER
================================= */
export function PartnerResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const [filters, setFilters] = useState({
    resourceType: 'all',
    category: '',
    search: '',
  });

  const loadResources = useCallback(async () => {
    try {
      setLoading(true);

      const response = await platformApi.listPartnerResources({
        status: 'published',
        resourceType: filters.resourceType,
        category: filters.category || undefined,
      });

      setResources(normalizeResourceList(response));
    } catch (error) {
      setNotice({
        type: 'error',
        text:
          error.message
          || 'No se pudo cargar la biblioteca de recursos.',
      });
    } finally {
      setLoading(false);
    }
  }, [filters.resourceType, filters.category]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        resources
          .map((resource) => resource.category)
          .filter(Boolean)
      )
    ).sort();
  }, [resources]);

  const visibleResources = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return resources
      .filter((resource) => {
        if (resource.status !== 'published') return false;

        if (
          filters.resourceType !== 'all'
          && resource.resource_type !== filters.resourceType
        ) {
          return false;
        }

        if (
          filters.category
          && resource.category !== filters.category
        ) {
          return false;
        }

        if (!search) return true;

        return [
          resource.title,
          resource.description,
          resource.category,
          resource.share_text,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(search)
          );
      })
      .sort((a, b) => {
        const featuredDifference =
          Number(b.is_featured) - Number(a.is_featured);

        if (featuredDifference !== 0) return featuredDifference;

        const orderDifference =
          Number(a.sort_order || 0) - Number(b.sort_order || 0);

        if (orderDifference !== 0) return orderDifference;

        return new Date(b.published_at || b.created_at || 0)
          - new Date(a.published_at || a.created_at || 0);
      });
  }, [resources, filters]);

  async function handleCopy(resource) {
    try {
      const text =
        resource.share_text
        || `${resource.title}\n${resource.media_url}`;

      await copyText(text);

      setNotice({
        type: 'success',
        text: 'Texto copiado.',
      });
    } catch {
      setNotice({
        type: 'error',
        text: 'No se pudo copiar el contenido.',
      });
    }
  }

  async function handleShare(resource) {
    try {
      const text =
        resource.share_text
        || resource.description
        || resource.title;

      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text,
          url: resource.media_url,
        });

        return;
      }

      await copyText(
        `${resource.title}\n${text}\n${resource.media_url}`
      );

      setNotice({
        type: 'success',
        text: 'Información copiada para compartir.',
      });
    } catch (error) {
      if (error?.name === 'AbortError') return;

      setNotice({
        type: 'error',
        text: 'No se pudo compartir el recurso.',
      });
    }
  }

  return (
    <div className="novo-page">
      <div className="novo-page-header">
        <span className="kicker">CENTRO DE CONTENIDOS</span>
        <h1>Recursos</h1>
        <p>
          Materiales listos para descargar, copiar y compartir
          con tus clientes.
        </p>
      </div>

      {notice && (
        <ResourceNotice
          {...notice}
          onClose={() => setNotice(null)}
        />
      )}

      <div
        className="novo-card"
        style={{ marginBottom: 18 }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 1.4fr) repeat(2, minmax(160px, .7fr)) auto',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <div className="novo-field">
            <label>Buscar recurso</label>

            <div
              className="novo-search"
              style={{ width: '100%' }}
            >
              <Search size={13} />

              <input
                value={filters.search}
                placeholder="Buscar videos, imágenes o categorías"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    search: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <ResourceSelect
            label="Tipo"
            value={filters.resourceType}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                resourceType: value,
              }))
            }
          >
            <option value="all">Todos</option>

            {RESOURCE_TYPES.map((type) => (
              <option
                key={type.value}
                value={type.value}
              >
                {type.label}
              </option>
            ))}
          </ResourceSelect>

          <ResourceSelect
            label="Categoría"
            value={filters.category}
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                category: value,
              }))
            }
          >
            <option value="">Todas</option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </ResourceSelect>

          <button
            className="novo-btn novo-btn-ghost"
            onClick={loadResources}
            disabled={loading}
          >
            <RefreshCw size={14} />
            Actualizar
          </button>
        </div>
      </div>

      {loading && (
        <div className="novo-card">
          <ResourceEmpty
            icon={Loader2}
            title="Cargando biblioteca…"
            spinning
          />
        </div>
      )}

      {!loading && visibleResources.length === 0 && (
        <div className="novo-card">
          <ResourceEmpty
            icon={FileText}
            title="No hay recursos publicados"
            description="Los nuevos materiales aparecerán aquí cuando sean publicados."
          />
        </div>
      )}

      {!loading && visibleResources.length > 0 && (
        <div style={resourceGridStyle}>
          {visibleResources.map((resource) => (
            <PartnerResourceCard
              key={resource.id}
              resource={resource}
              onCopy={() => handleCopy(resource)}
              onShare={() => handleShare(resource)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =================================
   FORMULARIO DE RECURSO
================================= */
function ResourceEditor({
  form,
  setForm,
  mediaFile,
  setMediaFile,
  thumbnailFile,
  setThumbnailFile,
  busy,
  onSave,
  onCancel,
}) {
  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div
      className="novo-card"
      style={{
        marginBottom: 20,
        border: '1px solid rgba(124,58,237,.35)',
      }}
    >
      <div className="novo-card-header">
        <div>
          <div className="novo-card-title">
            {form.id ? 'Editar recurso' : 'Nuevo recurso'}
          </div>

          <div className="novo-card-sub">
            Define el contenido que recibirán los Partners.
          </div>
        </div>

        <button
          className="novo-btn novo-btn-ghost"
          onClick={onCancel}
          disabled={busy}
        >
          <X size={14} />
        </button>
      </div>

      <div className="novo-grid-2">
        <ResourceField
          label="Título *"
          value={form.title}
          onChange={(value) => update('title', value)}
        />

        <ResourceField
          label="Categoría"
          value={form.category}
          placeholder="Ejemplo: Ventas, Redes sociales, Tutoriales"
          onChange={(value) => update('category', value)}
        />

        <ResourceSelect
          label="Tipo de recurso"
          value={form.resourceType}
          onChange={(value) => update('resourceType', value)}
        >
          {RESOURCE_TYPES.map((type) => (
            <option
              key={type.value}
              value={type.value}
            >
              {type.label}
            </option>
          ))}
        </ResourceSelect>

        <ResourceSelect
          label="Origen"
          value={form.sourceType}
          onChange={(value) => update('sourceType', value)}
        >
          <option value="url">URL externa</option>
          <option value="upload">Subir archivo</option>
        </ResourceSelect>

        <ResourceSelect
          label="Estado"
          value={form.status}
          onChange={(value) => update('status', value)}
        >
          {RESOURCE_STATUSES.map((status) => (
            <option
              key={status.value}
              value={status.value}
            >
              {status.label}
            </option>
          ))}
        </ResourceSelect>

        <ResourceField
          label="Orden"
          type="number"
          value={form.sortOrder}
          onChange={(value) => update('sortOrder', value)}
        />
      </div>

      <div className="novo-field">
        <label>Descripción</label>

        <textarea
          rows={3}
          value={form.description}
          onChange={(event) =>
            update('description', event.target.value)
          }
          style={textareaStyle}
          placeholder="Explica para qué sirve este recurso."
        />
      </div>

      {form.sourceType === 'url' ? (
        <div className="novo-grid-2">
          <ResourceField
            label="URL principal *"
            value={form.mediaUrl}
            placeholder="https://..."
            onChange={(value) => update('mediaUrl', value)}
          />

          <ResourceField
            label="URL de portada"
            value={form.thumbnailUrl}
            placeholder="https://..."
            onChange={(value) =>
              update('thumbnailUrl', value)
            }
          />
        </div>
      ) : (
        <div className="novo-grid-2">
          <FileSelector
            label="Archivo principal *"
            icon={UploadCloud}
            file={mediaFile}
            currentUrl={form.mediaUrl}
            accept={acceptForResourceType(form.resourceType)}
            onChange={setMediaFile}
          />

          <FileSelector
            label="Portada o miniatura"
            icon={ImagePlus}
            file={thumbnailFile}
            currentUrl={form.thumbnailUrl}
            accept="image/png,image/jpeg,image/webp"
            onChange={setThumbnailFile}
          />
        </div>
      )}

      <div className="novo-field">
        <label>Texto sugerido para compartir</label>

        <textarea
          rows={3}
          value={form.shareText}
          onChange={(event) =>
            update('shareText', event.target.value)
          }
          style={textareaStyle}
          placeholder="Texto listo para que el Partner copie y comparta."
        />
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          color: 'var(--novo-text)',
          fontSize: 13,
          marginBottom: 18,
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(event) =>
            update('isFeatured', event.target.checked)
          }
        />

        <Sparkles
          size={14}
          style={{ color: 'var(--novo-purple)' }}
        />

        Mostrar como recurso destacado
      </label>

      {(form.mediaUrl || mediaFile) && (
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--novo-muted)',
              fontWeight: 700,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            Vista previa actual
          </div>

          <ResourcePreview
            resource={{
              resource_type: form.resourceType,
              media_url:
                mediaFile
                  ? URL.createObjectURL(mediaFile)
                  : form.mediaUrl,
              thumbnail_url:
                thumbnailFile
                  ? URL.createObjectURL(thumbnailFile)
                  : form.thumbnailUrl,
              title: form.title,
            }}
          />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <button
          className="novo-btn novo-btn-primary"
          onClick={onSave}
          disabled={busy}
        >
          {busy ? (
            <Loader2
              size={14}
              style={{
                animation: 'novoSpin .8s linear infinite',
              }}
            />
          ) : (
            <Save size={14} />
          )}

          {form.id ? 'Actualizar recurso' : 'Crear recurso'}
        </button>

        <button
          className="novo-btn novo-btn-ghost"
          onClick={onCancel}
          disabled={busy}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

/* =================================
   TARJETA SUPER ADMIN
================================= */
function AdminResourceCard({
  resource,
  busy,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  return (
    <div
      className="novo-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ResourcePreview resource={resource} />

      <div
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--novo-text)',
                lineHeight: 1.25,
              }}
            >
              {resource.title}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                marginTop: 7,
              }}
            >
              <ResourceBadge
                status={resource.status}
              />

              <TypeBadge
                type={resource.resource_type}
              />

              {resource.is_featured && (
                <span
                  className="novo-badge active"
                  style={{
                    display: 'inline-flex',
                    gap: 4,
                    alignItems: 'center',
                  }}
                >
                  <Sparkles size={10} />
                  Destacado
                </span>
              )}
            </div>
          </div>
        </div>

        {resource.category && (
          <div
            style={{
              fontSize: 11,
              color: 'var(--novo-purple)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.05em',
              marginBottom: 8,
            }}
          >
            {resource.category}
          </div>
        )}

        {resource.description && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--novo-muted)',
              lineHeight: 1.55,
              margin: '0 0 14px',
            }}
          >
            {resource.description}
          </p>
        )}

        <div
          style={{
            fontSize: 11,
            color: 'var(--novo-muted)',
            marginTop: 'auto',
            marginBottom: 12,
          }}
        >
          Actualizado:{' '}
          {formatDate(
            resource.updated_at || resource.created_at
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          <button
            className="novo-btn novo-btn-ghost"
            style={smallButtonStyle}
            onClick={onEdit}
          >
            <Edit2 size={12} />
            Editar
          </button>

          {resource.status !== 'published' && (
            <button
              className="novo-btn novo-btn-primary"
              style={smallButtonStyle}
              onClick={() => onStatusChange('published')}
              disabled={busy}
            >
              <CheckCircle2 size={12} />
              Publicar
            </button>
          )}

          {resource.status === 'published' && (
            <button
              className="novo-btn novo-btn-ghost"
              style={smallButtonStyle}
              onClick={() => onStatusChange('draft')}
              disabled={busy}
            >
              <FileText size={12} />
              Borrador
            </button>
          )}

          {resource.status !== 'archived' && (
            <button
              className="novo-btn novo-btn-ghost"
              style={smallButtonStyle}
              onClick={() => onStatusChange('archived')}
              disabled={busy}
            >
              <Archive size={12} />
              Archivar
            </button>
          )}

          <button
            className="novo-btn novo-btn-ghost"
            style={smallButtonStyle}
            onClick={onDelete}
            disabled={busy}
          >
            <Trash2 size={12} />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

/* =================================
   TARJETA PARTNER
================================= */
function PartnerResourceCard({
  resource,
  onCopy,
  onShare,
}) {
  return (
    <div
      className="novo-card"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ResourcePreview resource={resource} />

      <div
        style={{
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginBottom: 9,
          }}
        >
          <TypeBadge type={resource.resource_type} />

          {resource.category && (
            <span className="novo-badge pending">
              {resource.category}
            </span>
          )}

          {resource.is_featured && (
            <span
              className="novo-badge active"
              style={{
                display: 'inline-flex',
                gap: 4,
                alignItems: 'center',
              }}
            >
              <Sparkles size={10} />
              Destacado
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--novo-text)',
            marginBottom: 7,
          }}
        >
          {resource.title}
        </div>

        {resource.description && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--novo-muted)',
              lineHeight: 1.55,
              margin: '0 0 14px',
            }}
          >
            {resource.description}
          </p>
        )}

        {resource.share_text && (
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.5,
              color: 'var(--novo-text)',
              background: 'var(--novo-card-hover)',
              border: '1px solid var(--novo-border)',
              padding: '10px 12px',
              borderRadius: 9,
              marginBottom: 14,
            }}
          >
            {resource.share_text}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginTop: 'auto',
          }}
        >
          <button
            className="novo-btn novo-btn-primary"
            style={smallButtonStyle}
            onClick={onShare}
          >
            <Share2 size={12} />
            Compartir
          </button>

          <button
            className="novo-btn novo-btn-ghost"
            style={smallButtonStyle}
            onClick={onCopy}
          >
            <Copy size={12} />
            Copiar texto
          </button>

          {resource.media_url && (
            <a
              className="novo-btn novo-btn-ghost"
              style={smallButtonStyle}
              href={resource.media_url}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={12} />
              Abrir
            </a>
          )}

          {resource.media_url && (
            <a
              className="novo-btn novo-btn-ghost"
              style={smallButtonStyle}
              href={resource.media_url}
              download
              target="_blank"
              rel="noreferrer"
            >
              <Download size={12} />
              Descargar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* =================================
   VISTA PREVIA
================================= */
function ResourcePreview({ resource }) {
  const type =
    resource.resource_type
    || resource.resourceType
    || 'link';

  const mediaUrl =
    resource.media_url
    || resource.mediaUrl
    || '';

  const thumbnailUrl =
    resource.thumbnail_url
    || resource.thumbnailUrl
    || '';

  const title = resource.title || 'Recurso';

  const youtubeUrl = getYoutubeEmbedUrl(mediaUrl);

  if (type === 'video' && youtubeUrl) {
    return (
      <div style={previewContainerStyle}>
        <iframe
          src={youtubeUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </div>
    );
  }

  if (
    type === 'video'
    && mediaUrl
    && isDirectVideo(mediaUrl)
  ) {
    return (
      <div style={previewContainerStyle}>
        <video
          src={mediaUrl}
          poster={thumbnailUrl || undefined}
          controls
          preload="metadata"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            background: '#050509',
          }}
        />
      </div>
    );
  }

  if (type === 'image' && mediaUrl) {
    return (
      <div style={previewContainerStyle}>
        <img
          src={mediaUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  if (thumbnailUrl) {
    return (
      <div style={previewContainerStyle}>
        <img
          src={thumbnailUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  const Icon =
    type === 'video'
      ? Video
      : type === 'image'
        ? Image
        : type === 'document'
          ? FileText
          : Link2;

  return (
    <div
      style={{
        ...previewContainerStyle,
        display: 'grid',
        placeItems: 'center',
        background:
          'linear-gradient(135deg, rgba(124,58,237,.16), rgba(59,130,246,.08))',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: 'var(--novo-purple)',
        }}
      >
        <Icon
          size={38}
          style={{ opacity: 0.75 }}
        />

        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            marginTop: 8,
            textTransform: 'uppercase',
            letterSpacing: '.08em',
          }}
        >
          {resourceTypeLabel(type)}
        </div>
      </div>
    </div>
  );
}

/* =================================
   COMPONENTES AUXILIARES
================================= */
function ResourceField({
  label,
  value = '',
  type = 'text',
  placeholder = '',
  onChange,
}) {
  return (
    <div className="novo-field">
      <label>{label}</label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
      />
    </div>
  );
}

function ResourceSelect({
  label,
  value,
  onChange,
  children,
  disabled = false,
}) {
  return (
    <div className="novo-field">
      <label>{label}</label>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
      >
        {children}
      </select>
    </div>
  );
}

function FileSelector({
  label,
  icon: Icon,
  file,
  currentUrl,
  accept,
  onChange,
}) {
  return (
    <div className="novo-field">
      <label>{label}</label>

      <label
        className="novo-btn novo-btn-secondary"
        style={{
          minHeight: 42,
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Icon size={14} />

        {file
          ? file.name
          : currentUrl
            ? 'Reemplazar archivo'
            : 'Seleccionar archivo'}

        <input
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(event) =>
            onChange(event.target.files?.[0] || null)
          }
        />
      </label>

      {currentUrl && !file && (
        <div
          style={{
            fontSize: 11,
            color: 'var(--novo-success)',
            marginTop: 6,
          }}
        >
          Ya existe un archivo guardado.
        </div>
      )}

      {file && (
        <div
          style={{
            fontSize: 11,
            color: 'var(--novo-muted)',
            marginTop: 6,
          }}
        >
          {formatFileSize(file.size)}
        </div>
      )}
    </div>
  );
}

function ResourceBadge({ status }) {
  const labels = {
    draft: 'Borrador',
    published: 'Publicado',
    archived: 'Archivado',
  };

  const className =
    status === 'published'
      ? 'active'
      : status === 'archived'
        ? 'inactive'
        : 'pending';

  return (
    <span className={`novo-badge ${className}`}>
      {labels[status] || status}
    </span>
  );
}

function TypeBadge({ type }) {
  const Icon =
    type === 'video'
      ? Video
      : type === 'image'
        ? Image
        : type === 'document'
          ? FileText
          : Link2;

  return (
    <span
      className="novo-badge pending"
      style={{
        display: 'inline-flex',
        gap: 4,
        alignItems: 'center',
      }}
    >
      <Icon size={10} />
      {resourceTypeLabel(type)}
    </span>
  );
}

function ResourceNotice({
  type,
  text,
  onClose,
}) {
  return (
    <div
      className={`novo-notice ${type}`}
      style={{ marginBottom: 16 }}
    >
      {type === 'success' ? (
        <CheckCircle2 size={15} />
      ) : (
        <AlertCircle size={15} />
      )}

      <span style={{ flex: 1 }}>{text}</span>

      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'none',
          border: 0,
          padding: 0,
          color: 'inherit',
          cursor: 'pointer',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

function ResourceEmpty({
  icon: Icon,
  title,
  description,
  spinning = false,
}) {
  return (
    <div
      className="novo-empty"
      style={{ padding: '54px 24px' }}
    >
      <Icon
        size={36}
        style={{
          opacity: 0.22,
          marginBottom: 12,
          animation: spinning
            ? 'novoSpin .8s linear infinite'
            : undefined,
        }}
      />

      <div
        style={{
          color: 'var(--novo-text)',
          fontWeight: 700,
          marginBottom: description ? 5 : 0,
        }}
      >
        {title}
      </div>

      {description && (
        <div
          style={{
            color: 'var(--novo-muted)',
            fontSize: 13,
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}

/* =================================
   FUNCIONES DE DATOS
================================= */
function normalizeResourceList(response) {
  const rows = Array.isArray(response)
    ? response
    : response?.resources
      || response?.data
      || [];

  return rows.map((resource) => ({
    ...resource,
    resource_type:
      resource.resource_type
      || resource.resourceType
      || 'link',
    source_type:
      resource.source_type
      || resource.sourceType
      || 'url',
    media_url:
      resource.media_url
      || resource.mediaUrl
      || '',
    thumbnail_url:
      resource.thumbnail_url
      || resource.thumbnailUrl
      || '',
    share_text:
      resource.share_text
      || resource.shareText
      || '',
    is_featured:
      resource.is_featured
      ?? resource.isFeatured
      ?? false,
    sort_order:
      resource.sort_order
      ?? resource.sortOrder
      ?? 0,
    metadata:
      resource.metadata
      && typeof resource.metadata === 'object'
        ? resource.metadata
        : {},
  }));
}

function resourceToForm(resource) {
  return {
    id: resource.id || '',
    title: resource.title || '',
    description: resource.description || '',
    resourceType:
      resource.resource_type
      || resource.resourceType
      || 'video',
    sourceType:
      resource.source_type
      || resource.sourceType
      || 'url',
    category: resource.category || '',
    mediaUrl:
      resource.media_url
      || resource.mediaUrl
      || '',
    thumbnailUrl:
      resource.thumbnail_url
      || resource.thumbnailUrl
      || '',
    shareText:
      resource.share_text
      || resource.shareText
      || '',
    status: resource.status || 'draft',
    isFeatured:
      resource.is_featured
      ?? resource.isFeatured
      ?? false,
    sortOrder:
      resource.sort_order
      ?? resource.sortOrder
      ?? 0,
    metadata:
      resource.metadata
      && typeof resource.metadata === 'object'
        ? resource.metadata
        : {},
  };
}

function getUploadedUrl(result) {
  return (
    result?.publicUrl
    || result?.public_url
    || result?.url
    || result?.mediaUrl
    || result?.media_url
    || result?.data?.publicUrl
    || result?.data?.public_url
    || result?.data?.url
    || ''
  );
}

function getUploadedPath(result) {
  return (
    result?.path
    || result?.storagePath
    || result?.storage_path
    || result?.fullPath
    || result?.full_path
    || result?.data?.path
    || result?.data?.storagePath
    || result?.data?.storage_path
    || ''
  );
}

function resourceTypeLabel(type) {
  return {
    video: 'Video',
    image: 'Imagen',
    document: 'Documento',
    link: 'Enlace',
  }[type] || 'Recurso';
}

function acceptForResourceType(type) {
  if (type === 'video') {
    return 'video/mp4,video/webm,video/quicktime';
  }

  if (type === 'image') {
    return 'image/png,image/jpeg,image/webp,image/gif';
  }

  if (type === 'document') {
    return '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip';
  }

  return '*/*';
}

function getYoutubeEmbedUrl(url) {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');

      return id
        ? `https://www.youtube.com/embed/${id}`
        : '';
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        return url;
      }

      const id = parsed.searchParams.get('v');

      return id
        ? `https://www.youtube.com/embed/${id}`
        : '';
    }

    return '';
  } catch {
    return '';
  }
}

function isDirectVideo(url) {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('es-US');
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';

  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

/* =================================
   ESTILOS INTERNOS
================================= */
const resourceGridStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 18,
};

const previewContainerStyle = {
  width: '100%',
  aspectRatio: '16 / 9',
  overflow: 'hidden',
  background: 'var(--novo-card-hover)',
  borderBottom: '1px solid var(--novo-border)',
};

const textareaStyle = {
  width: '100%',
  resize: 'vertical',
  background: 'var(--novo-card-hover)',
  border: '1px solid var(--novo-border)',
  borderRadius: 8,
  padding: '10px 12px',
  color: 'var(--novo-text)',
  fontSize: 13,
  lineHeight: 1.5,
  outline: 'none',
};

const smallButtonStyle = {
  padding: '5px 9px',
  fontSize: 11,
};