import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyProfile from './pages/MyProfile';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path ="/login" element={<LoginPage />} />
                <Route path='/myprofile' element={<MyProfile />} />
            </Routes>
        </Router>
    );
}

export default App;