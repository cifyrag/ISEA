import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Upload, Trash2, Loader2, ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { diveSiteImagesApi, type DiveSiteImage } from '../services/api';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface Props {
  diveSiteId: string;
  images: DiveSiteImage[];
  canUpload: boolean;
  canDelete: boolean;
  onImagesChanged: () => void;
}

export default function DiveSiteImageGallery({ diveSiteId, images, canUpload, canDelete, onImagesChanged }: Props) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const dragCounter = useRef(0);

  const validateAndUpload = useCallback(async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t('diveSiteImages.invalidType'));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(t('diveSiteImages.tooLarge', { max: MAX_SIZE_MB }));
      return;
    }

    setError(null);
    setUploading(true);
    const result = await diveSiteImagesApi.upload(diveSiteId, file);
    if (result.ok) {
      onImagesChanged();
    } else {
      setError(result.error);
    }
    setUploading(false);
  }, [diveSiteId, onImagesChanged, t]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    await validateAndUpload(file);
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await validateAndUpload(file);
    }
  }, [validateAndUpload]);

  const handleDelete = async (imageId: string) => {
    if (!window.confirm(t('diveSiteImages.deleteConfirm'))) return;
    setDeleting(imageId);
    setError(null);
    const result = await diveSiteImagesApi.delete(diveSiteId, imageId);
    if (result.ok) {
      if (lightboxIndex !== null) setLightboxIndex(null);
      onImagesChanged();
    } else {
      setError(result.error);
    }
    setDeleting(null);
  };

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const navigateLightbox = (direction: -1 | 1) => {
    if (lightboxIndex === null) return;
    const next = lightboxIndex + direction;
    if (next >= 0 && next < images.length) setLightboxIndex(next);
  };

  const dropZoneProps = canUpload ? {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  } : {};

  return (
    <div className="border-t border-ocean-100 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-abyss-500 uppercase tracking-wide flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-ocean-500" />
          {t('diveSiteImages.title')}
          {images.length > 0 && (
            <span className="text-xs font-normal text-abyss-400">({images.length})</span>
          )}
        </h2>
        {canUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-ocean-700 bg-ocean-50 hover:bg-ocean-100 rounded-xl transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading ? t('diveSiteImages.uploading') : t('diveSiteImages.upload')}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-coral-50 border border-coral-200 rounded-xl p-3 flex items-center gap-2 text-coral-600 text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="relative" {...dropZoneProps}>
        {canUpload && dragOver && (
          <div className="absolute inset-0 z-10 bg-ocean-50/90 border-2 border-dashed border-ocean-400 rounded-xl flex flex-col items-center justify-center pointer-events-none">
            <Upload className="w-10 h-10 text-ocean-500 mb-2" />
            <p className="text-sm font-medium text-ocean-700">{t('diveSiteImages.dropHere')}</p>
            <p className="text-xs text-ocean-500 mt-1">{t('diveSiteImages.dropHint')}</p>
          </div>
        )}

        {images.length === 0 ? (
          canUpload ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl p-8 text-center cursor-pointer transition-all border-2 border-dashed ${
                dragOver
                  ? 'border-ocean-400 bg-ocean-50'
                  : 'border-ocean-200 bg-abyss-50 hover:border-ocean-300 hover:bg-ocean-50/50'
              }`}
            >
              <Upload className="w-10 h-10 text-abyss-300 mx-auto mb-2" />
              <p className="text-sm text-abyss-500">{t('diveSiteImages.dragOrClick')}</p>
              <p className="text-xs text-abyss-400 mt-1">{t('diveSiteImages.dropHint')}</p>
            </div>
          ) : (
            <div className="bg-abyss-50 rounded-xl p-8 text-center">
              <ImageIcon className="w-10 h-10 text-abyss-300 mx-auto mb-2" />
              <p className="text-sm text-abyss-400">{t('diveSiteImages.noImages')}</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={image.id} className="relative group aspect-square rounded-xl overflow-hidden border border-ocean-100">
                <img
                  src={image.url}
                  alt={image.fileName}
                  className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => openLightbox(index)}
                  loading="lazy"
                />
                {canDelete && (
                  <button
                    onClick={() => handleDelete(image.id)}
                    disabled={deleting === image.id}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-coral-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                    title={t('diveSiteImages.delete')}
                  >
                    {deleting === image.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && images[lightboxIndex] && createPortal(
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center" style={{ zIndex: 9999 }}
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
              className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          {lightboxIndex < images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
              className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}

          <img
            src={images[lightboxIndex].url}
            alt={images[lightboxIndex].fileName}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
