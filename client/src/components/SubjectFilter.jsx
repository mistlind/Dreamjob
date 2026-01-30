import { useState } from 'react';
import { supabase } from '../lib/supabase';

function SubjectFilter({ subjects, selectedSubject, onSubjectChange, onSubjectCreated }) {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setIsCreating(true);
    setError('');

    const { data, error: insertError } = await supabase
      .from('subjects')
      .insert({ name: newSubjectName.trim() })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Subject already exists');
      } else {
        setError(insertError.message || 'Failed to create subject');
      }
    } else {
      onSubjectCreated?.(data);
      setNewSubjectName('');
      setShowForm(false);
    }

    setIsCreating(false);
  };

  return (
    <div className="subject-filter">
      <h3>Filter by Subject</h3>

      <div className="subject-list">
        <button
          className={`subject-button ${selectedSubject === null ? 'active' : ''}`}
          onClick={() => onSubjectChange(null)}
        >
          All Subjects
        </button>

        {subjects.map((subject) => (
          <button
            key={subject.id}
            className={`subject-button ${selectedSubject === subject.id ? 'active' : ''}`}
            onClick={() => onSubjectChange(subject.id)}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {!showForm ? (
        <button
          className="add-subject-toggle"
          onClick={() => setShowForm(true)}
        >
          + Add New Subject
        </button>
      ) : (
        <form className="new-subject-form" onSubmit={handleCreateSubject}>
          <input
            type="text"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="Enter subject name"
            disabled={isCreating}
            autoFocus
          />
          <div className="form-actions">
            <button type="submit" disabled={isCreating || !newSubjectName.trim()}>
              {isCreating ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewSubjectName('');
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>
      )}
    </div>
  );
}

export default SubjectFilter;
