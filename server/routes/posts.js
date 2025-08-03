const express = require('express');
const passport = require('passport');
const Post = require('../models/Post');

const router = express.Router();
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const posts = await Post.find()
      .populate('user')
      .populate('comments.user')
      .sort({ createdAt: -1 });

    const postsWithLiked = posts.map(post => ({
    ...post.toObject(),
    liked: post.likes.includes(userId),
    likeCount: post.likes.length
    }));

    res.json(postsWithLiked);
  } catch (err) {
    console.error('Помилка:', err);
    res.status(500).send('Серверна помилка');
  }
});

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try{
        const {title, content} = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: 'Заголовок та вміст є обов\'язковими' });
        }
        const post = new Post({ user: req.user._id, title, content });
        await post.save();
        res.status(201).json({ message: 'Пост успішно створено', post });
    } catch (err) {
        console.error('Помилка при створенні поста:', err);
        res.status(500).json({ message: 'Серверна помилка' });
    }
});

router.get('/:id/edit', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Пост не знайдено');
        if (!post.user.equals(req.user._id)) return res.status(403).send('Доступ заборонено');
        res.json({ post });
    } catch (err) {
        console.error('Помилка при редагуванні:', err);
        res.status(500).send('Серверна помилка');
    }
});

router.post('/:id/edit', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Пост не знайдено');
        if (!post.user.equals(req.user._id)) return res.status(403).send('Доступ заборонено');
        post.title = req.body.title;
        post.content = req.body.content;
        await post.save();
        res.redirect('/posts');
    } catch (err) {
        console.error('Помилка при оновленні поста:', err);
        res.status(500).send('Серверна помилка');
    }
});

router.get('/:postId/comments', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const post = await Post.findById(req.params.postId).populate('comments.user');

        if (!post) return res.status(404).json({ message: 'Пост не знайдено' });

        const updatedComments = post.comments.map(comment => ({
            ...comment.toObject(),
            liked: comment.likes?.includes(userId) || false,
            likeCount: comment.likes?.length || 0
        }));

        res.json(updatedComments);
    } catch (err) {
        console.error('Помилка при отриманні коментарів:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

router.post('/:postId/comments', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Текст коментаря є обов\'язковим' });
        }
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).send('Пост не знайдено');
        post.comments.push({ user: req.user._id, text: text.trim() });
        await post.save();
        const newComment = post.comments[post.comments.length - 1]; 
        res.status(201).json({ message: 'Коментар успішно додано', comment: newComment });
    } catch (err) {
        console.error('Помилка при додаванні коментаря:', err);
        res.status(500).send('Серверна помилка');
    }
});

router.get('/:postId/comments/:commentId/edit', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try{
        const post = await Post.findById(req.params.postId).populate('comments.user');
        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).send('Коментар не знайдено');
        if (!comment.user.equals(req.user._id)) return res.status(403).send('Доступ заборонено');
        res.json({ post, comment });
    } catch (err) {
        console.error('Помилка при редагуванні коментаря:', err);
        res.status(500).send('Серверна помилка');   
    }
});

router.post('/:postId/comments/:commentId/edit', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).send('Коментар не знайдено');
        if (!comment.user.equals(req.user._id)) return res.status(403).send('Доступ заборонено');
        comment.text = req.body.text;
        await post.save();
        res.redirect('/posts');
    } catch (err) {
        console.error('Помилка при оновленні коментаря:', err);
        res.status(500).send('Серверна помилка');
    }
});

router.put('/:postId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).send('Пост не знайдено');
        if (!post.user.equals(req.user._id)) return res.status(403).send('Доступ заборонено');
        post.content = req.body.content;
        await post.save();
        res.json({ message: 'Пост оновлено', post });
    } catch (err) {
        console.error('Помилка при оновленні поста:', err);
        res.status(500).send('Серверна помилка');
    }
});

router.delete('/:postId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).send('Пост не знайдено');
        if (!post.user.equals(req.user._id)) return res.status(403).send('Доступ заборонено');
        await post.deleteOne();
        res.json({ message: 'Пост видалено' });
    } catch (err) {
        console.error('Помилка при видаленні поста:', err);
        res.status(500).send('Серверна помилка');
    }
});

router.put('/:postId/comments/:commentId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate('comments.user');
        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).send('Коментар не знайдено');
        if (!comment.user.equals(req.user._id)) return res.status(403).send('Доступ заборонено');
        comment.text = req.body.text;
        await post.save();
        res.json({ message: 'Коментар оновлено', comment });
    } catch (err) {
        console.error('Помилка при оновленні коментаря:', err);
        res.status(500).send('Серверна помилка');
    }
});

router.delete('/:postId/comments/:commentId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).send('Пост не знайдено');
        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).send('Коментар не знайдено');
        if (!comment.user.equals(req.user._id)) return res.status(403).send('Доступ заборонено');
        comment.deleteOne(); 
        await post.save();
        res.json({ message: 'Коментар видалено' });
    } catch (err) {
        console.error('Помилка при видаленні коментаря:', err);
        res.status(500).send('Серверна помилка');
    }
});

router.post('/:postId/like', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: 'Пост не знайдено' });

        const alreadyLiked = post.likes.includes(userId);
        const update = alreadyLiked
            ? { $pull: { likes: userId } }
            : { $addToSet: { likes: userId } };

        await Post.updateOne({ _id: post._id }, update);

        const updatedPost = await Post.findById(post._id);

        return res.json({
            message: 'Лайк оновлено',
            postId: updatedPost._id,
            likeCount: updatedPost.likes.length,
            liked: !alreadyLiked
        });
    } catch (err) {
        console.error('Помилка при лайкуванні поста:', err);
        return res.status(500).json({ message: 'Серверна помилка' });
    }
});

router.post('/:postId/comments/:commentId/like', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userId = req.user._id.toString();

        const post = await Post.findOne({
            _id: req.params.postId,
            'comments._id': req.params.commentId
        });

        if (!post) return res.status(404).json({ message: 'Пост або коментар не знайдено' });

        const comment = post.comments.id(req.params.commentId);
        const alreadyLiked = comment.likes.includes(userId);

        if (alreadyLiked) {
            comment.likes.pull(userId);
        } else {
            comment.likes.push(userId);
        }

        await Post.updateOne(
            { _id: req.params.postId, 'comments._id': req.params.commentId },
            { 'comments.$.likes': comment.likes }
        );

        const updatedPost = await Post.findById(req.params.postId);
        const updatedComment = updatedPost.comments.id(req.params.commentId);

        return res.json({
            message: 'Лайк оновлено',
            postId: req.params.postId,
            commentId: req.params.commentId,
            likeCount: updatedComment.likes.length,
            liked: !alreadyLiked
        });
    } catch (err) {
        console.error('Помилка при лайкуванні коментаря:', err);
        return res.status(500).json({ message: 'Серверна помилка' });
    }
});

module.exports = router;

