import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin, Loader2, Anchor } from 'lucide-react';
import { locationsApi, type DiveSiteMarker } from '../services/api';
import StarRating from './StarRating';

interface SaveLocationModalProps {
  diveSite: DiveSiteMarker & { description?: string };
  onClose: () => void;
  onSaved: () => void;
}

export default function SaveLocationModal({ diveSite, onClose, onSaved }: SaveLocationModalProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [personalRating, setPersonalRating] = useState<number | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    setError(null);

    const result = await locationsApi.create({
      diveSiteId: diveSite.id,
      notes: notes || undefined,
      personalRating,
    });
    if (result.ok) {
      onSaved();
      onClose();
    } else {
      setError(result.error || t('saveLocationModal.failedToSave'));
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="p-5 border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-sea-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-xl flex items-center justify-center">
                <Anchor className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-abyss-900">{t('saveLocationModal.title')}</h2>
                <p className="text-xs text-abyss-500">{t('saveLocationModal.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ocean-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-abyss-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[calc(90vh-140px)] dive-scrollbar">
          <div className="space-y-5">
            <div className="bg-ocean-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-ocean-500" />
                <div>
                  <p className="text-sm font-semibold text-abyss-800">{diveSite.name}</p>
                  <p className="text-xs text-abyss-500 font-mono">
                    {diveSite.latitude.toFixed(4)}°, {diveSite.longitude.toFixed(4)}°
                  </p>
                </div>
              </div>
              {diveSite.description && (
                <p className="text-xs text-abyss-600 ml-8">{diveSite.description}</p>
              )}
              <div className="flex gap-2 ml-8 text-xs text-abyss-500">
                {diveSite.country && <span>{diveSite.country}</span>}
                {diveSite.region && <span>· {diveSite.region}</span>}
                {diveSite.maxDepthM != null && <span>· {diveSite.maxDepthM}m</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-abyss-600 mb-2">{t('saveLocationModal.ratingLabel')}</label>
              <StarRating value={personalRating} onChange={setPersonalRating} />
            </div>

            <div>
              <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('saveLocationModal.notesLabel')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none resize-none"
                placeholder={t('saveLocationModal.notesPlaceholder')}
              />
            </div>

            {error && (
              <div className="bg-coral-50 border border-coral-200 rounded-xl p-3 text-coral-600 text-sm">
                {error}
              </div>
            )}
          </div>
        </form>

        <div className="p-5 border-t border-ocean-100 bg-abyss-50 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-abyss-600 hover:bg-abyss-100 rounded-xl font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="btn-primary px-6 py-2.5 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('saveLocationModal.saving')}
              </>
            ) : (
              <>
                <Anchor className="w-4 h-4" />
                {t('saveLocationModal.saveButton')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
