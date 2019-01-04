const express = require('express')
const app = express()

var fs = require('fs')
var conf = fs.readFileSync('config.json', 'utf8')
var config = JSON.parse(conf)
config.launched = (new Date).getTime();

// Check if podium is already set up for this network/app-key

// Set up root podium account

// Set up rulebook entries

// Launch smart contracts

// Launch bots


// Set express access control middleware
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods",
		"PUT, GET, POST, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// Default (ping) route
app.get("/", (_, res) => { res.sendStatus(200) })

// Config route
app.get("/config", (_, res) => {
	res.send(JSON.stringify(config))
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