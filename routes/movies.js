var express = require("express"),
	router = express.Router(),
	middleware = require("../middleware"),
	Movie = require("../models/movies");
const conn = require('../dbConfig');
Feedback = require("../models/feedback");

// Index Page 
router.get("/", (request, respond) => {
	conn.query(
		'SELECT * FROM offer',
		function (err, results, fields) {
			if (err)
				console.log(err);
			respond.render("movies/index", { list: results, currentUser: request.user });
		}
	);

	/* SmtpJS.com - v3.0.0 */
	// 	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	// var xhr = new XMLHttpRequest();
	// var Email = { send: function (a) { return new Promise(function (n, e) { a.nocache = Math.floor(1e6 * Math.random() + 1), a.Action = "Send"; var t = JSON.stringify(a); Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, function (e) { n(e) }) }) }, ajaxPost: function (e, n, t) { var a = Email.createCORSRequest("POST", e); a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), a.onload = function () { var e = a.responseText; null != t && t(e) }, a.send(n) }, ajax: function (e, n) { var t = Email.createCORSRequest("GET", e); t.onload = function () { var e = t.responseText; null != n && n(e) }, t.send() }, createCORSRequest: function (e, n) { var t = new XMLHttpRequest; return "withCredentials" in t ? t.open(e, n, !0) : "undefined" != typeof XDomainRequest ? (t = new XDomainRequest).open(e, n) : t = null, t } };

	// Email.send({
	//     Host : "smtp.elasticemail.com",
	//     Username : "spareacc20192@gmail.com",
	//     Password : "3EB81C035B0034175890B87E1C49744B98C7",
	//     To : 'chaithanyareddy34@gmail.com',
	//     From : "spareacc20192@gmail.com",
	//     Subject : "This is the subject qqq q q ",
	//     Body : "And this is the body"
	// }).then(
	//   message =>console.log(message)
	// );

});

// Create offer
router.post("/", middleware.isLoggedIn, (request, respond) => {

	const body = request.body;
	conn.query(
		'SELECT * from offer',
		function (err, offers, fields) {
			if (err)
				console.log(err);
			else {
				console.log(request.user.username);
				conn.query(
					'INSERT INTO offer(offerDisc,coCgpa,lastDate,logo,cId,role) VALUES (?,?,?,?,?,?)', [body.offerDisc, body.coCgpa, body.lastDate, body.logo, request.user.username, body.role],
					function (err, results, fields) {
						if (err)
							console.log(err);
						else
							console.log(results);
					}
				);
			}
		}
	);
	request.flash("success", "Job Added");
	respond.redirect("/movies");
});

// New Page
router.get("/new", middleware.isLoggedIn, (request, respond) => {
	respond.render("movies/new", { currentUser: request.user });
});

router.get("/register/:offerID", middleware.isLoggedIn, (request, respond) => {

	conn.query(
		'SELECT * FROM student WHERE userName=?', [request.user.username],
		function (err, Sresult, fields) {
			if (err)
				console.log(err);
			else {
				conn.query(
					'INSERT INTO registration(offerID,usn) values(?,?)', [request.params.offerID, Sresult[0].usn],
					function (err, results, fields) {
						if (err) {
							console.log(err.code);
							request.flash("error", "Already Registered");
							respond.redirect("/movies/");
						}
						else {
							console.log(results);
							request.flash("success", "Registered Sucessfully");
							respond.redirect("/movies");
						}

					}
				);
			}
		}
	);
});
router.post("/register", middleware.isLoggedIn, (request, respond) => {

	console.log("posted");
	respond.redirect("/movies");

});

// Show Page
router.get("/:offerId", middleware.isLoggedIn, (request, respond) => {

	conn.query(
		'SELECT * FROM offer WHERE offerID=?', [request.params.offerId],
		function (err, results, fields) {
			if (err)
				console.log(err);
			else {
				console.log(results + "hi");
				conn.query(
					'SELECT * FROM company WHERE cId= ?', [results[0].cId],
					function (err, cresults, fields) {
						if (err)
							console.log(err);
						else {
							// stat

							//statend
							Comment.find({ offerID: request.params.offerId }, function (err, result) {
								if (err)
									console.log(err);
								else {

									//date
									var dtToday = new Date();

									var month = dtToday.getMonth() + 1;
									var day = dtToday.getDate();
									var year = dtToday.getFullYear();
									if (month < 10)
										month = '0' + month.toString();
									if (day < 10)
										day = '0' + day.toString();

									var maxDate = year + '-' + month + '-' + day
									var a = false;
									if (results[0].lastDate > maxDate)
										a = true;
									console.log(results[0].lastDate);
									console.log(maxDate);
									console.log(a);
									//date

									//feedback check
									var b = false;
									Feedback.findOne({ "offerID": request.params.offerId, "username": request.user.username }, function (err, rrresult) {

										console.log(rrresult);
										console.log(request.user.username);
										console.log(request.params.offerId);
										if (err)
											respond.render("movies/show", { movie: results[0], comp: cresults[0], comments: result, currentUser: request.user, regbool: a, b: b });

										if (rrresult == null)
											b = true;

										conn.query(
											'SELECT * FROM registration, student WHERE registration.usn=student.usn and offerID= ? and userName=?', [request.params.offerId, request.user.username],
											function (err, ccresults, fields) {
												if (err)
													console.log(err);
												else {
													console.log(ccresults.length == 0);
													b = !(ccresults.length == 0);
													respond.render("movies/show", { movie: results[0], comp: cresults[0], comments: result, currentUser: request.user, regbool: a, b: b });

												}
											});
									});
									//feedback check
								}
							});

						}
					}
				);

			}
		}
	);


});

