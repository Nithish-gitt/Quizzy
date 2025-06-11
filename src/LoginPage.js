import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import axios from 'axios';
import { server } from './variables/variables';

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    mobile: '',
    institute: '',
    approved: false
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async(e) => {
    e.preventDefault();
     try {
      await axios.post(`${server}/api/login`,
        { username: form.username, password: form.password },
        { withCredentials: true }
      );
      console.log("Login Successfull");
      navigate('/test-results', { state: { myParam: `${form.username}` } });

    } catch {
      alert('Login failed');
    }
  };

  const handleContactSubmit = async(e) => {
    e.preventDefault();
    try {
    const res = await axios.post(`${server}/api/contact`, contactForm);
    alert(res.data.message);
    setShowModal(false);
    setContactForm({ name: '', email: '', mobile: '', institute: '' });
  } catch (err) {
    alert('Error submitting request');
  }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLoginSubmit} className="login-form">
        <h2>🔐 Login</h2>
        <div className="form-group">
          <label>Username</label>
          <input type="text" name="username" value={form.username} onChange={handleLoginChange} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleLoginChange} required />
        </div>
        <button type="submit" className="login-btn">Login</button>
        <button type="button" className="contact-btn" onClick={() => setShowModal(true)}>Register</button>
      </form>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>📨 Login Request</h3>
            <form onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={contactForm.name} onChange={handleContactChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={contactForm.email} onChange={handleContactChange} required />
              </div>
              <div className="form-group">
                <label>Mobile</label>
                <input type="tel" name="mobile" value={contactForm.mobile} onChange={handleContactChange} required />
              </div>
              <div className="form-group">
                <label>Institute / Company</label>
                <input type="text" name="institute" value={contactForm.institute} onChange={handleContactChange} required />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="login-btn" >Submit Request</button>
                <button type="button" className="clear-btn" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
