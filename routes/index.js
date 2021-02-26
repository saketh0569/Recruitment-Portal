var express = require("express"),
	router = express.Router(),
	passport = require("passport"),
	User = require('../models/user.js');
const mysql = require('mysql2');
const { promise } = require("../dbConfig");
middleware = require("../middleware");
const conn = require('../dbConfig');
var Sentiment = require('sentiment');

//Root Route
router.get("/", function (request, respond) {

	respond.redirect("/movies");

	
});

//Register Form
router.get("/register", (request, respond) => {
	console.log("Registraion");
	console.log(request.user);
	respond.render("register", { currentUser: request.user });
});

//Sign Up Logic
router.post("/register", (request, respond) => {
	var newUser;
	if (request.body.Role) {
		newUser = new User({ username: request.body.username, role: "recruiter" });
	}
	else
		newUser = new User({ username: request.body.username, role: "student" });
	User.register(newUser, request.body.password, (err, createdUser) => {
		if (err) {
			console.log(err);
			console.log(err.message);
			request.flash("error", err.message);
			return respond.redirect("register");
		}
		console.log(createdUser.username);
		request.flash("success", "You Have created a account");

		var renderFileLoc;
		if (request.body.Role)
			renderFileLoc = "register/company";
		else
			renderFileLoc = "register/student";

		passport.authenticate("local")(request, respond, () => { respond.redirect(renderFileLoc); });
	});
});

// signup details from student
router.get("/register/student", middleware.isLoggedIn, (request, respond) => {
	respond.render("signup/student");

});

router.post("/register/student", middleware.isLoggedIn, (request, respond) => {

	console.log("posted");
	respond.redirect("/movies");
	const un = 1233;
	console.log(request.user);
	console.log(request.body);
	const body = request.body;
	conn.query(
		'INSERT INTO student VALUES (?,?,?,?,?,?,?,?,?)', [request.user.username, body.sName, body.sUsn, body.sDepartment, body.sAddress, body.sContactNo, body.sCGPA, body.resume, body.email],
		function (err, results, fields) {
			if (err)
				console.log(err);
			console.log(results); // results contains rows returned by server
			// console.log(fields); // fields contains extra meta data about results, if available
		}
	);
});

// signup details from company
router.get("/register/company", (request, respond) => {
	respond.render("signup/company");

});

router.post("/register/company", middleware.isLoggedIn, (request, respond) => {

	console.log("posted");
	respond.redirect("/movies");
	const un = 1233;
	console.log(request.user);
	console.log(request.body);
	const body = request.body;
	conn.query(
		'INSERT INTO company VALUES (?,?,?,?,?)', [body.cName, request.user.username, body.cInfo, body.address, body.contactNo],
		function (err, results, fields) {
			if (err)
				console.log(err);
			console.log(results); // results contains rows returned by server
			// console.log(fields); // fields contains extra meta data about results, if available
		}
	);
});

//Login Form 
router.get("/login", (request, respond) => {
	console.log(request.flash("error"));
	respond.render("login");
});


//apk.post("/login", middleware,callback)
router.post("/login", passport.authenticate(
	"local", { successRedirect: "/movies", failureRedirect: "/login" }), (request, respond) => { });

//LogOut Route
router.get("/logout", (request, respond) => {
	request.flash("success", "loged you out");
	request.logout();
	respond.redirect("/movies");
});

//result
router.get("/result", middleware.isLoggedIn, (request, respond) => {

   var Rstat={};
	console.log(request.user);
	if (request.user.role == 'student') {

		conn.query(
			'SELECT * FROM student WHERE userName=?', [request.user.username],
			function (err, results, fields) {
				if (err)
					console.log(err);
				else {
					conn.query(
						'SELECT * FROM offer INNER JOIN registration ON offer.offerID=registration.offerID AND registration.usn=?', [results[0].usn],
						function (err, results, fields) {
							if (err)
								console.log(err);
							else {
								console.log(results);

								respond.render("results/studentResult", { detail: results, currentUser: request.user });
							}

						}

					);
				}

			}

		);
	}
	else {

		conn.query(
			'SELECT * from student INNER JOIN registration ON student.usn= registration.usn where offerID IN (SELECT offerID FROM offer where offer.cId=?)', [request.user.username],
			function (err, resultstop, fields) {
				if (err)
					console.log(err);
				else {
					var res = {};
					//stat
					{

						var x = 'COUNT(usn)';
						conn.query(
							'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID AND offer.cId=?', [request.user.username],
							function (err, results, fields) {
								if (err)
									console.log(err);
								else {
									console.log(results);
									res['reg'] = results[0]['COUNT(usn)'];
									conn.query(
										'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID AND offer.cId=? AND registration.status=?', [request.user.username, "FAIL"],
										function (err, results, fields) {
											if (err)
												console.log(err);
											else {
												console.log(results);
												res['fail'] = results[0]['COUNT(usn)'];
												conn.query(
													'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID AND offer.cId=? AND registration.status=?', [request.user.username, "Not Started"],
													function (err, results, fields) {
														if (err)
															console.log(err);
														else {
															console.log(results);
															res['na'] = results[0]['COUNT(usn)'];
															conn.query(
																'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID AND offer.cId=? AND registration.status=?', [request.user.username, "PASS"],
																function (err, results, fields) {
																	if (err)
																		console.log(err);
																	else {
																		console.log(results[0]);
																		res['pass'] = results[0]['COUNT(usn)'];
																		console.log(res['pass'] + 'hi');
																		respond.render("results/companyResult", { detail: resultstop, currentUser: request.user,stat:res });
																	}
																}
															);
														}
													}
												);
											}
										}
									);
								}

							}
						);
					}

				}
			});
	}
});

