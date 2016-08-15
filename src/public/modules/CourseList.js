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
        <ul id='courselist' onMouseLeave={this.props.setHover.bind(null, null)}>
          {this.props.courses.map((courseId, i) => (
            <Course key={courseId}
              onMouseEnter={this.props.setHover.bind(null, i)}
              removeClass={this.props.removeClass.bind(null)}
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
