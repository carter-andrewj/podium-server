"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bots = void 0;

var _immutable = require("immutable");

var _uuid = require("uuid");

var bots = [{
  ref: "robot",
  clone: 1,
  id: function id(i) {
    return "bot_".concat(i);
  },
  password: function password() {
    return (0, _uuid.v4)();
  },
  name: function name(i) {
    return "Robot ".concat(i);
  },
  bio: function bio(i) {
    return "I am automated account number ".concat(i, ". ") + "I post a random number every hour.";
  },
  picture: function picture() {
    return "robot.jpg";
  },
  cycle: 60,
  onCycle: function onCycle(user) {
    return user.createPost(String(Math.random()), (0, _immutable.Map)(), null);
  },
  onReply: null,
  onMention: null,
  onFollow: null
}];
exports.bots = bots;