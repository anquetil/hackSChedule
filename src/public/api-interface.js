import ajax from 'reqwest';
import Promise from 'bluebird';
import _ from 'lodash';

let methods = {};

methods.verify = function (courseId, term) {
  courseId = courseId.split('-');
  return new Promise((resolve, reject) => {
    if (courseId.length !== 2) resolve(false);

    let dept = courseId[0];
    let num = courseId[1].slice(0, 3);
    let seq = courseId[1].slice(3);

    interfacer('TROJAN', 'course', { dept, num, seq, term }).then((data) => {
      resolve((Object.keys(data).length > 0));
    }).error(reject);
  });
};

methods.generateSchedules = function (courses = []) {
  return new Promise((resolve, reject) => {
    interfacer('method', 'generateSchedules', { courses }).then((data) => {
      resolve(data);
    }).error(reject);
  });
};

export default methods;

function interfacer(method, action, queries = {}) {
  let queriesString = '';
  for (let key in queries) {
    queriesString += '&' + key + '=' + queries[key];
  }

  return new Promise((resolve, reject) => {
    buffer();
    function buffer() {
      ajax({
        url: '/api/' + method + '.' + action + '?' + queriesString,
        method: 'get',
        success: function (res) {
          resolve(res);
        },

        error: function (err) {
          console.error('ajax err:', err._url.href);
          setTimeout(buffer, 200);
        },
      });
    }
  });
};
