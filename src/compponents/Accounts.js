import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/Accounts.css";

const Accounts = () => {
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    group: "",
    role: "",
  });

  const fetchUsers = async () => {
    try {
        const email = localStorage.getItem("userEmail");
      const res = await axios.get("http://localhost:3500/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowPopup(true);
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      group: "",
      role: "",
    });
    setShowPopup(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await axios.put(`http://localhost:3500/api/users/${editingUser._id}`, editingUser);
      } else {
        await axios.post("http://localhost:3500/signup", formData);
      }
      setShowPopup(false);
      fetchUsers();
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  return (
    <div className="account-wrapper">
      <h2>All Users</h2>
      <button className="add-account-btn" onClick={handleAddClick}>Add Account</button>

      <table className="account-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Group</th>
            <th>Role</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.group}</td>
              <td>{u.role}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEditClick(u)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>{editingUser ? "Edit User" : "Add User"}</h3>
            <input
              name="name"
              value={editingUser ? editingUser.name : formData.name}
              onChange={handleInputChange}
              placeholder="Name"
            />
            <input
              name="email"
              value={editingUser ? editingUser.email : formData.email}
              onChange={handleInputChange}
              placeholder="Email"
            />
            <input
              name="password"
              value={editingUser ? editingUser.password : formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              type="password"
            />
            <input
              name="group"
              value={editingUser ? editingUser.group : formData.group}
              onChange={handleInputChange}
              placeholder="Group"
            />
            <select
              name="role"
              value={editingUser ? editingUser.role : formData.role}
              onChange={handleInputChange}
            >
              <option value="manager">manager</option>
              <option value="ceo">ceo</option>
              <option value="admin">admin</option>
            </select>

            <button className="update-btn" onClick={handleSubmit}>
              {editingUser ? "Update" : "Create"}
            </button>
            <button className="cancel-btn" onClick={() => setShowPopup(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
