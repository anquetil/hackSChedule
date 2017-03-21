var TROJAN = require('trojan-course-api');
var _ = require('lodash');
var database = require('./database');
var term = database.term;
var coursesRef = database.coursesRef;
var sectionsRef = database.sectionsRef;

var course = {};

// get: /course/:course_id
course.getCourse = function (req, res) {
	var courseId = req.params.course_id.toUpperCase();
	coursesRef.child(courseId).once('value')
		.then(function (snap) {
			if (snap.exists()) {
				res.json(snap.val());
			} else {
				res.json({
					error: 'course does not exist'
				});
			}
		})
}

// get: /course/:course_id/sections
course.getCourseSections = function (req, res) {
	var courseId = req.params.course_id.toUpperCase();
	sectionsRef.child(courseId).once('value')
		.then(function (snap) {
			if (snap.exists()) {
				res.json(snap.val());
			} else {
				res.json({
					error: 'course does not exist'
				});
			}
		})
}

// get: /course/:course_id/section/:section_id
course.getCourseSection = function (req, res) {
	var courseId = req.params.course_id.toUpperCase();
	var sectionId = req.params.sectionId.toUpperCase();

	sectionsRef.child(courseId).child(sectionId).once('value')
		.then(function (snap) {
			if (snap.exists()) {
				res.json(snap.val());
			} else {
				res.json({
					error: 'course or section does not exist'
				});
			}
		})
}

course.autocompleteDefault = function (req, res) {
  res.json([]);
}

course.autocomplete = function (req, res) {
  var text = req.params.text;
  text = text.toUpperCase();
  coursesRef
    .orderByKey()
    .startAt(text)
    .limitToFirst(8)
    .once('value')
    .then(function (snap) {
      res.json(_.values(_.mapValues(snap.val(), function (courseData, key) {
        return {
          courseId: key,
          title: courseData.title
        };
      })));
    }).catch(function (e) {
      return res.status(400).json({ error: e.message });
    });
}

// get: /dept/:dept_id/update
course.updateCourseCache = function (req, res) {
	var dept = req.params.dept_id;

	TROJAN.courses(dept).then(function (coursesObject) {
		var courses = coursesObject.courses;
		var coursesToSave = _.mapValues(courses, function (value, key) {
			return _.omit(value, ['sections']);
		});

		var sectionsToSave = _.mapValues(courses, function (value, key) {
			return value.sections;
		});

		coursesRef.update(coursesToSave);
		sectionsRef.update(sectionsToSave);

		res.json({
			success: 'updated database',
			deptId: dept,
			courses: coursesToSave,
			sections: sectionsToSave
		});
	}).catch(function (error) {
		res.json({
			error: error.message
		});
	})
}

// get: /courses/update_all
course.updateAllCourses = function (req, res) {

	// get full list of departments with courses
	TROJAN.deptsCN().then(function (departmentsObject) {
		var arrayOfDepts = Object.keys(departmentsObject.departments);

		// we want to iterate through each dept and grab its data,
		// and return the final results once we process the last dept.
		var maxIndex = arrayOfDepts.length;
		var index = 0;

		// this is where the data will be stored.
		var masterCourses = {};

		res.json({ success: 'course updating initiated' });

		// now, go through all departments
		TROJAN.deptBatch_cb(arrayOfDepts, null, function (departmentObject) {
			var department = departmentObject.department;
			var courses = department.courses;

			// merge it with the master data collector
			// masterCourses = _.merge(masterCourses, courses);

			var coursesToSave = _.mapValues(courses, function (value, key) {
				return _.omit(value, ['sections']);
			});

			var sectionsToSave = _.mapValues(courses, function (value, key) {
				return value.sections;
			});

			coursesRef.update(coursesToSave);
			sectionsRef.update(sectionsToSave);

			index += 1;

			// once we hit the last index, turn the desc into the key.
			if (maxIndex <= index) {
				// res.json(masterCourses);
				console.log('database updated');
			}
		});
	});
}

module.exports = course
