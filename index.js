const express = require("express");
const session = require("express-session");
const { body, validationResult } = require("express-validator")
const path = require("node:path");
const bcrypt = require("bcryptjs")
const passport = require("./config/passportConfig");
const queries = require("./database/queries");
require("dotenv").config();

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false
}));
app.use(passport.session());
app.use(express.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
})

app.get('/sign-up', (req, res) => {
    res.render("sign-up", {errors : null});
})

app.post('/sign-up', 
    [
        body("firstname").trim()
        .isAlpha().withMessage("Names should only contain alphabets."),
        body("lastname").trim()
        .isAlpha().withMessage("Names should only contain alphabets."),
        body("username").trim()
        .isLength({min : 5})
        .custom(async username => {
            const user = await queries.findByUsername(username);
            if(user){
                throw new Error("Username already exists.")
            }
        }),
        body("password").trim()
        .isLength({min : 5}),
        body("confirmPassword").trim()
        .custom((value, {req}) => {
            if(value != req.body.password){
                throw new Error("Passwords should match.")
            }
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.status(400).render("sign-up", {errors : errors.array()})
        } else {
            const { firstname, lastname, username, password } = req.body;
            const hashedpassword = await bcrypt.hash(password, 10);
            await queries.createUser(firstname, lastname, username, hashedpassword);
            req.login();
            res.redirect('/');
        }
})

app.get('/login', (req, res) => {
    res.render("login", {error : req.session.messages})
    req.session.messages = [];
})

app.post('/login', passport.authenticate("local", {
    successRedirect : '/', 
    failureRedirect : '/login', 
    failureMessage : true
}))

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if(err){
            throw(err);
        }
    });
    res.redirect('/');
})

app.get('/', (req, res) => {
    res.render("home");
})


app.listen(3000, (err) => {
    if(err){
        throw(err);
    }
})
