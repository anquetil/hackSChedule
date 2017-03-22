var _ = require('lodash');
var stripe_key = process.env.STRIPE_SECRET_KEY;
var stripe = require('stripe')(stripe_key);

var database = require('./database');
var usersRef = database.usersRef;
var schedulesRef = database.schedulesRef;
var coursesRef = database.coursesRef;
var sectionsRef = database.sectionsRef;

var isEmailValid = database.isEmailValid; // function
var isPinValid = database.isPinValid;
var getUserName = database.getUserName; // function

var generate = require('./generate');

var user = {};


user.isEmailValid = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var userName = getUserName(userEmail);

	usersRef.child(userName).once('value')
		.then(function (snap) {
			var user_exists = snap.exists();
			var paid = user_exists ? snap.val().paid : false;
			res.json({
				email: userEmail,
				email_format_valid: isEmailValid(userEmail),
				user_exists: user_exists,
				paid: paid
			});
		});

}

user.isPinValid = function (req, res) {
	var pin = req.body.pin || req.query.pin;
	res.json(isPinValid(pin));
}

// middleware checks if email field is valid
user.isEmailValidMiddleware = function (req, res, next) {
	var userEmail = req.params.user_email.toLowerCase();

	if (!isEmailValid(userEmail)) {
		res.json({
			error: 'email is invalid'
		});
		return;
	} else return next();
}

user.isPinValidMiddleware = function (req, res, next) {
	var pin = req.body.pin || req.query.pin;

	if (!isPinValid(pin)) {
		res.json({
			error: 'pin is invalid'
		});
		return;
	} else return next();
}


// get: count users
user.count = function (req, res) {
	var paidOnly = req.body.paid || req.query.paid || false;

	usersRef.once("value")
		.then(function(snap) {
			if (!paidOnly) {
				res.json({
					count: snap.numChildren()
				});
			} else {
				var children = snap.val();

				// count paid children
				var paidCount = 0;
				for (var key of Object.keys(children)) {
					var child = children[key];
					if (child.paid) {
						paidCount += 1;
					}
				}

				res.json({
					count: paidCount
				});
			}
		});
}

// post: /user/:user_email
// creates an account for this user email
// if user already exists, send 400 error
user.postUser = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var userName = getUserName(userEmail);
	var pin = req.body.pin || req.query.pin;

	usersRef.child(userName).once('value')
		.then(function (snap) {
			if (snap.exists()) {
				user.getUser(req, res);
			} else {
				var userData = {
					dateCreated: Date.now(),
					dateLastAccessed: Date.now(),
					email: userEmail,
					pin: pin,
					paid: false
				};

				snap.ref.set(userData);

				delete userData['pin'];
				res.json(userData);
			}
		});
}

user.pay = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var userName = getUserName(userEmail);
	var token = req.body.token;
	// Create a Customer:
	stripe.customers.create({
	  email: userEmail,
	  source: token.id,
	}).then(function(customer) {
	  return stripe.charges.create({
	    amount: 300, // 3.00 usd
	    currency: "usd",
	    customer: customer.id,
	  });
	}).then(function (charge) {
		var chargeId = charge.id;

		res.json({
			paid: true
		});

		usersRef.child(userName).child('paid').set(true);

	}).catch(function (error) {
		console.error(error);
		res.json({ paid: false, error: error.message });
	});
}

// get: /user/:user_email
// grabs user data, if pin is correct
user.getUser = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var userName = getUserName(userEmail);
	var pin = req.body.pin || req.query.pin;

	verifyUser(userName, pin, false)
		.then(function(snap) {
			snap.ref.update({
				dateLastAccessed: Date.now()
			});

			var value = snap.val();
			delete value['pin'];
			res.json(value);
		})
		.catch(function(e) {
			res.json({error: e.message});
		})
}

// get: /user/:user_email/schedule
// gets user's schedule, if user exists (no pin necessary)
user.getSchedule = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var userName = getUserName(userEmail);

	usersRef.child(userName).once('value')
		.then(function (snap) {
			if (snap.exists()) {
				return schedulesRef.child(userName).once('value');
			} else {
				throw new Error('user does not exist');
			}
		})
		.then(function (scheduleSnap) {
			res.json(scheduleSnap.val());
		})
		.catch(function (error) {
			res.json({
				error: error.message
			});
		})
}

// get: /user/:user_email/generate
// generate user's schedules
user.generate = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var userName = getUserName(userEmail);

	usersRef.child(userName).once('value')
		.then(function (snap) {
			if (snap.exists()) {
				return schedulesRef.child(userName).once('value');
			} else {
				throw new Error('user does not exist');
			}
		})
		.then(function (snap) {
			var scheduleVal = snap.val();

			var courses = scheduleVal.courses || {};
			var anchors = scheduleVal.anchors || {};
			var blocks = scheduleVal.blocks || {};

			// taking array of courses, generate schedule
			return generate(courses, anchors, blocks)
				.then(function (data) {
					// sort results by score
					// data.results.sort(function (a, b) {
					// 	if (a.score < b.score) return -1;
					// 	else if (a.score > b.score) return 1;
					// 	else return 0;
					// });

					// respond json
					res.json(data);
				});

		})
		.catch(function (error) {
			res.json({
				error: error.message
			});
		})
}

