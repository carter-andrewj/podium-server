

export function postMedia(server, storage, config) {
	
	// Receives and upload media files to S3

	server.post("/media", (request, response) => {

		//TODO - Verify media id is registered on Radix
		//		 to the posting user

		//TODO - Check image does not already exist in S3

		// Unpack base64 string
		var image = request.body.file.split(",")

		// Upload media to S3
		storage
			.putObject({
				Body: Buffer.from(image[1], "base64"),
				Key: request.body.address,
				Bucket: config.MediaStore
			})
			.promise()
			.then(() =>
				response
					.status(200)
					.end()
			)
			.catch(error =>
				response
					.status(500)
					.send(error)
					.end()
			)

	})

}