const express = require("express");
const session = require("express-session");
const { body, validationResult } = require("express-validator")
const path = require("node:path");
const bcrypt = require("bcryptjs")
const passport = require("./config/passportConfig");
const queries = require("./database/queries");
const { error } = require("node:console");
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
                throw new error("Username already exists.")
            }
        }),
        body("password").trim()
        .isLength({min : 5}),
        body("confirmPassword").trim()
        .custom((value, {req}) => {
            if(value != req.body.password){
                throw new error("Passwords should match.")
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
    res.render("login", {error : null});
})

app.post('/login', (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if(err){
           throw(err);
        }
        if(!user){
            res.render('login', {error : [info.message]})
        }
        else{
            req.login(user, next)
            res.redirect('/')
        }
})(req, res, next);
})

app.get('/', (req, res) => {
    res.render("home");
})


app.listen(3000, (err) => {
    if(err){
        throw(err);
    }
})
