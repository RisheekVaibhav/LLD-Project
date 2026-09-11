import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [learnerId] = useState('test-learner-1'); // hardcoded for MVP, no auth
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/problems`).then((res) => setProblems(res.data));
  }, []);

  const startAttempt = async (slug) => {
    const res = await axios.post(`${API}/attempts`, { learnerId, problemSlug: slug });
    navigate(`/attempt/${res.data._id}`);
  };

  return (
    <div>
      <h2>Choose a Problem</h2>
      {problems.map((p) => (
        <div key={p._id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
          <h3>{p.title} <span style={{ fontSize: '0.8rem', color: '#666' }}>({p.difficulty})</span></h3>
          <p>{p.description}</p>
          <button onClick={() => startAttempt(p.slug)}>Start Attempt</button>
        </div>
      ))}
    </div>
  );
}

export default ProblemList;