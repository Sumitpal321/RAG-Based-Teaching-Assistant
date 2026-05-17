import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { generateQuiz, checkQuiz } from '../services/api';
import toast from 'react-hot-toast';
import { Brain, CheckCircle, XCircle } from 'lucide-react';

function parseQuiz(quizText) {
  const questions = [];
  const blocks = quizText.split(/\n\n/).filter(b => b.trim());
  let current = null;
  for (const block of blocks) {
    const lines = block.split('\n').filter(l => l.trim());
    for (const line of lines) {
      if (line.match(/^Question \d+:/)) {
        if (current) questions.push(current);
        current = { question: line.replace(/^Question \d+:\s*/, ''), options: [], answer: '' };
      } else if (line.match(/^[A-D]\)/)) {
        current?.options.push(line);
      } else if (line.startsWith('Answer:')) {
        if (current) current.answer = line.split(':')[1].trim()[0];
      }
    }
  }
  if (current) questions.push(current);
  return questions;
}

export default function Quiz() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [quiz, setQuiz] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const { getAuthHeader } = useAuth();

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setQuiz(null);
    setResults(null);
    setAnswers({});
    try {
      const res = await generateQuiz(topic, numQuestions, getAuthHeader());
      setQuiz(parseQuiz(res.data.quiz));
      setQuizId(res.data.quiz_id);
      toast.success('Quiz generated! 🎯');
    } catch {
      toast.error('Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.length) {
      toast.error('Please answer all questions!');
      return;
    }
    setChecking(true);
    try {
      const answerArray = quiz.map((_, i) => answers[i] || '');
      const res = await checkQuiz(quizId, answerArray, getAuthHeader());
      setResults(res.data);
      toast.success(`You scored ${res.data.score}/${res.data.total_questions}! 🌟`);
    } catch {
      toast.error('Failed to check answers');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="page-layout">
      <Navbar />
      <div className="quiz-page">
        <div className="quiz-header">
          <h2><Brain size={28} /> Quiz Generator</h2>
          <p>Test your knowledge with AI-generated quizzes!</p>
        </div>

        <div className="quiz-form-card">
          <form onSubmit={handleGenerate} className="quiz-form">
            <div className="form-group">
              <label>📚 Topic</label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. LLM, RAG, Transformers..."
                required
              />
            </div>
            <div className="form-group">
              <label>🔢 Number of Questions</label>
              <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))}>
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : '⚡ Generate Quiz'}
            </button>
          </form>
        </div>

        {quiz && !results && (
          <div className="quiz-questions">
            {quiz.map((q, i) => (
              <div key={i} className="question-card">
                <h3>Q{i + 1}: {q.question}</h3>
                <div className="options">
                  {q.options.map((opt, j) => {
                    const letter = opt[0];
                    return (
                      <label key={j} className={`option ${answers[i] === letter ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name={`q${i}`}
                          value={letter}
                          onChange={() => setAnswers({ ...answers, [i]: letter })}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            <button className="btn-primary submit-btn" onClick={handleSubmit} disabled={checking}>
              {checking ? <span className="spinner" /> : '✅ Submit Answers'}
            </button>
          </div>
        )}

        {results && (
          <div className="results-card">
            <div className="score-display">
              <div className="score-circle">
                <span className="score-num">{results.score}</span>
                <span className="score-total">/{results.total_questions}</span>
              </div>
              <h3>{results.message}</h3>
            </div>
            <div className="result-details">
              {results.results.map((r, i) => (
                <div key={i} className={`result-item ${r.is_correct ? 'correct' : 'wrong'}`}>
                  {r.is_correct ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  <span>Q{r.question_number}: You answered <b>{r.user_answer}</b>, correct is <b>{r.correct_answer}</b></span>
                </div>
              ))}
            </div>
            <button className="btn-secondary" onClick={() => { setQuiz(null); setResults(null); setTopic(''); }}>
              🔄 Try Another Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
