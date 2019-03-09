import { Map } from 'immutable';
import { v4 as uuid } from 'uuid';



export const bots = [
	{
		
		ref: "robot",
		clone: 1,

		id: i => `bot_${i}`,
		password: () => uuid(),
		name: i => `Robot ${i}`,
		bio: i =>
			`I am automated account number ${i}. ` +
			"I post a random number every hour.",
		picture: () => "robot.jpg",

		cycle: 60,
		onCycle: user => user
			.createPost(String(Math.random()), Map(), null),

		onReply: null,
		onMention: null,
		onFollow: null,

	}
]




