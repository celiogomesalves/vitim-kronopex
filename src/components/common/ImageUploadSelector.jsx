import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Check, Trash2 } from 'lucide-react';

const PRESET_GALLERY = [
  {
    name: 'Freios / Pastilhas',
    url: 'https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Velas / Ignição',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Óleo & Lubrificante',
    url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Amortecedor / Suspensão',
    url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Faróis / Iluminação',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Filtro de Ar / Motor',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80'
  }
];

export function ImageUploadSelector({ value, onChange }) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'url' | 'gallery'
  const [urlInput, setUrlInput] = useState(value?.startsWith('http') ? value : '');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    // Leitura como Data URL para persistência no localStorage
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        onChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleSelectPreset = (url) => {
    setUrlInput(url);
    onChange(url);
  };

  return (
    <div className="image-upload-selector-wrapper">
      <div className="flex-between mb-2">
        <label className="text-xs font-semibold text-main">Imagem da Peça / Produto *</label>
        <div className="flex-center gap-1">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`btn-tab-toggle ${tab === 'upload' ? 'active' : ''}`}
          >
            <Upload size={13} />
            <span>Galeria / Arquivo</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`btn-tab-toggle ${tab === 'url' ? 'active' : ''}`}
          >
            <LinkIcon size={13} />
            <span>URL Externa</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('gallery')}
            className={`btn-tab-toggle ${tab === 'gallery' ? 'active' : ''}`}
          >
            <ImageIcon size={13} />
            <span>Banco de Fotos</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Upload Arquivo / Galeria do Dispositivo */}
      {tab === 'upload' && (
        <div className="image-upload-zone" onClick={() => fileInputRef.current?.click()}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div className="text-center py-4">
            <Upload size={28} className="mx-auto mb-2 text-cyan" />
            <p className="text-xs text-main font-semibold">
              Clique para selecionar da galeria de fotos do seu dispositivo
            </p>
            <span className="text-xs text-muted block mt-1">
              Suporta PNG, JPG, JPEG ou WEBP (máx. 5MB)
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: URL Externa */}
      {tab === 'url' && (
        <div className="flex-center gap-2 mb-2">
          <input
            type="url"
            placeholder="Cole o link da imagem (ex: https://site.com/foto.jpg)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="btn btn-secondary btn-sm flex-center gap-1"
          >
            <Check size={14} />
            <span>Aplicar</span>
          </button>
        </div>
      )}

      {/* Tab 3: Banco de Fotos Automotivo */}
      {tab === 'gallery' && (
        <div className="preset-gallery-grid mb-2">
          {PRESET_GALLERY.map((item, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleSelectPreset(item.url)}
              className={`preset-thumb-btn ${value === item.url ? 'active' : ''}`}
              title={item.name}
            >
              <img src={item.url} alt={item.name} />
              <span className="preset-thumb-label">{item.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Preview atual */}
      {value && (
        <div className="image-preview-strip mt-3 flex-between p-2 rounded bg-surface">
          <div className="flex-center gap-3">
            <img src={value} alt="Preview da peça" className="preview-img-thumb" />
            <div>
              <span className="text-xs text-green font-bold flex-center gap-1">
                <Check size={13} /> Imagem selecionada
              </span>
              <span className="text-xs text-muted block truncate" style={{ maxWidth: '280px' }}>
                {value.startsWith('data:') ? 'Imagem carregada via upload local' : value}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setUrlInput('');
            }}
            className="btn btn-secondary btn-xs text-danger"
            title="Remover imagem"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
