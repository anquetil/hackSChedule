import React, { Component } from 'react';
import _ from 'lodash';

import Course from '../components/Course';

import colors from '../func/colors';

import api from '../api-interface';

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
      hover: null,
      userCount: 0
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

        <section id='how_it_works'>
          <h1>How it works</h1>
          <p>The worst part about course registration is making sure the sections in your classes don't overlap.</p>
          <p>HackSChedule solves this by generating a huge list of potential schedules. Let's say you're taking the classes listed below.</p>
          <p>There are {this.state.combinations.length} ways to arrange your schedule.</p>

          <ul id='courselist'>
            {this.state.courses.map((courseId, i) => {
              let item = [<Course
                className={(i === this.state.hover) ? 'hover' : ''}
                onMouseEnter={(e) => {this.setState({ hover: i })}}
                onMouseLeave={(e) => {this.setState({ hover: null })}}
                removeClass={()=>{}}
                courseId={courseId}
                courseData={this.state.courseData[courseId]}
                color={this.state.colors[i]}
                anchors={[]}
              />];
              if (i !== this.state.courses.length - 1) {
                item.push(<li className='txt'>+</li>);
              } else {
                item.push(<li className='txt'>= {this.state.combinations.length} schedules</li>);
              }
              return item;
            })}
          </ul>

          <p>Try it out with your schedule!</p>
          <p style={{ fontSize: 10 }}>User count: {this.state.userCount}</p>
        </section>
      </main>
    );
  }

  componentWillMount() {
    this.setState({ colors: colors.slice(0).splice(0, this.state.courses.length).reverse() });
  }

  componentDidMount() {
    this.refs.email.focus();

    api.generateCourseDataAndSchedules(this.state.courses)
      .then(({ courseData, results }) => {
        this.setState({
          courseData,
          combinations: results
        });
      });

    api.getUserCount().then(({ userCount }) => {
      this.setState({
        userCount
      });
    });
  }

  onChange(e) {
    this.setState({ text: e.target.value.toLowerCase() });
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

    if (validateEmail(this.state.text) && this.state.text.indexOf('@usc.edu') > 1) {
      api.createUser(this.state.text).then(function (data) {
        if (!data.error) {
          _this.context.router.push({ pathname: '/' + data.user_email });
        }
      });
    } else {
      this.setState({
        msg: 'Not a valid email.'
      });
    }
  }

};

Landing.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Landing;
