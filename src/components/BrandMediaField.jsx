import { useState } from 'react';
import { Film, Globe, Image, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { platformApi } from '../lib/platformApi.js';

const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov';
const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp';

export default function BrandMediaField({
  label,
  value,
  onChange,
  uploadFolder = 'logos',
  assetType = 'image',
  required = false,
  helper,
  urlPlaceholder = 'https://...',
}) {
  const isVideo = assetType === 'video';
  const defaultHelper = isVideo
    ? 'MP4, WebM o MOV. Máximo 50 MB.'
    : 'PNG, JPG o WEBP. Máximo 2 MB.';

  const [mode, setMode] = useState(value ? 'url' : 'upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const result = await platformApi.uploadBrandAsset(file, { folder: uploadFolder, assetType });
      onChange(result.url);
      setMode('url');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  const PreviewIcon = isVideo ? Film : Image;

  return (
    <div className="novo-field brand-image-field">
      <label>{label}{required ? ' *' : ''}</label>

      <div className="brand-image-mode-tabs">
        <button
          type="button"
          className={mode === 'upload' ? 'active' : ''}
          onClick={() => setMode('upload')}
        >
          <UploadCloud size={13} /> Subir archivo
        </button>
        <button
          type="button"
          className={mode === 'url' ? 'active' : ''}
          onClick={() => setMode('url')}
        >
          <Globe size={13} /> Usar URL
        </button>
      </div>

      <div className="brand-image-row">
        <div className={`brand-image-preview ${isVideo ? 'brand-media-preview-video' : ''}`}>
          {!value && <span><PreviewIcon size={18} /></span>}
          {value && !isVideo && <img src={value} alt={label} />}
          {value && isVideo && isEmbeddableVideoUrl(value) && (
            <>
              <span><PreviewIcon size={18} /></span>
              <span className="brand-media-embed-badge">Enlace externo</span>
            </>
          )}
          {value && isVideo && !isEmbeddableVideoUrl(value) && (
            <video src={value} muted playsInline preload="metadata" />
          )}
        </div>

        {mode === 'url' ? (
          <input
            type="text"
            placeholder={isVideo ? 'YouTube, Vimeo, Loom o URL directa del video' : urlPlaceholder}
            value={value || ''}
            onChange={event => {
              setError('');
              onChange(event.target.value);
            }}
          />
        ) : (
          <label className="novo-btn novo-btn-secondary brand-image-upload-btn">
            {uploading ? (
              <Loader2 size={14} style={{ animation: 'novoSpin .8s linear infinite' }} />
            ) : (
              <UploadCloud size={14} />
            )}
            {uploading ? 'Subiendo…' : (isVideo ? 'Seleccionar video' : 'Seleccionar imagen')}
            <input
              type="file"
              accept={isVideo ? VIDEO_ACCEPT : IMAGE_ACCEPT}
              onChange={handleFile}
              disabled={uploading}
            />
          </label>
        )}

        {value && (
          <button
            type="button"
            className="novo-btn novo-btn-ghost brand-image-remove-btn"
            onClick={() => onChange('')}
          >
            <Trash2 size={13} /> Eliminar
          </button>
        )}
      </div>

      <small className={`brand-field-helper ${error ? 'brand-field-helper-error' : ''}`}>
        {error || helper || defaultHelper}
      </small>
    </div>
  );
}

function isEmbeddableVideoUrl(url = '') {
  return /youtube|youtu\.be|vimeo|loom\.com/i.test(String(url));
}
