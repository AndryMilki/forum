import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../pages/styles/mainPage.css';
import CommentList from '../components/CommentList';

function MyProfile() {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        const fetchMyPosts = async () => {
            try {
                const response = await axios.get('/api/posts', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const myPosts = response.data.filter(post =>
                    post.user?._id === user.id || post.user === user.id
                );
                setPosts(myPosts);
            } catch (err) {
                setError('Не вдалося завантажити ваші пости');
            }
        };
        fetchMyPosts();
    }, [user, navigate]);
    if (!user) return null;

    return (
        <div className="auth-container main-page">
            <aside className="sidebar">
                <div className="sidebar-logo">LOGO</div>
                <nav className="sidebar-menu">
                    <a href='/myprofile'>Свій профіль {user.username}</a>
                    <a href="/main">Усі пости</a>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/');
                    }}>Вийти з аккаунта</button>
                </nav>
            </aside>
            <main className="main-content">
                <h1 className="main-title">Мій профіль</h1>
                <div className="main-panel">
                    <div className="my-profile-info" style={{ marginBottom: 24 }}>
                        <p><b>Логін:</b> {user.username}</p>
                        <p><b>Email:</b> {user.email}</p>
                    </div>
                    <h3 style={{ marginTop: 0 }}>Мої пости</h3>
                    {error && <p className="error">{error}</p>}
                    <div className="my-posts-list">
                        {posts.length === 0 && <p>У вас ще немає постів.</p>}
                        {posts.map(post => (
                            <div className="post-item" key={post._id}>
                                <div className="post-title-bar">
                                    <div className="post-title">{post.title}</div>
                                </div>
                                <div className="post-content-area post-content-large">{post.content}</div>
                                <CommentList postId={post._id} currentUser={user} />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default MyProfile;
