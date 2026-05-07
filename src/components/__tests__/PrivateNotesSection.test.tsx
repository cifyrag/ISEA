import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PrivateNotesSection from '../PrivateNotesSection';
import { renderWithProviders } from '../../test/helpers';
import { privateNotesApi } from '../../services/api';
import type { PrivateNote } from '../../services/api/types';

vi.mock('../../services/api', () => ({
  privateNotesApi: {
    getForSite: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockPrivateNotesApi = vi.mocked(privateNotesApi);

const mockNote: PrivateNote = {
  id: 'n1',
  diveSiteId: 'ds1',
  userId: 'u1',
  title: 'Entry point tip',
  content: 'Best to enter from the rocky area on the left side. Watch for sea urchins.',
  createdAt: '2026-05-20T10:00:00Z',
};

const mockNote2: PrivateNote = {
  id: 'n2',
  diveSiteId: 'ds1',
  userId: 'u1',
  title: 'Best time to visit',
  content: 'June-August has the best visibility here.',
  createdAt: '2026-05-21T10:00:00Z',
  updatedAt: '2026-05-22T10:00:00Z',
};

describe('PrivateNotesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrivateNotesApi.getForSite.mockResolvedValue({ ok: true, data: [mockNote, mockNote2] });
  });

  it('renders the private notes section with lock icon', async () => {
    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('My Private Notes')).toBeInTheDocument();
    });
  });

  it('shows privacy hint text', async () => {
    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText(/visible only to you/i)).toBeInTheDocument();
    });
  });

  it('displays existing notes', async () => {
    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Entry point tip')).toBeInTheDocument();
      expect(screen.getByText(/best to enter from the rocky area/i)).toBeInTheDocument();
      expect(screen.getByText('Best time to visit')).toBeInTheDocument();
    });
  });

  it('shows edited indicator for updated notes', async () => {
    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Best time to visit')).toBeInTheDocument();
    });
    const editedTexts = screen.getAllByText(/edited/i);
    expect(editedTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when no notes exist', async () => {
    mockPrivateNotesApi.getForSite.mockResolvedValue({ ok: true, data: [] });

    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText(/haven't added any private notes/i)).toBeInTheDocument();
    });
  });

  it('shows Add Note button', async () => {
    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Add Note')).toBeInTheDocument();
    });
  });

  it('opens create form when Add Note is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Add Note')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Note'));

    expect(screen.getByPlaceholderText('Note title...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write your private notes here...')).toBeInTheDocument();
    expect(screen.getByText('Create Note')).toBeInTheDocument();
  });

  it('creates a new note successfully', async () => {
    const user = userEvent.setup();
    const newNote: PrivateNote = {
      id: 'n3',
      diveSiteId: 'ds1',
      userId: 'u1',
      title: 'New note',
      content: 'New content',
      createdAt: '2026-05-25T10:00:00Z',
    };
    mockPrivateNotesApi.create.mockResolvedValue({ ok: true, data: newNote });

    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Add Note')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Note'));
    await user.type(screen.getByPlaceholderText('Note title...'), 'New note');
    await user.type(screen.getByPlaceholderText('Write your private notes here...'), 'New content');
    await user.click(screen.getByText('Create Note'));

    await waitFor(() => {
      expect(mockPrivateNotesApi.create).toHaveBeenCalledWith('ds1', {
        title: 'New note',
        content: 'New content',
      });
    });
  });

  it('shows edit and delete buttons on each note', async () => {
    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Entry point tip')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit');
    const deleteButtons = screen.getAllByTitle('Delete');
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('opens edit form when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Entry point tip')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit');
    await user.click(editButtons[0]);

    expect(screen.getByDisplayValue('Entry point tip')).toBeInTheDocument();
  });

  it('updates a note successfully', async () => {
    const user = userEvent.setup();
    const updatedNote = { ...mockNote, title: 'Updated title', updatedAt: '2026-05-25T12:00:00Z' };
    mockPrivateNotesApi.update.mockResolvedValue({ ok: true, data: updatedNote });

    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Entry point tip')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit');
    await user.click(editButtons[0]);

    const titleInput = screen.getByDisplayValue('Entry point tip');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated title');

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockPrivateNotesApi.update).toHaveBeenCalledWith('ds1', 'n1', expect.objectContaining({
        title: 'Updated title',
      }));
    });
  });

  it('confirms before deleting a note', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    mockPrivateNotesApi.delete.mockResolvedValue({ ok: true, data: undefined });

    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Entry point tip')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this note?'
    );
    expect(mockPrivateNotesApi.delete).toHaveBeenCalledWith('ds1', 'n1');
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);

    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Entry point tip')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockPrivateNotesApi.delete).not.toHaveBeenCalled();
  });

  it('handles cancel button on create form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Add Note')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add Note'));
    expect(screen.getByPlaceholderText('Note title...')).toBeInTheDocument();

    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText('Note title...')).not.toBeInTheDocument();
  });

  it('handles API error on fetch', async () => {
    mockPrivateNotesApi.getForSite.mockResolvedValue({
      ok: false,
      error: 'Failed to load notes',
    });

    renderWithProviders(<PrivateNotesSection diveSiteId="ds1" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load notes')).toBeInTheDocument();
    });
  });
});
