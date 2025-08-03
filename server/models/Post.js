const mongoose = require('mongoose');
const commentSchema = require('./Comment');
const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  comments: { type: [commentSchema], default: [] },
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Post', postSchema);