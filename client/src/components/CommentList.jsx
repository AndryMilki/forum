import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommentForm from './CommentForm';
import editIcon from '../icons/editIcon.png';
import deleteIcon from '../icons/deleteIcon.png';
import saveIcon from '../icons/saveIcon.png';
import cancelIcon from '../icons/cancelIcon.png';
import likeIcon from '../icons/likeIcon.png';
import likeIcon2 from '../icons/likeIcon2.png';

function CommentList({ postId, currentUser, onCommentAdded }) {
    const [comments, setComments] = useState([]);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(`/api/posts/${postId}/comments`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setComments(response.data);
            } catch (err) {
                setError('Не вдалося завантажити коментарі');
            }
        };
        fetchComments();
    }, [postId]);

    const handleDelete = async (commentId) => {
        try {
            await axios.delete(`/api/posts/${postId}/comments/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error('Помилка при видаленні коментаря', err);
            alert('Не вдалося видалити коментар');
        }
    };
    const handleEditStart = (id, text) => {
        setEditingId(id);
        setEditText(text);
    };
    const handleNewComment = async (newComment) => {    try {
        const response = await axios.get(`/api/posts/${postId}/comments`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        setComments(response.data);
    } catch (err) {
        setError('Не вдалося оновити коментарі');
    }
};
    const handleEditSave = async (commentId) => {
        if (!editText.trim()) return;
        try {
            const response = await axios.put(
                `/api/posts/${postId}/comments/${commentId}`,
                { text: editText },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setComments(comments.map(c => c._id === commentId ? response.data.comment : c));
            setEditingId(null);
            setEditText('');
        } catch (err) {
            alert('Не вдалося оновити коментар');
        }
    };

    if (error) {
        return <div>{error}</div>;
    }
const handleLikeComment = async (commentId) => {
    try {
        const response = await axios.post(`/api/posts/${postId}/comments/${commentId}/like`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        const { commentId: likedCommentId, likeCount, liked } = response.data;
        setComments(prevComments =>
            prevComments.map(comment =>
                comment._id === likedCommentId
                    ? { ...comment, likeCount, liked }
                    : comment
            ));
    } catch (err) {
        console.error('Помилка при лайкуванні коментаря', err);
    }
};
    return (
        <div className="comment-list-block">
                            <CommentForm
                                postId={postId}
                                onCommentAdded={(newComment) => {
                                    handleNewComment(newComment); 
                                    if (onCommentAdded) {
                                        onCommentAdded(newComment); 
                                    }
                                }}
                            />
                            
            <h3>Коментарі</h3>
            <ul>
                {comments.map(comment => (
                    <li key={comment._id} style={{ position: 'relative', marginTop: '12px' }}>
                        <strong>{comment.user?.username || 'Анонім'}:</strong> {editingId === comment._id ? (
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    handleEditSave(comment._id);
                                }}
                                style={{ display: 'inline'}}
                            >
                                <input
                                    type="text"
                                    value={editText}
                                    onChange={e => setEditText(e.target.value)}
                                    style={{ fontSize: '1.1rem', marginRight: 8 }}
                                />

                                <button type="submit" style={{ marginRight:8 }}><img src={saveIcon} alt="Зберегти" style={{ width: 16, height: 16 }} /></button>
                                <button type="button" onClick={() => setEditingId(null)}><img src={cancelIcon} alt="Скасувати" style={{ width: 16, height: 16 }} /></button>
                            </form>
                        ) : (
                            comment.text
                        )}
                        {(currentUser?.id === comment.user?._id || currentUser?._id === comment.user?._id) && (
                            <span className="comment-actions">
                                <button onClick={() => handleEditStart(comment._id, comment.text)}><img src={editIcon} alt="Редагувати" style={{ width: 16, height: 16 }} /></button>
                                <button onClick={() => handleDelete(comment._id)}><img src={deleteIcon} alt="Видалити" style={{ width: 16, height: 16 }} /></button>
                            </span>
                            
                        )}
                        <div className='comment-like'>
                        <button onClick={() => handleLikeComment(comment._id)} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <img
                            src={
                                comment.liked ? likeIcon2 : likeIcon
                            }
                            alt="Лайк"
                            style={{ width: 16, height: 16 }}
                            />
                            ({comment.likeCount || 0})
                        </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default CommentList;
