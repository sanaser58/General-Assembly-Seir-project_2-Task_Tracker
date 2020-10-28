const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

const PORT = process.env.PORT || 3000;




//-----DB Config---------//
const db = require('./config/keys').MongoURI;

//------Connect to Mongo--------//
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB successfully!"))
    .catch(err => console.log(err));


//-----EJS---------//
app.use(expressLayouts);
app.use("/public", express.static('./public'));
app.set('view engine', 'ejs');




//------BodyParser--------//
app.use(express.urlencoded({ extended: false }));



//---------Express Session----------//
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

//---------Connect Flash----------//
app.use(flash());


//---------Global Variables----------//
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});



//-----Routes---------//
app.use('/', require('./controllers/index'));
app.use('/users', require('./controllers/users'));


app.listen(PORT, () => {
    console.log(`Listening on port  ${PORT}`)
})