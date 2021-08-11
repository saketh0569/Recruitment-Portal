const mysql = require('mysql2');

const conn = mysql.createConnection({
	// for offline mysql - "practice" online mongo
	// host: 'localhost',
	// user: 'root',
	// password: 'saketh4147',
	// database: 'rms',


	// online mysql
	host: 'byvaivau9ovxtjvnxrgk-mysql.services.clever-cloud.com',
	user: 'uv23pdeukrsfj7at',
	password: 'AcSrQZCbKNEIuIfC4g13',
	database: 'byvaivau9ovxtjvnxrgk',
});
conn.connect((err) => {
	if (err)
		console.log('its error ' + err);
	else
		console.log("connected...");

});

module.exports = conn;