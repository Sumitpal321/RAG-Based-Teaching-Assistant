import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getQuizHistory } from '../services/api';
import { History, Trophy, Target } from 'lucide-react';

export default function QuizHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    getQuizHistory(getAuthHeader())
      .then(res => setHistory(res.data.history || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [getAuthHeader]);

  const avgScore = history.length
    ? (history.reduce((sum, h) => sum + (h.score / h.total_questions) * 100, 0) / history.length).toFixed(1)
    : 0;

  return (
    <div className="page-layout">
      <Navbar />
      <div className="history-page">
        <div className="history-header">
          <h2><History size={28} /> Quiz History</h2>
          <p>Track your learning progress</p>
        </div>

        {!loading && history.length > 0 && (
          <div className="stats-row">
            <div className="stat-card">
              <Trophy size={24} />
              <span className="stat-num">{history.length}</span>
              <span className="stat-label">Total Quizzes</span>
            </div>
            <div className="stat-card">
              <Target size={24} />
              <span className="stat-num">{avgScore}%</span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="stat-card">
              <span className="stat-emoji">🔥</span>
              <span className="stat-num">{Math.max(...history.map(h => Math.round((h.score / h.total_questions) * 100)))}%</span>
              <span className="stat-label">Best Score</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading your history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <span>📝</span>
            <h3>No quizzes yet!</h3>
            <p>Take your first quiz to see your progress here</p>
          </div>
        ) : (
          <div className="history-list">
            {history.slice().reverse().map((item, i) => {
              const pct = Math.round((item.score / item.total_questions) * 100);
              return (
                <div key={i} className="history-card">
                  <div className="history-card-header">
                    <div>
                      <h3>📚 {item.topic}</h3>
                      <span className="history-date">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className={`score-badge ${pct >= 70 ? 'good' : pct >= 40 ? 'ok' : 'bad'}`}>
                      {item.score}/{item.total_questions}
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="progress-pct">{pct}%</span>
                  <div className="result-pills">
                    {item.results?.map((r, j) => (
                      <span key={j} className={`pill ${r.is_correct ? 'correct' : 'wrong'}`}>
                        Q{r.question_number}: {r.is_correct ? '✓' : '✗'}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