// Edit Details
router.get("/:id/edit", middleware.checkMovieOwnership, (request, respond) => {
	Movie.findById(request.params.id, (err, foundMovie) => {
		respond.render("movies/edit", { movie: foundMovie });
	});
});

// RESULT

router.get("/company/result/:offerID", middleware.isLoggedIn, (request, respond) => {


	respond.render("movies/results", { currentUser: request.user, offerID: request.params.offerID });


});

router.post("/company/result/:offerID", middleware.isLoggedIn, (request, respond) => {

	var res = 0;
	conn.query(
		'UPDATE registration set roundNo= ? ,status =? WHERE usn= ? AND offerID=?', [request.body.roundNo, request.body.status, request.body.usn, request.params.offerID],
		function (err, results, fields) {
			if (err)
				console.log(err);
			else {
				res = results.affectedRows;
				console.log(results);
			}

		}
	);

	conn.query(
		'select email from student WHERE usn= ?', [request.body.usn],
		function (err, results, fields) {
			if (err)
				console.log(err);
			else {
				var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
				var xhr = new XMLHttpRequest();
				var Email = { send: function (a) { return new Promise(function (n, e) { a.nocache = Math.floor(1e6 * Math.random() + 1), a.Action = "Send"; var t = JSON.stringify(a); Email.ajaxPost("https://smtpjs.com/v3/smtpjs.aspx?", t, function (e) { n(e) }) }) }, ajaxPost: function (e, n, t) { var a = Email.createCORSRequest("POST", e); a.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), a.onload = function () { var e = a.responseText; null != t && t(e) }, a.send(n) }, ajax: function (e, n) { var t = Email.createCORSRequest("GET", e); t.onload = function () { var e = t.responseText; null != n && n(e) }, t.send() }, createCORSRequest: function (e, n) { var t = new XMLHttpRequest; return "withCredentials" in t ? t.open(e, n, !0) : "undefined" != typeof XDomainRequest ? (t = new XDomainRequest).open(e, n) : t = null, t } };
				console.log(results);
				Email.send({
					Host: "smtp.elasticemail.com",
					Username: "spare4147@gmail.com",
					Password: "B595F09AFA8A1DEF599467DBEE410B838FA5",
					// To: "mkrishnasaketh2001@gmail.com",
					To: results[0].email,
					From: "spare4147@gmail.com",
					Subject: " Job Application Status ",
					Body: `From RMS, Your Job Application has a UPDATE \n \t Round Number: ${request.body.roundNo} \n \t Status ${request.body.status}`
				}).then(
					message => console.log(message)
				);
				console.log(results);
			}
		}
	);
	request.flash("success", ` ${request.body.usn} Results UPDATED`);
	respond.redirect(`/movies/company/result/${request.params.offerID}`);
});

//Update offer
router.get("/update/offer/:offerID", (request, respond) => {

	conn.query(
		'SELECT * FROM offer WHERE offerID=?', [request.params.offerID],
		function (err, results, fields) {
			if (err)
				console.log(err);
			respond.render("movies/offerEdit", { data: results[0], currentUser: request.user });
		}
	);


});

router.post("/update/offer/:offerID", (request, respond) => {
	const body = request.body;
	console.log(body);
	conn.query(
		'UPDATE offer SET  offerDisc=?,coCgpa=?, logo=?,role=?, lastDate=? WHERE offerID=?', [body.offerDisc, body.coCgpa, body.logo, body.role, body.lastDate, request.params.offerID],
		function (err, results, fields) {
			if (err)
				console.log(err);
			else
				console.log(results);
		}
	);
	respond.redirect(`/movies/update/offer/${request.params.offerID}`);
});


//result for each offer
router.get("/result/offer/:offerID", (request, respond) => {

	conn.query(
		'SELECT * from offer JOIN registration ON offer.offerID= registration.offerID where offer.offerID=?', [request.params.offerID],
		function (err, results, fields) {
			if (err)
				console.log(err);
			stat = "CR";
			respond.render("results/companyResult", { detail: results, currentUser: request.user, stat: stat });
			//testing
		}
	);


});

// Delete The offer
router.get("/company/delete/:offerID", middleware.isLoggedIn, (request, respond) => {

	conn.query(
		'DELETE FROM offer where offerID=? ', [request.params.offerID],
		function (err, results, fields) {
			if (err)
				console.log(err);
			else {
				console.log(results);
			}

		}
	);
	respond.redirect("/movies");

});

//FEEDBACK
router.get("/feedback/:offerID", middleware.isLoggedIn, (request, respond) => {

	respond.render("feedback", { currentUser: request.user, offerID: request.params.offerID });
});

router.post("/feedback/:offerID", middleware.isLoggedIn, (request, respond) => {

	console.log(request.body);
	Feedback.create(request.body, (err, newComment) => {
		if (err) {
			console.log(err);
		} else {
			newComment.offerID = request.params.offerID;

			conn.query(
				'SELECT cId FROM offer where offerID=? ', [request.params.offerID],
				function (err, results, fields) {
					if (err) {
						console.log(err);
						newComment.save();
					}
					else {
						newComment.cId = results[0].cId;
						newComment.username = request.user.username;
						newComment.rating = request.body.rating;
						newComment.save();
					}

				}
			);
		}
	});
	respond.redirect(`/movies/${request.params.offerID}`)
});


router.get("/feedback/:offerID", (request, respond) => {

	respond.render("feedback", { currentUser: request.user, offerID: request.params.offerID });
});


module.exports = router;