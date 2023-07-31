module.exports = {
	server: {
		port: 8080,
		hostname: process.env["HOSTNAME"] || "lolcathost"
	},
	database: {
		filename: process.env["DB_FILENAME"] || "secureapp.db"
	}
};
