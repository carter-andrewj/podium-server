import { fromJS, Map, Repeat } from 'immutable';

import { bots } from './botData';

import { log } from '../logging';



export function launchBots(podium) {

	log(" >  > Managing Bots...")

	// Create bots
	var builders = fromJS(bots)
		.map(b => Repeat(b, b.get("clone")).toList())
		.flatten(true)
		.map((b, i) => runBot(podium, b, i))
		.toJS()

	return Promise.all(builders)

}



function runBot(podium, botData, i) {
	return new Promise((resolve, reject) => {

		// Generate bot data
		const bot = botData
			.set("id", botData.get("id")(i))
			.set("password", botData.get("password")(i))
			.set("name", botData.get("name")(i))
			.set("bio", botData.get("bio")(i))
			.set("picture", botData.get("picture")(i))

		// Build user
		podium
			.isUser(bot.get("id"))
			.then(address => {
				if (address) {
					return resumeBot(podium, bot, i)
				} else {
					return makeBot(podium, bot, i)
				}
			})
			.then(resolve)
			.catch(reject)

	})
}



function resumeBot(podium, bot, address) {
	return new Promise((resolve, reject) => {

		// Regenerate bot data
		const botkey = `${podium.app}|${bot.get("id")}.json`

		// Retrieve bot record
		podium.S3
			.getObject({
				Bucket: "podium-core",
				Key: `bots/${botkey}`
			})
			.promise()

			// Unpack bot data
			.then(item => JSON.parse(item.Body.toString('utf-8')))

			// Log in this bot
			.then(botRecord => podium.activeUser(
				botRecord.id,
				botRecord.password
			))
			
			// Set up bot behaviour
			.then(user => behaviour(bot, user))

			// Return the active bot record
			.then(botRecord => {
				log(` >  >  > Reactivated Bot: @${bot.get("id")}`)
				resolve(botRecord)
			})

			// Handle errors
			.catch(reject)

	})
}



function makeBot(podium, bot, i) {
	return new Promise((resolve, reject) => {

		// Retrieve bot picture, if required
		let getPicture;
		if (bot.get("picture")) {
			getPicture = podium.S3
				.getObject({
					Bucket: "podium-core",
					Key: `images/${bot.get("picture")}`
				})
				.promise()
		} else {
			getPicture = new Promise(false)
		}

		// Create bot
		getPicture
			.then(data => {

				// Unpack data
				let picture;
				if (data) {
					picture = data.Body.toString('base64')
				}

				// Make user
				return podium.createUser(
					bot.get("id"),
					bot.get("password"),
					bot.get("name"),
					bot.get("bio"),
					picture,
					picture ? bot.get("picture").split(".")[1] : null
				)

			})

			// Save bot data to S3
			.then(user => {

				// Save bot record
				const botkey = `${podium.app}|${bot.get("id")}.json`
				var save = podium.S3
					.putObject({
						Bucket: "podium-core",
						Key: `bots/${botkey}`,
						Body: JSON.stringify({
							id: bot.get("id"),
							password: bot.get("password"),
							network: podium.app
						}),
						ContentType: "json"
					})
					.promise()

				// Activate bot behaviour
				var behave = behaviour(bot, user)

				// Ensure bot has funds
				var fund = podium.mint(1000000000, user.identity)

				return Promise.all([save, behave, fund])

			})

			// Return the bot record
			.then(result => {
				log(` >  >  > Activated New Bot: @${bot.get("id")}`)
				resolve(result[1])
			})

			// Handle errors
			.catch(reject)

	})
}


function behaviour(bot, user) {
	return new Promise((resolve, reject) => {

		// Respond to events
		if (bot.get("onFollow")) {
			user.onFollow(bot.get("onFollow"))
		}

		// Create interval
		var cycle = setInterval(
			() => {

				// Run custom actions
				bot.get("onCycle")(user)

				// Get alerts
				if (bot.get("onReply") || bot.get("onMention")) {
					user.alerts(true)
						.then(alerts => {

							// Check for new mentions
							alerts.filter(a => a.get("type") === "mention")
								.map(a => bot.onMention(
									user,
									a.get("from"),
									a.get("about")
								))

							// Check for new replies
							alerts.filter(a => a.get("type") === "reply")
								.map(a => bot.onReply(
									user,
									a.get("from"),
									a.get("about")
								))

							// Flag these alerts as seen
							const seen = alerts.map(a => a.get("key"))
							user.clearAlerts(seen)

						})
						.catch(reject)
				}

			},
			Math.max(60000, bot.get("cycle") * 60000)
		)

		// Return the cycle
		resolve(Map({
			id: bot.get("id"),
			password: bot.get("password"),
			cycle: cycle
		}))

	})
}







