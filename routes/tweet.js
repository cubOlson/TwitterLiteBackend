const express = require('express');
const router = express.Router();
const { asyncHandler, handleValidationErrors } = require('./utils');
const { Tweet } = require('../db/models');
const { check } = require('express-validator');
const { requireAuth } = require("../auth");

router.use(requireAuth);

const tweetNotFoundError = (tweetId) => {
    const error = new Error("The tweet with that ID can't be found.");
    error.title = "Tweet not found";
    error.status = 404;
    return error
}

router.get('/', asyncHandler(async(req, res, next) => {
    const tweets = await Tweet.findAll();
    res.json({tweets});
}));

router.get("/:id(\\d+)", asyncHandler(async(req, res) => {
    try {
        const tweetId = req.params.id
        const tweet = await Tweet.findByPk(tweetId)
    } catch (e){
        next(tweetNotFoundError(tweetId));
    }
    res.json({tweet});
}));

const tweetValidator = [
    check('message')
        .exists({ checkFalsey: true })
        .withMessage('Tweet must contain written content.')
        .isLength({ max : 280 })
        .withMessage('Tweet must be 280 characters or less.')
]

router.post('/', tweetValidator, handleValidationErrors, asyncHandler(async(req, res) => {
    const { message } = req.body;

    await Tweet.create({
        message
    });

    res.redirect('/tweets');
}));

router.put('/:id(\\d+)', tweetValidator, handleValidationErrors, asyncHandler(async(req, res) => {
    try {
        const tweetId = req.params.id;
        const { message } = req.body;
        const tweet = await Tweet.findByPk(tweetId);
        tweet.message = message;
        await tweet.save();
        res.redirect('/tweets');
    } catch (e){
        next(tweetNotFoundError(tweetId));
    }
}));

router.delete('/:id(\\d+)', asyncHandler(async(req, res, next) => {
    try {
        const { id } = req.body;
        const tweet = await Tweet.findByPk(id);
        await tweet.destroy()
        res.redirect('/tweets');
    } catch {
        next(tweetNotFoundError(id));
    }
}));


module.exports = router;