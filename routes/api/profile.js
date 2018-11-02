const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route GET api/profile/test
// @desc Tests post route
// @access Public
router.get('/test', (req, res) => res.json({msg: "profile works"}))


// @route  GET api/profile
// @desc   Get current users profile
// @access Public

router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    Profile.findOne({user: req.user.id})
        .then(profile => {
            errors.noprofile = 'There is no profile for this user';
            if(!profile) return res.status(404).json(errors);
            res.json(profile);
        })
        .catch(err => {
            res.status(404).json(err);
        });
})

module.exports = router;