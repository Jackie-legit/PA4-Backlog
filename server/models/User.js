const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  f_name: {
    type: String,
    required: true,
  },

  l_name: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;