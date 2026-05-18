import React, { useEffect, useState, useCallback } from 'react';
import { Modal } from '@mui/material';
import { createNote, fetchNotes, updateNote, deleteNote } from '../../../Api/Api';
import { useTravel } from '../../../Contexts/TravelContext';
import { useAuth } from '../../../Contexts/AuthContext';
import { Perf, Stamp } from '../../Design/Atoms';

interface Note {
  noteId: string;
  note: string;
  userId: number;
}

interface NotesModalProps {
  open: boolean;
  onClose: () => void;
}
interface UserMapType {
  [key: number]: { email: string; userName: string };
}

const NotesModal: React.FC<NotesModalProps> = ({ open, onClose }) => {
  const [notes, setNotes] = useState<Note[] | undefined>(undefined);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const travelCtx = useTravel();
  const auth = useAuth();
  const [userMap, setUserMap] = useState<UserMapType>({});

  const loadNotes = useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        if (travelCtx.state.chosenTrip?.tripIdShared) {
          const response = await fetchNotes(travelCtx.state.chosenTrip.tripIdShared, page);
          setNotes(response.data.Message.notes);
          setTotalPages(response.data.Message.totalPages);
          setCurrentPage(response.data.Message.currentPage);
        }
      } catch {
        /* surfaced via global handler elsewhere */
      } finally {
        setLoading(false);
      }
    },
    [travelCtx.state.chosenTrip?.tripIdShared],
  );

  useEffect(() => {
    if (open) {
      const users: UserMapType = {};
      travelCtx.state.users.forEach((user) => {
        users[user.userId] = { userName: user.userName, email: user.email };
      });
      setUserMap(users);
      loadNotes(1);
      setIsAddingNote(false);
      setNewNote('');
    }
  }, [open, loadNotes, travelCtx.state.users]);

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;
    try {
      setSubmitting(true);
      const res = await createNote({
        tripId: travelCtx.state.chosenTrip?.tripIdShared,
        note: newNote,
      });
      if (res.status === 200) {
        await loadNotes(currentPage);
        setIsAddingNote(false);
        setNewNote('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!editNoteContent.trim()) return;
    try {
      setSubmitting(true);
      await updateNote({
        tripId: travelCtx.state.chosenTrip?.tripIdShared,
        noteId: editingNoteId,
        note: editNoteContent,
      });
      await loadNotes(currentPage);
      setEditingNoteId(null);
      setEditNoteContent('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const tripId = travelCtx.state.chosenTrip?.tripIdShared;
    if (!tripId) return;
    await deleteNote(tripId, noteId);
    await loadNotes(currentPage);
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ overflowY: 'auto' }}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(90vw, 640px)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        <div className="ts-paper" style={{ padding: '28px 30px', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 16,
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div className="ts-eyebrow">Marginalia</div>
              <h2
                className="ts-display"
                style={{ margin: '6px 0 0', fontSize: 28, fontVariationSettings: '"SOFT" 30, "opsz" 144' }}
              >
                Notes.
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Stamp text="Logged" date="·" tone="ledger" size={62} rotate={-5} />
              <button
                className="ts-btn ts-btn-ink"
                onClick={() => {
                  setIsAddingNote(true);
                  setNewNote('');
                }}
                disabled={isAddingNote}
                style={{ padding: '8px 14px', fontSize: 11 }}
              >
                + Pen a note
              </button>
            </div>
          </div>

          {isAddingNote && (
            <div
              style={{
                background: 'var(--paper-deep)',
                border: '1px dashed var(--rule-soft)',
                padding: 14,
                marginBottom: 18,
              }}
            >
              <div className="ts-label" style={{ marginBottom: 8 }}>New entry</div>
              <textarea
                rows={4}
                value={newNote}
                maxLength={1000}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Inkwell open. What do you want to remember?"
                style={{
                  width: '100%',
                  resize: 'vertical',
                  border: 'none',
                  borderBottom: '1px solid var(--ink)',
                  background: 'transparent',
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 16,
                  color: 'var(--ink)',
                  padding: '6px 0',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button
                  className="ts-btn"
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote('');
                  }}
                >
                  Discard
                </button>
                <button
                  className="ts-btn ts-btn-ink"
                  disabled={submitting || newNote.trim().length === 0}
                  onClick={handleSubmitNote}
                >
                  {submitting ? 'Saving…' : 'Pen it'}
                </button>
              </div>
            </div>
          )}

          {loading || notes === undefined ? (
            <div style={{ padding: '36px 12px', textAlign: 'center', color: 'var(--ink-faded)' }}>
              <div className="ts-label">Fetching marginalia…</div>
            </div>
          ) : notes.length === 0 ? (
            <div style={{ padding: '36px 12px', textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 22,
                  color: 'var(--ink-soft)',
                }}
              >
                The margins are blank.
              </div>
            </div>
          ) : (
            <>
              <div style={{ maxHeight: 460, overflowY: 'auto' }}>
                {notes.map((note: Note, index: number) => {
                  const owner = userMap[note.userId];
                  const editing = editingNoteId === note.noteId;
                  const ownNote = owner?.email === auth.currentUser?.email;
                  return (
                    <div
                      key={note.noteId}
                      style={{
                        padding: '14px 4px',
                        borderBottom:
                          index === notes.length - 1
                            ? 'none'
                            : '1px dashed var(--rule-soft)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'baseline',
                          marginBottom: 6,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'var(--ink)',
                          }}
                        >
                          {owner?.userName || '—'}
                        </div>
                        <div className="ts-label">#{note.noteId}</div>
                      </div>
                      {editing ? (
                        <>
                          <textarea
                            rows={3}
                            value={editNoteContent}
                            maxLength={1000}
                            onChange={(e) => setEditNoteContent(e.target.value)}
                            style={{
                              width: '100%',
                              resize: 'vertical',
                              border: 'none',
                              borderBottom: '1px solid var(--ink)',
                              background: 'transparent',
                              outline: 'none',
                              fontFamily: 'var(--font-body)',
                              fontSize: 16,
                              padding: '4px 0',
                            }}
                          />
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                              gap: 8,
                              marginTop: 10,
                            }}
                          >
                            <button
                              className="ts-btn"
                              onClick={() => {
                                setEditingNoteId(null);
                                setEditNoteContent('');
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              className="ts-btn ts-btn-ink"
                              onClick={handleUpdateNote}
                              disabled={submitting || editNoteContent.trim().length === 0}
                            >
                              {submitting ? 'Saving…' : 'Update'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: 16,
                              lineHeight: 1.5,
                              color: 'var(--ink)',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                            }}
                          >
                            {note.note}
                          </div>
                          {ownNote && (
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 8,
                                marginTop: 8,
                              }}
                            >
                              <button
                                className="ts-btn"
                                style={{ padding: '4px 10px', fontSize: 10 }}
                                onClick={() => {
                                  setEditingNoteId(note.noteId);
                                  setEditNoteContent(note.note);
                                }}
                              >
                                Amend
                              </button>
                              <button
                                className="ts-btn ts-btn-stamp"
                                style={{ padding: '4px 10px', fontSize: 10 }}
                                onClick={() => handleDeleteNote(note.noteId)}
                              >
                                Strike
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <>
                  <Perf style={{ margin: '16px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => loadNotes(p)}
                        className="ts-mono"
                        style={{
                          minWidth: 32,
                          padding: '6px 10px',
                          fontSize: 12,
                          letterSpacing: '0.12em',
                          background: p === currentPage ? 'var(--ink)' : 'transparent',
                          color: p === currentPage ? 'var(--paper)' : 'var(--ink)',
                          border: '1px solid var(--ink)',
                          cursor: 'pointer',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <Perf style={{ marginTop: 16 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button className="ts-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NotesModal;
