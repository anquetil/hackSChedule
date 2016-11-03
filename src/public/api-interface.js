import ajax from 'reqwest';
import Promise from 'bluebird';
import _ from 'lodash';

let methods = {};

let API = {};

// quick verifier if course exists
API.verify = (courseId, term=null) => {
  courseId = courseId.split('-');
  let dept = courseId[0];
  let num  = courseId[1].slice(0, 3);
  let seq  = courseId[1].slice(3);

  return new Promise((resolve, reject) => {
    ajax({
      url: '/api/verify/'+dept+'-'+num+seq,
      method: 'get',
      data: { dept, num, seq, term },
      success: data => resolve(data.exists),
      error: reject
    });
  });
}

API.generateCourseDataAndSchedules = (courses = [], anchors = {}, blocks = []) => {
  return new Promise((resolve, reject) => {
    ajax({
      url: '/api/schedule',
      method: 'get',
      data: { courses, anchors, blocks },
      success: resolve,
      error: reject
    });
  });
}

API.autocomplete = (query) => {
  return new Promise((resolve, reject) => {
    ajax({
      url: '/api/autocomplete/' + query,
      method: 'get',
      success: resolve,
      error: reject
    });
  });
}

API.createUser = (email) => {
  return new Promise((resolve, reject) => {
    ajax({
      url: '/api/schedule/' + email,
      method: 'post',
      success: resolve,
      error: reject
    });
  });
}

API.getUser = (email) => {
  return new Promise((resolve, reject) => {
    ajax({
      url: '/api/schedule/' + email,
      method: 'get',
      success: resolve,
      error: reject
    });
  });
}

API.updateUser = (email, courses, anchors, blocks) => {
  return new Promise((resolve, reject) => {
    ajax({
      url: '/api/schedule/' + email,
      method: 'put',
      data: { courses, anchors, blocks },
      success: resolve,
      error: reject
    });
  });
}

API.updateServer = (courses = []) => {
  return new Promise((resolve, reject) => {
    ajax({
      url: '/api/update_server',
      method: 'post',
      data: { courses },
      success: resolve
    });
  });
}

API.uploadScreenshot = (email, data) => {
  return new Promise((resolve, reject) => {
    ajax({
      url: '/api/upload/' + email,
      method: 'post',
      data: { data },
      success: resolve
    });
  });
}

API.getUserCount = () => {
  return new Promise((resolve, reject) => {
    ajax({
      url: '/api/usercount',
      method: 'get',
      success: resolve
    });
  });
}

export default API;
