const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User')

const router = express.Router();

router.post('/register', async(req, res) => {
    const { username, password, confirmPassword, email } = req.body;
    if (!username || !password || !confirmPassword || !email) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }
    try {
        const existingUser = await User.findOne({username});
        if (existingUser) return res.status(400).json({message:'Користувач вже існує'});

        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({username, password: hashedPassword, email});
        await newUser.save();
        const token = jwt.sign(
            { sub: newUser._id, username: newUser.username },
            process.env.JWT_SECRET
        )
        res.status(201).json({
            message: 'Реєстрація пройшла успішно',
            token,
            user: { id: newUser._id, username: newUser.username, email: newUser.email },
        });
    } catch (err) {
        console.error('Помилка реєстрації:', err);
        res.status(500).json({ message: 'Помилка реєстрації' });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session:false}, (err,user,info)=>{
        if(err) return res.status(500).json({message:'Помилка сервер'});
        if(!user) return res.status(401).json({message: info.message || 'Невірні дані'});
        const token = jwt.sign(
            { sub: user._id, username: user.username },
            process.env.JWT_SECRET
        );
        return res.status(200).json({
            message: 'Вхід виконано успішно',
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    })(req, res, next);
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).json({ username: req.user.username });
});

module.exports = router;