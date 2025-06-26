import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiHome, FiPlus, FiLogOut } from 'react-icons/fi';
import { FaUser } from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import './css/Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);

    const root = document.querySelector('.main-content');
    if (root) {
      root.style.marginLeft = isCollapsed ? '220px' : '60px';
    }
  };

  return (
    <div className={`sidebar-fixed ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <h2 className="sidebar-title">Dashboard</h2>}
        <button className="toggle-button" onClick={toggleSidebar}>
          <FiMenu size={22} />
        </button>
      </div>
      <nav className="sidebar-nav">
        <Link to="/dashboard" className="sidebar-link">
          <RxDashboard size={20} />
          {!isCollapsed && "Dashboard"}
        </Link>
        {localStorage.getItem("userRole") === "ceo" && (
        <Link to="/users" className="sidebar-link">
          <FaUser  size={20} />
          {!isCollapsed && "users"}
        </Link>
        )}
        <Link to="/home" className="sidebar-link">
          <FiHome size={20} />
          {!isCollapsed && "Home"}
        </Link>
        <Link to="/add-company" className="sidebar-link">
          <FiPlus size={20} />
          {!isCollapsed && "Add Company"}
        </Link>
        <Link to="/" className="sidebar-link">
          <FiLogOut size={20} />
          {!isCollapsed && "Logout"}
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
