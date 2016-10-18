import React, { Component } from 'react';
import _ from 'lodash';

import Course from '../components/Course';

import ApiInterface from '../api-interface';
let api = new ApiInterface();

class Landing extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      msg: '',
    };
  }

  render() {
    return (
      <main id='landing'>
        <div id='logo' />

        <div id='blurb'>
          Design your perfect class schedule in 10 seconds. <br />
          USC's Spring 2017 course catalog is now available.
        </div>

        <ul id='courselist'>
          <Course
            removeClass={()=>{}}
            courseId='CSCI-201'
            courseData={{ units: '4.0 units', title: 'Principles of Software Development' }}
            color={[251,140,0]}
            anchors={{}}
          />
          <Course
            removeClass={()=>{}}
            courseId='CSCI-270'
            courseData={{ units: '4.0 units', title: 'Introduction to Algorithms and Theory of Computing' }}
            color={[76,175,80]}
            anchors={{}}
          />
          <Course
            removeClass={()=>{}}
            courseId='ITP-380'
            courseData={{ units: '4.0 units', title: 'Video Game Programming' }}
            color={[0,188,212]}
            anchors={{}}
          />
          <Course
            removeClass={()=>{}}
            courseId='EE-109'
            courseData={{ units: '3.0 units', title: 'Introduction to Embedded Systems' }}
            color={[33,150,243]}
            anchors={{}}
          />
        </ul>
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
      </main>
    );
  }

  componentDidMount() {
    this.refs.email.focus();
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
