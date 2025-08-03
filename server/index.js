require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const app = express();
const postsRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.get('/', (req, res) => {
    res.send('Сервер працює без проблем');
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на порту ${PORT}`);
});