"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launch = launch;
exports.resume = resume;

var _immutable = require("immutable");

var _bots = require("./bots/bots");

var _logging = require("./logging");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function launch(podium) {
  return new Promise(function (resolve, reject) {
    // Set root account profile picture
    (0, _logging.log)(" >  > Setting Root User Profile Picture");
    var rootPicture = podium.S3.getObject({
      Bucket: "podium-core",
      Key: "images/podium.png"
    }).promise().then(function (data) {
      // Unpack image
      var image;

      if (data) {
        image = data.Body.toString('base64');
      } // Update picture


      return podium.rootUser.updateProfilePicture(image, "png");
    }); // Get pre-register accounts from S3

    var reservedAccounts = podium.S3.getObject({
      Bucket: "podium-core",
      Key: "accounts.json"
    }).promise().then(function (result) {
      return (0, _immutable.fromJS)(JSON.parse(result.Body.toString('utf-8')));
    }) // Map over accounts and register
    .then(function (accounts) {
      return Promise.all(accounts.map(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(account, id) {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  (0, _logging.log)(" >  > Creating Account: ".concat(id));
                  return _context.abrupt("return", podium.S3.getObject({
                    Bucket: "podium-core",
                    Key: account.get("picture")
                  }).promise().then(function (data) {
                    // Unpack image
                    var image;
                    var ext;

                    if (data) {
                      image = data.Body.toString('base64');
                      ext = account.get("picture").split(".")[1];
                    } // Write account to podium


                    return podium.createUser(id, account.get("password"), account.get("name"), account.get("bio"), image, ext);
                  }));

                case 2:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }()));
    }); // Wait for tasks to complete

    Promise.all([rootPicture, reservedAccounts]).then(function () {
      return (0, _bots.launchBots)(podium);
    }).then(function () {
      return resolve();
    }).catch(function (error) {
      return reject(error);
    });
  });
}

function resume(podium) {
  return new Promise(function (resolve, reject) {
    (0, _bots.launchBots)(podium).then(resolve).catch(reject);
  });
}