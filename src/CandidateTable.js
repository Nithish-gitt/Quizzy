import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import './CandidateTable.css';
import axios from 'axios';
import { useLocation,useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { server } from './variables/variables';



const CandidateTable = () => {
  const [numCandidates, setNumCandidates] = useState('');
  const [rows, setRows] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState('');
  const [userid, setUserids] =useState(false);
  const location = useLocation();
  const { username, testname, testvisibility } = location.state || {};
  const navigate = useNavigate();
  const [isSelfAssigned, setIsSelfAssigned] = useState(false);

  console.log('testvisibility',testvisibility);

  const handleGenerateRows = () => {
    const count = parseInt(numCandidates);
    if (isNaN(count) || count <= 0) return;

    const newRows = Array.from({ length: count }, (_, index) => ({
      id: index,
      name: '',
      email: '',
      username: ''
    }));
    setRows(newRows);
    setConfirmed(false);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleConfirmUsers = async() => {
    const updatedRows = rows.map(row => {
      const username = row.name.replace(/\s+/g, '').toLowerCase() + Math.floor(100000 + Math.random() * 900000);
      return { ...row, username };
    });
    setRows(updatedRows);
    setConfirmed(true);
    
    
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: ['name', 'email'], defval: '' });

      const importedRows = jsonData.map((row, index) => ({
        id: index,
        name: row.name || '',
        email: row.email || '',
        username: ''
      }));

      setRows(importedRows);
      setConfirmed(false);
    };

    reader.readAsArrayBuffer(file);
  };
  const handleSendemails = async()=>
  {
    try {
      setUserids(true);
      rows.map(async row=>{
        const to = row.email;
        const subject = "Username Created Successfully!";
        const text = `Hi ${row.name},\nYour Username: ${row.username}`
        await axios.post(`${server}/send-email`, { to, subject, text });

      });
      setStatus('✅ Email sent successfully');
    } catch (error) {
      setStatus('❌ Failed to send email');
    }
  };

  const handleCheckboxChange = (e) => {
    setIsSelfAssigned(e.target.checked);
    setRows([]);
  };

  const handleTakeQuiz = async()=>{
      try{
      rows.map( async row =>{
        await axios.post(`${server}/api/candidates/add`, {
          username: username,
          candidateName: '',
          candidateEmail: '',
          candidateUsername: '',

      })
    });
    alert("Quiz Initialized");
    navigate('/quiz',{state :{ username: username , testname: testname, testVisibility: testvisibility}});
    
  } catch (error) {
        setStatus('❌ Failed to Load Quiz');
      }

  };

  const handleSubmit = async () => {
    try{
    rows.map( async row =>{
      await axios.post(`${server}/api/candidates/add`, {
        username: username,
        candidateName: row.name,
        candidateEmail: row.email,
        candidateUsername: row.username

    })
  });
  alert("Candidates added successfully");
  navigate('/quiz',{state :{ username: username , testname: testname , testVisibility: testvisibility}});
  
} catch (error) {
      setStatus('❌ Failed to add candidate(s)');
    }
};

  return (
    <div>
      <Navbar username={username}/>
    <div className="container">
      <h2>Candidate Registration</h2>

      <div className="input-group">
        <input
          type="number"
          min="1"
          placeholder="Enter number of candidates"
          value={numCandidates}
          onChange={(e) => setNumCandidates(e.target.value)}
          disabled={isSelfAssigned}
        />
        <button className="tick-btn" onClick={handleGenerateRows} disabled='true'>✔️</button>
      </div>

      <div className="import-link">
        <span onClick={() => fileInputRef.current.click()}>📥 Import Excel</span>
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          onChange={handleFileImport}
          style={{ display: 'none' }}
          disabled = 'true'
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox" 
            onChange={handleCheckboxChange} 
          />
          Self-assignment
        </label>
         { isSelfAssigned &&<button className="confirm-btn" onClick={handleTakeQuiz}>TakeQuiz</button>}
      </div>

      {rows.length > 0 && (
        <>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      value={row.email}
                      onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                    />
                  </td>
                  <td>
                    <input type="text" value={row.username} readOnly />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="confirm-btn" onClick={handleConfirmUsers}>
            Confirm Users
          </button>

          {confirmed && <div><p className="success-msg">Usernames generated successfully ✅</p> <button className="confirm-btn" onClick={handleSendemails}>
            Send emails
          </button>
              <button className="confirm-btn" onClick={handleSubmit}>Submit</button>
          </div>}
          {userid && <p>{status}</p>}
        </>
      )}
    </div>
    </div>
  );
};

export default CandidateTable;
