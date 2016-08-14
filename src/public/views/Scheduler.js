import React, { Component } from 'react';
import _ from 'lodash';

import CourseList from '../modules/CourseList';
import Calendar from '../modules/Calendar';
import Selector from '../modules/Selector';

import api from '../api-interface';

class Scheduler extends Component {

  constructor(props) {
    super(props);
    this.state = {
      courses: [],
      courseData: {},
      combinations: [],
      index: 0,
    };
  }

  addClass(courseId) {
    let _this = this;

    if (this.state.courses.indexOf(courseId) > -1) {
      return;
    }

    // 1. verify that the course exists
    api.verify(courseId, 20163).then(courseExists => {
      if (courseExists) {
        let coursesList = this.state.courses;
        coursesList.push(courseId);
        _this.setState({ courses: coursesList }, () => {
          _this.generateSchedules();
        });
      }
    });
  }

  removeClass(courseId) {
    this.setState({ courses: _.pull(this.state.courses, courseId) }, () => {
      this.generateSchedules();
    });
  }

  generateSchedules() {
    api.generateSchedules(this.state.courses).then(({ courseData, results }) => {
      this.setState({ courseData, combinations: results, index: 0 });
    });
  }

  render() {
    return (
      <main>
        <section id='courseselector'>
          <div id="logo" />
          <CourseList
            courses={this.state.courses}
            courseData={this.state.courseData}
            combinations={this.state.combinations}
            addClass={this.addClass.bind(this)}
            removeClass={this.removeClass.bind(this)} />
          <div id='credits'>
            <a href='http://github.com/ninjiangstar/hackSChedule'>Github</a>
          </div>
        </section>
        <section id='calendar'>
          <Calendar
            courses={this.state.courses}
            courseData={this.state.courseData}
            combinations={this.state.combinations}
            index={this.state.index} />
        </section>
        <section id='selector'>
          <Selector
            courses={this.state.courses}
            courseData={this.state.courseData}
            combinations={this.state.combinations}
            index={this.state.index} />
        </section>
      </main>
    );
  }

};

export default Scheduler;
