

export function getConfig(server, config) {
	server.get("/config", (_, response) => {
		response
			.status(200)
			.json(config.toJS())
			.end()
	})
}

