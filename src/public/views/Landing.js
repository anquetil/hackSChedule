import React, { Component } from 'react';
import _ from 'lodash';

import Course from '../components/Course';
import Calendar from '../containers/Calendar';

import ApiInterface from '../api-interface';
let api = new ApiInterface();

let courses = ['CSCI-201', 'CSCI-270', 'ITP-380', 'EE-109'];

class Landing extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      msg: '',
      courses: ['CSCI-201', 'CSCI-270', 'ITP-380', 'EE-109'],
      courseData: {},
      combinations: [],
      colors: [],
      index: 3,
      hover: null
    };
  }

  render() {
    return (
      <main id='landing'>
        <div id='logo' />

        <section id='blob'>
          <div id='blurb'>
            Design your perfect class schedule in 10 seconds. <br />
            USC's Spring 2017 course catalog is now available.
          </div>
          <div id='login'>
            <div className='prompt'>Enter your USC email to get started.</div>
            <input type='text'
              ref='email'
              onChange={this.onChange.bind(this)}
              value={this.state.text}
              onKeyDown={this.checkSubmit.bind(this)}
              placeholder='tommytrojan@usc.edu' />
            <button onClick={this.submit.bind(this)}>Go</button>
            <div className='alert'>{this.state.msg}</div>
          </div>
        </section>

        <ul id='courselist' onMouseLeave={(e) => {this.setState({ hover: null })}}>
          {this.state.courses.map((courseId, i) => (
            <Course
              className={(i === this.state.hover) ? 'hover' : ''}
              onMouseEnter={(e) => {this.setState({ hover: i })}}
              removeClass={()=>{}}
              courseId={courseId}
              courseData={this.state.courseData[courseId]}
              color={this.state.colors[i]}
              anchors={{}}
            />
          ))}
        </ul>
        <Calendar
          courses={this.state.courses}
          full={true}
          courseData={this.state.courseData}
          combinations={this.state.combinations}
          index={this.state.index}
          hoverIndex={this.state.hover}
          setHover={(i) => {this.setState({ hover: i })}}
          anchors={{}}
          toggleAnchor={()=>{}}
          colors={this.state.colors}
          regenerate={() => {}}
          save={()=>{}} />
      </main>
    );
  }

  componentDidMount() {
    this.refs.email.focus();

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

    this.setState({ colors: colors.splice(0, this.state.courses.length).reverse() });

    api.generateCourseDataAndSchedules(this.state.courses)
      .then(({ courseData, results }) => {
        this.setState({
          courseData,
          combinations: results
        });
      });
  }

  onChange(e) {
    this.setState({ text: e.target.value });
  }

  checkSubmit(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.submit();
    }
  }

  submit() {
    let _this = this;
    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    if (validateEmail(this.state.text) && this.state.text.indexOf('@usc.edu') > 4) {
      api.createUser(this.state.text).then(function (data) {
        console.log(data);
        if (!data.error) {
          _this.props.history.push('/' + data.user_email);
        }
      });
    } else {
      this.setState({
        msg: 'Not a valid email.'
      });
    }
  }

};

export default Landing;
