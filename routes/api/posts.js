const express = require('express');
const router = express.Router();
const passport = require('passport');

const Post = require('../../models/Post');

const validatePostInputs = require('../../validation/post');

// @route  GET api/posts/test
// @desc   Tests post route
// @access Public

router.get('/test', (req, res) => res.json({msg: "posts works"}))

// @route  GET api/posts
// @desc   Get posts
// @access Public
router.get('/', (req, res) => {
    Post.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostsfound: "No posts found"}));
});

// @route  GET api/posts/:id
// @desc   Get posts by id
// @access Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({nopostfound: "No post found with thatt ID"}));
})

// @route  Post api/posts
// @desc   Create post
// @access Private

router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid} = validatePostInputs(req.body);

    if(!isValid){
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });
    newPost.save().then(post => res.json(post));
});


// @route  DELETE api/posts/:id
// @desc   Delete post
// @access Private
router.delete('/:id', passport.authenticate('jwt', {session: false}) ,(req, res) => {
    Post.findOne({_id: req.params.id})
        .then(post => {
            if(!post){
                return res.status(404).json({nopostfound: "No post found "});
            }
            if(post.user.toString() !== req.user.id){
                return res.status(401).json({ notauthorized: "User not authorized"})
            }

            post.remove().then(() => res.json({success: true}));
        })
        .catch(err => res.status(404).json({nopostfound: "No post found"}));
})

// @route  POST api/posts/:id/like
// @desc   Add like to post
// @access Private
router.post('/:id/like', passport.authenticate('jwt', {session: false}) ,(req, res) => {
    // get post that user liked, if not liked get another value
    Post.findOne({_id: req.params.id})
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                return res.status(400).json({alreadyliked: 'User already liked this post'})
            }
            // Add user id to likes array
            post.likes.unshift({user: req.user.id});
            post.save().then(post => {
                res.json(post);
            });
        })
        .catch(err => res.status(404).json({nopostfound: "No post found"}));
});


// @route  POST api/posts/:id/unlike
// @desc   remove like from post
// @access Private
router.post('/:id/unlike', passport.authenticate('jwt', {session: false}) ,(req, res) => {
    // get post that user liked, if not liked get another value
    Post.findOne({_id: req.params.id})
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                return res.status(400).json({notliked: 'You have not yet liked this post'})
            }
            // Add user id to likes array
            const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);

            post.likes.splice(removeIndex, 1);

            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({nopostfound: "No post found"}));
});


module.exports = router;