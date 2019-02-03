import s3 from 'aws-sdk/clients/s3';

import { PodiumServer } from '@carter_andrewj/podix';

import { launch } from './launch';


// Swallow event emitter warning
require('events').EventEmitter.prototype._maxListeners = 1000;




function initialize() {

	// Create placeholder for podium object
	let podium;
	console.log("PODIUM SERVER")

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
		.then(config => {
			console.log(" > Connecting to Radix...")
			podium = new PodiumServer()
			return podium.connect(config)
		})

		// Retrieve the Root User details from S3
		.then(() => {
			console.log(" > Retrieving Root User Data...")
			return store
				.getObject({
					Bucket: "podium-core",
					Key: "rootuser.json"
				})
				.promise()
		})
		.then(item => JSON.parse(item.Body.toString('utf-8')))

		// Create the network with the root user
		.then(rootUser => {
			console.log(" > Creating Network...")
			return podium.createNetwork(rootUser)
		})

		// Launch the network - creating reserved accounts,
		// bots, and other objects
		.then(() => {
			console.log(" > Launching Network...")
			return launch(podium)
		})

		// Start the server and exit initialization
		.then(() => {
			podium.serve()
			console.log("ONLINE")
		})

		// Handle errors
		.catch(error => console.error(error.stack))

}



initialize()


