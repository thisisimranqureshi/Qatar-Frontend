import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiPlus, FiLogOut } from 'react-icons/fi';
import './css/Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="sidebar-toggle-button" onClick={toggleSidebar}>
        {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </div>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <h2 className="sidebar-title">Dashboard</h2>
        <nav>
          <Link to="/home" className="sidebar-link"><FiHome /> Home</Link>
          <Link to="/add-company" className="sidebar-link"><FiPlus /> Add Company</Link>
          <Link to="/" className="sidebar-link"><FiLogOut /> Logout</Link>
        </nav>
      </div>

      {isOpen && <div className="sidebar-backdrop" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar;
