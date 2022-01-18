if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const method = require('method-override');

const app = express();

const initializepassport = require('./passport-config');
const methodOverride = require('method-override');

initializepassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

// Creating a local db to store users information
// users information would be stored temporarily
// Meaning that anytime to restart the server all user will be gone
const users = []

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Routes
app.get('/', checkAuthenticated, (req, res)=>{
    let context = { name:req.user.name, title: "Safe Authentication..."}
    res.render('index.ejs', context);
});

app.get('/login', checkNotAuthenticated, (req, res)=>{
    res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res)=>{
    res.render('register.ejs');
});

app.post('/register', checkNotAuthenticated, async (req,res)=>{
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

app.delete('/logout', (req, res)=>{
    req.logOut()
    res.redirect('/login');
})

// checking if the user is authenticated
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect('/login');
    }
}

// If user is authenticated don't allow them to go to certain pages
function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect('/');
    }
    else{
        next();
    }
}

app.listen(3000);