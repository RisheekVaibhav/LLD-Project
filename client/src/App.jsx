import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProblemList from './pages/ProblemList';
import AttemptPage from './pages/AttemptPage';
import History from './pages/History';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Problems</Link>
        <Link to="/history">History</Link>
      </nav>
      <div style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<ProblemList />} />
          <Route path="/attempt/:attemptId" element={<AttemptPage />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;