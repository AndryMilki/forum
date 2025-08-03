import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentList from './CommentList';
import editIcon from '../icons/editIcon.png';
import deleteIcon from '../icons/deleteIcon.png';
import saveIcon from '../icons/saveIcon.png';
import cancelIcon from '../icons/cancelIcon.png';

function PostList({ posts, setPosts }) {
    const user = JSON.parse(localStorage.getItem('user'));
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await axios.get('/api/posts', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
            });
            setPosts(response.data); 
        };

    fetchPosts();
}, []);

    const handleCommentAdded = (postId, comment) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId
                    ? { ...post, comments: [...post.comments, comment] }
                    : post
            )
        );
    };
    const handleDelete = async (postId) => {
        try {
            await axios.delete(`/api/posts/${postId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        } catch (err) {
            console.error('Помилка при видаленні поста', err);
        }
    };

    const handleEditSave = async (postId) => {
        if (!editText.trim()) return;
        try {
            const response = await axios.put(
                `/api/posts/${postId}`,
                { content: editText },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, content: response.data.post.content }
                        : post
                )
            );
            setEditingId(null);
            setEditText('');
        } catch (err) {
            console.error('Помилка при редагуванні поста', err);
        }
    };
    const handleEditStart = (postId, currentContent) => {
        setEditingId(postId);
        setEditText(currentContent);
    };
const handleLikePost = async (postId) => {
  try {
    const response = await axios.post(`/api/posts/${postId}/like`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    const { postId: likedPostId, likeCount, liked } = response.data; 

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === likedPostId
          ? { ...post, likeCount, liked }  
          : post
      )
    );
  } catch (err) {
    console.error('Помилка при лайкуванні поста', err);
  }
};
    return (
        <div className="post-list">
            {posts.map(post => (
                <div className="post-item" key={post._id}>
                    <div className="post-title-bar">
                        <div className="post-title">{post.title} </div>
                                <div className="post-date">
                                    
                                </div>
                            <div className="post-actions">
                                {user && (
                            (user.id === (typeof post.user === 'object' ? post.user?._id : post.user)) ||
                            (user._id === (typeof post.user === 'object' ? post.user?._id : post.user))
                            ) && (
                                <div>
                                    {editingId === post._id ? (
                                        <>
                                            <button style={{ marginRight: 8 }} onClick={() => handleEditSave(post._id)}>
                                                <img src={saveIcon} alt="Зберегти" style={{ width: 20, height: 20  }} />
                                            </button>
                                            <button onClick={() => setEditingId(null)}>
                                                <img src={cancelIcon} alt="Скасувати" style={{ width: 20, height: 20 }} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button style={{ marginRight: 8 }} onClick={() => handleEditStart(post._id, post.content)}>
                                                <img src={editIcon} alt="Редагувати" style={{ width: 20, height: 20 }} />
                                            </button>
                                            <button onClick={() => handleDelete(post._id)}>
                                                <img src={deleteIcon} alt="Видалити" style={{ width: 20, height: 20 }} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                                <button onClick={() => handleLikePost(post._id)}>
                                {post.liked ? '❤️' : '🤍'} {post.likeCount || 0}
                                </button>
                                    <div className="post-date">
                                        {new Date(post.createdAt).toLocaleString('uk-UA')}
                                    </div>
                            </div>
                    </div>
                    <div className="post-content-area post-content-large">
                        {editingId === post._id ? (
                            <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                style={{ fontSize: '1.1rem', width: '100%', marginTop: 8 }}
                            />
                        ) : (
                            post.content
                        )}
                    </div>
                    <CommentList
                        postId={post._id}
                        currentUser={user}
                        onCommentAdded={comment => handleCommentAdded(post._id, comment)}
                    />
                </div>
            ))}
        </div>
    );
}
export default PostList;
