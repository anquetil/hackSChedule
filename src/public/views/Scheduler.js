import React, { Component } from 'react';
import { Link } from 'react-router'
import _ from 'lodash';

import CourseList from '../containers/CourseList';
import Calendar from '../containers/Calendar';
import SelectorFilter from '../containers/SelectorFilter';

import ApiInterface from '../api-interface';
let api = new ApiInterface();

class Scheduler extends Component {

  constructor(props) {
    super(props);
    // let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    //   var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    //   return v.toString(16);
    // });
    this.state = {
      courses: [],
      courseData: {},
      combinations: [],
      anchors: {},
      colors: [],
      index: 0,
      hover: null,
      enabled: true
    };
    this.socket = io();
  }

  render() {

    let { enabled, courses, courseData, combinations,
          anchors, colors, index, hover } = this.state;

    if (enabled) {
      return (
        <main>
          <CourseList
            courses={courses}
            courseData={courseData}
            combinations={combinations}
            addClass={this.addClass.bind(this)}
            removeClass={this.removeClass.bind(this)}
            anchors={anchors}
            hoverIndex={hover}
            setHover={this.setHover.bind(this)}
            colors={colors}
          />
          <Calendar
            courses={courses}
            courseData={courseData}
            combinations={combinations}
            index={index}
            hoverIndex={hover}
            setHover={this.setHover.bind(this)}
            anchors={anchors}
            toggleAnchor={this.toggleAnchor.bind(this)}
            colors={colors}
            regenerate={this.generateSchedules.bind(this)}
          />
          <SelectorFilter
            courses={courses}
            courseData={courseData}
            combinations={combinations}
            index={index}
            updateCal={this.updateCal.bind(this)}
          />
        </main>
      );
    }
    else {
      return (
        <main>
          <h1 style={{
            textAlign: 'center',
            margin: 100
          }}>User does not exist. <Link to={`/`}>Go back.</Link></h1>
        </main>
      );
    }
  }

  componentWillMount() {
    let _this = this;
    api.getUser(this.props.params.userEmail).then((data) =>{
      if (data.error) {
        _this.setState({ enabled: false });
      } else {
        _this.setState({
          courses: data.courses,
          anchors: data.anchors
        }, _this.generateSchedules);
        api.updateServer().then(()=>{});
      }
    });
  }

  componentDidMount() {
    document.addEventListener('keydown', this.keyboardCommands.bind(this), false);

    // sockets
    this.socket.on('receive:courseData', function (courseId) {
      if (this.state.courses.indexOf(courseId) > -1) {
        this.generateSchedules();
      }
    });
  }

  updateServer() {
    api.updateUser(this.props.params.userEmail, this.state.courses, this.state.anchors);
  }

  addClass(courseId) {
    let _this = this;

    // don't re-add class
    if (this.state.courses.indexOf(courseId) > -1) return;

    // 1. verify that the course exists
    api.verify(courseId, 20163).then(courseExists => {
      if (courseExists) {
        let coursesList = this.state.courses;
        coursesList.unshift(courseId);
        _this.setState({ courses: coursesList }, _this.generateSchedules());
      }
    });
  }

  removeClass(courseId) {
    let anchors = this.state.anchors;
    if (anchors[courseId]) {
      delete anchors[courseId];
      this.setState({ anchors });
    }

    this.setState({
      courses: _.pull(this.state.courses, courseId)
    }, this.generateSchedules);
  }

  toggleAnchor(courseId, sectionId) {
    let anchors = this.state.anchors;
    if (anchors[courseId] && anchors[courseId].indexOf(sectionId) >= 0) {
      this.removeAnchor(courseId, sectionId);
    } else {
      this.addAnchor(courseId, sectionId);
    }
  }

  addAnchor(courseId, sectionId) {
    let anchors = this.state.anchors;

    if (!_.isArray(anchors[courseId]))
      anchors[courseId] = [];

    if (anchors[courseId].indexOf(sectionId) >= 0) return;

    anchors[courseId].push(sectionId);
    this.setState({ anchors }, this.generateSchedules);
  }

  removeAnchor(courseId, sectionId) {
    let anchors = this.state.anchors;
    if (!anchors[courseId]) return;
    if (anchors[courseId].indexOf(sectionId) < 0) return;
    anchors[courseId] = _.pull(anchors[courseId], sectionId)
    if (anchors[courseId].length <= 0) {
      delete anchors[courseId];
    }
    this.setState({ anchors }, this.generateSchedules);
  }

  regenerate() {
    this.generateSchedules();
    api.updateServer().then(()=>{});
  }

  generateSchedules() {
    this.generateColors();
    this.updateServer();
    if (this.state.courses.length === 0) {
      this.setState({
        courseData: {},
        combinations: [],
        index: 0,
      });
    } else {
      api.generateCourseDataAndSchedules(this.state.courses, this.state.anchors)
        .then(({ courseData, results }) => {
          let index = this.state.index;
          if (index >= results.length) index = results.length - 1;
          if (index <= 0) index = 0;
          this.setState({
            courseData,
            combinations: results,
            index
          });
      });
    }
  }

  updateCal(i) {
    this.setState({ index: i });
  }

  generateColors() {
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
      color.cyan,
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
      if(e.keyCode == 37 || e.keyCode == 38) this.goPrev();
      else this.goNext();
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
