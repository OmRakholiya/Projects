import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { FaArrowLeft, FaBuilding, FaUser, FaTools, FaCheckCircle, FaClock, FaExclamationTriangle, FaCamera, FaUpload, FaPlus, FaStickyNote } from 'react-icons/fa';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaint();
    // eslint-disable-next-line
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/complaints/${id}`);
      setComplaint(response.data);
    } catch (err) {
      setError('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setNoteLoading(true);
    try {
      await axios.post(`/complaints/${id}/notes`, { content: note });
      setNote('');
      fetchComplaint();
    } catch (err) {
      setError('Failed to add note');
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  if (!complaint) {
    return <div className="alert alert-danger">Complaint not found</div>;
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      assigned: 'badge-assigned',
      in_progress: 'badge-in-progress',
      resolved: 'badge-resolved',
      closed: 'badge-closed'
    };
    return badges[status] || 'badge-pending';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      urgent: 'badge-urgent'
    };
    return badges[priority] || 'badge-medium';
  };

  return (
    <div className="complaint-detail-container">
      <button className="btn btn-outline mb-4" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>
      <div className="complaint-detail-card">
        <div className="detail-header">
          <h1>{complaint.title}</h1>
          <div className="badges">
            <span className={`badge ${getStatusBadge(complaint.status)}`}>{complaint.status.replace('_', ' ')}</span>
            <span className={`badge ${getPriorityBadge(complaint.priority)}`}>{complaint.priority}</span>
          </div>
        </div>
        <div className="detail-meta">
          <div><FaBuilding /> {complaint.location.building} - {complaint.location.room}</div>
          <div><FaUser /> Reported by: {complaint.reportedBy?.name}</div>
          <div><FaClock /> Created: {new Date(complaint.createdAt).toLocaleString()}</div>
          {complaint.assignedTo && <div><FaTools /> Assigned to: {complaint.assignedTo.name}</div>}
        </div>
        <div className="detail-description">
          <h3>Description</h3>
          <p>{complaint.description}</p>
        </div>
        <div className="detail-images">
          <h3>Before Photos</h3>
          <div className="image-list">
            {complaint.images?.before?.length > 0 ? complaint.images.before.map((img, idx) => (
              <img key={idx} src={`http://localhost:5000/${img.path.replace('\\', '/')}`} alt="Before" />
            )) : <span>No images</span>}
          </div>
          <h3>After Photos</h3>
          <div className="image-list">
            {complaint.images?.after?.length > 0 ? complaint.images.after.map((img, idx) => (
              <img key={idx} src={`http://localhost:5000/${img.path.replace('\\', '/')}`} alt="After" />
            )) : <span>No images</span>}
          </div>
        </div>
        <div className="detail-notes">
          <h3>Notes & Updates</h3>
          {complaint.notes?.length > 0 ? (
            <ul>
              {complaint.notes.map((note, idx) => (
                <li key={idx}>
                  <FaStickyNote /> {note.content} <span className="note-meta">- {note.addedBy?.name || 'Unknown'} ({new Date(note.addedAt).toLocaleString()})</span>
                </li>
              ))}
            </ul>
          ) : <span>No notes yet</span>}
          <form onSubmit={handleAddNote} className="add-note-form">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note..."
              className="form-control"
              disabled={noteLoading}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={noteLoading || !note.trim()}>
              <FaPlus /> Add Note
            </button>
          </form>
        </div>
        {error && <div className="alert alert-danger mt-2">{error}</div>}
      </div>
      <style jsx>{`
        .complaint-detail-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .complaint-detail-card { background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 32px; }
        .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .badges { display: flex; gap: 8px; }
        .detail-meta { color: #6c757d; font-size: 14px; margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 16px; }
        .detail-description { margin-bottom: 20px; }
        .detail-images { margin-bottom: 20px; }
        .image-list { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
        .image-list img { width: 120px; height: 90px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }
        .detail-notes { margin-bottom: 20px; }
        .detail-notes ul { list-style: none; padding: 0; }
        .detail-notes li { margin-bottom: 8px; color: #333; }
        .note-meta { color: #6c757d; font-size: 12px; margin-left: 8px; }
        .add-note-form { display: flex; gap: 8px; margin-top: 12px; }
        @media (max-width: 768px) { .complaint-detail-card { padding: 16px; } }
      `}</style>
    </div>
  );
};

export default ComplaintDetail; 