import React, { useState } from 'react';
import axios from 'axios';

const SendEmail = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  const handleSend = async () => {
    try {
      await axios.post(`${server}/send-email`, { to, subject, text });
      setStatus('✅ Email sent successfully');
    } catch (error) {
      setStatus('❌ Failed to send email');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Send Email</h2>
      <input type="email" placeholder="To" value={to} onChange={e => setTo(e.target.value)} /><br />
      <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} /><br />
      <textarea placeholder="Message" value={text} onChange={e => setText(e.target.value)} /><br />
      <button onClick={handleSend}>Send Email</button>
      <p>{status}</p>
    </div>
  );
};

export default SendEmail;
