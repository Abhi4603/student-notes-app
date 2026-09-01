import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotes, createNote, updateNote, deleteNote } from '../api/api';

function Dashboard() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({ title: '', subject: '', content: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  const fetchNotes = async () => {
    try {
      const { data } = await getNotes();
      setNotes(data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAddForm = () => {
    setEditingNote(null);
    setForm({ title: '', subject: '', content: '' });
    setShowForm(true);
    setError('');
  };

  const openEditForm = (note) => {
    setEditingNote(note);
    setForm({ title: note.title, subject: note.subject, content: note.content });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.subject || !form.content) {
      return setError('All fields are required.');
    }

    try {
      if (editingNote) {
        await updateNote(editingNote.id, form);
      } else {
        await createNote(form);
      }
      setShowForm(false);
      setForm({ title: '', subject: '', content: '' });
      setEditingNote(null);
      fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(id);
      fetchNotes();
    } catch (err) {
      alert('Failed to delete note.');
    }
  };

  // Filter notes by title or subject
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.subject.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="dashboard-container"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>📚 Student Notes</h1>
          <p>Welcome, <strong>{user.name || 'Student'}</strong>!</p>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by title or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-add" onClick={openAddForm}>+ Add Note</button>
      </div>

      {/* Note Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingNote ? 'Edit Note' : 'Add New Note'}</h3>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleSubmit}>
              <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} />
              <input type="text" name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} />
              <textarea name="content" placeholder="Write your note here..." rows="5" value={form.content} onChange={handleChange}></textarea>
              <div className="modal-actions">
                <button type="submit">{editingNote ? 'Update' : 'Save'}</button>
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'No notes match your search.' : 'No notes yet. Click "+ Add Note" to create one!'}</p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-header">
                <h3>{note.title}</h3>
                <span className="subject-tag">{note.subject}</span>
              </div>
              <p className="note-content">{note.content}</p>
              <div className="note-footer">
                <span className="note-date">{new Date(note.createdAt).toLocaleDateString()}</span>
                <div className="note-actions">
                  <button className="btn-edit" onClick={() => openEditForm(note)}>✏️ Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(note.id)}>🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
