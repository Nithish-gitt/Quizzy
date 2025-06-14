import React, { useState } from 'react';
import './FileUploadValidator.css';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { server } from './variables/variables';
import axios from 'axios';

const FileUploadValidator = () => {
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'valid' | 'invalid' | null
  const [keyuploadStatus,setKeyUploadStatus] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [keyText, setKeyText] = useState('');
  const location = useLocation();
  const myParam = location.state?.myParam;
  const username = `${myParam}`;  // Add UI input if needed
  const [Testname, setTestname] = useState('');
  const [makePublic, setMakePublic] = useState(false);
  const navigate = useNavigate();


  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setUploadStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
  const text = event.target.result;
  setQuestionText(text);
  validateContent(text);
  setIsLoading(false);
};

    reader.onerror = () => {
      setIsLoading(false);
      setErrors(['Error reading file']);
      setUploadStatus('invalid');
    };

    reader.readAsText(file);
  };

  const handleKeyFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target.result;
       setKeyText(content);
      const lines = content.trim().split(/\r?\n/);

      const errorList = [];
      const formatRegex = /^\d+\.\s[A-Z]$/;

      lines.forEach((line, index) => {
        if (!formatRegex.test(line.trim())) {
          errorList.push(`Line ${index + 1} is invalid: "${line}"`);
        }
      });

      if (errorList.length === 0) {
        setKeyUploadStatus('valid');
        setErrors([]);
      } else {
        setKeyUploadStatus('invalid');
        setErrors(errorList);
      }

      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const validateContent = (text) => {
    const rawLines = text.split(/\r?\n/).map(line => line.trim());
    const lines = rawLines.filter(line => line.length > 0);
    const localErrors = [];

    for (let i = 0; i < lines.length; i += 2) {
      const questionLine = lines[i];
      const optionLine = lines[i + 1];

      const questionFormat = /^\d+\.\s.+\?$/;
      const optionFormat = /^A\..+ B\..+ C\..+ D\..+$/;

      if (!questionLine || !questionFormat.test(questionLine)) {
        localErrors.push(`Line ${i + 1}: Invalid question format.`);
      }

      if (!optionLine || !optionFormat.test(optionLine)) {
        localErrors.push(`Line ${i + 2}: Invalid option format.`);
      }
    }

    setErrors(localErrors);
    setKeyUploadStatus(localErrors.length > 0 ? 'invalid' : 'valid');
  };

  const handleSubmit = async () => {
  try {
      const res = await axios.post(`${server}/api/upload`, {
        username: username,
        questionsText: questionText,
        keyText: keyText,
        Testname: Testname,
        makePublic: makePublic
      },
      {
        withCredentials: true,
        headers: {
                    'Content-Type': 'application/json'
                 }
      }
    );


    const data = await res.data;
    console.log(res);
    if (res.ok) {
      alert('Upload successful! Link ID: ' + data.fileSetId);
      navigate('/candidates', {state :{ username: username , testname: Testname, testvisibility: makePublic}} );
    } else {
      alert('Upload failed: ' + data.error);
    }
  } catch (err) {
    console.error(err);
    alert('Upload error');
  }
};

const handleInputChange = (e) => {
  const {value } = e.target;
  setTestname(value);
  console.log(value);
};



  return (
    <div>
      <Navbar username={username}/>
    <div className="upload-wrapper">
      <h2>📤 Upload Question File</h2>
      <input type="file" accept=".txt" onChange={handleFileUpload} className="file-input" />
      <a href="/testquestion.txt" download="Question-Template-File.txt">Download Question-Template-File.txt</a>


      {isLoading && (
        <div className="progress-container">
          <div className="progress-bar" />
        </div>
      )}

      {uploadStatus === 'valid' && (
        <div className="result valid">
          <span className="icon">✅</span>
          <p>File is valid!</p>
        </div>
      )}

      {uploadStatus === 'invalid' && (
        <div className="result invalid">
          <span className="icon">❌</span>
          <p>File is invalid. See errors below.</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="error-list">
          <ul>
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

       <h2>📤 Upload Key File</h2>
      <input type="file" accept=".txt" onChange={handleKeyFileUpload} className="file-input" />
      <a href="/testkey.txt" download="Key-Template-File.txt">Download Key-Template-File.txt</a>

      

      {isLoading && (
        <div className="progress-container">
          <div className="progress-bar" />
        </div>
      )}

      {keyuploadStatus === 'valid' && (
        <div className="result valid">
          <span className="icon">✅</span>
          <p>File is valid!</p>
        </div>
      )}

      {keyuploadStatus === 'invalid' && (
        <div className="result invalid">
          <span className="icon">❌</span>
          <p>File is invalid. See errors below.</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="error-list">
          <ul>
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="center-container">
        <label className='label'>Name of the Test:</label>
        <input type="text" name="testname" placeholder="Testname"  onChange={handleInputChange} />
      </div>

      <label>
        <input
          type="checkbox"
          checked={makePublic}
          onChange={(e) => setMakePublic(e.target.checked)}
        />
        Make this test public
      </label>

      <button className='submitbutton' disabled={keyuploadStatus !== 'valid' && Testname && uploadStatus} onClick={handleSubmit}>Submit</button>

      
    </div>
    </div>
  );
};

export default FileUploadValidator;
