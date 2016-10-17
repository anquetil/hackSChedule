import React, { Component } from 'react';
import _ from 'lodash';

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
        <div id="logo" />
        <div id="blurb">
          Design your perfect class schedule in 10 seconds. <br />
          USC's Spring 2017 course catalog is now available.
        </div>
        <div id="login">
          <div className='prompt'>Enter your USC email to get started.</div>
          <input type='text'
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
