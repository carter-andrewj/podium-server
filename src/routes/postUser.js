

export function postUser(server, podium, db) {

	// User registration route

	server.post("/user", (request, response) => {

		//TODO - Validate input data

		// Create user
		podium
			.newUser(body.id, body.pw, body.name,
				body.bio, body.image)
			.then(address => {

				// Add user to roster
				db.setIn(["users", body.id], address)

				// Confirm user creation to client
				response
					.send(address)
					.status(500)
					.end()

			})
			.catch(error => {
				response
					.send(error)
					.status(500)
					.end()
			})

	})

}

