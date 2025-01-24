const express = require('express');
const app = express();

const bcrypt = require('bcrypt');



const path=require('path');

const cookieParser = require('cookie-parser');

const PORT = 3000;
const jwt = require('jsonwebtoken');

const userModel = require('./models/usermodel');
const postModel = require('./models/posts');





// Set EJS as the view engine
app.set('view engine', 'ejs');


// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')));


//home
app.get('/', (req, res) => {
  res.render('index');
});


//register
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
  const token = jwt.sign({user},"secret")
  res.cookie('token', token);
  res.redirect('/profile');
});


//login
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
    const token = jwt.sign({user},"secret")
    res.cookie('token', token);
    res.redirect('/profile');
  }
  else {
    res.send('Invalid credentials');
  }

});


//profile
app.get('/profile', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/');
  }
  const { user } = jwt.verify(token, 'secret');
  res.render('profile', { user });
} );

//logout
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});


//post-creation
app.get('/post', (req, res) => {
  const token = req.cookies.token;
  if(!token) res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  res.render('createpost',{user});
});

app.post('/post/create', async (req, res) => {
  const token = req.cookies.token;
  if(!token) res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  const { title, detail } = req.body;
  const post = await postModel.create({
    title,
    detail,
    userId: user._id,
    date: Date.now()
  });

  res.redirect('/post');
} );


app.get('/post/read/:userId', async (req, res) => {
  const token = req.cookies.token;
  if(!token) res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  const posts = await postModel.find({userId: req.params.userId});
  res.render('readPost',{posts,user});
});

app.get('/post/delete/:postId', async (req, res) => {
  const token = req.cookies.token;
  if(!token) res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  const post = await postModel.findById(req.params.postId);
  await postModel.findByIdAndDelete(req.params.postId);

  res.render('delete',{post,user});
});

app.get('/post/edit/:postId', async (req, res) => {
  const token = req.cookies.token;
  if(!token) res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  const post = await postModel.findById(req.params.postId);
  res.render('edit',{post,user});
});

app.post('/post/update/:postId' , async (req, res) => { 
  const token = req.cookies.token;
  if(!token) res.redirect('/');
  const { user } = jwt.verify(token, 'secret');
  const { title, detail } = req.body;
  const post = await postModel.findById(req.params.postId);
  post.title = title || post.title;
  post.detail = detail || post.detail;
  post.save();
  res.redirect('/post');
});





app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
