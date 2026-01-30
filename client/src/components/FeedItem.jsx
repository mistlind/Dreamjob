import { memo } from 'react';

function FeedItem({ answer }) {
  const formattedDate = new Date(answer.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className="feed-item">
      <div className="feed-item-header">
        <span className="feed-item-author">{answer.author}</span>
        <span className="feed-item-subject">{answer.subject?.name}</span>
      </div>
      <p className="feed-item-content">{answer.content}</p>
      <time className="feed-item-time" dateTime={answer.createdAt}>
        {formattedDate}
      </time>
    </article>
  );
}

export default memo(FeedItem);
