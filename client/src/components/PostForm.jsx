import React, { useState } from 'react';
import axios from 'axios';

function PostForm({ onPostAdded }) {
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    if (!token) {
        return 
    }

    const handlePostAdd = async (e) => {
        e.preventDefault();
        if (!postTitle || !postContent) {
            setError('Будь ласка, введіть заголовок та вміст.');
            return;
        }

        try {
            const response = await axios.post(
                '/api/posts',
                { title: postTitle, content: postContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (onPostAdded) onPostAdded(response.data.post);

            setPostTitle('');
            setPostContent('');
            setError(null);
        } catch (error) {
            console.error('Помилка при додаванні поста:', error);
            setError('Не вдалося додати пост.');
        }
    };

    return (
        <form className="post-form" onSubmit={handlePostAdd}>
            <div className="post-title-bar">
                <input
                    className="post-title-input"
                    type="text"
                    placeholder="Заголовок поста"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                />
            </div>
            <textarea
                className="post-content-input"
                placeholder="Текст поста"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                required
            />
            {error && <p className="error">{error}</p>}
            <button className="submit-btn" type="submit">Опублікувати</button>
        </form>
    );
}


export default PostForm;