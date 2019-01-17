import { getConfig } from './getConfig';

import { postUser } from './postUser';
import { postMedia } from './postMedia';


export function routes(server, podium, db, storage, config) {

	// Ping
	server.get("/", (request, response) => {
		response.status(200).end()
	})

	// Data retreival
	getConfig(server, config)

	// Data upload
	postUser(server, podium, db)
	postMedia(server, storage, config)

}

