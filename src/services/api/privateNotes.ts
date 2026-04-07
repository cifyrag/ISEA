import api, { apiCall, type Result } from './client';
import type {
  PrivateNote,
  CreatePrivateNoteRequest,
  UpdatePrivateNoteRequest,
} from './types';

export const privateNotesApi = {
  getForSite: (diveSiteId: string): Promise<Result<PrivateNote[]>> =>
    apiCall(() =>
      api.get<PrivateNote[]>(`/Notes/divesite/${diveSiteId}`)
    ),

  create: (
    diveSiteId: string,
    data: Omit<CreatePrivateNoteRequest, 'diveSiteId'>
  ): Promise<Result<PrivateNote>> =>
    apiCall(() =>
      api.post<PrivateNote>('/Notes', { ...data, diveSiteId })
    ),

  update: (
    diveSiteId: string,
    noteId: string,
    data: UpdatePrivateNoteRequest
  ): Promise<Result<PrivateNote>> =>
    apiCall(() =>
      api.put<PrivateNote>(`/Notes/${noteId}`, data)
    ),

  delete: (diveSiteId: string, noteId: string): Promise<Result<void>> =>
    apiCall(() =>
      api.delete(`/Notes/${noteId}`)
    ),
};
