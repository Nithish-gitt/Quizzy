import React, { useEffect, useState, useCallback } from 'react';
import { server } from './variables/variables';
import './QuizPage.css';
import axios from 'axios';
import Navbar from './Navbar'; // Ensure Navbar is correctly imported and set up

import { useLocation } from 'react-router-dom';

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // Stores answers as { questionIndex: selectedOptionLabel }
  const [submitted, setSubmitted] = useState(false);
  const [keyvalue, setKeyValue] = useState([]); // Stores correct answer labels
  const [score, setScore] = useState(0); // Initialize score as a number, not undefined
  const [showPopup, setShowPopup] = useState(false);
  const [scoreDetails, setScoreDetails] = useState({ correct: 0, total: 0 });
  const [inputSelected, setInputSelected] = useState(false);

  const location = useLocation();
  const { username, testname, testVisibility } = location.state || {};

  useEffect(() => {
  }, [testname]);

  // Fetch quiz questions and correct answers
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${server}/api/quiz`, {
          params: {
            username: username,
            testname: testname,
            testVisibility: testVisibility,
          }
        });

        // Assuming res.data[0][0] contains the questions and res.data[1][0] contains the keys
        const quizText = res.data[0][0];
        const keysText = res.data[1][0];

        // Parse Questions
        const lines = quizText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        const parsedQuestions = [];
        for (let i = 0; i < lines.length; i += 2) {
          const questionLine = lines[i];
          const optionLine = lines[i + 1] || '';
          const question = questionLine.replace(/^\d+\.\s*/, '');
          const optionParts = optionLine.split(/(?=[A-D]\.\s)/g);

          if (!question || optionParts.length < 2) continue;

          const options = optionParts.map(opt => {
            const match = opt.match(/^([A-D])\.\s*(.*)/);
            return match ? { label: match[1], text: match[2].trim() } : null;
          }).filter(Boolean);

          parsedQuestions.push({ question, options });
        }
        setQuestions(parsedQuestions);

        // Parse Keys
        const parsedKeys = keysText
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(Boolean)
          .map(line => line.split('. ')[1]); // Extracts 'A', 'B', etc.

        setKeyValue(parsedKeys);

      } catch (error) {
        console.error('Error fetching quiz:', error);
        // Handle error, e.g., show an error message to the user
      }
    };
    fetchQuiz();
  }, [username, testname]); // Depend on username and testname to refetch if they change

  // Handler for option selection
  const handleOptionSelect = useCallback((qIndex, label) => {
    setAnswers(prev => ({
      ...prev,
      [qIndex]: label, // Use question index as the key for reliable mapping
    }));
  }, []);

  // Handler for submitting the quiz
  const handleSubmit = useCallback(async () => {
    // Calculate score before updating state or sending to backend
    let correctCount = 0;
    const totalQuestions = questions.length;

    for (let i = 0; i < totalQuestions; i++) {
      // Ensure we compare the user's answer for this specific question index
      // with the correct answer for this specific question index.
      const userAnswer = answers[i];
      const correctAnswer = keyvalue[i];

      if (userAnswer && correctAnswer && userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase()) {
        correctCount++;
      }
    }

    const scorePercentage = (correctCount / totalQuestions) * 100;

    setScore(scorePercentage);
    setScoreDetails({ correct: correctCount, total: totalQuestions });
    setSubmitted(true); // Mark as submitted to show results and disable inputs
    setShowPopup(true); // Show the result popup

    try {
      await axios.post(`${server}/api/submit-test`, {
        username: username,
        testname: testname,
        score: scorePercentage
      },);

    } catch (error) {
      console.error('Error submitting test:', error);
      // Handle submission error (e.g., alert user)
    }
  }, [answers, keyvalue, questions.length, username, testname]);

  // Handler for clearing selections
  const handleClear = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setScoreDetails({ correct: 0, total: 0 });
    setShowPopup(false);
  }, []);


  return (
    <div>
      <div>
        {/* Pass handleHome and handleLogout to Navbar */}
        <Navbar username={username} />
        <div className="quiz-container">
          <h2>📝 Quiz</h2>
          {questions.length === 0 && <p>Loading quiz...</p>}
          {questions.map((q, index) => (
            <div className="question-block" key={index}>
              <p className="question">{index + 1}. {q.question}</p>
              <div className="options">
                {q.options.map((opt) => {
                  // --- FIX APPLIED HERE ---
                  const userAnswer = answers[index]; // Correctly gets the user's answer for this specific question
                  const correctAnswer = keyvalue[index]; // Correct answer from the fetched keys

                  const isSelected = userAnswer === opt.label;
                  const isCorrect = correctAnswer === opt.label;

                  let optionClass = "option";

                  if (submitted) {
                    if (isSelected && isCorrect) {
                      optionClass += " correct"; // selected and correct → green
                    } else if (isSelected && !isCorrect) {
                      optionClass += " wrong"; // selected and wrong → red
                    } else if (!isSelected && isCorrect) {
                      optionClass += " highlight-correct"; // not selected but correct → light green
                    }
                  } else {
                    if (isSelected) optionClass += " selected";
                  }

                  return (
                    <label key={opt.label} className={optionClass}>
                      <input
                        type="radio"
                        name={`q-${index}`} // Ensures unique radio group per question
                        value={opt.label}
                        checked={isSelected}
                        onChange={() => handleOptionSelect(index, opt.label) && setInputSelected(true)}
                        disabled={submitted} // Disable inputs after submission
                      />
                      {opt.label}. {opt.text}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <button className="submit-btn" onClick={handleSubmit} disabled={submitted}>Submit</button>
          <button className="clear-btn" onClick={handleClear} disabled={submitted}>Clear</button>

          {submitted && (
            <div className="summary">
              ✅ You answered {Object.keys(answers).length} out of {questions.length} questions.
              Your Score: {score.toFixed(2)}%
            </div>
          )}

          {showPopup && (
            <div className="popup-overlay">
              <div className="popup">
                <h2>✅ Test Submitted</h2>
                <p>
                  You scored {scoreDetails.correct} out of {scoreDetails.total} (
                  {((scoreDetails.correct / scoreDetails.total) * 100).toFixed(2)}%)
                </p>
                <button onClick={() => setShowPopup(false)}>OK</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;