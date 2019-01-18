

export function getSearch(server, db) {
	server.get("/search/:target", (request, response) => {

		//TODO - Handle filtering for users-only,
		//		 topics-only, etc...

		// Unpack request
		const target = request.query("target")
		console.log(target)

		// Search database
		const results = db
			.get("users")
			.filter(v => v.includes(target))

		console.log(results.toJS())

		// Build response
		response
			.status(200)
			.json(results.toJS())
			.end()

	})
}

