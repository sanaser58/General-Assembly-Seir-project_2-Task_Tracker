const express = require('express');
const router = express.Router();

//---------User model----------//
const user = require('../models/user')

//---------Login Page----------//
router.get('/login', (req, res) => res.render('login'));

//---------Register Page----------//
router.get('/register', (req, res) => res.render('register'));

//---------Register Handle----------//
router.post('/register', (req, res) => {
    const { name, email } = req.body;


    //---------Checking for errors----------//
    let errors = [];

    if (!name || !email) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email
        });
    } else {
        //---------Validation Passed----------//
        user.findOne({ email: email }).then(foundUser => {
            if (foundUser) {
                //---------User already exists----------//
                errors.push({ msg: 'Email ID already exists' });
                res.render('register', {
                    errors,
                    name,
                    email
                });
            } else {
                const newUser = user.create({
                    name,
                    email
                }).then(() => {
                    req.flash(
                        'success_msg',
                        'You are now registered and can log in'
                    );
                    res.redirect('/users/login');
                })
                ;

//---------Save user----------//
                newUser
                    .save()
                    
                    .catch(err => console.log(err));
            }
        });
    }
});


//---------Login Handle----------//
router.post('/login', (req, res) => {
    const { name, email } = req.body;
    //---------Checking user in database----------//
    user.findOne({
        email: email
    }).then(user => {
        if (!user) {
            let errors = [];
            errors.push({ msg: 'This email is not registered' });
            res.render('login', {
                errors,
                name,
                email
            });
        }
        //---------Redirect to dashboard----------//
        else {
            res.redirect(`/dashboard?user=${user.email}`);
        }
    });

});

//---------Logout Handle----------//
router.get('/logout', (req, res) => {
    // req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;