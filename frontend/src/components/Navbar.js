import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaHome, 
  FaClipboardList, 
  FaPlus, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaTools,
  FaChartBar
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-content">
            <img src="/mylogo.png" alt="FixItNow Logo" className="brand-logo-img" style={{ height: '40px', width: '40px', objectFit: 'contain', marginRight: '10px' }} />
            <span className="brand-text">FixItNow</span>
          </div>
        </Link>

        <button className="navbar-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="navbar-nav">
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <FaHome />
              <span>Dashboard</span>
            </Link>

            <Link 
              to="/complaints" 
              className={`nav-link ${isActive('/complaints') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <FaClipboardList />
              <span>Complaints</span>
            </Link>

            {(user.role === 'student' || user.role === 'staff') && (
              <Link 
                to="/complaint/new" 
                className={`nav-link ${isActive('/complaint/new') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <FaPlus />
                <span>New Complaint</span>
              </Link>
            )}

            {user.role === 'maintenance' && (
              <Link 
                to="/maintenance" 
                className={`nav-link ${isActive('/maintenance') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <FaTools />
                <span>Maintenance</span>
              </Link>
            )}

            {(user.role === 'staff' || user.role === 'admin') && (
              <Link 
                to="/staff" 
                className={`nav-link ${isActive('/staff') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <FaUser />
                <span>Staff</span>
              </Link>
            )}

            {user.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <FaChartBar />
                <span>Admin</span>
              </Link>
            )}
          </div>

          <div className="navbar-user">
            <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="user-info-inline">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
              </span>
              <Link 
                to="/profile" 
                className="user-menu-item"
                onClick={closeMenu}
              >
                <FaUser />
                <span>Profile</span>
              </Link>
              <button 
                className="user-menu-item logout-btn"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .navbar-brand {
          text-decoration: none;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .brand-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-icon {
          font-size: 2rem;
        }

        .brand-text {
          font-size: 1.8rem;
        }

        .navbar-toggle {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 8px;
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .navbar-nav {
          display: flex;
          gap: 20px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          padding: 10px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .nav-link:hover,
        .nav-link.active {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .navbar-user {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          color: white;
        }

        .user-name {
          font-weight: 600;
          font-size: 14px;
        }

        .user-role {
          font-size: 12px;
          opacity: 0.8;
          text-transform: capitalize;
        }

        .user-menu {
          display: flex;
          gap: 10px;
        }

        .user-menu-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
          font-size: 14px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .user-menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .logout-btn {
          color: #ff6b6b;
        }

        .logout-btn:hover {
          background: rgba(255, 107, 107, 0.1);
          color: #ff6b6b;
        }

        .user-info-inline {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-right: 8px;
          color: white;
        }
        .user-info-inline .user-name {
          font-weight: 600;
          font-size: 14px;
        }
        .user-info-inline .user-role {
          font-size: 12px;
          opacity: 0.8;
          text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .navbar-toggle {
            display: block;
          }

          .navbar-menu {
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            flex-direction: column;
            padding: 20px;
            gap: 20px;
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
          }

          .navbar-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .navbar-nav {
            flex-direction: column;
            width: 100%;
            gap: 10px;
          }

          .nav-link {
            width: 100%;
            justify-content: flex-start;
          }

          .navbar-user {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }

          .user-info {
            align-items: center;
            text-align: center;
          }

          .user-menu {
            flex-direction: column;
            gap: 5px;
          }

          .user-menu-item {
            justify-content: flex-start;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar; 