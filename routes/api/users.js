const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('../../models/User');
const {secretOrKey} = require('../../config/keys');

// load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// @route  GET api/users/test
// @desc   Tests post route
// @access Public

router.get('/test', (req, res) => res.json({msg: "users works"}))

// @route  POST api/users/register
// @desc   Register user
// @access Public

router.post('/register', (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);
    if(!isValid) return res.status(400).json(errors);


    User.findOne({email: req.body.email})
        .then(user => {
            if(user){
                errors.email = 'Email already exists';
                return res.status(400).json(errors)
            }else{
                const avatar = gravatar.url(req.body.email, {
                    s: '200', //size
                    r: 'pg',
                    d: 'mm'
                })
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                })
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                });
            }
        });
});


// @route  POST api/users/login
// @desc   Login User / Return a token
// @access Public

router.post('/login', (req, res) => {
    const {errors, isValid} = validateLoginInput(req.body);
    if(!isValid) return res.status(400).json(errors);

    const {email, password} = req.body;

    User.findOne({email})
        .then(user => {
            if(!user){
                errors.email = 'User not found'
                return res.status(404).json(errors);
            }

            // Check Password
            bcrypt.compare(password, user.password)
                .then(match => {
                    if(match){
                        // User matched
                        const payload = {id: user.id, name: user.name, avatar: user.avatar } // create jwt payload
                        // sign token 
                        jwt.sign(
                            payload,
                            secretOrKey,
                            {expiresIn: 3600},
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                        });
                    }else{
                        errors.password = 'Password incorrect';
                        res.status(400).json(errors);
                    }
                })
        })
});


// @route  POST api/users/current
// @desc   Return current user
// @access Private

router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    })
});

module.exports = router;