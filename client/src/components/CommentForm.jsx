import React, { useState } from 'react';

function CommentForm({ postId, onCommentAdded }) {
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState(null);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) {
            setError('Текст коментаря є обов\'язковим');
            return;
        }

        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ text: commentText })
            });

            if (!response.ok) {
                throw new Error('Не вдалося додати коментар');
            }

            const data = await response.json();
            onCommentAdded(data.comment);
            setCommentText('');
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleCommentSubmit} className = "comment-form">
            <textarea
                className="comment-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ваш коментар"
            />
            {error && <p className="error">{error}</p>}
            <button className='submit-btn' type="submit">Додати коментар</button>
        </form>
    );
}

export default CommentForm;