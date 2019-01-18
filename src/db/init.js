import loki from "lokijs";




function getDB(config) {

	// Make or retreive database
	var db = new loki(config.DatabaseName, {
		autoloadCallback : initDB,
		autoload: true,
		autosave: true, 
		autosaveInterval: config.BackupFrequency
	});

	// Initialize database
	function initDB() {

		// Get collections
		const users = db.getCollection("users") || db.addCollection("users");
		const topics = db.getCollection("topics") || db.addCollection("topics");

		// Log out
		console.log("Database online")
		console.log(`Backing-up Database every ${config.BackupFrequency}s`)

	}

	// Return the database
	return db;

}




