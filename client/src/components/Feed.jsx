import { useState, useEffect, useRef, useCallback } from 'react';
import FeedItem from './FeedItem';

function Feed({ answers, loading }) {
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const feedRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Scroll speed in pixels per second
  const SCROLL_SPEED = 30;

  const animate = useCallback((timestamp) => {
    if (!feedRef.current) return;

    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (!isPaused) {
      const feed = feedRef.current;
      const maxScroll = feed.scrollHeight - feed.clientHeight;

      if (maxScroll > 0) {
        setScrollPosition((prev) => {
          const newPosition = prev + (SCROLL_SPEED * deltaTime) / 1000;
          // Loop back to top when reaching the end
          if (newPosition >= maxScroll) {
            return 0;
          }
          return newPosition;
        });
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPaused]);

  // Start animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Apply scroll position
  useEffect(() => {
    if (feedRef.current && !isPaused) {
      feedRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition, isPaused]);

  // Reset scroll when new answers come in (scroll to show new content)
  useEffect(() => {
    if (answers.length > 0 && !isPaused) {
      setScrollPosition(0);
      if (feedRef.current) {
        feedRef.current.scrollTop = 0;
      }
    }
  }, [answers.length]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    lastTimeRef.current = null;
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    lastTimeRef.current = null;
  };

  if (loading) {
    return (
      <div className="feed feed-loading">
        <div className="loading-spinner" />
        <p>Loading answers...</p>
      </div>
    );
  }

  if (answers.length === 0) {
    return (
      <div className="feed feed-empty">
        <p>No answers yet. Be the first to submit one!</p>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h2>Live Answers</h2>
        <span className={`pause-indicator ${isPaused ? 'visible' : ''}`}>
          Paused (hover)
        </span>
      </div>
      <div
        ref={feedRef}
        className={`feed ${isPaused ? 'feed-paused' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {answers.map((answer) => (
          <FeedItem key={answer.id} answer={answer} />
        ))}
      </div>
    </div>
  );
}

export default Feed;
