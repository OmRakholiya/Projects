import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers, FaClipboardList, FaTools, FaChartBar, FaDownload, FaUserCog, FaListAlt, FaCheck, FaTimes, FaUserShield, FaUser, FaPlus, FaEdit } from 'react-icons/fa';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

const ROLES = ['student', 'staff', 'maintenance', 'admin'];
const ROLE_LABELS = {
  student: 'Student',
  staff: 'Staff',
  maintenance: 'Maintenance',
  admin: 'Admin',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User management state
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState('');

  // Complaint management state
  const [complaints, setComplaints] = useState([]);
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintPage, setComplaintPage] = useState(1);
  const [complaintTotalPages, setComplaintTotalPages] = useState(1);
  const [complaintActionLoading, setComplaintActionLoading] = useState('');
  const [maintenanceStaff, setMaintenanceStaff] = useState([]);
  const [complaintFilters, setComplaintFilters] = useState({ status: '', priority: '', category: '', building: '' });

  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [analyticsRange, setAnalyticsRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchStats();
      fetchAnalytics();
    }
    if (activeTab === 'users') fetchUsers(1);
    if (activeTab === 'complaints') {
      fetchComplaints(1);
      fetchMaintenanceStaff();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    setUserLoading(true);
    try {
      const res = await axios.get(`/admin/users?page=${page}&limit=10`);
      setUsers(res.data.users);
      setUserPage(res.data.pagination.current);
      setUserTotalPages(res.data.pagination.total);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setUserLoading(false);
    }
  };

  const handleUserStatus = async (id, isActive) => {
    setUserActionLoading(id + '-status');
    try {
      await axios.patch(`/admin/users/${id}/status`, { isActive });
      fetchUsers(userPage);
    } catch (err) {
      setError('Failed to update user status');
    } finally {
      setUserActionLoading('');
    }
  };

  const handleUserRole = async (id, newRole) => {
    setUserActionLoading(id + '-role');
    try {
      await axios.patch(`/admin/users/${id}`, { role: newRole });
      fetchUsers(userPage);
    } catch (err) {
      setError('Failed to update user role');
    } finally {
      setUserActionLoading('');
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await axios.post('/admin/maintenance-staff', addForm);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', phone: '' });
      fetchUsers(userPage);
    } catch (err) {
      setError('Failed to add maintenance staff');
    } finally {
      setAddLoading(false);
    }
  };

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

  const handleAssign = async (complaintId, staffId) => {
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

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    setComplaintActionLoading(complaintId + '-delete');
    try {
      await axios.delete(`/complaints/${complaintId}`);
      fetchComplaints(complaintPage);
    } catch (err) {
      setError('Failed to delete complaint');
    } finally {
      setComplaintActionLoading('');
    }
  };

  const handleComplaintFilterChange = (name, value) => {
    setComplaintFilters(prev => ({ ...prev, [name]: value }));
    setComplaintPage(1);
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      let params = '';
      if (analyticsRange.startDate && analyticsRange.endDate) {
        params = `?startDate=${analyticsRange.startDate}&endDate=${analyticsRange.endDate}`;
      }
      const res = await axios.get(`/admin/analytics${params}`);
      setAnalytics(res.data);
    } catch (err) {
      setAnalyticsError('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleAnalyticsRangeChange = (e) => {
    setAnalyticsRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAnalyticsRangeSubmit = (e) => {
    e.preventDefault();
    fetchAnalytics();
  };

  // Sidebar navigation items
  const navItems = [
    { key: 'analytics', label: 'Analytics', icon: <FaChartBar /> },
    { key: 'users', label: 'User Management', icon: <FaUsers /> },
    { key: 'complaints', label: 'Complaint Management', icon: <FaListAlt /> },
  ];

  return (
    <div className="admin-dashboard-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">🔧</span>
          <span className="sidebar-title">Admin Panel</span>
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
      <main className="admin-main">
        {activeTab === 'analytics' && (
          <section className="fade-in-up">
            <h1>Analytics</h1>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : stats ? (
              <>
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <FaClipboardList className="stat-icon" />
                    <div>
                      <h3>{stats.overview.totalComplaints}</h3>
                      <p>Total Complaints</p>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <FaUsers className="stat-icon" />
                    <div>
                      <h3>{stats.overview.totalUsers}</h3>
                      <p>Total Users</p>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <FaTools className="stat-icon" />
                    <div>
                      <h3>{stats.overview.maintenanceStaff}</h3>
                      <p>Maintenance Staff</p>
                    </div>
                  </div>
                  <div className="admin-stat-card">
                    <FaChartBar className="stat-icon" />
                    <div>
                      <h3>{stats.overview.resolvedComplaints}</h3>
                      <p>Resolved Complaints</p>
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
                {/* Enhanced Analytics */}
                <div className="enhanced-analytics-section">
                  <form className="analytics-range-form" onSubmit={handleAnalyticsRangeSubmit}>
                    <label>From: <input type="date" name="startDate" value={analyticsRange.startDate} onChange={handleAnalyticsRangeChange} /></label>
                    <label>To: <input type="date" name="endDate" value={analyticsRange.endDate} onChange={handleAnalyticsRangeChange} /></label>
                    <button className="btn btn-outline btn-sm" type="submit">Apply</button>
                  </form>
                  {analyticsLoading ? (
                    <div className="loading">Loading analytics...</div>
                  ) : analyticsError ? (
                    <div className="alert alert-danger">{analyticsError}</div>
                  ) : analytics ? (
                    <div className="enhanced-charts-grid">
                      <div className="chart-card">
                        <h3>Monthly Complaints Trend</h3>
                        <Line
                          data={{
                            labels: analytics.monthlyTrend.map(t => `${t._id.month}/${t._id.year}`),
                            datasets: [{
                              label: 'Complaints',
                              data: analytics.monthlyTrend.map(t => t.count),
                              backgroundColor: 'rgba(102,126,234,0.2)',
                              borderColor: '#667eea',
                              tension: 0.3,
                              fill: true
                            }]
                          }}
                          options={{ responsive: true, plugins: { legend: { display: false } } }}
                        />
                      </div>
                      <div className="chart-card">
                        <h3>Top Locations</h3>
                        <Doughnut
                          data={{
                            labels: analytics.topLocations.map(l => `${l._id.building} ${l._id.room}`),
                            datasets: [{
                              data: analytics.topLocations.map(l => l.count),
                              backgroundColor: [
                                '#667eea', '#764ba2', '#43e97b', '#f093fb', '#fd7e14', '#20c997', '#dc3545', '#ffb347', '#6a89cc', '#38ada9'
                              ]
                            }]
                          }}
                          options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                        />
                      </div>
                      <div className="chart-card">
                        <h3>Average Resolution Time</h3>
                        <div className="resolution-time-value">
                          <span>{analytics.avgResolutionTime ? analytics.avgResolutionTime.toFixed(2) : 'N/A'} days</span>
                        </div>
                      </div>
                      <div className="chart-card">
                        <h3>Status Over Time</h3>
                        <Bar
                          data={{
                            labels: Array.from(new Set(analytics.statusOverTime.map(s => `${s._id.month}/${s._id.year}`))),
                            datasets: Array.from(new Set(analytics.statusOverTime.map(s => s._id.status))).map(status => ({
                              label: status,
                              data: analytics.statusOverTime.filter(s => s._id.status === status).map(s => s.count),
                              backgroundColor: status === 'resolved' ? '#43e97b' : status === 'pending' ? '#fd7e14' : status === 'assigned' ? '#667eea' : status === 'in_progress' ? '#764ba2' : '#dc3545',
                            }))
                          }}
                          options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { x: { stacked: true }, y: { stacked: true } } }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="recent-section">
                  <h3>Recent Complaints</h3>
                  <div className="recent-list">
                    {stats.recentComplaints.map((c) => (
                      <div key={c._id} className="recent-item">
                        <div><strong>{c.title}</strong> ({c.category})</div>
                        <div>Status: {c.status}</div>
                        <div>By: {c.reportedBy?.name}</div>
                        <div>Date: {new Date(c.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </section>
        )}
        {activeTab === 'users' && (
          <section className="fade-in-up">
            <div className="user-management-header">
              <h1>User Management</h1>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <FaPlus /> Add Maintenance Staff
              </button>
            </div>
            {userLoading ? (
              <div className="loading">Loading users...</div>
            ) : (
              <div className="user-table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            value={user.role}
                            onChange={e => handleUserRole(user._id, e.target.value)}
                            disabled={userActionLoading === user._id + '-role'}
                          >
                            {ROLES.map(role => (
                              <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {user.isActive ? (
                            <span className="badge badge-success">Active</span>
                          ) : (
                            <span className="badge badge-danger">Inactive</span>
                          )}
                        </td>
                        <td>{user.phone || '-'}</td>
                        <td>
                          {user.isActive ? (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleUserStatus(user._id, false)}
                              disabled={userActionLoading === user._id + '-status'}
                            >
                              <FaTimes /> Deactivate
                            </button>
                          ) : (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUserStatus(user._id, true)}
                              disabled={userActionLoading === user._id + '-status'}
                            >
                              <FaCheck /> Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="user-pagination">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => fetchUsers(userPage - 1)}
                    disabled={userPage === 1}
                  >
                    Previous
                  </button>
                  <span>Page {userPage} of {userTotalPages}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => fetchUsers(userPage + 1)}
                    disabled={userPage === userTotalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            {showAddModal && (
              <div className="modal-overlay">
                <div className="modal-card">
                  <h2>Add Maintenance Staff</h2>
                  <form onSubmit={handleAddMaintenance}>
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={addForm.name}
                        onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={addForm.email}
                        onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        value={addForm.password}
                        onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="text"
                        value={addForm.phone}
                        onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={addLoading}>
                        {addLoading ? 'Adding...' : 'Add Staff'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}
        {activeTab === 'complaints' && (
          <section className="fade-in-up">
            <h1>Complaint Management</h1>
            <div className="complaint-filters">
              <label>Status:
                <select value={complaintFilters.status} onChange={e => handleComplaintFilterChange('status', e.target.value)}>
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label>Priority:
                <select value={complaintFilters.priority} onChange={e => handleComplaintFilterChange('priority', e.target.value)}>
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
              <label>Category:
                <select value={complaintFilters.category} onChange={e => handleComplaintFilterChange('category', e.target.value)}>
                  <option value="">All</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="furniture">Furniture</option>
                  <option value="wifi">WiFi/Internet</option>
                  <option value="heating">Heating/Cooling</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>Building:
                <input type="text" value={complaintFilters.building} onChange={e => handleComplaintFilterChange('building', e.target.value)} placeholder="Building name" />
              </label>
              <button className="btn btn-outline btn-sm" onClick={() => fetchComplaints(1)}>Apply Filters</button>
              <button className="btn btn-outline btn-sm" onClick={() => { setComplaintFilters({ status: '', priority: '', category: '', building: '' }); fetchComplaints(1); }}>Clear</button>
            </div>
            {complaintLoading ? (
              <div className="loading">Loading complaints...</div>
            ) : (
              <div className="complaint-table-wrapper">
                <table className="complaint-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Reported By</th>
                      <th>Assigned To</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(complaint => (
                      <tr key={complaint._id}>
                        <td>{complaint.title}</td>
                        <td>{complaint.category}</td>
                        <td>{complaint.priority}</td>
                        <td>
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
                        </td>
                        <td>{complaint.location?.building} - {complaint.location?.room}</td>
                        <td>{complaint.reportedBy?.name}</td>
                        <td>
                          <select
                            value={complaint.assignedTo?._id || ''}
                            onChange={e => handleAssign(complaint._id, e.target.value)}
                            disabled={complaintActionLoading === complaint._id + '-assign'}
                          >
                            <option value="">Unassigned</option>
                            {maintenanceStaff.map(staff => (
                              <option key={staff._id} value={staff._id}>{staff.name} ({staff.email})</option>
                            ))}
                          </select>
                        </td>
                        <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                        <td>
                          <a href={`/complaint/${complaint._id}`} className="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer">View</a>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteComplaint(complaint._id)}
                            disabled={complaintActionLoading === complaint._id + '-delete'}
                          >Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="complaint-pagination">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => fetchComplaints(complaintPage - 1)}
                    disabled={complaintPage === 1}
                  >Previous</button>
                  <span>Page {complaintPage} of {complaintTotalPages}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => fetchComplaints(complaintPage + 1)}
                    disabled={complaintPage === complaintTotalPages}
                  >Next</button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
      <style jsx>{`
        .admin-dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%);
        }
        .admin-sidebar {
          width: 260px;
          background: rgba(255,255,255,0.25);
          box-shadow: 2px 0 24px rgba(102,126,234,0.10);
          display: flex;
          flex-direction: column;
          padding: 32px 0 0 0;
          backdrop-filter: blur(18px) saturate(180%);
          border-right: 1.5px solid rgba(102,126,234,0.10);
          transition: background 0.3s, box-shadow 0.3s;
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
          text-shadow: 0 2px 8px #667eea11;
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
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          margin-bottom: 2px;
          box-shadow: 0 2px 8px rgba(102,126,234,0.04);
        }
        .sidebar-nav-item.active, .sidebar-nav-item:hover {
          background: rgba(102,126,234,0.18);
          color: #667eea;
          box-shadow: 0 4px 16px rgba(102,126,234,0.10);
        }
        .admin-main {
          flex: 1;
          padding: 48px 32px 32px 32px;
          background: transparent;
          min-height: 100vh;
          transition: background 0.3s;
        }
        .fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(.39,.575,.565,1) both;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: none; }
        }
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 32px;
          margin-bottom: 36px;
        }
        .admin-stat-card {
          background: rgba(255,255,255,0.35);
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(102,126,234,0.10);
          padding: 32px 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          transition: box-shadow 0.2s, background 0.2s;
          border: 1.5px solid rgba(102,126,234,0.10);
          backdrop-filter: blur(12px) saturate(180%);
        }
        .admin-stat-card:hover {
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
          transition: box-shadow 0.2s, background 0.2s;
        }
        .chart-card:hover {
          box-shadow: 0 12px 36px 0 rgba(102,126,234,0.18);
          background: rgba(102,126,234,0.10);
        }
        .recent-section {
          margin-top: 36px;
          background: rgba(255,255,255,0.35);
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(102,126,234,0.10);
          padding: 28px 24px;
          border: 1.5px solid rgba(102,126,234,0.10);
          backdrop-filter: blur(12px) saturate(180%);
        }
        .recent-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-top: 18px;
        }
        .recent-item {
          background: rgba(255,255,255,0.25);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(102,126,234,0.06);
          padding: 16px 14px;
          border: 1px solid rgba(102,126,234,0.08);
          transition: box-shadow 0.2s, background 0.2s;
        }
        .recent-item:hover {
          background: rgba(102,126,234,0.10);
          box-shadow: 0 4px 16px rgba(102,126,234,0.10);
        }
        .user-table-wrapper, .complaint-table-wrapper {
          background: rgba(255,255,255,0.35);
          border-radius: 18px;
          box-shadow: 0 8px 32px 0 rgba(102,126,234,0.10);
          padding: 28px 18px 18px 18px;
          border: 1.5px solid rgba(102,126,234,0.10);
          backdrop-filter: blur(12px) saturate(180%);
          margin-bottom: 32px;
        }
        .user-table, .complaint-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          background: transparent;
        }
        .user-table th, .user-table td, .complaint-table th, .complaint-table td {
          padding: 14px 8px;
          text-align: left;
          background: transparent;
          border-bottom: 1px solid rgba(102,126,234,0.08);
        }
        .user-table th, .complaint-table th {
          background: rgba(102,126,234,0.08);
          font-weight: 600;
          color: #667eea;
          border-bottom: 2px solid #e0e7ff;
        }
        .user-table tr:last-child td, .complaint-table tr:last-child td {
          border-bottom: none;
        }
        .user-table select, .complaint-table select, .complaint-filters select, .complaint-filters input {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e1e8ed;
          font-size: 0.98rem;
          color: #333;
          background: rgba(255,255,255,0.7);
          transition: border 0.2s, box-shadow 0.2s;
        }
        .user-table select:focus, .complaint-table select:focus, .complaint-filters select:focus, .complaint-filters input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px #667eea33;
        }
        .btn, button, input[type="submit"] {
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-size: 1rem;
          font-weight: 500;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          box-shadow: 0 2px 8px rgba(102,126,234,0.10);
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, color 0.2s;
        }
        .btn:hover, button:hover, input[type="submit"]:hover {
          background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
          color: #fff;
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
          border: 1.5px solid #667eea;
        }
        .btn-danger {
          background: linear-gradient(90deg, #dc3545 0%, #fd7e14 100%);
          color: #fff;
          border: none;
        }
        .btn-danger:hover {
          background: linear-gradient(90deg, #fd7e14 0%, #dc3545 100%);
          color: #fff;
        }
        .btn-success {
          background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
          color: #fff;
          border: none;
        }
        .btn-success:hover {
          background: linear-gradient(90deg, #38f9d7 0%, #43e97b 100%);
          color: #fff;
        }
        .btn-secondary {
          background: #e0e7ff;
          color: #667eea;
          border: none;
        }
        .btn-secondary:hover {
          background: #667eea;
          color: #fff;
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
          min-width: 340px;
          max-width: 95vw;
          border: 1.5px solid rgba(102,126,234,0.10);
          backdrop-filter: blur(12px) saturate(180%);
          animation: fadeInUp 0.4s cubic-bezier(.39,.575,.565,1) both;
        }
        .form-group label {
          font-weight: 500;
          color: #667eea;
          margin-bottom: 6px;
          display: block;
        }
        .form-control {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1.5px solid #e1e8ed;
          font-size: 1rem;
          margin-bottom: 12px;
          background: rgba(255,255,255,0.7);
          transition: border 0.2s, box-shadow 0.2s;
        }
        .form-control:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px #667eea33;
        }
        .user-pagination, .complaint-pagination {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: flex-end;
          margin-top: 12px;
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
        .complaint-filters label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.98rem;
          color: #555;
        }
        .enhanced-analytics-section {
          margin-top: 32px;
          background: rgba(255,255,255,0.35);
          border-radius: 16px;
          box-shadow: 0 8px 32px 0 rgba(102,126,234,0.10);
          padding: 32px 24px;
          border: 1.5px solid rgba(102,126,234,0.10);
          backdrop-filter: blur(12px) saturate(180%);
        }
        .analytics-range-form {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 24px;
        }
        .enhanced-charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          margin-bottom: 32px;
        }
        .resolution-time-value {
          font-size: 2.2rem;
          font-weight: 700;
          color: #43e97b;
          text-align: center;
          margin-top: 32px;
        }
        .loading {
          text-align: center;
          padding: 48px 0;
          font-size: 1.2rem;
          color: #667eea;
          letter-spacing: 1px;
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
        .badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          margin-right: 6px;
          margin-bottom: 2px;
          background: rgba(102,126,234,0.10);
          color: #667eea;
          box-shadow: 0 1px 4px rgba(102,126,234,0.04);
          letter-spacing: 0.5px;
          transition: background 0.2s, color 0.2s;
        }
        .badge-success {
          background: rgba(67,233,123,0.15);
          color: #43e97b;
        }
        .badge-danger {
          background: rgba(220,53,69,0.15);
          color: #dc3545;
        }
        .badge-pending {
          background: rgba(253,126,20,0.15);
          color: #fd7e14;
        }
        .badge-assigned {
          background: rgba(102,126,234,0.15);
          color: #667eea;
        }
        .badge-in-progress {
          background: rgba(118,75,162,0.15);
          color: #764ba2;
        }
        .badge-resolved {
          background: rgba(67,233,123,0.15);
          color: #43e97b;
        }
        .badge-closed {
          background: rgba(220,53,69,0.15);
          color: #dc3545;
        }
        .badge-low {
          background: rgba(67,233,123,0.10);
          color: #43e97b;
        }
        .badge-medium {
          background: rgba(102,126,234,0.10);
          color: #667eea;
        }
        .badge-high {
          background: rgba(253,126,20,0.10);
          color: #fd7e14;
        }
        .badge-urgent {
          background: rgba(220,53,69,0.10);
          color: #dc3545;
        }
        @media (max-width: 900px) {
          .charts-section { grid-template-columns: 1fr; }
          .admin-main { padding: 32px 8px 24px 8px; }
          .admin-sidebar { width: 100px; padding: 16px 0 0 0; }
          .sidebar-title { display: none; }
          .sidebar-header { padding: 0 12px 24px 12px; }
          .sidebar-nav { padding: 0 8px; }
        }
        @media (max-width: 600px) {
          .admin-stats-grid, .charts-section, .enhanced-charts-grid, .recent-list {
            grid-template-columns: 1fr;
          }
          .admin-main { padding: 12px 2vw; }
          .admin-sidebar { width: 70px; }
          .sidebar-header { padding: 0 4px 12px 4px; }
          .sidebar-nav { padding: 0 2px; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard; 