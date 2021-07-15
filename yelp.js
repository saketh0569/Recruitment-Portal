const express = require('express'),
	apk = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	Movie = require("./models/movies.js"),
	seedDB = require("./seeds.js"),
	passport = require("passport"),
	LocalStrategy = require('passport-local'),
	methodOveride = require('method-override'),
	User = require('./models/user.js'),
	flash = require('connect-flash'),
	logger = require('morgan')
Comment = require("./models/comment.js");


// console.log(process.env)


const commentRoutes = require("./routes/comments"),
	moviesRoutes = require("./routes/movies"),
	indexRoutes = require("./routes/index");

// for offline mysql - "practice" online mongo
const DB_URL = process.env.DB_URL || "mongodb+srv://saketh:saketh@cluster0.np0za.mongodb.net/PMS?retryWrites=true&w=majority";

// for online mysql
// const DB_URL = process.env.DB_URL || "mongodb+srv://saketh:saketh@cluster0.np0za.mongodb.net/rms?retryWrites=true&w=majority";

const PORT = process.env.PORT || 3000;
const IP = process.env.IP || "127.0.0.1"


const mysql = require('mysql2');
const { db } = require('./models/movies.js');

// create the connection to database

apk.set("view engine", "ejs");
apk.use(bodyParser.urlencoded({ extended: true }));
apk.use(express.static(__dirname + "/public"));
apk.use(methodOveride("_method"));
apk.use(logger('dev'));

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set('useFindAndModify', false);
apk.use(require("express-session")({
	secret: "I have to complete this by today",
	resave: false,
	saveUninitialized: false
}));

apk.use(flash());
apk.use((request, respond, next) => {
	respond.locals.currentUser = request.user;
	respond.locals.error = request.flash("error");
	respond.locals.success = request.flash("success");
	next();
});

//Passport Config

apk.use(passport.initialize());
apk.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

apk.use("/", indexRoutes);
apk.use("/movies", moviesRoutes);
apk.use("/comments", commentRoutes);

apk.get("*", (request, respond) => {
	respond.send("Use a Valid Url");
});
apk.listen(PORT, () => {
	console.log(process.env.PORT, process.env.IP);
});

module.exports = () => {
	var conn = mysql.createConnection({

		// for offline mysql - "practice" online mongo
		host: 'localhost',
		user: 'root',
		password: 'saketh4147',
		database: 'rms',



		//for online mysql
		// host: 'bq35ggmveksgiyapykyw-mysql.services.clever-cloud.com',
		// user: 'ujvkzd5a6z7uzrc1',
		// password: '59pm9QME1GTHHbxhUWkE',
		// database: 'bq35ggmveksgiyapykyw',
	});

	conn.connect((err) => {
		if (err)
			console.log('its error ' + err);
		else
			console.log("connected...");
	});
}