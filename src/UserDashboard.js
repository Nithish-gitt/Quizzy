import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import { server } from './variables/variables';
import './UserDashboard.css';

function Dashboard() {
  const [testResults, setTestResults] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.myParam;

  // Fetch previous test results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`${server}/api/test-results?username=${encodeURIComponent(username)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) setTestResults(data.results || []);
        else throw new Error(data.message || 'Failed to fetch');
      } catch (err) {
        console.error('Error fetching results:', err);
      }
    };

    if (username) fetchResults();
  }, [username]);

  // Fetch available tests for this user
  useEffect(() => {
    const fetchAvailableTests = async () => {
      try {
        const res = await fetch(`${server}/api/upload/tests/${username}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) setAvailableTests(data.tests || []);
        else throw new Error(data.message || 'Failed to fetch available tests');
      } catch (err) {
        console.error('Error fetching available tests:', err);
      }
    };

    if (username) fetchAvailableTests();
  }, [username]);

  // Create test
  const handleCreateTest = () => {
    navigate('/upload', { state: { myParam: username } });
  };

  // Take test
  const handleTakeTest = () => {
    if (selectedTest) {
      navigate('/quiz', {
        state: {
          username,
          testname: selectedTest
        }

      });
    }
  };

  return (
    <div>
      <Navbar username={username} />

      {/* 👇 Test selection form */}
        <div className="test-select-section">
          <h4>Select a Test to Take</h4>
          <select
            className="test-select"
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
          >
            <option value="">-- Choose a test --</option>
            {availableTests.map((test, index) => (
              <option key={index} value={test}>
                {test}
              </option>
            ))}
          </select>

          <button
            onClick={handleTakeTest}
            disabled={!selectedTest}
            className="take-test-button"
          >
            Take Test
          </button>
          <button onClick={handleCreateTest} className="create-test-button">
          Create New Test
          </button>
        </div>

      <div className="dashboard-container">
        <h3>Your Previous Test Results</h3>
        {testResults.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.testname}</td>
                  <td>{result.score}</td>
                  <td>{new Date(result.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
