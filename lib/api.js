// goal: define what is shown on /api/:method?params=query

var Firebase = require('firebase');
var db = new Firebase("https://hackschedule.firebaseio.com/schedules");

var deepcopy = require("deepcopy");

var TROJAN = require('./TROJAN');
var Generate = require('./generate');

module.exports = function(req,res){

	var method = req.params.method; // api/:method
	var action = req.params.action; // api/:method.:action
	var queries = req.query; // {param1:query1, param2:query2}

	if(method == "generate"){
		var objectArr = [];
		Generate(queries.courses, function(data, score, courseHeap){
			var object = deepcopy(data);
			objectArr.push(object);
		},function(count, courseHeap){
			res.json(objectArr);
		});
	}
	else if(method == "method"){
		if(action == "term") TROJAN.term(queries, res.json);
		else if(action == "current_term") TROJAN.current_term(queries, res.json);
		else if(action == "dept") TROJAN.dept(queries, res.json);
		else if(action == "course_list") TROJAN.course_list(queries, res.json);
		else if(action == "course") TROJAN.course(queries, res.json);
	}
	else res.json({error: "nomethod"});
}