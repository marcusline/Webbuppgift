if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const startuppassport = require('./passport-config')
startuppassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id),
)

app.use(express.static(__dirname + '/public'));

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
res.render('index.ejs', {name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) =>{
    try{
        const hasedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hasedPassword
        })

        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    Console.log(users)
})

//Logout
app.delete('/logout', (req, res) =>{
    req.logOut()
    res.redirect('/login')
})

//Håller dig inloggad
function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

//Funktion för att blocka login och register efter du har loggat in
function checkNotAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000)