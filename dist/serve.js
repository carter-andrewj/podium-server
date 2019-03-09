"use strict";

var _s2 = _interopRequireDefault(require("aws-sdk/clients/s3"));

var _express = _interopRequireDefault(require("express"));

var _podix = require("@carter_andrewj/podix");

var _launch = require("./launch");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// Swallow event emitter warning
require('events').EventEmitter.prototype._maxListeners = 1000; // Get command line args
// NOTE: The server will automatically look for live.json
//		 in the "podium-core" bucket to resume the last
//		 network. If it does not find the file, it will
//		 automatically create a new network. To force
//		 creation of a new network, call 'npm start reset'.

var args = process.argv;
var resumeNetwork = !args.includes("reset");
var networkType = args.includes("dev") ? "dev" : "live";

function initialize() {
  // Create placeholder for podium object
  var podium;
  var config;
  console.log("PODIUM SERVER | ".concat(networkType.toUpperCase())); // Make S3 connection

  var store = new _s2.default({
    apiVersion: '2006-03-01',
    region: 'eu-west-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }); // Retrieve config from S3

  console.log(" > Retrieving Config...");
  store.getObject({
    Bucket: "podium-core",
    Key: "config.json"
  }).promise().then(function (item) {
    return JSON.parse(item.Body.toString('utf-8'));
  }) // Instantiate Podium Server and connect to Radix
  .then(function (conf) {
    console.log(" > Connecting to Radix...");
    config = conf;
    return new _podix.PodiumServer().connect(config);
  }) // Retrieve the Root User details from S3
  .then(function (api) {
    // Save connected podium
    podium = api; // Log progress

    console.log(" > Retrieving Root User Data..."); // Retreive root user data

    var getRootUser = store.getObject({
      Bucket: "podium-core",
      Key: "rootuser.json"
    }).promise(); // Retreive existing app data, if required

    var getAppID;

    if (resumeNetwork) {
      getAppID = store.getObject({
        Bucket: "podium-core",
        Key: "".concat(networkType, ".json")
      }).promise().catch(function (error) {
        if (error.code = "NoSuchKey") {
          return null;
        } else {
          throw error;
        }
      });
    } // Wait for both objects to return


    return Promise.all([getRootUser, getAppID]);
  }) // Unpack data from S3
  .then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        userJSON = _ref2[0],
        appJSON = _ref2[1];

    return Promise.all([JSON.parse(userJSON.Body.toString('utf-8')), appJSON ? JSON.parse(appJSON.Body.toString('utf-8')).appID : null]);
  }) // Create the network with the root user
  .then(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        rootUser = _ref4[0],
        appID = _ref4[1];

    if (resumeNetwork && appID) {
      console.log(" > Finding Existing Network...");
      return podium.getNetwork(appID, rootUser);
    } else {
      console.log(" > Creating Network...");
      resumeNetwork = false;
      return podium.createNetwork(rootUser);
    }
  }) // Update stored config, if required
  .then(function (network) {
    // Store data for new network
    if (!resumeNetwork) {
      console.log(" >  > Saving New Network..."); // Store new app data

      var liveStore = store.putObject({
        Bucket: "podium-core",
        Key: "".concat(networkType, ".json"),
        Body: JSON.stringify({
          appID: network.app
        }),
        ContentType: "json"
      }).promise(); // Log new network

      var logStore = store.putObject({
        Bucket: "podium-core",
        Key: "networks/".concat(network.app, ".json"),
        Body: JSON.stringify({
          appID: network.app,
          created: new Date().getTime()
        }),
        ContentType: "json"
      }).promise(); // Wait for writes to complete

      return Promise.all([liveStore, logStore]); // Ignore this step for resumed networks
    } else {
      return;
    }
  }) // Launch the network - creating reserved accounts,
  // bots, and other objects
  .then(function () {
    if (resumeNetwork) {
      console.log(" >  > Resuming Network: ".concat(podium.app));
      return (0, _launch.resume)(podium);
    } else {
      console.log(" >  > Launching Network: ".concat(podium.app));
      return (0, _launch.launch)(podium);
    }
  }) // Start the server and exit initialization
  .then(function () {
    console.log(" > Starting Server...");
    podium.serve(new _express.default());
    console.log("ONLINE");
  }) // Handle errors
  .catch(function (error) {
    return console.error(error.stack);
  });
}

initialize();