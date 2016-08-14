import React, { Component } from 'react';

import Search from '../components/Search';
import Course from '../components/Course';

class CourseList extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section id='courses'>
        <div id="logo" />
        <Search
          courses={this.props.courses}
          submit={this.addClass.bind(this)} />
        <ul id='courselist'>
          {this.props.courses.map((courseId, i) => (
            <Course key={courseId}
              removeClass={this.props.removeClass.bind(this)}
              courseId={courseId}
              courseData={this.props.courseData[courseId]}
              color={this.props.colors[i]} />
          ))}
        </ul>
        <div id='credits'>
          <a href='http://github.com/ninjiangstar/hackSChedule'>Github</a>
        </div>
      </section>
    );
  }

  addClass(courseId) {
    this.props.addClass(courseId);
  }

  removeClass(courseId) {
    this.props.removeClass(courseId);
  }

};

export default CourseList;
