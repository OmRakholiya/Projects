import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  FaPlus, 
  FaClipboardList, 
  FaTools, 
  FaChartBar, 
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaBuilding,
  FaWifi,
  FaLightbulb,
  FaTint,
  FaChair,
  FaThermometerHalf,
  FaBroom
} from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [complaintsResponse] = await Promise.all([
        axios.get('/complaints?limit=5')
      ]);

      const complaints = complaintsResponse.data.complaints;
      setRecentComplaints(complaints);

      // Calculate stats based on user role
      if (user.role === 'admin') {
        const statsResponse = await axios.get('/admin/dashboard');
        setStats(statsResponse.data.overview);
      } else {
        // For other roles, calculate stats from their complaints
        const total = complaints.length;
        const pending = complaints.filter(c => c.status === 'pending').length;
        const inProgress = complaints.filter(c => c.status === 'in_progress').length;
        const resolved = complaints.filter(c => c.status === 'resolved').length;

        setStats({
          totalComplaints: total,
          pendingComplaints: pending,
          inProgressComplaints: inProgress,
          resolvedComplaints: resolved
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      electrical: <FaLightbulb />,
      plumbing: <FaTint />,
      furniture: <FaChair />,
      wifi: <FaWifi />,
      heating: <FaThermometerHalf />,
      cleaning: <FaBroom />,
      other: <FaTools />
    };
    return icons[category] || <FaTools />;
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

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'badge-low',
      medium: 'badge-medium',
      high: 'badge-high',
      urgent: 'badge-urgent'
    };
    return badges[priority] || 'badge-medium';
  };

  const getQuickActions = () => {
    const actions = [];

    if (user.role === 'student' || user.role === 'staff') {
      actions.push({
        title: 'Submit New Complaint',
        description: 'Report a maintenance issue',
        icon: <FaPlus />,
        link: '/complaint/new',
        color: 'primary'
      });
    }

    actions.push({
      title: 'View All Complaints',
      description: 'Check status of your complaints',
      icon: <FaClipboardList />,
      link: '/complaints',
      color: 'secondary'
    });

    if (user.role === 'maintenance') {
      actions.push({
        title: 'Maintenance Dashboard',
        description: 'Manage assigned complaints',
        icon: <FaTools />,
        link: '/maintenance',
        color: 'success'
      });
    }

    if (user.role === 'admin') {
      actions.push({
        title: 'Admin Dashboard',
        description: 'Analytics and management',
        icon: <FaChartBar />,
        link: '/admin',
        color: 'danger'
      });
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}! 👋</h1>
        <p className="text-muted">Here's what's happening with your maintenance requests</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaClipboardList />
          </div>
          <div className="stat-content">
            <h3>{stats.totalComplaints}</h3>
            <p>Total Complaints</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingComplaints}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">
            <FaTools />
          </div>
          <div className="stat-content">
            <h3>{stats.inProgressComplaints}</h3>
            <p>In Progress</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon resolved">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.resolvedComplaints}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {getQuickActions().map((action, index) => (
            <Link key={index} to={action.link} className="action-card">
              <div className={`action-icon ${action.color}`}>
                {action.icon}
              </div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="section">
        <div className="section-header">
          <h2>Recent Complaints</h2>
          <Link to="/complaints" className="btn btn-outline btn-sm">
            View All
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No complaints yet</h3>
            <p>Start by submitting your first maintenance request</p>
            {(user.role === 'student' || user.role === 'staff') && (
              <Link to="/complaint/new" className="btn btn-primary">
                Submit Complaint
              </Link>
            )}
          </div>
        ) : (
          <div className="complaints-list">
            {recentComplaints.map((complaint) => (
              <div key={complaint._id} className="complaint-card">
                <div className="complaint-header">
                  <div className="complaint-category">
                    {getCategoryIcon(complaint.category)}
                    <span>{complaint.category}</span>
                  </div>
                  <div className="complaint-badges">
                    <span className={`badge ${getStatusBadge(complaint.status)}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                    <span className={`badge ${getPriorityBadge(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                </div>
                
                <h3 className="complaint-title">{complaint.title}</h3>
                <p className="complaint-description">{complaint.description}</p>
                
                <div className="complaint-footer">
                  <div className="complaint-location">
                    <FaBuilding />
                    <span>{complaint.location.building} - {complaint.location.room}</span>
                  </div>
                  <div className="complaint-date">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard {
          padding: 20px;
        }

        .dashboard-header {
          margin-bottom: 30px;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }

        .stat-icon.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-icon.pending {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .stat-icon.progress {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .stat-icon.resolved {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }

        .stat-content h3 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: #2c3e50;
        }

        .stat-content p {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }

        .section {
          margin-bottom: 40px;
        }

        .section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 20px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .action-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .action-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: white;
        }

        .action-icon.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .action-icon.secondary {
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
        }

        .action-icon.success {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }

        .action-icon.danger {
          background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
        }

        .action-content h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #2c3e50;
        }

        .action-content p {
          margin: 0;
          color: #6c757d;
          font-size: 14px;
        }

        .complaints-list {
          display: grid;
          gap: 16px;
        }

        .complaint-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .complaint-card:hover {
          transform: translateY(-1px);
        }

        .complaint-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .complaint-category {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6c757d;
          font-size: 14px;
        }

        .complaint-badges {
          display: flex;
          gap: 8px;
        }

        .complaint-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #2c3e50;
        }

        .complaint-description {
          color: #6c757d;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .complaint-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          color: #6c757d;
        }

        .complaint-location {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #6c757d;
          margin: 0 0 24px 0;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 15px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .complaint-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .complaint-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 