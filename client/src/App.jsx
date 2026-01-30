import { useState, useEffect, useCallback } from 'react';
import { useSocket, useSocketEvent } from './hooks/useSocket';
import Feed from './components/Feed';
import SubjectFilter from './components/SubjectFilter';
import SubmitAnswer from './components/SubmitAnswer';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const { socket, isConnected } = useSocket();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Fetch answers when subject changes
  useEffect(() => {
    fetchAnswers();
  }, [selectedSubject]);

  // Join socket room when subject changes
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('subject:join', selectedSubject);
    }
  }, [socket, isConnected, selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/subjects`);
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchAnswers = async () => {
    setLoading(true);
    try {
      const url = selectedSubject
        ? `${API_URL}/api/subjects/${selectedSubject}/answers`
        : `${API_URL}/api/subjects/all/answers`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAnswers(data);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle new answer from socket
  const handleNewAnswer = useCallback((answer) => {
    setAnswers((prev) => [answer, ...prev]);
  }, []);

  // Handle new subject from socket
  const handleNewSubject = useCallback((subject) => {
    setSubjects((prev) => [...prev, subject].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  useSocketEvent(socket, 'answer:created', handleNewAnswer);
  useSocketEvent(socket, 'subject:created', handleNewSubject);

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
  };

  const handleAnswerSubmitted = (answer) => {
    // Answer will come through socket, but we can optimistically add it
    // This is handled by the socket event now
  };

  const handleSubjectCreated = (subject) => {
    // Subject will come through socket
    // This is handled by the socket event now
  };

  return (
    <div className="app">
      <header className="header">
        <h1>DreamJob Feed</h1>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          {isConnected ? 'Live' : 'Connecting...'}
        </div>
      </header>

      <main className="main">
        <aside className="sidebar">
          <SubjectFilter
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSubjectChange={handleSubjectChange}
            onSubjectCreated={handleSubjectCreated}
          />
          <SubmitAnswer
            subjects={subjects}
            selectedSubject={selectedSubject}
            onAnswerSubmitted={handleAnswerSubmitted}
          />
        </aside>

        <section className="feed-section">
          <Feed answers={answers} loading={loading} />
        </section>
      </main>
    </div>
  );
}

export default App;
