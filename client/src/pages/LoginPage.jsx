import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/auth.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user)); 
            navigate('/main'); 
        } catch (err) {
            setError('Неправильний логін або пароль');
        }
    };

   return (
        <div className="auth-container auth-page">
            <aside className="sidebar">
                <h2>Форум</h2>
            </aside>
            <main className="main-content">
                <div className="auth-panel">
                    <div className="auth-form">
                        <h2>Увійти</h2>
                        <form onSubmit={handleLogin}>
                            <input
                                className="login-field"
                                type="text"
                                placeholder="Логін"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <input
                                className="login-field"
                                type="password"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button className="submit-btn" type="submit" disabled={loading}>
                                {loading ? 'Завантаження...' : 'Увійти'}
                            </button>
                        </form>
                        {error && <p className="message">{error}</p>}
                        <div className = 'switch-wrapper'>
                            <button className = 'toggle-mode' onClick={() => navigate('/register')}>
                                Реєстрація
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default LoginPage;