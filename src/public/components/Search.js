import React, { Component } from 'react';

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = { text: '' };
  }

  render() {
    return (
      <div id='search'>
        <input type='text'
          onChange={this.onChange.bind(this)}
          value={this.state.text}
          onKeyDown={this.checkSubmit.bind(this)}
          placeholder='Enter a class ID' />
      </div>
    );
  }

  onChange(e) {
    this.setState({ text: e.target.value });
  }

  checkSubmit(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      var fixed = this.state.text.toUpperCase().replace(' ', '-');
      this.setState({ text: fixed }, () => {
        this.props.submit(fixed);
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ text: '' });
  }

}

export default Search;