//student details
router.get("/studDetails/:usn", middleware.isLoggedIn, (request, respond) => {

	conn.query(
		'SELECT * FROM student WHERE usn=?', [request.params.usn],
		function (err, results, fields) {
			if (err)
				console.log(err);
			respond.render("movies/studentDet", { data: results[0], currentUser: request.user });
		}
	);
});

//MyAcc

router.get("/myAcc", middleware.isLoggedIn, (request, respond) => {

	if (request.user.role == 'student') {
		conn.query(
			'SELECT * FROM student WHERE userName=?', [request.user.username],
			function (err, results, fields) {
				if (err)
					console.log(err);
				respond.render("signup/studentEdit", { data: results[0], currentUser: request.user });
			}
		);
	}
	else {
		conn.query(
			'SELECT * FROM company WHERE cId=?', [request.user.username],
			function (err, results, fields) {
				if (err)
					console.log(err);
				respond.render("signup/companyEdit", { data: results[0], currentUser: request.user });
			}
		);

	}
});

router.post("/myAcc", middleware.isLoggedIn, (request, respond) => {

	console.log("posted");
	respond.redirect("/movies");
	const body = request.body;


	if (request.user.role == 'student') {
		conn.query(
			'UPDATE student SET userName=?, sname=?,usn=?, department=?,address=?,contactNo=?,cgpa=?,resume=?,email=? WHERE userName=?', [request.user.username, body.sName, body.sUsn, body.sDepartment, body.sAddress, body.sContactNo, body.sCGPA, body.resume, body.email, request.user.username],
			function (err, results, fields) {
				if (err)
					console.log(err);
				console.log(results); // results contains rows returned by server
				// console.log(fields); // fields contains extra meta data about results, if available
			}
		);

	}
	else {
		conn.query(
			'UPDATE company SET  cName=?,cInfo=?, address=?,contactNo=? WHERE cId=?', [body.cName, body.cInfo, body.address, body.contactNo, request.user.username],
			function (err, results, fields) {
				if (err)
					console.log(err);
				console.log(results); // results contains rows returned by server
				// console.log(fields); // fields contains extra meta data about results, if available
			}
		);

	}

});


//Sentiment analisis
router.get("/SA", (request, respond) => {

	Feedback.find({ cId: request.user.username }, function (err, result) {
		if (err)
			console.log(err);
		else {
			var pos = [];
			var neg = [];
			var sentiment = new Sentiment();

			result.forEach(x => {
				var result = sentiment.analyze(x.feedback);
				console.log(result);
				if (result.score < 0)
					neg.push({ det: x, res: result });
				else
					pos.push({ det: x, res: result });
			});

			respond.render("sentimentAna", { currentUser: request.user, neg: neg, pos: pos });
		}
	});


});


//RoleStat
router.post("/Rstat", middleware.isLoggedIn, (request, respond) => {

	{
		var res={};
		
		conn.query(
			'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID AND offer.cId=? AND offer.role=?', [request.user.username,request.body.name],
			function (err, results, fields) {
				if (err)
					console.log(err);
				else {
					console.log(results);
					res['reg'] = results[0]['COUNT(usn)'];
					conn.query(
						'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID AND offer.cId=? AND registration.status=? AND offer.role=?', [request.user.username, "FAIL",request.body.name],
						function (err, results, fields) {
							if (err)
								console.log(err);
							else {
								console.log(results);
								res['fail'] = results[0]['COUNT(usn)'];
								conn.query(
									'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID AND offer.cId=? AND registration.status=? AND offer.role=?', [request.user.username, "Not Started",request.body.name],
									function (err, results, fields) {
										if (err)
											console.log(err);
										else {
											console.log(results);
											res['na'] = results[0]['COUNT(usn)'];
											conn.query(
												'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID AND offer.cId=? AND registration.status=? AND offer.role=?', [request.user.username, "PASS",request.body.name],
												function (err, results, fields) {
													if (err)
														console.log(err);
													else {
														console.log(results[0]);
														res['pass'] = results[0]['COUNT(usn)'];
														console.log(res+'hi');
														respond.render("results/Rstat", {  currentUser: request.user,Rstat:res });
													}
												}
											);
										}
									}
								);
							}
						}
					);
				}

			}
		);





	}
});

router.get("/Tstat", middleware.isLoggedIn, (request, respond) => {

	{
		var res={};
		
		conn.query(
			'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID ',
			function (err, results, fields) {
				if (err)
					console.log(err);
				else {
					console.log(results);
					res['reg'] = results[0]['COUNT(usn)'];
					conn.query(
						'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID AND  registration.status=? ', [ "FAIL"],
						function (err, results, fields) {
							if (err)
								console.log(err);
							else {
								console.log(results);
								res['fail'] = results[0]['COUNT(usn)'];
								conn.query(
									'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID  AND registration.status=? ', [ "Not Started"],
									function (err, results, fields) {
										if (err)
											console.log(err);
										else {
											console.log(results);
											res['na'] = results[0]['COUNT(usn)'];
											conn.query(
												'SELECT COUNT(usn) FROM offer INNER JOIN registration ON offer.offerID=registration.offerID AND registration.status=? ', [ "PASS"],
												function (err, results, fields) {
													if (err)
														console.log(err);
													else {
														console.log(results[0]);
														res['pass'] = results[0]['COUNT(usn)'];
														console.log(res+'hi');
														respond.render("results/Rstat", {  currentUser: request.user,Rstat:res });
													}
												}
											);
										}
									}
								);
							}
						}
					);
				}

			}
		);





	}
});
//middleware
function isLoggedIn(request, respond, next) {
	if (request.isAuthenticated()) {
		return next();
	}
	respond.render("login");
}

module.exports = router;
