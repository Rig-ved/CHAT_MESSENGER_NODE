
// Main file to generate server


// variable declarations
const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const favicon = require('serve-favicon')
const app = express()
const port = process.env.PORT || 3000
const path = require('path');
// load Data base url
const keys = require('./config/connections');

const session = require('express-session');
const cookieParser = require('cookie-parser');

// Global Variables 
app.use((req,res,next)=>{
    res.locals.user= req.user || null
    next();
})

// facebook cookieparser and session 
app.use(cookieParser());
app.use(session({
    secret:'keyboard cat',
    saveUninitialized: true,
    resave:false
}));



// express static files
app.use("/public", express.static('client')); 


// view engine set up 
app.engine('.hbs', hbs({
    defaultLayout:'main',
    extname:'.hbs',
    helpers: require('./config/handlebar-helpers')
}));
app.set('view engine','.hbs')


// mongoose db connect   
mongoose.connect(keys.dbUrl,{
    useNewUrlParser: true
}).then(()=>{
    console.log("connected successfully")
}).catch((err)=>{
    throw(err);
    console.log("error");
})
// install the body parsers  
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
//passport facebook initialise
require('./passport/authFacebook')(app);

// passport google initialise
require('./passport/authGoogle')(app);
require('./routes')(app);   

// listen to the event 
app.listen(port,()=>{console.log(`Listen on port ${port}`)})