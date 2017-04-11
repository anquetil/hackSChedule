// routes.js router setup
var express = require('express');
var router = express.Router();

// routes
var user = require('./user');
var course = require('./course');
var trojan = require('./trojan');


router.route('/validate/email/:user_email')
	.get(user.isEmailValid);

router.route('/validate/pin')
	.get(user.isPinValid);

// ==================
// USERS

router.route('/user/count')
	.get(user.count)

router.route('/user/:user_email')
	.post(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.postUser)
	.get(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.getUser)

router.route('/user/:user_email/pay')
	.post(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.pay);

router.route('/venmo')
	.post(user.venmoWebook);

router.route('/user/:user_email/schedule')
	.get(user.getSchedule)

router.route('/user/:user_email/schedule/generate')
	.get(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.generate);

router.route('/user/:user_email/schedule/add_course/:course_id')
	.post(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.postCourseAdd)

router.route('/user/:user_email/schedule/enable_course/:course_id')
	.post(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.postCourseEnable)

router.route('/user/:user_email/schedule/disable_course/:course_id')
	.post(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.postCourseDisable)

router.route('/user/:user_email/schedule/remove_course/:course_id')
	.post(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.postCourseRemove)

router.route('/user/:user_email/schedule/course/:course_id/enable_anchor/:section_id')
	.post(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.postAnchorEnable)

router.route('/user/:user_email/schedule/course/:course_id/disable_anchor/:section_id')
	.post(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.postAnchorDisable)

router.route('/user/:user_email/schedule/add_block')
	.post(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.postBlockAdd)

router.route('/user/:user_email/schedule/remove_block/:block_key')
	.post(user.isEmailValidMiddleware, user.isPinValidMiddleware, user.postBlockRemove)


// ==================
// COURSES


router.route('/course/dept/:dept_id/update')
	.get(course.updateCourseCache)

router.route('/course/update_all')
	.get(course.updateAllCourses)

router.route('/course/:course_id')
	.get(course.getCourse)

router.route('/course/:course_id/sections')
	.get(course.getCourseSections)

router.route('/course/:course_id/section/:section_id')
	.get(course.getCourseSection)

router.route('/autocomplete')
  .get(course.autocompleteDefault);

router.route('/autocomplete/:text')
  .get(course.autocomplete);

router.route('/rmp')
	.get(course.rmp);


// ==================
// TROJAN

router.route('/trojan')
	.get(trojan.trojan)

router.route('/trojan/:action')
	.get(trojan.trojanAction)


// ==================
// EXPORT ROUTER


router.route('/*')
  .all(function (req, res) {
    res.json({
      messages: 'here are some methods you can call',
      rest_api: ['user', 'course', 'trojan']
    });
  });

module.exports = router
