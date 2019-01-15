const Express = require('express')
var app = Express()

// const BodyParser = require('body-parser');
// app.use(BodyParser.urlencoded({ extended: true }))
// app.use(BodyParser.json())


//var Buffer = require('safe-buffer').Buffer;


// Load config
const FS = require('fs')
var config = JSON.parse(FS.readFileSync('config.json', 'utf8'))
config.launched = (new Date).getTime()



// Set up S3 connection
const S3 = require('aws-sdk/clients/s3')
const s3 = new S3({
	apiVersion: '2006-03-01',
	region: 'eu-west-1',
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});



// Set up API parser
const BusBoy = require("busboy-body-parser")
app.use(BusBoy({ limit: config.FileLimit }));


// var Podium = require('podix')
// var podium = new Podium(config.Universe)


// Check if podium is already set up for this network/app-key
//if (!podium.alive) {

	// Set up root podium account

	// Set up rulebook entries

	// Launch smart contracts

	// Register reserved accounts

	// Register bots

//}

// Launch bots




// Set express access control middleware
//TODO - Make this more secure than just allowing everything through
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
	next();
})

// Default (ping) route
app.get("/", (request, response) => {
	response
		.status(200)
		.send("Working")
		.end()
})






// Config route
app.get("/config", (_, response) => {
	response
		.status(200)
		.json(config)
		.end()
})






// User route
app.get("/user", (request, response) => {
	response
		.status(200)
		.end()
})

// User registration route
app.post("/user", (request, response) => {

	console.log("User:", request.body);

	response
		.status(200)
		.end()

})






// Receive and upload media files to S3
app.post("/media", (request, response) => {

	//TODO - Verify media id is registered on Radix
	//		 to the posting user
	//const fileAddress = 

	//TODO - Check image does not already exist in S3

	// Unpack base64 string
	var image = request.body.file.split(",")

	// Upload media to S3
	s3.putObject({
			Body: Buffer.from(image[1], "base64"),
			Key: request.body.address,
			Bucket: config.MediaStore
		})
		.promise()
		.then(() =>
			response
				.status(200)
				.end()
		)
		.catch(error =>
			response
				.status(500)
				.send(error)
				.end()
		)

})



// User listing route

// User search route

// Topic listing route

// Topic search route



// Start server
var server = app.listen(3000, () => console.log('Podium Server running on port 3000'))

// Stop server
// function shutdown() {
// 	console.log("closing server")
// 	server.close()
// }
// process.on('exit', shutdown);
// process.on('uncaughtException', shutdown);
// process.stdin.resume();
