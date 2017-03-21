var TROJAN = require('trojan-course-api');
var database = require('./database');
var currentTerm = database.term;

var trojan = {}

trojan.trojan = function (req, res) {
  res.json({
    trojan: ['terms', 'current_term', 'depts', 'dept', 'courses', 'dept_info', 'course', 'section', 'depts_flat', 'deptsY', 'deptsC', 'deptsN', 'deptsCN', 'deptBatch', 'combinations']
  });
}

trojan.trojanAction = function (req, res) {
  var action = req.params.action;
  var q = req.query || req.body;
	var options = {
		term: q.term || currentTerm,
		refresh: q.refresh || false
	};

	function respond(result) {
		res.json(result);
	}

	function catchError(error) {
		res.json({ error: error.message });
	}

  switch (action) {
    case 'terms':
      TROJAN.terms().then(respond).catch(catchError);
      break;
    case 'current_term':
      TROJAN.current_term().then(respond).catch(catchError);
      break;
    case 'depts':
      TROJAN.depts(options).then(respond).catch(catchError);
      break;
    case 'dept':
      TROJAN.dept(q.dept, options).then(respond).catch(catchError);
      break;
    case 'courses':
      TROJAN.courses(q.dept, options).then(respond).catch(catchError);
      break;
    case 'dept_info':
      TROJAN.dept_info(q.dept, options).then(respond).catch(catchError);
      break;
    case 'course':
      TROJAN.course(q.courseId, options).then(respond).catch(catchError);
      break;
    case 'section':
      TROJAN.section(q.courseId, q.sectionId, options).then(respond).catch(catchError);
      break;
    case 'depts_flat':
      TROJAN.depts_flat(options).then(respond).catch(catchError);
      break;
    case 'deptsY':
      TROJAN.deptsY(options).then(respond).catch(catchError);
      break;
    case 'deptsC':
      TROJAN.deptsC(options).then(respond).catch(catchError);
      break;
    case 'deptsN':
      TROJAN.deptsN(options).then(respond).catch(catchError);
      break;
    case 'deptsCN':
      TROJAN.deptsCN(options).then(respond).catch(catchError);
      break;
    case 'deptBatch':
      TROJAN.deptBatch(q.depts).then(respond).catch(catchError);
      break;
		case 'combinations':
			TROJAN.course(q.courseId, options).then(function(results) {
					return new Promise(function(resolve, reject) {
						resolve(results[Object.keys(results)[0]])
					});
				}).then(TROJAN.combinations)
				.then(respond)
				.catch(catchError);
				break;
    default:
      res.json({ error: 'action not found' });
  }
}

module.exports = trojan
