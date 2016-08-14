import React, { Component } from 'react';

class Selector extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    // component will mount, set up
  }

  componentDidMount() {
    // component did mount, manipulate DOM here
  }

  shouldComponentUpdate(nextProps, nextState) {
    // return a boolean to prevent update
    return true;
  }

  componentWillUpdate(nextProps, nextState) {
    // only called during prop transition. not called initally
  }

  componentDidUpdate(prevProps, prevState) {
    // do something after component updated
  }

  componentWillUnmount() {
    // stop any unnecessary processes just before unmount
  }

  render() {
    return (<div>How are ya</div>);
  }

};

export default Selector;
