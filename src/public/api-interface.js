import request from 'request';
import Promise from 'bluebird';
import _ from 'lodash';

let methods = {};

let API = {};

API.get = (requestUrl, data) => {
	data = data || {};
	requestUrl = window.location.origin + '/api' + requestUrl;
	return new Promise(function (resolve, reject) {
		request.get({
			uri: requestUrl,
			json: true,
			qs: data
		}, (error, response, body) => {
			if (error) {
				reject(error);
			} else {
				resolve(body,response.statusCode);
			}
		});
	});
}

API.post = (requestUrl, data) => {
	data = data || {};
	requestUrl = window.location.origin + '/api' + requestUrl;
	return new Promise(function (resolve, reject) {
		request.post({
			uri: requestUrl,
			json: true,
			body: data
		}, (error, response, body) => {
			if (error) {
				reject(error);
			} else {
				resolve(body,response.statusCode);
			}
		});
	});
}

API.validate = {};
API.validate.email = (userEmail) => ('/validate/email/' + userEmail);
API.validate.pin = () => ('/validate/pin');

API.user = {}
API.user.count = () => ('/user/count');
API.user.data = (userEmail) => ('/user/' + userEmail);
API.user.schedule = (userEmail) => ('/user/' + userEmail + '/schedule');
API.user.generateSchedule = (userEmail) => ('/user/' + userEmail + '/schedule/generate');
API.user.addCourse = (userEmail, courseId) => ('/user/' + userEmail + '/schedule/add_course/' + courseId);
API.user.enableCourse = (userEmail, courseId) => ('/user/' + userEmail + '/schedule/enable_course/' + courseId);
API.user.disableCourse = (userEmail, courseId) => ('/user/' + userEmail + '/schedule/disable_course/' + courseId);
API.user.removeCourse = (userEmail, courseId) => ('/user/' + userEmail + '/schedule/remove_course/' + courseId);
API.user.enableAnchor = (userEmail, courseId, sectionId) => ('/user/' + userEmail + '/schedule/course/' + courseId + '/enable_anchor/' + sectionId);
API.user.disableAnchor = (userEmail, courseId, sectionId) => ('/user/' + userEmail + '/schedule/course/' + courseId + '/disable_anchor/' + sectionId);
API.user.addBlock = (userEmail) => ('/user/' + userEmail + '/schedule/add_block');
API.user.removeBlock = (userEmail, blockKey) => ('/user/' + userEmail + '/schedule/remove_block/' + blockKey);

API.course = {};
API.course.updateDept = (deptId) => ('/course/dept/' + deptId + '/update');
API.course.updateAll = () => ('/course/updateAllCourses');
API.course.data = (courseId) => ('/course/' + courseId);
API.course.sections = (courseId) => ('/course/' + courseId + '/sections');
API.course.section = (courseId, sectionId) => ('/course/' + courseId + '/section/' + sectionId);

API.autocomplete = (text) => ('/autocomplete/' + text);

export default API;
