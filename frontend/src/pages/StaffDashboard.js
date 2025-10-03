import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaClipboardList, FaUsers, FaTools, FaChartBar, FaPlus, FaEdit, FaCheck, FaTimes, FaUserCog, FaListAlt, FaSearch, FaFilter, FaEye, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('complaints');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Complaint management state
  const [complaints, setComplaints] = useState([]);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintPage, setComplaintPage] = useState(1);
  const [complaintTotalPages, setComplaintTotalPages] = useState(1);
  const [complaintActionLoading, setComplaintActionLoading] = useState('');
  const [maintenanceStaff, setMaintenanceStaff] = useState([]);
  const [complaintFilters, setComplaintFilters] = useState({ 
    status: '', 
    priority: '', 
    category: '', 
    building: '',
    search: ''
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [afterImages, setAfterImages] = useState([]);

  // Maintenance staff management state
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [addStaffForm, setAddStaffForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    phone: '',
    department: '',
    role: 'staff'
  });
  const [addStaffLoading, setAddStaffLoading] = useState(false);
  const [staffActionLoading, setStaffActionLoading] = useState('');

  // Dashboard statistics
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints(1);
      fetchMaintenanceStaff();
    }
    if (activeTab === 'staff') {
      fetchStaff();
    }
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchComplaints = async (page = 1) => {
    setComplaintLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...complaintFilters
      });
      const res = await axios.get(`/complaints?${params}`);
      setComplaints(res.data.complaints);
      setComplaintPage(res.data.pagination.current);
      setComplaintTotalPages(res.data.pagination.total);
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setComplaintLoading(false);
    }
  };

  const fetchMaintenanceStaff = async () => {
    try {
      const res = await axios.get('/admin/maintenance-staff');
      setMaintenanceStaff(res.data);
    } catch (err) {
      setError('Failed to load maintenance staff');
    }
  };

  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      // Get all users except students
      const res = await axios.get('/admin/users?limit=50');
      // Filter out students to show only staff, maintenance, and admin
      const filteredUsers = res.data.users.filter(user => 
        ['staff', 'maintenance', 'admin'].includes(user.role)
      );
      setStaff(filteredUsers);
    } catch (err) {
      setError('Failed to load staff');
    } finally {
      setStaffLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await axios.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleAssignComplaint = async (complaintId, staffId) => {
    setComplaintActionLoading(complaintId + '-assign');
    try {
      await axios.patch(`/complaints/${complaintId}/assign`, { assignedTo: staffId });
      fetchComplaints(complaintPage);
    } catch (err) {
      setError('Failed to assign complaint');
    } finally {
      setComplaintActionLoading('');
    }
  };

  const handleStatusUpdate = async (complaintId, status) => {
    setComplaintActionLoading(complaintId + '-status');
    try {
      await axios.patch(`/complaints/${complaintId}/status`, { status });
      fetchComplaints(complaintPage);
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setComplaintActionLoading('');
    }
  };

  const handleResolveComplaint = async (complaintId) => {
    setComplaintActionLoading(complaintId + '-resolve');
    try {
      await axios.patch(`/complaints/${complaintId}/resolve`, { 
        resolutionNotes,
        actualCompletion: new Date()
      });
      setShowComplaintModal(false);
      setResolutionNotes('');
      setAfterImages([]);
      fetchComplaints(complaintPage);
    } catch (err) {
      setError('Failed to resolve complaint');
    } finally {
      setComplaintActionLoading('');
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setAddStaffLoading(true);
    try {
      // Add staff member using admin endpoint
      const staffData = {
        name: addStaffForm.name,
        email: addStaffForm.email,
        password: addStaffForm.password,
        phone: addStaffForm.phone,
        department: addStaffForm.department,
        role: addStaffForm.role
      };
      
      await axios.post('/admin/maintenance-staff', staffData);
      setShowAddStaffModal(false);
      setAddStaffForm({ name: '', email: '', password: '', phone: '', department: '', role: 'staff' });
      fetchStaff();
    } catch (err) {
      console.error('Add staff error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to add staff member');
    } finally {
      setAddStaffLoading(false);
    }
  };

  const handleStaffStatus = async (id, isActive) => {
    setStaffActionLoading(id + '-status');
    try {
      await axios.patch(`/admin/users/${id}/status`, { isActive });
      fetchStaff();
    } catch (err) {
      setError('Failed to update staff status');
    } finally {
      setStaffActionLoading('');
    }
  };

  const handleComplaintFilterChange = (name, value) => {
    setComplaintFilters(prev => ({ ...prev, [name]: value }));
    setComplaintPage(1);
  };

  const openComplaintModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fd7e14',
      assigned: '#667eea',
      in_progress: '#764ba2',
      resolved: '#43e97b',
      closed: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#43e97b',
      medium: '#667eea',
      high: '#fd7e14',
      urgent: '#dc3545'
    };
    return colors[priority] || '#6c757d';
  };

  // Sidebar navigation items
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { key: 'complaints', label: 'Complaints', icon: <FaClipboardList /> },
    { key: 'staff', label: 'Staff Management', icon: <FaUsers /> },
  ];

  return (
    <div className="staff-dashboard-layout">
      <aside className="staff-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">👥</span>
          <span className="sidebar-title">Staff Panel</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`sidebar-nav-item${activeTab === item.key ? ' active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="staff-main">
        {activeTab === 'dashboard' && (
          <section className="fade-in-up">
            <h1>Staff Dashboard</h1>
            {statsLoading ? (
              <div className="loading">Loading statistics...</div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : stats ? (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <FaClipboardList className="stat-icon" />
                    <div>
                      <h3>{stats.overview.totalComplaints}</h3>
                      <p>Total Complaints</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <FaClock className="stat-icon" />
                    <div>
                      <h3>{stats.overview.pendingComplaints}</h3>
                      <p>Pending</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <FaTools className="stat-icon" />
                    <div>
                      <h3>{stats.overview.inProgressComplaints}</h3>
                      <p>In Progress</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <FaCheckCircle className="stat-icon" />
                    <div>
                      <h3>{stats.overview.resolvedComplaints}</h3>
                      <p>Resolved</p>
                    </div>
                  </div>
                </div>
                <div className="charts-section">
                  <div className="chart-card">
                    <h3>Complaints by Category</h3>
                    <Pie
                      data={{
                        labels: stats.categoryStats.map(c => c._id),
                        datasets: [{
                          data: stats.categoryStats.map(c => c.count),
                          backgroundColor: [
                            '#667eea', '#764ba2', '#43e97b', '#f093fb', '#fd7e14', '#20c997', '#dc3545'
                          ]
                        }]
                      }}
                    />
                  </div>
                  <div className="chart-card">
                    <h3>Complaints by Priority</h3>
                    <Bar
                      data={{
                        labels: stats.priorityStats.map(p => p._id),
                        datasets: [{
                          label: 'Complaints',
                          data: stats.priorityStats.map(p => p.count),
                          backgroundColor: '#667eea'
                        }]
                      }}
                      options={{ responsive: true, plugins: { legend: { display: false } } }}
                    />
                  </div>
                </div>
              </>
            ) : null}
          </section>
        )}

        {activeTab === 'complaints' && (
          <section className="fade-in-up">
            <div className="complaints-header">
              <h1>Complaint Management</h1>
              <div className="complaint-actions">
                <button className="btn btn-outline" onClick={() => fetchComplaints(1)}>
                  <FaSearch /> Refresh
                </button>
              </div>
            </div>

            <div className="complaint-filters">
              <div className="filter-group">
                <FaFilter className="filter-icon" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  value={complaintFilters.search}
                  onChange={e => handleComplaintFilterChange('search', e.target.value)}
                  className="search-input"
                />
              </div>
              <select 
                value={complaintFilters.status} 
                onChange={e => handleComplaintFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select 
                value={complaintFilters.priority} 
                onChange={e => handleComplaintFilterChange('priority', e.target.value)}
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select 
                value={complaintFilters.category} 
                onChange={e => handleComplaintFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="furniture">Furniture</option>
                <option value="wifi">WiFi/Internet</option>
                <option value="heating">Heating/Cooling</option>
                <option value="cleaning">Cleaning</option>
                <option value="other">Other</option>
              </select>
              <input 
                type="text" 
                placeholder="Building" 
                value={complaintFilters.building} 
                onChange={e => handleComplaintFilterChange('building', e.target.value)} 
              />
              <button className="btn btn-primary" onClick={() => fetchComplaints(1)}>
                Apply Filters
              </button>
              <button className="btn btn-outline" onClick={() => {
                setComplaintFilters({ status: '', priority: '', category: '', building: '', search: '' });
                fetchComplaints(1);
              }}>
                Clear
              </button>
            </div>

            {complaintLoading ? (
              <div className="loading">Loading complaints...</div>
            ) : (
              <div className="complaints-grid">
                {complaints.map(complaint => (
                  <div key={complaint._id} className="complaint-card">
                    <div className="complaint-header">
                      <h3>{complaint.title}</h3>
                      <div className="complaint-badges">
                        <span 
                          className="badge" 
                          style={{ backgroundColor: getStatusColor(complaint.status) }}
                        >
                          {complaint.status.replace('_', ' ')}
                        </span>
                        <span 
                          className="badge" 
                          style={{ backgroundColor: getPriorityColor(complaint.priority) }}
                        >
                          {complaint.priority}
                        </span>
                      </div>
                    </div>
                    <div className="complaint-body">
                      <p className="complaint-description">{complaint.description}</p>
                      <div className="complaint-details">
                        <div className="detail-item">
                          <strong>Category:</strong> {complaint.category}
                        </div>
                        <div className="detail-item">
                          <strong>Location:</strong> {complaint.location?.building} - {complaint.location?.room}
                        </div>
                        <div className="detail-item">
                          <strong>Reported by:</strong> {complaint.reportedBy?.name}
                        </div>
                        <div className="detail-item">
                          <strong>Date:</strong> {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="complaint-actions">
                      <div className="action-group">
                        <label>Assign to:</label>
                        <select
                          value={complaint.assignedTo?._id || ''}
                          onChange={e => handleAssignComplaint(complaint._id, e.target.value)}
                          disabled={complaintActionLoading === complaint._id + '-assign'}
                        >
                          <option value="">Select Staff</option>
                          {maintenanceStaff.map(staff => (
                            <option key={staff._id} value={staff._id}>
                              {staff.name} ({staff.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="action-group">
                        <label>Status:</label>
                        <select
                          value={complaint.status}
                          onChange={e => handleStatusUpdate(complaint._id, e.target.value)}
                          disabled={complaintActionLoading === complaint._id + '-status'}
                        >
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => openComplaintModal(complaint)}
                        >
                          <FaEye /> View Details
                        </button>
                        {complaint.status === 'in_progress' && (
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setShowComplaintModal(true);
                            }}
                          >
                            <FaCheckCircle /> Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {complaintTotalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-outline"
                  onClick={() => fetchComplaints(complaintPage - 1)}
                  disabled={complaintPage === 1}
                >
                  Previous
                </button>
                <span>Page {complaintPage} of {complaintTotalPages}</span>
                <button
                  className="btn btn-outline"
                  onClick={() => fetchComplaints(complaintPage + 1)}
                  disabled={complaintPage === complaintTotalPages}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === 'staff' && (
          <section className="fade-in-up">
            <div className="staff-header">
              <h1>Staff Management</h1>
              <button className="btn btn-primary" onClick={() => setShowAddStaffModal(true)}>
                <FaPlus /> Add Staff Member
              </button>
            </div>

            {staffLoading ? (
              <div className="loading">Loading staff...</div>
            ) : (
              <div className="staff-grid">
                {staff.map(member => (
                  <div key={member._id} className="staff-card">
                    <div className="staff-avatar">
                      <FaUserCog />
                    </div>
                    <div className="staff-info">
                      <h3>{member.name}</h3>
                      <p className="staff-email">{member.email}</p>
                      <p className="staff-phone">{member.phone || 'No phone'}</p>
                      <p className="staff-role">Role: {member.role.charAt(0).toUpperCase() + member.role.slice(1)}</p>
                      {member.department && <p className="staff-department">Dept: {member.department}</p>}
                      <div className="staff-status">
                        {member.isActive ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-danger">Inactive</span>
                        )}
                      </div>
                    </div>
                    <div className="staff-actions">
                      {member.isActive ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleStaffStatus(member._id, false)}
                          disabled={staffActionLoading === member._id + '-status'}
                        >
                          <FaTimes /> Deactivate
                        </button>
                      ) : (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleStaffStatus(member._id, true)}
                          disabled={staffActionLoading === member._id + '-status'}
                        >
                          <FaCheck /> Activate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Complaint Detail Modal */}
      {showComplaintModal && selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-card large">
            <div className="modal-header">
              <h2>Complaint Details</h2>
              <button 
                className="close-btn"
                onClick={() => setShowComplaintModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="complaint-detail-content">
                <div className="detail-section">
                  <h3>{selectedComplaint.title}</h3>
                  <p>{selectedComplaint.description}</p>
                </div>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Category:</strong> {selectedComplaint.category}
                  </div>
                  <div className="detail-item">
                    <strong>Priority:</strong> {selectedComplaint.priority}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong> {selectedComplaint.status}
                  </div>
                  <div className="detail-item">
                    <strong>Location:</strong> {selectedComplaint.location?.building} - {selectedComplaint.location?.room}
                  </div>
                  <div className="detail-item">
                    <strong>Reported by:</strong> {selectedComplaint.reportedBy?.name}
                  </div>
                  <div className="detail-item">
                    <strong>Assigned to:</strong> {selectedComplaint.assignedTo?.name || 'Unassigned'}
                  </div>
                </div>
                {selectedComplaint.status === 'in_progress' && (
                  <div className="resolution-section">
                    <h3>Resolve Complaint</h3>
                    <div className="form-group">
                      <label>Resolution Notes:</label>
                      <textarea
                        value={resolutionNotes}
                        onChange={e => setResolutionNotes(e.target.value)}
                        className="form-control"
                        rows="4"
                        placeholder="Describe how the issue was resolved..."
                      />
                    </div>
                    <div className="modal-actions">
                      <button 
                        className="btn btn-success"
                        onClick={() => handleResolveComplaint(selectedComplaint._id)}
                        disabled={complaintActionLoading === selectedComplaint._id + '-resolve'}
                      >
                        {complaintActionLoading === selectedComplaint._id + '-resolve' ? 'Resolving...' : 'Mark as Resolved'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Add Staff Member</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddStaffModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddStaff}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={addStaffForm.name}
                    onChange={e => setAddStaffForm({ ...addStaffForm, name: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={addStaffForm.email}
                    onChange={e => setAddStaffForm({ ...addStaffForm, email: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={addStaffForm.password}
                    onChange={e => setAddStaffForm({ ...addStaffForm, password: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={addStaffForm.phone}
                    onChange={e => setAddStaffForm({ ...addStaffForm, phone: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={addStaffForm.role}
                    onChange={e => setAddStaffForm({ ...addStaffForm, role: e.target.value })}
                    className="form-control"
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={addStaffForm.department}
                    onChange={e => setAddStaffForm({ ...addStaffForm, department: e.target.value })}
                    className="form-control"
                    placeholder="e.g., IT, Administration, Management, Electrical, Plumbing"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddStaffModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={addStaffLoading}
                  >
                    {addStaffLoading ? 'Adding...' : 'Add Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .staff-dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%);
        }
        .staff-sidebar {
          width: 260px;
          background: rgba(255,255,255,0.25);
          box-shadow: 2px 0 24px rgba(102,126,234,0.10);
          display: flex;
          flex-direction: column;
          padding: 32px 0 0 0;
          backdrop-filter: blur(18px) saturate(180%);
          border-right: 1.5px solid rgba(102,126,234,0.10);
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 32px 32px 32px;
          border-bottom: 1px solid #eee;
        }
        .sidebar-logo {
          font-size: 2.2rem;
          filter: drop-shadow(0 2px 8px #667eea33);
        }
        .sidebar-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #667eea;
          letter-spacing: 1px;
        }
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 32px;
          padding: 0 24px;
        }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-radius: 12px;
          background: rgba(255,255,255,0.18);
          color: #444;
          font-weight: 500;
          font-size: 1.05rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 2px;
          box-shadow: 0 2px 8px rgba(102,126,234,0.04);
        }
        .sidebar-nav-item.active, .sidebar-nav-item:hover {
          background: rgba(102,126,234,0.18);
          color: #667eea;
          box-shadow: 0 4px 16px rgba(102,126,234,0.10);
        }
        .staff-main {
          flex: 1;
          padding: 48px 32px 32px 32px;
          background: transparent;
          min-height: 100vh;
        }
        .fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(.39,.575,.565,1) both;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: none; }
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 32px;
          margin-bottom: 36px;
        }
        .stat-card {
          background: rgba(255,255,255,0.35);
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(102,126,234,0.10);
          padding: 32px 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          transition: all 0.2s;
          border: 1.5px solid rgba(102,126,234,0.10);
          backdrop-filter: blur(12px) saturate(180%);
        }
        .stat-card:hover {
          box-shadow: 0 12px 36px 0 rgba(102,126,234,0.18);
          background: rgba(102,126,234,0.10);
        }
        .stat-icon {
          font-size: 2.5rem;
          color: #667eea;
          filter: drop-shadow(0 2px 8px #667eea22);
        }
        .charts-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 32px;
          margin-bottom: 36px;
        }
        .chart-card {
          background: rgba(255,255,255,0.35);
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(102,126,234,0.10);
          padding: 28px 18px 18px 18px;
          border: 1.5px solid rgba(102,126,234,0.10);
          backdrop-filter: blur(12px) saturate(180%);
        }
        .complaints-header, .staff-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .complaint-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          background: rgba(255,255,255,0.25);
          border-radius: 12px;
          padding: 16px;
          align-items: center;
          box-shadow: 0 2px 8px rgba(102,126,234,0.04);
          backdrop-filter: blur(8px) saturate(180%);
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.7);
          border-radius: 8px;
          padding: 8px 12px;
        }
        .filter-icon {
          color: #667eea;
        }
        .search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 1rem;
          min-width: 200px;
        }
        .complaints-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        .complaint-card {
          background: rgba(255,255,255,0.35);
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(102,126,234,0.10);
          padding: 24px;
          border: 1.5px solid rgba(102,126,234,0.10);
          backdrop-filter: blur(12px) saturate(180%);
          transition: all 0.2s;
        }
        .complaint-card:hover {
          box-shadow: 0 12px 36px 0 rgba(102,126,234,0.18);
          background: rgba(102,126,234,0.10);
        }
        .complaint-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .complaint-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.2rem;
        }
        .complaint-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }
        .complaint-description {
          color: #666;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        .complaint-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }
        .detail-item {
          font-size: 0.9rem;
          color: #555;
        }
        .complaint-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .action-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .action-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #667eea;
        }
        .action-group select {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e1e8ed;
          font-size: 0.9rem;
          background: rgba(255,255,255,0.7);
        }
        .action-buttons {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .staff-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .staff-card {
          background: rgba(255,255,255,0.35);
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(102,126,234,0.10);
          padding: 24px;
          border: 1.5px solid rgba(102,126,234,0.10);
          backdrop-filter: blur(12px) saturate(180%);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.2s;
        }
        .staff-card:hover {
          box-shadow: 0 12px 36px 0 rgba(102,126,234,0.18);
          background: rgba(102,126,234,0.10);
        }
        .staff-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          margin-bottom: 16px;
        }
        .staff-info h3 {
          margin: 0 0 8px 0;
          color: #333;
        }
        .staff-email, .staff-phone, .staff-role, .staff-department {
          margin: 4px 0;
          color: #666;
          font-size: 0.9rem;
        }
        .staff-role {
          font-weight: 600;
          color: #667eea;
        }
        .staff-department {
          color: #555;
          font-style: italic;
        }
        .staff-status {
          margin: 12px 0;
        }
        .staff-actions {
          margin-top: 16px;
        }
        .pagination {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
          margin-top: 32px;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(102,126,234,0.18);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(6px);
          animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .modal-card {
          background: rgba(255,255,255,0.85);
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(102,126,234,0.18);
          padding: 36px 32px;
          min-width: 400px;
          max-width: 95vw;
          border: 1.5px solid rgba(102,126,234,0.10);
          backdrop-filter: blur(12px) saturate(180%);
          animation: fadeInUp 0.4s cubic-bezier(.39,.575,.565,1) both;
        }
        .modal-card.large {
          min-width: 600px;
          max-width: 90vw;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
          padding: 4px;
        }
        .close-btn:hover {
          color: #667eea;
        }
        .detail-section h3 {
          margin: 0 0 12px 0;
          color: #333;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 16px 0;
        }
        .resolution-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #eee;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #667eea;
        }
        .form-control {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1.5px solid #e1e8ed;
          font-size: 1rem;
          background: rgba(255,255,255,0.7);
          transition: border 0.2s, box-shadow 0.2s;
        }
        .form-control:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px #667eea33;
        }
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }
        .btn {
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-size: 1rem;
          font-weight: 500;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          box-shadow: 0 2px 8px rgba(102,126,234,0.10);
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn:hover {
          background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
          box-shadow: 0 4px 16px rgba(102,126,234,0.18);
        }
        .btn-outline {
          background: transparent;
          color: #667eea;
          border: 1.5px solid #667eea;
          box-shadow: none;
        }
        .btn-outline:hover {
          background: #667eea;
          color: #fff;
        }
        .btn-success {
          background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
        }
        .btn-success:hover {
          background: linear-gradient(90deg, #38f9d7 0%, #43e97b 100%);
        }
        .btn-danger {
          background: linear-gradient(90deg, #dc3545 0%, #fd7e14 100%);
        }
        .btn-danger:hover {
          background: linear-gradient(90deg, #fd7e14 0%, #dc3545 100%);
        }
        .btn-secondary {
          background: #e0e7ff;
          color: #667eea;
        }
        .btn-secondary:hover {
          background: #667eea;
          color: #fff;
        }
        .btn-sm {
          padding: 6px 12px;
          font-size: 0.9rem;
        }
        .badge-success {
          background: rgba(67,233,123,0.15);
          color: #43e97b;
        }
        .badge-danger {
          background: rgba(220,53,69,0.15);
          color: #dc3545;
        }
        .loading {
          text-align: center;
          padding: 48px 0;
          font-size: 1.2rem;
          color: #667eea;
        }
        .alert {
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 1.05rem;
          margin-bottom: 18px;
          box-shadow: 0 2px 8px rgba(220,53,69,0.06);
        }
        .alert-danger {
          background: rgba(220,53,69,0.10);
          color: #dc3545;
          border: 1.5px solid #dc3545;
        }
        @media (max-width: 900px) {
          .staff-main { padding: 32px 8px 24px 8px; }
          .staff-sidebar { width: 100px; padding: 16px 0 0 0; }
          .sidebar-title { display: none; }
          .sidebar-header { padding: 0 12px 24px 12px; }
          .sidebar-nav { padding: 0 8px; }
          .complaints-grid { grid-template-columns: 1fr; }
          .staff-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .stats-grid, .charts-section { grid-template-columns: 1fr; }
          .complaint-details { grid-template-columns: 1fr; }
          .detail-grid { grid-template-columns: 1fr; }
          .modal-card { min-width: 95vw; padding: 24px 16px; }
        }
      `}</style>
    </div>
  );
};

export default StaffDashboard;
