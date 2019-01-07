var fs = require('fs')
var conf = fs.readFileSync('config.json', 'utf8')
var config = JSON.parse(conf)
config.launched = (new Date).getTime()
export const Config = config;