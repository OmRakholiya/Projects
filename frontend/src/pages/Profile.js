import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaIdCard, 
  FaBuilding,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaKey
} from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      student: 'Student',
      staff: 'Staff Member',
      maintenance: 'Maintenance Staff',
      admin: 'Administrator'
    };
    return roleMap[role] || role;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <h3>{user?.name}</h3>
              <p className="user-role">{getRoleDisplay(user?.role)}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser />
              Profile Information
            </button>
            <button
              className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <FaKey />
              Change Password
            </button>
          </div>
        </div>

        <div className="profile-main">
          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <div className="input-group">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <div className="input-group">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      value={user?.email}
                      className="form-control"
                      disabled
                    />
                  </div>
                  <small className="form-text">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <div className="input-group">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="form-control"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {user?.role === 'student' && (
                  <div className="form-group">
                    <label className="form-label">Student ID</label>
                    <div className="input-group">
                      <FaIdCard className="input-icon" />
                      <input
                        type="text"
                        value={user?.studentId || ''}
                        className="form-control"
                        disabled
                      />
                    </div>
                  </div>
                )}

                {user?.role === 'staff' && (
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <div className="input-group">
                      <FaBuilding className="input-icon" />
                      <input
                        type="text"
                        value={user?.department || ''}
                        className="form-control"
                        disabled
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <FaSave />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="profile-section">
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">
                    Current Password
                  </label>
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="form-control"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('current')}
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="form-control"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="form-control"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <FaKey />
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          padding: 20px;
          max-width: 1200px;
          margin: 60px auto 0 auto;
        }

        .profile-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .profile-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .profile-header p {
          color: #6c757d;
          font-size: 16px;
        }

        .profile-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 40px;
        }

        .profile-sidebar {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          height: fit-content;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .user-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 2rem;
          color: white;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .user-details h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 10px 0;
        }

        .user-role {
          color: #667eea;
          font-weight: 500;
          margin: 0 0 4px 0;
        }

        .user-email {
          color: #6c757d;
          font-size: 14px;
          margin: 0;
        }

        .profile-tabs {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          color: #6c757d;
        }

        .tab-button:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .tab-button.active {
          background: #667eea;
          color: white;
        }

        .profile-main {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .profile-section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 24px;
        }

        .form-text {
          color: #6c757d;
          font-size: 12px;
          margin-top: 4px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 4px;
        }

        .password-toggle:hover {
          color: #333;
        }

        @media (max-width: 768px) {
          .profile-container {
            padding: 15px;
          }

          .profile-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .profile-sidebar {
            order: 2;
          }

          .profile-main {
            order: 1;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile; 