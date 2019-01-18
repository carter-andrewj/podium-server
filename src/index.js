import { Map, fromJS } from 'immutable';

import Express from 'express';
import BusBoy from "busboy-body-parser";

import { getDB } from "./db/init";

import s3 from 'aws-sdk/clients/s3';

import Podix from '@carter_andrewj/podix';
import { launchNetwork } from './launch/launch';

import { routes } from './routes/routes';




// GLOBAL VARIABLES

// Server
var server = Express()

// Podium API
let podium;

// Database
var db = getDB();

// S3 connection
const storage = new s3({
	apiVersion: '2006-03-01',
	region: 'eu-west-1',
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Config
var config = Map({})
	.set("launched", (new Date).getTime());






// RUN SERVER

// Set up environment
function init() {
	return new Promise((resolve, reject) =>

		// Load config
		storage
			.getObject({
				Bucket: "podium-core",
				Key: "config.json"
			})
			.promise()
			.then(result =>
				JSON.parse(result.Body.toString('utf-8'))
			)

			// Initialize Podium on Radix
			.then(conf => {
				config = config
					.mergeDeep(fromJS(conf))
					.set("latest", (new Date).getTime())
				podium = new Podix(config.toJS())
				podium.setDebug(true)
				launchNetwork(podium)
					.then(result => resolve(result))
			})

			// Handle errors
			.catch(error => reject(error))

	)
}

// Launch server
init().then(() => {

	// Set the server to periodlically check for
	// changes to the config file
	const reload = config.get("ReloadConfig")
	console.log(`Checking for updates every ${reload}s`)
	setInterval(init, reload * 1000)

	// Set up post body and file parsing
	server.use(BusBoy({
		limit: config.get("FileLimit")
	}));

	// Set up CORS
	//TODO - Make this more secure than just allowing everything through
	server.use((request, response, next)  => {
		response.header(
			"Access-Control-Allow-Origin",
			request.headers.origin
		);
		response.header(
			"Access-Control-Allow-Methods",
			"GET,PUT,POST,DELETE"
		);
		response.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);
		next();
	})

	// Set up routes
	routes(server, podium, db, storage, config)

	// Start server
	const port = config.get("Port")
	server.listen(port,
		() => console.log('Podium Server running on port ' +
						  config.get("Port"))
	)

})




