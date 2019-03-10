"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launchBots = launchBots;

var _immutable = require("immutable");

var _botData = require("./botData");

var _logging = require("../logging");

function launchBots(podium) {
  (0, _logging.log)(" >  > Managing Bots..."); // Create bots

  var builders = (0, _immutable.fromJS)(_botData.bots).map(function (b) {
    return (0, _immutable.Repeat)(b, b.get("clone")).toList();
  }).flatten(true).map(function (b, i) {
    return runBot(podium, b, i);
  }).toJS();
  return Promise.all(builders);
}

function runBot(podium, botData, i) {
  return new Promise(function (resolve, reject) {
    // Generate bot data
    var bot = botData.set("id", botData.get("id")(i)).set("password", botData.get("password")(i)).set("name", botData.get("name")(i)).set("bio", botData.get("bio")(i)).set("picture", botData.get("picture")(i)); // Build user

    podium.isUser(bot.get("id")).then(function (address) {
      if (address) {
        return resumeBot(podium, bot, i);
      } else {
        return makeBot(podium, bot, i);
      }
    }).then(resolve).catch(reject);
  });
}

function resumeBot(podium, bot, address) {
  return new Promise(function (resolve, reject) {
    // Regenerate bot data
    var botkey = "".concat(podium.app, "|").concat(bot.get("id"), ".json"); // Retrieve bot record

    podium.S3.getObject({
      Bucket: "podium-core",
      Key: "bots/".concat(botkey)
    }).promise() // Unpack bot data
    .then(function (item) {
      return JSON.parse(item.Body.toString('utf-8'));
    }) // Log in this bot
    .then(function (botRecord) {
      return podium.activeUser(botRecord.id, botRecord.password);
    }) // Set up bot behaviour
    .then(function (user) {
      return behaviour(bot, user);
    }) // Return the active bot record
    .then(function (botRecord) {
      (0, _logging.log)(" >  >  > Reactivated Bot: @".concat(bot.get("id")));
      resolve(botRecord);
    }) // Handle errors
    .catch(reject);
  });
}

function makeBot(podium, bot, i) {
  return new Promise(function (resolve, reject) {
    // Retrieve bot picture, if required
    var getPicture;

    if (bot.get("picture")) {
      getPicture = podium.S3.getObject({
        Bucket: "podium-core",
        Key: "images/".concat(bot.get("picture"))
      }).promise();
    } else {
      getPicture = new Promise(false);
    } // Create bot


    getPicture.then(function (data) {
      // Unpack data
      var picture;

      if (data) {
        picture = data.Body.toString('base64');
      } // Make user


      return podium.createUser(bot.get("id"), bot.get("password"), bot.get("name"), bot.get("bio"), picture, picture ? bot.get("picture").split(".")[1] : null);
    }) // Save bot data to S3
    .then(function (user) {
      // Save bot record
      var botkey = "".concat(podium.app, "|").concat(bot.get("id"), ".json");
      var save = podium.S3.putObject({
        Bucket: "podium-core",
        Key: "bots/".concat(botkey),
        Body: JSON.stringify({
          id: bot.get("id"),
          password: bot.get("password"),
          network: podium.app
        }),
        ContentType: "json"
      }).promise(); // Activate bot behaviour

      var behave = behaviour(bot, user); // Ensure bot has funds

      var fund = podium.mint(1000000000, user.identity);
      return Promise.all([save, behave, fund]);
    }) // Return the bot record
    .then(function (result) {
      (0, _logging.log)(" >  >  > Activated New Bot: @".concat(bot.get("id")));
      resolve(result[1]);
    }) // Handle errors
    .catch(reject);
  });
}

function behaviour(bot, user) {
  return new Promise(function (resolve, reject) {
    // Respond to events
    if (bot.get("onFollow")) {
      user.onFollow(bot.get("onFollow"));
    } // Create interval


    var cycle = setInterval(function () {
      // Run custom actions
      bot.get("onCycle")(user); // Get alerts

      if (bot.get("onReply") || bot.get("onMention")) {
        user.alerts(true).then(function (alerts) {
          // Check for new mentions
          alerts.filter(function (a) {
            return a.get("type") === "mention";
          }).map(function (a) {
            return bot.onMention(user, a.get("from"), a.get("about"));
          }); // Check for new replies

          alerts.filter(function (a) {
            return a.get("type") === "reply";
          }).map(function (a) {
            return bot.onReply(user, a.get("from"), a.get("about"));
          }); // Flag these alerts as seen

          var seen = alerts.map(function (a) {
            return a.get("key");
          });
          user.clearAlerts(seen);
        }).catch(reject);
      }
    }, Math.max(60000, bot.get("cycle") * 60000)); // Return the cycle

    resolve((0, _immutable.Map)({
      id: bot.get("id"),
      password: bot.get("password"),
      cycle: cycle
    }));
  });
}