import { useState } from 'react';
import { Globe, Image, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { platformApi } from '../lib/platformApi.js';

export default function BrandImageField({
  label,
  value,
  onChange,
  uploadFolder = 'logos',
  required = false,
  helper = 'PNG, JPG o WEBP. Máximo 2 MB.',
}) {
  const [mode, setMode] = useState(value ? 'url' : 'upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError('');
      const result = await platformApi.uploadBrandAsset(file, { folder: uploadFolder });
      onChange(result.url);
      setMode('url');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

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
        <div className="brand-image-preview">
          {value ? (
            <img src={value} alt={label} />
          ) : (
            <span><Image size={18} /></span>
          )}
        </div>

        {mode === 'url' ? (
          <input
            type="text"
            placeholder="https://..."
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
            {uploading ? 'Subiendo…' : 'Seleccionar imagen'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
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
        {error || helper}
      </small>
    </div>
  );
}
