const express = require('express')
const app = express()

var counter = 0;
setInterval(
	() => { counter = counter + 1 },
	1000
)

app.get('/', (req, res) => {
  res.send(counter)
})

app.listen(3000, () => console.log('Podium Server running on port 3000'))