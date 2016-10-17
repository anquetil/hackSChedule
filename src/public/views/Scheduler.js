import React, { Component } from 'react';
import _ from 'lodash';

import CourseList from '../modules/CourseList';
import Calendar from '../modules/Calendar';
import SelectorFilter from '../modules/SelectorFilter';

import api from '../api-interface';

class Scheduler extends Component {

  constructor(props) {
    super(props);
    this.state = {
      courses: [],
      courseData: {},
      combinations: [],
      colors: [],
      index: null,
      hover: null,
    };
  }

  render() {
    return (
      <main>
        <CourseList
          courses={this.state.courses}
          courseData={this.state.courseData}
          combinations={this.state.combinations}
          addClass={this.addClass.bind(this)}
          removeClass={this.removeClass.bind(this)}
          hoverIndex={this.state.hover}
          setHover={this.setHover.bind(this)}
          colors={this.state.colors} />
        <Calendar
          courses={this.state.courses}
          courseData={this.state.courseData}
          combinations={this.state.combinations}
          index={this.state.index}
          hoverIndex={this.state.hover}
          setHover={this.setHover.bind(this)}
          colors={this.state.colors} />
        <SelectorFilter
          courses={this.state.courses}
          courseData={this.state.courseData}
          combinations={this.state.combinations}
          index={this.state.index}
          updateCal={this.updateCal.bind(this)} />
      </main>
    );
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyboardCommands.bind(this), false);
    document.getElementById('search').addEventListener('keydown', this.keyboardCommandsInInput.bind(this), false);
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
        coursesList.unshift(courseId);
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
    this.generateColors();
    if (this.state.courses.length === 0) {
      this.setState({
        courseData: {},
        combinations: [],
        index: 0,
      });
    } else {
      api.generateSchedules(this.state.courses).then(({ courseData, results }) => {
        this.setState({
          courseData,
          combinations: results,
          index: 0
        });
      });
    }
  }

  updateCal(i) {
    this.setState({ index: i });
  }

  generateColors() {
    // var colors = [];
    // let count = this.state.courses.length;
    // for (var i = 0; i < count; i++) {
    //   colors.push(colorFade([233,52,50],[233,167,30], i, count));
    // }
    // this.setState({ colors });
    //
    // function colorFade(startColor, endColor, index, count){
    //   var diffR = endColor[0] - startColor[0],
    //       diffG = endColor[1] - startColor[1],
    //       diffB = endColor[2] - startColor[2],
    //       percentFade = (index + 1) / count;
    //   diffR = Math.round((diffR * percentFade) + startColor[0]);
    //   diffG = Math.round((diffG * percentFade) + startColor[1]);
    //   diffB = Math.round((diffB * percentFade) + startColor[2]);
    //   return [diffR, diffG, diffB];
    // }

    function rgb(r,g,b) {
      return [r,g,b];
    }

    let color = {
      red: rgb(244,67,54),
      pink: rgb(233,30,99),
      purple: rgb(156,39,176),
      deepPurple: rgb(103,58,183),
      indigo: rgb(63,81,181),
      blue: rgb(33,150,243),
      lightBlue: rgb(3,169,244),
      cyan: rgb(0,188,212),
      teal: rgb(0,150,136),
      green: rgb(76,175,80),
      lightGreen: rgb(104,159,56),
      lime: rgb(175,180,43),
      yellow: rgb(249,168,37),
      orange: rgb(251,140,0),
      deepOrange: rgb(255,87,34),
      brown: rgb(121,85,72),
      blueGrey: rgb(96,125,139),
    };

    let colors = [
      color.orange,
      color.green,
      color.blue,
      color.indigo,
      color.purple,
      color.brown,
    ];

    this.setState({ colors: colors.splice(0, this.state.courses.length).reverse() })
  }

  keyboardCommands(e) {
    if([37,38,39,40].indexOf(e.keyCode) > -1){
      e.preventDefault();
      if(e.keyCode == 37 || e.keyCode == 38) this.goPrev().bind(this);
      else this.goNext().bind(this);
    }
  }

  keyboardCommandsInInput(e) {
    if([37,39].indexOf(e.keyCode) > -1){
      e.stopPropagation();
    }
  }

  goPrev() {
    if (this.state.index > 0) {
      this.setState({ index: this.state.index - 1 });
    }
  }

  goNext() {
    if (this.state.index < this.state.combinations.length - 1) {
      this.setState({ index: this.state.index + 1 });
    } else {
      this.setState({ index: this.state.combinations.length - 1});
    }
  }

  setHover(i) {
    this.setState({ hover: i });
  }

};

export default Scheduler;
