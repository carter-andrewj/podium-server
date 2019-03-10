import fs from 'fs';


export function log(line) {
	fs.appendFileSync('log.txt', `${line}\n`)
	console.log(line)
}


export function resetLog() {
	return new Promise(resolve => {
		fs.truncate('log.txt', 0, resolve)
	})
}
