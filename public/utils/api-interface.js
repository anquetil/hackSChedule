import Promise from 'bluebird';
import _ from 'lodash';

export default {
	// post, get
	get: (requestUrl, data) => {
		data = data || {};
		const url = new URL(window.location.origin + '/api' + requestUrl);
		Object.keys(data).forEach(key => url.searchParams.append(key, data[key]));
		return fetch(url, { method: 'get' }).then(response => response.json());
	},
	post: (requestUrl, data) => {
		data = data || {};
		const url = new URL(window.location.origin + '/api' + requestUrl);
		return fetch(url, {
			method: 'post',
	    headers: {
		    'Accept': 'application/json, text/plain, */*',
		    'Content-Type': 'application/json'
	    },
			body: JSON.stringify(data)
		}).then(response => response.json());
	},

	// validation (returns true or false)
	validate: {
		email: (userEmail) => ('/validate/email/' + userEmail),
		pin: () => ('/validate/pin'),
	},

	user: {
		count: () => ('/user/count'),
		data: (userEmail) => ('/user/' + userEmail),
		pay: (userEmail) => ('/user/' + userEmail + '/pay'),
		schedule: (userEmail) => ('/user/' + userEmail + '/schedule'),
		generateSchedule: (userEmail) => ('/user/' + userEmail + '/schedule/generate'),
		addCourse: (userEmail, courseId) => ('/user/' + userEmail + '/schedule/add_course/' + courseId),
		enableCourse: (userEmail, courseId) => ('/user/' + userEmail + '/schedule/enable_course/' + courseId),
		disableCourse: (userEmail, courseId) => ('/user/' + userEmail + '/schedule/disable_course/' + courseId),
		removeCourse: (userEmail, courseId) => ('/user/' + userEmail + '/schedule/remove_course/' + courseId),
		enableAnchor: (userEmail, courseId, sectionId) => ('/user/' + userEmail + '/schedule/course/' + courseId + '/enable_anchor/' + sectionId),
		disableAnchor: (userEmail, courseId, sectionId) => ('/user/' + userEmail + '/schedule/course/' + courseId + '/disable_anchor/' + sectionId),
		addBlock: (userEmail) => ('/user/' + userEmail + '/schedule/add_block'),
		removeBlock: (userEmail, blockKey) => ('/user/' + userEmail + '/schedule/remove_block/' + blockKey),
	},

	course: {
		updateDept: (deptId) => ('/course/dept/' + deptId + '/update'),
		updateAll: () => ('/course/updateAllCourses'),
		data: (courseId) => ('/course/' + courseId),
		sections: (courseId) => ('/course/' + courseId + '/sections'),
		section: (courseId, sectionId) => ('/course/' + courseId + '/section/' + sectionId),
	},

	autocomplete: {
		search: (text) => ('/autocomplete/' + text),
	},

	rmp: () => ('/rmp'),
};
