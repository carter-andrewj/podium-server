import '@babel/polyfill';

import s3 from 'aws-sdk/clients/s3';
import Express from 'express';

import { PodiumServer } from '@carter_andrewj/podix';

import { launch, resume } from './launch';


// Swallow event emitter warning
require('events').EventEmitter.prototype._maxListeners = 1000;


// Get command line args
// NOTE: The server will automatically look for live.json
//		 in the "podium-core" bucket to resume the last
//		 network. If it does not find the file, it will
//		 automatically create a new network. To force
//		 creation of a new network, call 'npm start reset'.
const args = process.argv
var resumeNetwork = !args.includes("reset")
var networkType = args.includes("dev") ? "dev" : "live"



function initialize() {

	// Create placeholder for podium object
	let podium;
	let config;
	console.log(`PODIUM SERVER | ${networkType.toUpperCase()}`)

	// Make S3 connection
	var store = new s3({
			apiVersion: '2006-03-01',
			region: 'eu-west-1',
			accessKeyId: process.env.AWS_ACCESS_KEY,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
		})

	// Retrieve config from S3
	console.log(" > Retrieving Config...")
	store
		.getObject({
			Bucket: "podium-core",
			Key: "config.json"
		})
		.promise()
		.then(item => JSON.parse(item.Body.toString('utf-8')))

		// Instantiate Podium Server and connect to Radix
		.then(conf => {
			console.log(" > Connecting to Radix...")
			config = conf
			return new PodiumServer().connect(config)
		})

		// Retrieve the Root User details from S3
		.then(api => {

			// Save connected podium
			podium = api

			// Log progress
			console.log(" > Retrieving Root User Data...")

			// Retreive root user data
			var getRootUser = store
				.getObject({
					Bucket: "podium-core",
					Key: "rootuser.json"
				})
				.promise()

			// Retreive existing app data, if required
			let getAppID;
			if (resumeNetwork) {
				getAppID = store
					.getObject({
						Bucket: "podium-core",
						Key: `${networkType}.json`
					})
					.promise()
					.catch(error => {
						if (error.code = "NoSuchKey") {
							return null
						} else {
							throw error
						}
					})
			}

			// Wait for both objects to return
			return Promise.all([getRootUser, getAppID])

		})

		// Unpack data from S3
		.then(([userJSON, appJSON]) => Promise.all([
			JSON.parse(userJSON.Body.toString('utf-8')),
			appJSON ?
				JSON.parse(appJSON.Body.toString('utf-8')).appID
				: null
		]))

		// Create the network with the root user
		.then(([rootUser, appID]) => {
			if (resumeNetwork && appID) {
				console.log(" > Finding Existing Network...")
				return podium.getNetwork(appID, rootUser)
			} else {
				console.log(" > Creating Network...")
				resumeNetwork = false
				return podium.createNetwork(rootUser)
			}
		})

		// Update stored config, if required
		.then(network => {

			// Store data for new network
			if (!resumeNetwork) {

				console.log(" >  > Saving New Network...")

				// Store new app data
				var liveStore = store
					.putObject({
						Bucket: "podium-core",
						Key: `${networkType}.json`,
						Body: JSON.stringify({ appID: network.app }),
						ContentType: "json"
					})
					.promise()

				// Log new network
				var logStore = store
					.putObject({
						Bucket: "podium-core",
						Key: `networks/${network.app}.json`,
						Body: JSON.stringify({
							appID: network.app,
							created: new Date().getTime()
						}),
						ContentType: "json"
					})
					.promise()

				// Wait for writes to complete
				return Promise.all([liveStore, logStore])

			// Ignore this step for resumed networks
			} else {
				return
			}

		})

		// Launch the network - creating reserved accounts,
		// bots, and other objects
		.then(() => {
			if (resumeNetwork) {
				console.log(` >  > Resuming Network: ${podium.app}`)
				return resume(podium)
			} else {
				console.log(` >  > Launching Network: ${podium.app}`)
				return launch(podium)
			}
		})

		// Start the server and exit initialization
		.then(() => {
			console.log(" > Starting Server...")
			podium.serve(new Express)
			console.log("ONLINE")
		})

		// Handle errors
		.catch(error => console.error(error.stack))

}



initialize()


