var mongoose = require("mongoose");

var userSchem = mongoose.Schema({
  Uid: String,
  Fav: [
    {
      type: mongoose.Schema({
        id: String,
        status: Boolean,
      }),
    },
  ],
});

var UserFav = mongoose.model("UserFav", userSchem);

module.exports.UserFav = UserFav;
