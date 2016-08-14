import React, { Component } from 'react';
import _ from 'lodash';

class CourseList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
    };
  }

  render() {
    return (
      <div>
        <div id='search'>
          <input type='text'
            onChange={this.onChange.bind(this)}
            value={this.state.searchText}
            onKeyDown={this.checkSubmit.bind(this)}
            placeholder='Enter a class ID' />
        </div>
        <ul id='courselist'>
          {this.props.courses.map(this.createCourseItem.bind(this))}
        </ul>
      </div>
    );
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.courses.length > this.props.courses.length) {
      this.setState({ searchText: '' });
    }
  }

  onChange(e) {
    this.setState({ searchText: e.target.value });
  }

  checkSubmit(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.props.addClass(this.state.searchText.toUpperCase().replace(' ', '-'));
    }
  }

  removeClass(courseId) {
    this.props.removeClass(courseId);
  }

  createCourseItem(courseId) {
    if (_.isUndefined(this.props.courseData[courseId])) {
      return (
        <li key={courseId}>
          Loading {courseId}...
        </li>
      );
    } else {
      return (
        <li key={courseId}>
          <a className='close' onClick={this.props.removeClass.bind(this, courseId)}>×</a>
          <span className='course tag'>{courseId}</span>
          <span className='unit tag'>{this.props.courseData[courseId].units} units</span>
          <span className='courseTitle'>{this.props.courseData[courseId].title}</span>
        </li>
      );
    }
  }

};

export default CourseList;
