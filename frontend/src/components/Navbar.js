import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const getInitial = (username) => username ? username[0].toUpperCase() : '?';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-name">StudySocial</span>
        </Link>

        {user && (
          <div className="navbar-links">
            <Link to="/feed" className={`nav-link ${isActive('/feed') ? 'active' : ''}`}>
              🏠 Bảng tin
            </Link>
            <Link to="/groups" className={`nav-link ${isActive('/groups') ? 'active' : ''}`}>
              👥 Nhóm học tập
            </Link>
          </div>
        )}

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <div className="avatar avatar-sm">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} />
                ) : (
                  getInitial(user.username)
                )}
              </div>
              <span className="username-text">{user.username}</span>
              {menuOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                    👤 Hồ sơ
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
