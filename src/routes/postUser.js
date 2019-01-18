

export function postUser(server, podium, db) {

	// User registration route

	//TODO - Replace with scrypto smart contract

	server.post("/user", (request, response) => {

		//TODO - Validate input data
		const data = request.body;

		// Create user
		podium
			.newUser(data.id, data.pw, data.name,
				data.bio, data.image)
			.then(address => {

				// Add user to roster
				db.setIn(["users", address], data.id)

				// Confirm user creation to client
				response
					.json({
						address: address
					})
					.status(200)
					.end()

			})
			.catch(error => {
				response
					.json(error)
					.status(500)
					.end()
			})

	})

}

