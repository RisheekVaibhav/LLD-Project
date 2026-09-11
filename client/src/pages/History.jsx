import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function History() {
  const [attempts, setAttempts] = useState([]);
  const learnerId = 'test-learner-1'; // hardcoded for MVP, no auth

  useEffect(() => {
    axios.get(`${API}/attempts/history?learnerId=${learnerId}`).then((res) => setAttempts(res.data));
  }, []);

  return (
    <div>
      <h2>Your Attempt History</h2>
      {attempts.length === 0 && <p>No attempts yet — go pick a problem.</p>}
      {attempts.map((a) => (
        <div key={a._id} style={{ border: '1px solid #ddd', padding: '0.75rem', marginBottom: '0.75rem' }}>
          <strong>{a.problem.title}</strong> — Status: {a.status}
          <br />
          <span style={{ fontSize: '0.8rem', color: '#666' }}>
            {new Date(a.createdAt).toLocaleString()}
          </span>
          <br />
          <Link to={`/attempt/${a._id}`}>View</Link>
        </div>
      ))}
    </div>
  );
}

export default History;