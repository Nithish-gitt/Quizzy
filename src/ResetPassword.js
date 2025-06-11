import React, { useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { server } from './variables/variables';
import axios from 'axios';
import './ResetPassword.css';

function ResetPassword() {
  const { token } = useParams();
  // const [email, setEmail]=useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  // var payload;

  function parseJwt (token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

  const payload = parseJwt(token);
  console.log('payload='+payload.email);
  



  const handleSubmit = async (e) => {
    e.preventDefault();
    // setEmail(payload.email);
  

    if (newPassword !== confirmPassword) {
      setMsg("❌ Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${server}/api/auth/reset-password/${token}`, {
        username,
        newPassword,
        email: payload.email
      });
      alert(res.data.message || '✅ Password reset successful');
      navigate('/');

    } catch (err) {
      setMsg(err.response?.data?.message || '❌ Error resetting password');
    }
  };

  return (
    <div className="reset-container">
      <h2>🔐 Reset Your Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={payload.email}
          aria-disabled
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {msg && <p style={{ color: msg.startsWith('✅') ? 'green' : 'red' }}>{msg}</p>}
    </div>
  );
}

export default ResetPassword;
