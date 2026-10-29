import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <span className="hamburger"></span>
        <span className="hamburger"></span>
        <span className="hamburger"></span>
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <nav className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="logo">
          <h2>💰 Family Expenses</h2>
          <button className="close-btn" onClick={closeSidebar}>×</button>
        </div>

        {user && (
          <div className="user-info">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>
        )}

        <ul className="nav-menu">
          <li>
            <Link to="/" className={isActive('/') && location.pathname === '/' ? 'active' : ''} onClick={closeSidebar}>
              📊 Dashboard
            </Link>
          </li>
          <li>
            <Link to="/expenses" className={isActive('/expenses') ? 'active' : ''} onClick={closeSidebar}>
              💰 Transactions
            </Link>
          </li>
          <li>
            <Link to="/categories" className={isActive('/categories') ? 'active' : ''} onClick={closeSidebar}>
              🏷️ Categories
            </Link>
          </li>
          <li>
            <Link to="/users" className={isActive('/users') ? 'active' : ''} onClick={closeSidebar}>
              👥 Members
            </Link>
          </li>
          <li>
            <Link to="/reports" className={isActive('/reports') ? 'active' : ''} onClick={closeSidebar}>
              📈 Reports
            </Link>
          </li>
        </ul>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;

