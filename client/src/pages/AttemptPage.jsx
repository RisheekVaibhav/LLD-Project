import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function AttemptPage() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const loadAttempt = async () => {
    const res = await axios.get(`${API}/attempts/${attemptId}`);
    setAttempt(res.data.attempt);
    setEvaluation(res.data.evaluation);
    if (res.data.submission) setContent(res.data.submission.content);
    return res.data.attempt;
  };

  useEffect(() => {
    loadAttempt();
    return () => clearInterval(pollRef.current);
  }, [attemptId]);

  const startPolling = () => {
    pollRef.current = setInterval(async () => {
      const updated = await loadAttempt();
      if (updated.status === 'Completed' || updated.status === 'Failed') {
        clearInterval(pollRef.current);
        setSubmitting(false);
      }
    }, 2000); // check every 2 seconds
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post(`${API}/attempts/${attemptId}/submit`, { content });
      setAttempt(res.data.attempt); // status: Evaluating
      startPolling();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setSubmitting(false);
    }
  };

  if (!attempt) return <p>Loading...</p>;

  return (
    <div>
      <h2>{attempt.problem.title}</h2>
      <p>{attempt.problem.description}</p>
      <ul>
        {attempt.problem.requirements.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
      <p>Status: <strong>{attempt.status}</strong></p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Describe your design: classes, responsibilities, relationships, and reasoning..."
        rows={12}
        style={{ width: '100%', marginTop: '1rem' }}
        disabled={attempt.status === 'Completed' || submitting}
      />

      {attempt.status !== 'Completed' && (
        <button onClick={handleSubmit} disabled={submitting || content.trim().length < 20}>
          {submitting ? 'Evaluating... (this can take 5-15s)' : 'Submit for Feedback'}
        </button>
      )}

      {attempt.status === 'Failed' && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          Evaluation failed, but your submission was saved.{' '}
          <button onClick={handleSubmit}>Retry Evaluation</button>
        </div>
      )}

      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}

      {evaluation && (
        <div style={{ marginTop: '2rem', borderTop: '2px solid #333', paddingTop: '1rem' }}>
          <h3>Feedback — Overall Score: {evaluation.overallScore}/5</h3>
          <p>{evaluation.summary}</p>
          {evaluation.results.map((r, i) => (
            <div key={i} style={{ border: '1px solid #ddd', padding: '0.75rem', marginBottom: '0.75rem' }}>
              <strong>{r.criterion.replace(/_/g, ' ')}</strong> — Score: {r.score}/5
              <p><em>Evidence:</em> {r.evidence}</p>
              <p><em>Concern:</em> {r.concern}</p>
              <p><em>Suggestion:</em> {r.suggestion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AttemptPage;