import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import {server} from './variables/variables';

const AdminDashboard = () => {
  const [contacts, setContacts] = useState([]);
  console.log('server',server);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${server}/api/contact`);
      setContacts(res.data);
    } catch (err) {
      alert('Failed to load contacts');
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${server}/api/contact/${id}/approve`);
      await axios.post(`${server}/api/contact/${id}/send-email`);
      fetchContacts(); // Refresh the list
    } catch (err) {
      alert('Error approving contact');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>📋 Contact Requests</h2>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Institute</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(contact => (
            <tr key={contact._id}>
              <td>{contact.name}</td>
              <td>{contact.email}</td>
              <td>{contact.mobile}</td>
              <td>{contact.institute}</td>
              <td>{contact.approved ? '✅ Approved' : '⏳ Pending'}</td>
              <td>
                {!contact.approved && (
                  <button onClick={() => handleApprove(contact._id)}>Approve</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
