const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();

const Profile = require('../../models/Profile');
const User = require('../../models/User');

const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// @route GET api/profile/test
// @desc Tests post route
// @access Public
router.get('/test', (req, res) => res.json({msg: "profile works"}))


// @route  GET api/profile
// @desc   Get current user profile
// @access private

router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    Profile.findOne({user: req.user.id})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            errors.noprofile = 'There is no profile for this user';
            if(!profile) return res.status(404).json(errors);
            res.json(profile);
        })
        .catch(err => {
            res.status(404).json(err);
        });
})

// @route  GET api/profile/all
// @desc   Get all profiles
// @access Public

router.get('/all', (req, res) => {
    const errors = {};

    Profile.find({})
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if(profiles.length === 0){
                errors.noprofile = 'There are no profiles';
                res.status(404).json(errors);
            }

            res.json(profiles);
        })
        .catch(err => res.status(500).json(err));
});

// @route  GET api/profile/handle/:handle
// @desc   Get profile by handle
// @access Public

router.get('/handle/:handle', (req, res) => {
    const errors = {};

    Profile.findOne({handle: req.params.handle})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = 'There\'s no profile for this user';
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(500).json(err));
});

// @route  GET api/profile/user/:user_id
// @desc   Get profile by user ID
// @access Public

router.get('/user/:user_id', (req, res) => {
    const errors = {};

    Profile.findOne({user: req.params.user_id})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = 'There\'s no profile for this user';
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json({profile: 'There\'s no profile for this user'}));
})

// @route  POST api/profile
// @desc   Create user or edit profile
// @access private

router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateProfileInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.githubUsername) profileFields.githubUsername = req.body.githubUsername;


    if(typeof req.body.skills !== 'undefined'){
        profileFields.skills = req.body.skills.split(',');

    }
    // Social
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
    
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if(profile){
                // update
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    {$set: profileFields},
                    {new: true}
                )
                .then(profile => res.json(profile));
            }else{
                // create

                // Check if handle exists
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if(profile) {
                            errors.handle = "That handle already exists";
                            return res.status(400).json(errors);
                        }

                        // save Profile
                        new Profile(profileFields)
                            .save()
                            .then(profile => res.json(profile));
                    });
            }
        })
        .catch()
})


// @route  POST api/profile/experience
// @desc   Add experience to profile
// @access private

router.post('/experience', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateExperienceInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({user: req.user.id})
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // add to experience array
            profile.experience.unshift(newExp);

            profile.save().then(profile => res.json(profile));
        });
});


// @route  POST api/profile/education
// @desc   Add education to profile
// @access private

router.post('/education', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validateEducationInput(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    Profile.findOne({user: req.user.id})
        .then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldOfStudy: req.body.fieldOfStudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }

            // add to experience array
            profile.education.unshift(newEdu);

            profile.save().then(profile => res.json(profile));
        });
});

// @route  Delete api/profile/experience/exp_id
// @desc   Delete experience from profile
// @access private

router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOneAndUpdate(
        {user: req.user.id},
        {$pull: {experience: {_id: req.params.exp_id}}},
        {new: true}
        )
        .then(profile => {
            res.json(profile);
        })
        .catch(err => {
            res.status(404).json(err)
        });
});

// @route  Delete api/profile/education/edu_id
// @desc   Delete education from profile
// @access private

router.delete('/education/:edu_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOneAndUpdate(
        {user: req.user.id},
        {$pull: {education: {_id: req.params.edu_id}}},
        {new: true}
        )
        .then(profile => {
            res.json(profile);
        })
        .catch(err => {
            res.status(404).json(err)
        });
});

// @route  Delete api/profile
// @desc   Delete user and profile
// @access private

router.delete('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.deleteOne({ user: req.user.id })
        .then(() => {
            User.deleteOne({_id: req.user.id})
                .then(() => {
                    res.json({success: true});
                });
        })
});




module.exports = router;