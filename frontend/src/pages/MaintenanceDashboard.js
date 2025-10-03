import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaClipboardList, FaCheckCircle, FaTools, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MaintenanceDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/complaints?status=assigned');
      setComplaints(response.data.complaints);
    } catch (err) {
      setError('Failed to load assigned complaints');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="maintenance-dashboard-container">
      <h1>Assigned Complaints</h1>
      {complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛠️</div>
          <h3>No assigned complaints</h3>
          <p>All caught up!</p>
        </div>
      ) : (
        <div className="complaints-list">
          {complaints.map((c) => (
            <div key={c._id} className="complaint-card">
              <div className="complaint-header">
                <span className={`badge ${getStatusBadge(c.status)}`}>{c.status.replace('_', ' ')}</span>
                <span className="complaint-title">{c.title}</span>
              </div>
              <div className="complaint-meta">
                <span>Building: {c.location.building}</span>
                <span>Room: {c.location.room}</span>
                <span>Priority: {c.priority}</span>
                <span>Date: {new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <Link to={`/complaint/${c._id}`} className="btn btn-outline btn-sm">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .maintenance-dashboard-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .complaints-list { display: grid; gap: 20px; }
        .complaint-card { background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 24px; }
        .complaint-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .complaint-title { font-weight: 600; font-size: 1.1rem; }
        .complaint-meta { color: #6c757d; font-size: 14px; display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
        .empty-state { text-align: center; padding: 60px 20px; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .empty-icon { font-size: 4rem; margin-bottom: 16px; }
      `}</style>
    </div>
  );
};

export default MaintenanceDashboard; 