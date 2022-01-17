if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const app = express();

const initializepassport = require('./passport-config');
initializepassport(passport, email =>{
    return users.find(user => user.email === email)
})

// Creating a local db to store users information
// users information would be stored temporarily
const users = []

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res)=>{
    res.render('index.ejs', {title: "Logging you in safely and securely is what we do"});
});

app.get('/login', (req, res)=>{
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', (req, res)=>{
    res.render('register.ejs');
});

app.post('/register', async (req,res)=>{
    try{
        const hashedpassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(), // When using a db this won't be needed as it would be generated automatically
            name: req.body.name,
            email: req.body.email,
            password: hashedpassword
        })
        res.redirect('/login');
    }
    catch{
        res.redirect('/register').status(500);
    }
});

app.listen(3000);