// post: /user/:user_email/schedule/add_course/:course_id
user.postCourseAdd = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var courseId = req.params.course_id.toUpperCase();
	var userName = getUserName(userEmail);
	var pin = req.body.pin || req.query.pin;;

	verifyUser(userName, pin)
		.then(function (snap) {
			return coursesRef.child(courseId).once('value');
		})
		.then(function (snap) {
				if (!snap.exists()) throw new Error('course does not exist')
		})
		.then(function (snap) {
			return sectionsRef.child(courseId).once('value')
		})
		.then(function (snap) {
			var numChildren = snap.numChildren();
			var maximumSectionsToHandle = 50;
			var userScheduleRef = schedulesRef.child(userName + '/courses/' + courseId);
			if (numChildren < maximumSectionsToHandle) {
				userScheduleRef.set(true);
				var toRet = {};
				toRet[courseId] = true;
				res.json(toRet);
			} else {
				userScheduleRef.set(false);
				var toRet = {};
				toRet[courseId] = false;
				res.json(toRet);
			}
		})
		.catch(function(e) {
			res.json({error: e.message});
		})
}

// post: /user/:user_email/schedule/enable_course/:course_id
// sets course to true
user.postCourseEnable = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var courseId = req.params.course_id.toUpperCase();
	var userName = getUserName(userEmail);
	var pin = req.body.pin || req.query.pin;;

	verifyUser(userName, pin)
		.then(function (snap) {
			return schedulesRef.child(userName + '/courses/' + courseId).once('value');
		})
		.then(function (snap) {
			if (snap.exists()) {
				snap.ref.set(true);
				var toRet = {};
				toRet[courseId] = true;
				res.json(toRet);
			} else {
				throw new Error('user does not have this course.');
			}
		})
		.catch(function(e) {
			res.json({error: e.message});
		})
}

// post: /user/:user_email/schedule/disable_course/:course_id
// sets course to false
user.postCourseDisable = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var courseId = req.params.course_id.toUpperCase();
	var userName = getUserName(userEmail);
	var pin = req.body.pin || req.query.pin;;

	verifyUser(userName, pin)
		.then(function (snap) {
			return schedulesRef.child(userName + '/courses/' + courseId).once('value')
		})
		.then(function (snap) {
			if (snap.exists()) {
				snap.ref.set(false);
				var toRet = {};
				toRet[courseId] = false;
				res.json(toRet);
			} else {
				throw new Error('user does not have this course.');
			}
		})
		.catch(function(e) {
			res.json({error: e.message});
		})
}

// post: /user/:user_email/schedule/remove_course/:course_id
// removes course from list
user.postCourseRemove = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var courseId = req.params.course_id.toUpperCase();
	var userName = getUserName(userEmail);
	var pin = req.body.pin || req.query.pin;;

	verifyUser(userName, pin)
		.then(function (snap) {
			return schedulesRef.child(userName + '/courses/' + courseId).remove();
		})
		.then(function () {
			schedulesRef.child(userName + '/anchors/' + courseId).remove();
			res.json({ success: 'course removed' });
		})
		.catch(function(e) {
			res.json({error: e.message});
		})
}

// post: /user/:user_email/schedule/course/:course_id/enable_anchor/:section_id
// sets anchor for a particular course to true
user.postAnchorEnable = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var courseId = req.params.course_id.toUpperCase();
	var sectionId = req.params.section_id.toUpperCase();
	var userName = getUserName(userEmail);
	var pin = req.body.pin || req.query.pin;;

	verifyUser(userName, pin)
		.then(function(snap) {
			schedulesRef.child(userName + '/anchors/' + courseId).child(sectionId).set(true);
			res.json({ success: 'anchor enabled' });
		})
		.catch(function(error) {
			res.json({error: error.message});
		})
}

// post: /user/:user_email/schedule/disable_course/:course_id
// sets anchor for a particular course to false
user.postAnchorDisable = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var courseId = req.params.course_id.toUpperCase();
	var sectionId = req.params.section_id.toUpperCase();
	var userName = getUserName(userEmail);
	var pin = req.body.pin || req.query.pin;;

	verifyUser(userName, pin)
		.then(function(snap) {
			schedulesRef.child(userName + '/anchors/' + courseId).child(sectionId).remove();
			res.json({ success: 'anchor enabled' });
		})
		.catch(function(error) {
			res.json({error: error.message});
		})
}

// post: /user/:user_email/schedule/add_block
// sets anchor for a particular course to false
user.postBlockAdd = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var userName = getUserName(userEmail);
	var pin = req.body.pin || req.query.pin;;
	var block = req.body.block;

	verifyUser(userName, pin)
		.then(function(snap) {
			var blockRef = schedulesRef.child(userName + '/blocks/').push();
			blockRef.set(block);
			res.json({
				success: 'block added',
				block_key: blockRef.key
			});
		})
		.catch(function(error) {
			res.json({error: error.message});
		})
}

// post: /user/:user_email/schedule/remove_block/:block_key
// remove anchor for a particular course
user.postBlockRemove = function (req, res) {
	var userEmail = req.params.user_email.toLowerCase();
	var blockKey = req.params.block_key;
	var userName = getUserName(userEmail);
	var pin = req.body.pin || req.query.pin;;

	verifyUser(userName, pin)
		.then(schedulesRef.child(userName + '/blocks/').child(blockKey).remove())
		.then(function () {
			res.json({ success: 'block removed' });
		})
		.catch(function(error) {
			res.json({error: error.message});
		})
}

module.exports = user;

function verifyUser(userName, pin, isPaidOnly) {
	isPaidOnly = isPaidOnly || true;

	return new Promise(function (resolve, reject) {

		usersRef.child(userName).once('value')
			.then(function (snap) {

				if (snap.exists()) {
					var value = snap.val();
					if (value.pin == pin && (isPaidOnly || !value.paid)) {
						resolve(snap);
					}
					reject(new Error('unable to process'));
				} else {
					reject(new Error('user does not exist'));
				}
			});

	});
}
