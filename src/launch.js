import { fromJS } from 'immutable';



export function launch(podium) {
	return new Promise((resolve, reject) => {

		// Set root account profile picture
		console.log(" >  > Setting Root User Profile Picture")
		var rootPicture = podium.S3
			.getObject({
				Bucket: "podium-core",
				Key: "images/podium.png"
			})
			.promise()
			.then(data => {

				// Unpack image
				let image;
				let ext;
				if (data) {
					image = data.Body.toString('base64')
				}

				// Update picture

				return podium.rootUser
					.updateProfilePicture(image, "png")

			})

		// Get pre-register accounts from S3
		var reservedAccounts = podium.S3
			.getObject({
				Bucket: "podium-core",
				Key: "accounts.json"
			})
			.promise()
			.then(result => fromJS(JSON.parse(
				result.Body.toString('utf-8')
			)))

			// Map over accounts and register
			.then(accounts => Promise.all(accounts
				.map(async (account, id) => {
					console.log(` >  > Creating Account: ${id}`)
					return podium.S3
						.getObject({
							Bucket: "podium-core",
							Key: account.get("picture")
						})
						.promise()
						.then(data => {

							// Unpack image
							let image;
							let ext;
							if (data) {
								image = data.Body.toString('base64')
								ext = account.get("picture").split(".")[1]
							}

							// Write account to podium
							return podium.createUser(
								id,
								account.get("password"),
								account.get("name"),
								account.get("bio"),
								image,
								ext
							)

						})
				})
			))


		// Launch bots


		// Wait for tasks to complete
		Promise.all([rootPicture, reservedAccounts])
			.then(() => resolve())
			.catch(error => reject(error))

	})
}



