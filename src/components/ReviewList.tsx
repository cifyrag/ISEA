import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Loader2,
  MessageSquare,
  Eye,
  Clock,
  Waves,
  Thermometer,
  Ruler,
  Calendar,
  Trash2,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import { reviewsApi } from '../services/api';
import type { DiveSiteReview, ReviewSummary } from '../services/api/types';
import { useAuth } from '../context/AuthContext';

const isSafeUrl = (url: string) => /^https?:\/\//i.test(url);

interface ReviewListProps {
  diveSiteId: string;
}

function RatingBar({ count, total }: { count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex-1 h-2 bg-abyss-100 rounded-full overflow-hidden">
      <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function getAuthorName(review: DiveSiteReview): string {
  return [review.authorFirstName, review.authorLastName].filter(Boolean).join(' ') || '?';
}

function ReviewCard({
  review,
  isOwner,
  isAdmin,
  onDelete,
  onEdit,
}: {
  review: DiveSiteReview;
  isOwner: boolean;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onEdit: (review: DiveSiteReview) => void;
}) {
  const { t } = useTranslation();
  const safePhotos = review.photoUrls?.filter(isSafeUrl) ?? [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <div className="bg-white border border-ocean-100 rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-abyss-900">{getAuthorName(review)}</span>
            <StarRating value={review.rating} readOnly size="sm" />
          </div>
          <p className="text-xs text-abyss-400 mt-0.5">
            {new Date(review.createdAt).toLocaleDateString()}
            {review.updatedAt && new Date(review.updatedAt).getTime() - new Date(review.createdAt).getTime() > 60000 && ` (${t('reviews.edited')})`}
          </p>
        </div>
        {(isOwner || isAdmin) && (
          <div className="flex items-center gap-1">
            {isOwner && (
              <button
                onClick={() => onEdit(review)}
                className="p-1.5 text-abyss-400 hover:text-ocean-600 rounded-lg hover:bg-ocean-50 transition-colors"
                title={t('reviews.editReview')}
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(review.id)}
              className="p-1.5 text-abyss-400 hover:text-coral-600 rounded-lg hover:bg-coral-50 transition-colors"
              title={t('reviews.deleteReview')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {review.comment && (
        <p className="text-abyss-700 leading-relaxed">{review.comment}</p>
      )}

      {(review.diveDate || review.visibility || review.diveDurationMin || review.maxDepth || review.waterTemperature || review.currentStrength) && (
        <div className="flex flex-wrap gap-2">
          {review.diveDate && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-ocean-50 text-ocean-700 rounded-lg">
              <Calendar className="w-3 h-3" />
              {new Date(review.diveDate).toLocaleDateString()}
            </span>
          )}
          {review.visibility != null && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-cyan-50 text-cyan-700 rounded-lg">
              <Eye className="w-3 h-3" />
              {review.visibility}m {t('reviews.vis')}
            </span>
          )}
          {review.diveDurationMin != null && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-sea-50 text-sea-700 rounded-lg">
              <Clock className="w-3 h-3" />
              {review.diveDurationMin} min
            </span>
          )}
          {review.maxDepth != null && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-abyss-50 text-abyss-700 rounded-lg">
              <Ruler className="w-3 h-3" />
              {review.maxDepth}m
            </span>
          )}
          {review.waterTemperature != null && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg">
              <Thermometer className="w-3 h-3" />
              {review.waterTemperature}°C
            </span>
          )}
          {review.currentStrength && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">
              <Waves className="w-3 h-3" />
              {review.currentStrength}
            </span>
          )}
        </div>
      )}

      {safePhotos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {safePhotos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`${t('reviews.photo')} ${i + 1}`}
              className="w-24 h-24 object-cover rounded-lg border border-ocean-200 hover:opacity-90 transition-opacity cursor-pointer"
              onClick={() => setLightboxIndex(i)}
            />
          ))}
        </div>
      )}

      {lightboxIndex !== null && safePhotos[lightboxIndex] && createPortal(
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center" style={{ zIndex: 9999 }}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          {lightboxIndex < safePhotos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}

          <img
            src={safePhotos[lightboxIndex]}
            alt={`${t('reviews.photo')} ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 text-white/70 text-sm">
            {lightboxIndex + 1} / {safePhotos.length}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function ReviewList({ diveSiteId }: ReviewListProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<DiveSiteReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<DiveSiteReview | null>(null);
  const isAdmin = user?.roles?.includes('Admin') ?? false;

  const fetchSummary = useCallback(async () => {
    const result = await reviewsApi.getSummary(diveSiteId);
    if (result.ok) {
      setSummary(result.data);
    }
  }, [diveSiteId]);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    const result = await reviewsApi.getForSite(diveSiteId);
    if (result.ok) {
      setReviews(result.data);
    }
    setIsLoading(false);
  }, [diveSiteId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmitted = () => {
    setEditingReview(null);
    fetchSummary();
    fetchReviews();
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm(t('reviews.deleteConfirm'))) return;
    const result = await reviewsApi.delete(reviewId);
    if (result.ok) {
      fetchSummary();
      fetchReviews();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-ocean-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-ocean-500" />
          <h2 className="text-lg font-semibold text-abyss-900">{t('reviews.title')}</h2>
          {summary && (
            <span className="text-sm text-abyss-500">({summary.totalReviews})</span>
          )}
        </div>

        {summary && summary.totalReviews > 0 && (
          <div className="flex items-start gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-abyss-900">{summary.averageRating.toFixed(1)}</p>
              <StarRating value={Math.round(summary.averageRating)} readOnly size="sm" />
              <p className="text-xs text-abyss-400 mt-1">
                {t('reviews.basedOn', { count: summary.totalReviews })}
              </p>
            </div>
          </div>
        )}

        {(!summary || summary.totalReviews === 0) && !isLoading && (
          <p className="text-sm text-abyss-400">{t('reviews.noReviews')}</p>
        )}
      </div>

      {user && !editingReview && (
        <ReviewForm
          diveSiteId={diveSiteId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

      {editingReview && (
        <ReviewForm
          diveSiteId={diveSiteId}
          existingReview={editingReview}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => setEditingReview(null)}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-ocean-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={user?.email === review.userId}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onEdit={setEditingReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
