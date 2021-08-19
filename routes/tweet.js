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
    const tweets = await Tweet.findAll({
        include: [{ model: User, as: "user", attributes: ["username"] }],
        order: [["createdAt", "DESC"]],
        attributes: ["message"],
      });
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
        message,
        userId: req.user.id
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

router.delete(
    "/:id(\\d+)",
    asyncHandler(async (req, res, next) => {
      const tweet = await Tweet.findOne({
        where: {
          id: req.params.id,
        },
      });
      if (req.user.id !== tweet.userId) {
        const err = new Error("Unauthorized");
        err.status = 401;
        err.message = "You are not authorized to delete this tweet.";
        err.title = "Unauthorized";
        throw err;
      }
      if (tweet) {
        await tweet.destroy();
        res.json({ message: `Deleted tweet with id of ${req.params.id}.` });
      } else {
        next(tweetNotFoundError(req.params.id));
      }
    })
  );


module.exports = router;