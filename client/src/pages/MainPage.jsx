import React, { useState, useEffect } from 'react';
import PostList from '../components/PostList';
import PostForm from '../components/PostForm';
import { useNavigate } from 'react-router-dom';
import '../pages/styles/mainPage.css';
import axios from 'axios';

function MainPage() {
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('');
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.username) {
            setUsername(user.username);
        } else {
            setUsername('Гість');
        }

        const fetchPosts = async () => {
            try {
                const response = await axios.get('/api/posts', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPosts(response.data);
            } catch (err) {
                setError('Не вдалося завантажити пости');
            }
        };

        fetchPosts();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handlePostAdded = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    return (
        <div className="auth-container main-page">
            <aside className="sidebar">
                <div className="sidebar-logo">LOGO</div>
                <nav className="sidebar-menu">
                    <a href="/myprofile">Мій профіль {username}</a>
                    <a href="/main">Усі пости</a>
                    <button onClick={handleLogout}>Вийти з аккаунта</button>
                </nav>
            </aside>
            <main className="main-content">
                <h1 className="main-title">Форум</h1>
                <div className="main-panel">
                    {error && <p className="message">{error}</p>}
                    <PostForm onPostAdded={handlePostAdded} />
                    <h1 className="main-title">Усі пости</h1>
                    <PostList posts={posts} setPosts={setPosts} />
                </div>
            </main>
        </div>
    );
}

export default MainPage;