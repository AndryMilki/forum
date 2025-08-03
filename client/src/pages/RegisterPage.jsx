import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        if (!username || !email || !password || !confirmPassword) {
            setError('Будь ласка, заповніть всі поля.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Паролі не співпадають.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/auth/register', {
                username,
                email,
                password,
                confirmPassword,
            });

            if (response.status === 201) {
                navigate('/login');
            }
        } catch (err) {
            setError('Не вдалося зареєструватися. Спробуйте ще раз.');
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
                        <h2>Зареєструватися</h2>
                        <form onSubmit={handleRegister}>
                            <input
                                className="register-field"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                className="register-field"
                                type="text"
                                placeholder="Логін"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <input
                                className="register-field"
                                type="password"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <input
                                className="register-field"
                                type="password"
                                placeholder="Підтвердження пароля"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button className="submit-btn" type="submit" disabled={loading}>
                                {loading ? 'Завантаження...' : 'Зареєструватися'}
                            </button>
                        </form>
                        {error && <p className="message">{error}</p>}
                        <div className = 'switch-wrapper'>
                            <button className = 'toggle-mode' onClick={() => navigate('/')}>
                                Є вже акаунт? Увійти
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default RegisterPage;