var generateSchedules = require('./lib/generateSchedules');
var TROJAN = require('trojan-course-api');

module.exports = function (req, res) {
  var method = req.params.method; // api/:method
  var action = req.params.action; // api/:method.:action
  var q = req.query; // {param1:query1, param2:query2}

  switch (method) {
    case 'method':
      switch (action) {
        case 'generateSchedules':
          generateSchedules(q.courses.split(','), function (data) {
            data.results.sort(function (a, b) {
              if (a.score < b.score) return -1;
              else if(a.score > b.score) return 1;
              else return 0;
            });
            res.json(data);
          });
          break;
        default:
          res.json({ error: 'NO_ACTION' });
      }
      break;
    case 'TROJAN':
      switch (action) {
        case 'terms': TROJAN.terms().then(res.json); break;
        case 'current_term': TROJAN.current_term().then(res.json); break;
        case 'depts': TROJAN.depts(q.term).then(res.json); break;
        case 'dept': TROJAN.dept(q.dept, q.term).then(res.json); break;
        case 'courses': TROJAN.courses(q.dept, q.term).then(res.json); break;
        case 'dept_info': TROJAN.dept_info(q.dept, q.term).then(res.json); break;
        case 'course': TROJAN.course(q.dept, q.num, q.seq, q.term).then(res.json); break;
        case 'section': TROJAN.section(q.dept, q.num, q.seq, q.sect, q.term).then(res.json); break;
        case 'depts_flat': TROJAN.depts_flat(q.term).then(res.json); break;
        case 'deptsY': TROJAN.deptsY(q.term).then(res.json); break;
        case 'deptsC': TROJAN.deptsC(q.term).then(res.json); break;
        case 'deptsN': TROJAN.deptsN(q.term).then(res.json); break;
        case 'deptsCN': TROJAN.deptsCN(q.term).then(res.json); break;
        case 'deptBatch': TROJAN.deptBatch(q.depts).then(res.json); break;
        default:
          res.json({ error: 'NO_ACTION' });
      }
      break;
    default:
      res.json({ error: 'NO_METHOD' });
  }
};
