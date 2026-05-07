import { describe, it, expect, vi, beforeEach } from 'vitest';
import { privateNotesApi } from '../privateNotes';
import api from '../client';

vi.mock('../client', async () => {
  const actual = await vi.importActual('../client');
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const mockApi = vi.mocked(api);

describe('privateNotesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getForSite', () => {
    it('fetches private notes for a dive site', async () => {
      const mockNotes = [
        { id: 'n1', diveSiteId: 'ds1', title: 'Entry tip', content: 'Enter from the left side' },
        { id: 'n2', diveSiteId: 'ds1', title: 'Best season', content: 'Visit in June' },
      ];
      mockApi.get.mockResolvedValue({ data: mockNotes });

      const result = await privateNotesApi.getForSite('ds1');

      expect(mockApi.get).toHaveBeenCalledWith('/Notes/divesite/ds1');
      expect(result).toEqual({ ok: true, data: mockNotes });
    });

    it('returns empty array when no notes exist', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await privateNotesApi.getForSite('ds1');

      expect(result).toEqual({ ok: true, data: [] });
    });

    it('handles unauthorized access', async () => {
      mockApi.get.mockRejectedValue({
        response: { data: { Error: 'Authentication required' }, status: 401 },
      });

      const result = await privateNotesApi.getForSite('ds1');

      expect(result).toEqual({ ok: false, error: 'Authentication required' });
    });
  });

  describe('create', () => {
    it('creates a new private note', async () => {
      const newNote = { title: 'My tip', content: 'Bring extra weights here' };
      const createdNote = {
        id: 'n3',
        diveSiteId: 'ds1',
        userId: 'u1',
        ...newNote,
        createdAt: '2026-05-25T10:00:00Z',
      };
      mockApi.post.mockResolvedValue({ data: createdNote });

      const result = await privateNotesApi.create('ds1', newNote);

      expect(mockApi.post).toHaveBeenCalledWith('/Notes', { ...newNote, diveSiteId: 'ds1' });
      expect(result).toEqual({ ok: true, data: createdNote });
    });

    it('handles creation failure', async () => {
      mockApi.post.mockRejectedValue({
        response: { data: { message: 'Title is required' }, status: 400 },
      });

      const result = await privateNotesApi.create('ds1', { title: '', content: 'x' });

      expect(result.ok).toBe(false);
    });
  });

  describe('update', () => {
    it('updates an existing private note', async () => {
      const updateData = { title: 'Updated title', content: 'Updated content' };
      const updatedNote = { id: 'n1', diveSiteId: 'ds1', userId: 'u1', ...updateData, createdAt: '2026-05-25T10:00:00Z', updatedAt: '2026-05-25T12:00:00Z' };
      mockApi.put.mockResolvedValue({ data: updatedNote });

      const result = await privateNotesApi.update('ds1', 'n1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/Notes/n1', updateData);
      expect(result).toEqual({ ok: true, data: updatedNote });
    });
  });

  describe('delete', () => {
    it('deletes a private note', async () => {
      mockApi.delete.mockResolvedValue({ data: undefined });

      const result = await privateNotesApi.delete('ds1', 'n1');

      expect(mockApi.delete).toHaveBeenCalledWith('/Notes/n1');
      expect(result).toEqual({ ok: true, data: undefined });
    });

    it('prevents deleting other users notes', async () => {
      mockApi.delete.mockRejectedValue({
        response: { data: { Error: 'Forbidden' }, status: 403 },
      });

      const result = await privateNotesApi.delete('ds1', 'n-other');

      expect(result).toEqual({ ok: false, error: 'Forbidden' });
    });
  });
});
