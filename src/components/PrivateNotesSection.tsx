import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Loader2,
  Lock,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { privateNotesApi } from '../services/api';
import type { PrivateNote } from '../services/api/types';

interface PrivateNotesSectionProps {
  diveSiteId: string;
}

function NoteForm({
  initialTitle,
  initialContent,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: {
  initialTitle: string;
  initialContent: string;
  onSubmit: (title: string, content: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit(title.trim(), content.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('privateNotes.titlePlaceholder')}
        required
        className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-2.5 text-sm text-abyss-800 placeholder:text-abyss-400 focus:outline-none focus:ring-2 focus:ring-ocean-300"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder={t('privateNotes.contentPlaceholder')}
        required
        className="w-full rounded-xl border border-ocean-200 bg-white px-4 py-3 text-sm text-abyss-800 placeholder:text-abyss-400 focus:outline-none focus:ring-2 focus:ring-ocean-300 resize-none"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-ocean-600 hover:bg-ocean-700 rounded-xl transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-abyss-600 hover:text-abyss-800 transition-colors"
        >
          <X className="w-4 h-4" />
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}

export default function PrivateNotesSection({ diveSiteId }: PrivateNotesSectionProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<PrivateNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    const result = await privateNotesApi.getForSite(diveSiteId);
    if (result.ok) {
      setNotes(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  }, [diveSiteId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreate = async (title: string, content: string) => {
    setSubmittingAction('create');
    const result = await privateNotesApi.create(diveSiteId, { title, content });
    if (result.ok) {
      setNotes((prev) => [result.data, ...prev]);
      setShowCreate(false);
    } else {
      setError(result.error);
    }
    setSubmittingAction(null);
  };

  const handleUpdate = async (noteId: string, title: string, content: string) => {
    setSubmittingAction(noteId);
    const result = await privateNotesApi.update(diveSiteId, noteId, { title, content });
    if (result.ok) {
      setNotes((prev) => prev.map((n) => (n.id === noteId ? result.data : n)));
      setEditingId(null);
    } else {
      setError(result.error);
    }
    setSubmittingAction(null);
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm(t('privateNotes.deleteConfirm'))) return;
    const result = await privateNotesApi.delete(diveSiteId, noteId);
    if (result.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    }
  };

  return (
    <div className="bg-white border border-ocean-100 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-abyss-400" />
          <h2 className="text-lg font-semibold text-abyss-900">{t('privateNotes.title')}</h2>
        </div>
        {!showCreate && (
          <button
            onClick={() => { setShowCreate(true); setEditingId(null); }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-ocean-700 bg-ocean-50 hover:bg-ocean-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('privateNotes.addNote')}
          </button>
        )}
      </div>

      <p className="text-xs text-abyss-400">{t('privateNotes.privacyHint')}</p>

      {error && (
        <p className="text-sm text-coral-600">{error}</p>
      )}

      {showCreate && (
        <NoteForm
          initialTitle=""
          initialContent=""
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
          isSubmitting={submittingAction === 'create'}
          submitLabel={t('privateNotes.createNote')}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 text-ocean-500 animate-spin" />
        </div>
      ) : notes.length === 0 && !showCreate ? (
        <p className="text-sm text-abyss-400 text-center py-4">{t('privateNotes.noNotes')}</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-abyss-50 rounded-xl p-4">
              {editingId === note.id ? (
                <NoteForm
                  initialTitle={note.title}
                  initialContent={note.content}
                  onSubmit={(title, content) => handleUpdate(note.id, title, content)}
                  onCancel={() => setEditingId(null)}
                  isSubmitting={submittingAction === note.id}
                  submitLabel={t('common.save')}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-abyss-900">{note.title}</h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => { setEditingId(note.id); setShowCreate(false); }}
                        className="p-1.5 text-abyss-400 hover:text-ocean-600 rounded-lg hover:bg-ocean-50 transition-colors"
                        title={t('privateNotes.editNote')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 text-abyss-400 hover:text-coral-600 rounded-lg hover:bg-coral-50 transition-colors"
                        title={t('privateNotes.deleteNote')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-abyss-700 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-abyss-400 mt-2">
                    {new Date(note.createdAt).toLocaleDateString()}
                    {note.updatedAt && ` · ${t('privateNotes.edited')}`}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
