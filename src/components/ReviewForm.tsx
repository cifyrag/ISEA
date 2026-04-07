import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Send, Upload, X } from 'lucide-react';
import StarRating from './StarRating';
import { reviewsApi } from '../services/api';
import type { CreateReviewRequest, UpdateReviewRequest, DiveSiteReview } from '../services/api/types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface ReviewFormProps {
  diveSiteId: string;
  onReviewSubmitted: (review: DiveSiteReview) => void;
  existingReview?: DiveSiteReview;
  onCancel?: () => void;
}

interface PendingPhoto {
  file: File;
  preview: string;
}

export default function ReviewForm({ diveSiteId, onReviewSubmitted, existingReview, onCancel }: ReviewFormProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const [rating, setRating] = useState<number | undefined>(existingReview?.rating);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [existingPhotos, setExistingPhotos] = useState<string[]>(existingReview?.photoUrls ?? []);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [visibility, setVisibility] = useState<string>(existingReview?.visibility?.toString() ?? '');
  const [diveDurationMin, setDiveDurationMin] = useState<string>(existingReview?.diveDurationMin?.toString() ?? '');
  const [maxDepth, setMaxDepth] = useState<string>(existingReview?.maxDepth?.toString() ?? '');
  const [diveDate, setDiveDate] = useState(existingReview?.diveDate?.split('T')[0] ?? '');
  const [waterTemperature, setWaterTemperature] = useState<string>(existingReview?.waterTemperature?.toString() ?? '');
  const [currentStrength, setCurrentStrength] = useState(existingReview?.currentStrength ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newPending: PendingPhoto[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(t('diveSiteImages.invalidType'));
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(t('diveSiteImages.tooLarge', { max: 10 }));
        return;
      }
      newPending.push({ file, preview: URL.createObjectURL(file) });
    }
    setError(null);
    setPendingPhotos((prev) => [...prev, ...newPending]);
  }, [t]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removePendingPhoto = (index: number) => {
    setPendingPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingPhoto = (url: string) => {
    setExistingPhotos((prev) => prev.filter((p) => p !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError(t('reviews.ratingRequired'));
      return;
    }
    if (!comment.trim()) {
      setError(t('reviews.commentRequired'));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    let review: DiveSiteReview;

    if (existingReview) {
      const data: UpdateReviewRequest = {
        rating,
        comment: comment.trim(),
        photoUrls: existingPhotos.length > 0 ? existingPhotos : undefined,
        visibility: visibility ? Number(visibility) : undefined,
        diveDurationMin: diveDurationMin ? Number(diveDurationMin) : undefined,
        maxDepth: maxDepth ? Number(maxDepth) : undefined,
        diveDate: diveDate || undefined,
        waterTemperature: waterTemperature ? Number(waterTemperature) : undefined,
        currentStrength: currentStrength || undefined,
      };
      const result = await reviewsApi.update(existingReview.id, data);
      if (!result.ok) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      review = result.data;
    } else {
      const data: CreateReviewRequest = {
        diveSiteId,
        rating,
        comment: comment.trim(),
        visibility: visibility ? Number(visibility) : undefined,
        diveDurationMin: diveDurationMin ? Number(diveDurationMin) : undefined,
        maxDepth: maxDepth ? Number(maxDepth) : undefined,
        diveDate: diveDate || undefined,
        waterTemperature: waterTemperature ? Number(waterTemperature) : undefined,
        currentStrength: currentStrength || undefined,
      };
      const result = await reviewsApi.create(data);
      if (!result.ok) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      review = result.data;
    }

    for (const pending of pendingPhotos) {
      const uploadResult = await reviewsApi.uploadPhoto(review.id, pending.file);
      if (uploadResult.ok) {
        review = uploadResult.data;
      } else {
        setError(uploadResult.error);
      }
      URL.revokeObjectURL(pending.preview);
    }

    onReviewSubmitted(review);

    if (!existingReview) {
      setRating(undefined);
      setComment('');
      setExistingPhotos([]);
      setPendingPhotos([]);
      setVisibility('');
      setDiveDurationMin('');
      setMaxDepth('');
      setDiveDate('');
      setWaterTemperature('');
      setCurrentStrength('');
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-ocean-100 rounded-2xl p-6 space-y-5">
      <h3 className="text-lg font-semibold text-abyss-900">
        {existingReview ? t('reviews.editReview') : t('reviews.writeReview')}
      </h3>

      <div>
        <label className="block text-sm font-medium text-abyss-600 mb-1">
          {t('reviews.yourRating')} <span className="text-coral-500">*</span>
        </label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium text-abyss-600 mb-1">
          {t('reviews.comment')} <span className="text-coral-500">*</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder={t('reviews.commentPlaceholder')}
          className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 text-abyss-800 placeholder:text-abyss-400 focus:outline-none focus:ring-2 focus:ring-ocean-300 resize-none"
        />
      </div>

      <div>
        <h4 className="text-sm font-medium text-abyss-600 mb-3">{t('reviews.diveDetails')}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-abyss-500 mb-1">{t('reviews.diveDate')}</label>
            <input
              type="date"
              value={diveDate}
              onChange={(e) => setDiveDate(e.target.value)}
              className="w-full rounded-lg border border-ocean-200 bg-white px-3 py-2 text-sm text-abyss-800 focus:outline-none focus:ring-2 focus:ring-ocean-300"
            />
          </div>
          <div>
            <label className="block text-xs text-abyss-500 mb-1">{t('reviews.visibility')}</label>
            <input
              type="number"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              placeholder="m"
              min="0"
              max="100"
              className="w-full rounded-lg border border-ocean-200 bg-white px-3 py-2 text-sm text-abyss-800 focus:outline-none focus:ring-2 focus:ring-ocean-300"
            />
          </div>
          <div>
            <label className="block text-xs text-abyss-500 mb-1">{t('reviews.duration')}</label>
            <input
              type="number"
              value={diveDurationMin}
              onChange={(e) => setDiveDurationMin(e.target.value)}
              placeholder="min"
              min="0"
              max="300"
              className="w-full rounded-lg border border-ocean-200 bg-white px-3 py-2 text-sm text-abyss-800 focus:outline-none focus:ring-2 focus:ring-ocean-300"
            />
          </div>
          <div>
            <label className="block text-xs text-abyss-500 mb-1">{t('reviews.maxDepth')}</label>
            <input
              type="number"
              value={maxDepth}
              onChange={(e) => setMaxDepth(e.target.value)}
              placeholder="m"
              min="0"
              max="300"
              className="w-full rounded-lg border border-ocean-200 bg-white px-3 py-2 text-sm text-abyss-800 focus:outline-none focus:ring-2 focus:ring-ocean-300"
            />
          </div>
          <div>
            <label className="block text-xs text-abyss-500 mb-1">{t('reviews.waterTemp')}</label>
            <input
              type="number"
              value={waterTemperature}
              onChange={(e) => setWaterTemperature(e.target.value)}
              placeholder="°C"
              min="-5"
              max="40"
              className="w-full rounded-lg border border-ocean-200 bg-white px-3 py-2 text-sm text-abyss-800 focus:outline-none focus:ring-2 focus:ring-ocean-300"
            />
          </div>
          <div>
            <label className="block text-xs text-abyss-500 mb-1">{t('reviews.currentStrength')}</label>
            <select
              value={currentStrength}
              onChange={(e) => setCurrentStrength(e.target.value)}
              className="w-full rounded-lg border border-ocean-200 bg-white px-3 py-2 text-sm text-abyss-800 focus:outline-none focus:ring-2 focus:ring-ocean-300"
            >
              <option value="">{t('reviews.selectCurrent')}</option>
              <option value="None">{t('reviews.currentNone')}</option>
              <option value="Weak">{t('reviews.currentWeak')}</option>
              <option value="Moderate">{t('reviews.currentModerate')}</option>
              <option value="Strong">{t('reviews.currentStrong')}</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-abyss-600 mb-2">{t('reviews.photos')}</label>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {(existingPhotos.length > 0 || pendingPhotos.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {existingPhotos.map((url) => (
              <div key={url} className="relative group">
                <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-ocean-200" />
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(url)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-coral-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {pendingPhotos.map((p, i) => (
              <div key={p.preview} className="relative group">
                <img src={p.preview} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-dashed border-ocean-300" />
                <button
                  type="button"
                  onClick={() => removePendingPhoto(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-coral-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          onClick={() => !isSubmitting && fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative rounded-xl p-5 text-center cursor-pointer transition-all border-2 border-dashed ${
            dragOver
              ? 'border-ocean-400 bg-ocean-50'
              : 'border-ocean-200 bg-abyss-50/50 hover:border-ocean-300 hover:bg-ocean-50/50'
          }`}
        >
          <Upload className="w-6 h-6 text-abyss-300 mx-auto mb-1" />
          <p className="text-sm text-abyss-500">{t('reviews.dragOrClickPhoto')}</p>
          <p className="text-xs text-abyss-400 mt-0.5">{t('reviews.photoHint')}</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-coral-600">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-ocean-600 hover:bg-ocean-700 rounded-xl transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {isSubmitting
            ? t('reviews.submitting')
            : existingReview
              ? t('reviews.updateReview')
              : t('reviews.submitReview')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-abyss-600 hover:text-abyss-800 transition-colors"
          >
            {t('common.cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
