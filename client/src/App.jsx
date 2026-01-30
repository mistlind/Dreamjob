import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import Feed from './components/Feed';
import SubjectFilter from './components/SubjectFilter';
import SubmitAnswer from './components/SubmitAnswer';

function App() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Fetch answers when subject changes
  useEffect(() => {
    fetchAnswers();
  }, [selectedSubject]);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to new answers
    const answersChannel = supabase
      .channel('answers-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'answers',
          ...(selectedSubject && { filter: `subject_id=eq.${selectedSubject}` }),
        },
        async (payload) => {
          // Fetch the full answer with subject info
          const { data } = await supabase
            .from('answers')
            .select('*, subjects(name)')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setAnswers((prev) => [data, ...prev]);
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to new subjects
    const subjectsChannel = supabase
      .channel('subjects-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'subjects',
        },
        (payload) => {
          setSubjects((prev) =>
            [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name))
          );
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount or when subject changes
    return () => {
      supabase.removeChannel(answersChannel);
      supabase.removeChannel(subjectsChannel);
    };
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching subjects:', error);
    } else {
      setSubjects(data || []);
    }
  };

  const fetchAnswers = async () => {
    setLoading(true);

    let query = supabase
      .from('answers')
      .select('*, subjects(name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (selectedSubject) {
      query = query.eq('subject_id', selectedSubject);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching answers:', error);
    } else {
      setAnswers(data || []);
    }

    setLoading(false);
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
  };

  const handleSubjectCreated = useCallback((subject) => {
    // Real-time subscription will handle adding the subject
  }, []);

  const handleAnswerSubmitted = useCallback((answer) => {
    // Real-time subscription will handle adding the answer
  }, []);

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
