// goal: define what is shown on /api/:method?params=query

var Firebase = require('firebase');
var db = new Firebase("https://hackschedule.firebaseio.com/schedules");

var deepcopy = require("deepcopy");

var TROJAN = require('./TROJAN');
var Generate = require('./generate');
var FUNC = require('./func');

module.exports = function(req,res){

  var method = req.params.method; // api/:method
  var action = req.params.action; // api/:method.:action
  var queries = req.query; // {param1:query1, param2:query2}

  if(method == "generate"){
    if(action == "fromList"){
      var objectArr = [];
      Generate(queries.courses, function(data){
        var object = deepcopy(data);
        objectArr.push(object);
      },function(count){
        objectArr.sort(FUNC.compareScore);
        res.json(objectArr);
      });
    }
    else if(action == "fromHeap"){
      var objectArr = [];
      queries.courseHeap = queries.courseHeap || {};
      Generate.courseHeap(Object.keys(queries.courseHeap), queries.courseHeap, function(data){
        var object = deepcopy(data);
        objectArr.push(object);
      },function(count){
        objectArr.sort(FUNC.compareScore);
        res.json(objectArr);
      });
    }
  }
  else if(method == "method"){
    if(action == "term") TROJAN.term(queries, res.json);
    else if(action == "current_term") TROJAN.current_term(queries, res.json);
    else if(action == "dept") TROJAN.dept(queries, res.json);
    else if(action == "course_list") TROJAN.course_list(queries, res.json);
    else if(action == "course") TROJAN.course(queries, res.json);
    else if(action == "allcourses") {
      // OUTPUT ALL COURSES
      TROJAN.current_term({},function(term){
        var dbTerm = db.child(term);
        dbTerm.child("courses").once("value",function(snapshot){
          var object = snapshot.val();
          var courselist = Object.keys(object);
          var courselistobj = courselist.map(function(item){
            return {
              course: item,
              title: object[item].title,
              tokens: item + ' ' + object[item].title
            };
          });
          //console.log(courselistobj);
          res.json(courselistobj);
        });
      });
    }
  }
  else res.json({error: "nomethod"});
}