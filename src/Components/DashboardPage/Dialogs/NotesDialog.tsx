import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Modal,
  Typography,
  Pagination,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Button,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { createNote, fetchNotes, updateNote, deleteNote } from '../../../Api/Api';
import { useTravel } from '../../../Contexts/TravelContext';
import { useAuth } from '../../../Contexts/AuthContext';

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
  const loadNotes = useCallback(async (page: number) => {
    try {
      setLoading(true);
      if (travelCtx.state.chosenTrip?.tripIdShared) {
        const response = await fetchNotes(travelCtx.state.chosenTrip?.tripIdShared, page);
        setNotes(response.data.Message.notes);
        setTotalPages(response.data.Message.totalPages);
        setCurrentPage(response.data.Message.currentPage);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  }, [travelCtx.state.chosenTrip?.tripIdShared]);

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

  const handlePageChange = (_: any, value: number) => {
    loadNotes(value);
  };

  const handleAddNoteClick = () => {
    setIsAddingNote(true);
    setNewNote('');
  };

  const handleCancelAdd = () => {
    setIsAddingNote(false);
    setNewNote('');
  };

  const handleSubmitNote = async () => {
    if (!newNote.trim()) return;
    try {
      setSubmitting(true);
      const requestPayload = {
        tripId: travelCtx.state.chosenTrip?.tripIdShared,
        note: newNote,
      };
      const response = await createNote(requestPayload);
      if (response.status === 200) {
        loadNotes(currentPage);
        setIsAddingNote(false);
        setNewNote('');
      }
    } catch (err) {
      console.error('Error submitting note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNoteId(note.noteId);
    setEditNoteContent(note.note);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteContent('');
  };

  const handleUpdateNote = async () => {
    if (!editNoteContent.trim()) return;
    try {
      setSubmitting(true);
      const payload = {
        tripId: travelCtx.state.chosenTrip?.tripIdShared,
        noteId: editingNoteId,
        note: editNoteContent,
      };
      await updateNote(payload);
      await loadNotes(currentPage);
      setEditingNoteId(null);
      setEditNoteContent('');
    } catch (err) {
      console.error('Failed to update note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const tripId = travelCtx.state.chosenTrip?.tripIdShared;
      if (tripId) {
        await deleteNote(tripId, noteId);
        await loadNotes(currentPage);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Notes</Typography>
          <Box>
            <Button
              onClick={handleAddNoteClick}
              startIcon={<AddIcon />}
              sx={{ marginRight: 1 }}
              variant="outlined"
              size="small"
              disabled={isAddingNote}
            >
              Add Note
            </Button>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {isAddingNote && (
          <Box mb={3}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Note"
              variant="outlined"
              inputProps={{ maxLength: 1000 }}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <Box display="flex" justifyContent="flex-end" mt={2} gap={1} flexWrap="wrap">
              <Button onClick={handleCancelAdd} variant="text">
                Cancel
              </Button>
              <Button
                onClick={handleSubmitNote}
                variant="contained"
                disabled={submitting || newNote.trim().length === 0}
              >
                {submitting ? 'Saving...' : 'Submit'}
              </Button>
            </Box>
          </Box>
        )}

        {loading || notes === undefined ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : notes.length === 0 ? (
          <Box width="100%" display="flex" alignItems="center" justifyContent="center">
            <Typography variant="h6" mt={1} textAlign="center">
              Add a new note!
            </Typography>
          </Box>
        ) : (
          <>
            <Box maxHeight={{ xs: '300px', sm: '400px' }} overflow="auto">
              {notes.map((note: Note) => (
                <Card
                  key={note.noteId}
                  sx={{ mb: 2, backgroundColor: '#f5f5f5' }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography variant="body1" fontWeight="bold" noWrap>
                      {userMap[note.userId].userName}
                    </Typography>
                    {editingNoteId === note.noteId ? (
                      <>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                          inputProps={{ maxLength: 1000 }}
                          sx={{ mt: 1 }}
                        />
                        <Box mt={2} display="flex" justifyContent="flex-end" gap={1} flexWrap="wrap">
                          <Button onClick={handleCancelEdit} variant="text">
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateNote}
                            variant="contained"
                            disabled={
                              submitting || editNoteContent.trim().length === 0
                            }
                          >
                            {submitting ? 'Saving...' : 'Update'}
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Typography variant="body2" mt={1}>
                          {note.note}
                        </Typography>
                        {userMap[note.userId].email === auth.currentUser?.email && (
                          <Box
                            mt={2}
                            display="flex"
                            justifyContent="flex-end"
                            gap={1}
                            flexWrap="wrap"
                          >
                            <Button
                              onClick={() => handleEditClick(note)}
                              size="small"
                              variant="outlined"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteNote(note.noteId)}
                              size="small"
                              variant="outlined"
                              color="error"
                            >
                              Delete
                            </Button>
                          </Box>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>

            {totalPages > 1 && (
              <Box mt={3} display="flex" justifyContent="center">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {
    xs: '90vw',
    sm: '80vw',
    md: '600px',
  },
  maxHeight: '90vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '12px',
  p: 3,
};

export default NotesModal;
