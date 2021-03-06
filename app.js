const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const { environment } = require('./config');
const indexRouter = require('./routes/index');
const tweetsRouter = require('./routes/tweet');
const userRouter = require('./routes/users')

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors({ origin: "http://localhost:4000" }));

app.use('/', indexRouter);
app.use('/tweets', tweetsRouter);
app.use('/users', userRouter);

// Catch unhandled requests and forward to error handler.
app.use((req, res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.errors = ["The requested resource couldn't be found."];
  err.status = 404;
  next(err);
});

// Custom error handlers.

// Process sequelize errors
app.use((err, req, res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    err.errors = err.errors.map((e) => e.message);
    err.title = "Sequelize Error";
  }
  next(err);
});

// Generic error handler.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  const isProduction = environment === "production";
  res.json({
    title: err.title || "Server Error",
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack,
  });
});

module.exports = app;
