const express = require('express')
const app = express()

var fs = require('fs');
var conf = fs.readFileSync('config.json', 'utf8');
var Config = JSON.parse(conf);

var counter = 0;
setInterval(
	() => { counter = counter + 1 },
	1000
)

app.get('/', (_, res) => {
	res.send(conf)
})

app.get('/', (req, res) => {
  res.send("There have been " + counter + " seconds since activation...")
})

app.listen(3000, () => console.log('Podium Server running on port 3000'))