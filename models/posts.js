const mongoose = require('mongoose');
const User = require('./usermodel');
mongoose.connect('mongodb://127.0.0.1:27017/test');

const postSchema = new mongoose.Schema({
    title: String,
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date:{
        type: Date,
        default: Date.now
    },
    detail: String

});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;