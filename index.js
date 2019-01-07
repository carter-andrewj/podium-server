const Express = require('express')
var app = Express()


const S3 = require('aws-sdk/clients/s3')
var s3 = new S3({
	apiVersion: '2006-03-01',
	region: 'eu-west-1'
});


const FS = require('fs')
var conf = JSON.parse(FS.readFileSync('config.json', 'utf8'))
config.launched = (new Date).getTime()


var Podium = require('podium')
var podium = new Podium(config.Universe, config.ApplicationID)


// Check if podium is already set up for this network/app-key
if (!podium.alive) {

	// Set up root podium account

	// Set up rulebook entries

	// Launch smart contracts

	// Register reserved accounts

	// Register bots

}

// Launch bots



// Set express access control middleware
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
    next();
})


// Default (ping) route
app.get("/", (req, res) => {
	res.status(200)
		.send("Working")
})


// Config route
app.get("/config", (_, res) => {
	res.status(200)
		.json(config)
})


// Receive and upload media files to S3
app.post("/media", (req, res) => {

	// Verify media id is registered on Radix
	// to the posting user

	// Get media from file

	// Upload media to S3
	s3.putObject({
			Bucket: config.MediaBucket,
			Key:
		})
		.promise()
		.then(() => res.status(200))
		.catch(() => res.status(500))

})



// User listing route

// User search route

// Topic listing route

// Topic search route

// Media endpoint route
// app.put('/media', (req, res) => {
// 	// Check media object has been registered with ledger
// 	// Upload image to S3
// 	res.send(200)
// })

app.listen(3000, () => console.log('Podium Server running on port 3000'))