import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

function SubmitAnswer({ subjects, selectedSubject, onAnswerSubmitted }) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [subjectId, setSubjectId] = useState(selectedSubject || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Update subjectId when selectedSubject changes
  useState(() => {
    if (selectedSubject) {
      setSubjectId(selectedSubject);
    }
  }, [selectedSubject]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() || !author.trim() || !subjectId) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/api/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          author: author.trim(),
          subjectId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit answer');
      }

      const answer = await response.json();
      onAnswerSubmitted?.(answer);
      setContent('');
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="submit-answer">
      <h3>Submit an Answer</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="author">Your Name</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter your name"
            disabled={isSubmitting}
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <select
            id="subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="content">Your Answer</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            disabled={isSubmitting}
            rows={4}
            maxLength={1000}
          />
          <span className="char-count">{content.length}/1000</span>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || !content.trim() || !author.trim() || !subjectId}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </button>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">Answer submitted successfully!</p>}
      </form>
    </div>
  );
}

export default SubmitAnswer;
