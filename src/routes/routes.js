import { getConfig } from './getConfig';
import { getSearch } from './getSearch';

import { postUser } from './postUser';
import { postMedia } from './postMedia';


export function routes(server, podium, db, storage, config) {

	// Ping
	server.get("/", (request, response) => {
		response.status(200).end()
	})

	// Data retreival
	getConfig(server, config)
	getSearch(server, db)

	// Data upload
	postUser(server, podium, db)
	postMedia(server, storage, config)

	// 404
	server.get("*", (request, response) => {
		response.status(404).end()
	})

}

