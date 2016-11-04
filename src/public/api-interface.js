import request from 'request';
import Promise from 'bluebird';
import _ from 'lodash';

let methods = {};

let API = {};

function interfacer(reqUrl, verb, data = {}) {
  return new Promise((resolve, reject) => {
    const requestUrl = window.location.origin + reqUrl;
    buffer();
    function buffer() {
      var req = request({
        uri: requestUrl,
        method: verb,
        json: true,
        body: data,
        qs: data
      }, (error, response, body) => {
        if (error) {
          return reject(error);
        } else if(response.statusCode !== 200) {
          return reject(new Error(body.error));
        } else {
          return resolve(body);
        }
      });
    }
  });
}

// quick verifier if course exists
API.verify = (courseId, term=null) => {
  courseId = courseId.split('-');
  let dept = courseId[0];
  let num  = courseId[1].slice(0, 3);
  let seq  = courseId[1].slice(3);

  return new Promise((resolve, reject) => {
    interfacer('/api/verify/'+dept+'-'+num+seq, 'get', { dept, num, seq, term })
      .then(data => resolve(data.exists))
      .catch(reject);
  });
}

API.generateCourseDataAndSchedules = (courses = [], anchors = {}, blocks = []) => {
  return new Promise((resolve, reject) => {
    interfacer('/api/schedule', 'get', { courses, anchors, blocks })
      .then(resolve).catch(reject);
  });
}

API.autocomplete = (query) => {
  return new Promise((resolve, reject) => {
    interfacer('/api/autocomplete/' + query, 'get')
      .then(resolve).catch(reject);
  });
}

API.createUser = (email) => {
  return new Promise((resolve, reject) => {
    interfacer('/api/schedule/' + email, 'post')
      .then(resolve).catch(reject);
  });
}

API.getUser = (email) => {
  return new Promise((resolve, reject) => {
    interfacer('/api/schedule/' + email, 'get')
      .then(resolve).catch(reject);
  });
}

API.updateUser = (email, courses, anchors, blocks) => {
  return new Promise((resolve, reject) => {
    interfacer('/api/schedule/' + email, 'put', { courses, anchors, blocks })
      .then(resolve).catch(reject);
  });
}

API.updateServer = (courses = []) => {
  return new Promise((resolve, reject) => {
    interfacer('/api/update_server', 'post', { courses })
      .then(resolve).catch(reject);
  });
}

API.uploadScreenshot = (email, data) => {
  return new Promise((resolve, reject) => {
    interfacer('/api/upload/' + email, 'post', { data })
      .then(resolve).catch(reject);
  });
}

API.getUserCount = () => {
  return new Promise((resolve, reject) => {
    interfacer('/api/usercount', 'get')
      .then(resolve).catch(reject);
  });
}

export default API;
