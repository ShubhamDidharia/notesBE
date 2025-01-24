const express = require('express');
const app = express();

const bcrypt = require('bcryptjs');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const connectDB = require('./models/db'); // Import the MongoDB setup
const userModel = require('./models/usermodel');
const postModel = require('./models/posts');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Set the views directory and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Home
app.get('/', (req, res) => {
  res.render('index');
});

// Register
app.get('/register', (req, res) => {
  res.render('register');
});
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
  });
  const token = jwt.sign({ user }, 'secret');
  res.cookie('token', token);
  res.redirect('/profile');
});

// Login
app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return res.send('Invalid credentials');
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ user }, 'secret');
    res.cookie('token', token);
    res.redirect('/profile');
  } else {
    res.send('Invalid credentials');
  }
});

// Profile
app.get('/profile', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/');
  }
  const { user } = jwt.verify(token, 'secret');
  res.render('profile', { user });
});

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// Post Creation
app.get('/post', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  res.render('createpost', { user });
});

app.post('/post/create', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  const { title, detail } = req.body;
  const post = await postModel.create({
    title,
    detail,
    userId: user._id,
    date: Date.now(),
  });
  res.redirect('/post');
});

// Read Posts
app.get('/post/read/:userId', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  const posts = await postModel.find({ userId: req.params.userId });
  res.render('readPost', { posts, user });
});

// Delete Post
app.get('/post/delete/:postId', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  const post = await postModel.findById(req.params.postId);
  await postModel.findByIdAndDelete(req.params.postId);
  res.render('delete', { post, user });
});

// Edit Post
app.get('/post/edit/:postId', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  const post = await postModel.findById(req.params.postId);
  res.render('edit', { post, user });
});

app.post('/post/update/:postId', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  const { title, detail } = req.body;
  const post = await postModel.findById(req.params.postId);
  post.title = title || post.title;
  post.detail = detail || post.detail;
  await post.save();
  res.redirect('/post');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});