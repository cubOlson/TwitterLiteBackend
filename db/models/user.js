'use strict';
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false
    },
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Tweet, {
      as: "tweets",
      foreignKey: "userId",
    });
  };
  User.prototype.validatePassword = function (password) {
    // Note that since this function is a model instance method,
    // `this` is the user instance here:
    return bcrypt.compareSync(password, this.hashedPassword.toString());
  };
  return User;
};