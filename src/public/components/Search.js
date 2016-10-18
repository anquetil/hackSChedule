import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';

import ApiInterface from '../api-interface';
let api = new ApiInterface();

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      text_copy: '',
      autocomplete: [],
      index: -1
    };
  }

  render() {
    let _this = this;
    return (
      <div id='search'>
        <input type='text'
          ref='search'
          onChange={this.onChange.bind(this)}
          value={this.state.text}
          onKeyDown={this.checkSubmit.bind(this)}
          disabled={this.props.disabled}
          placeholder={(!this.props.disabled) ? 'Enter a class ID' : 'Exceeded maximum'} />
        {(()=>{
          if (this.state.autocomplete.length > 0) {
            return (
              <ul className='autocomplete'>
                {this.state.autocomplete.map((o, i) => (
                  <li
                    key={o.courseId}
                    className={classNames({ hover: (i == this.state.index)})}
                    onClick={()=>{ _this.submitAutocompleteIndex(i); }}>
                    <b>{o.courseId}</b><br /><i>{o.title}</i>
                  </li>
                ))}
              </ul>
            );
          }
        })()}
      </div>
    );
  }

  componentDidMount() {
    document.getElementById('search').addEventListener('keydown', this.keyboardCommandsInInput.bind(this), false);
    document.getElementById('search').addEventListener('keyup', this.keyboardCommandsInInputUp.bind(this), false);
    this.refs.search.focus();
  }

  componentWillUnmount() {
    document.getElementById('search').removeEventListener('keydown', this.keyboardCommandsInInput.bind(this));
    document.getElementById('search').removeEventListener('keyup', this.keyboardCommandsInInputUp.bind(this));
  }

  onChange(e) {
    if (!this.props.disabled) {
      let text = e.target.value.toUpperCase().replace(' ', '-');
      this.setState({ text, text_copy: text });
      let _this = this;
      api.autocomplete(e.target.value).then(function (arr) {
        _this.setState({ autocomplete: arr, index: -1 });
      });
    } else {
      this.setState({ autocomplete: [], index: -1 });
    }
  }

  checkSubmit(e) {
    if (e.keyCode === 13 && !this.props.disabled) {
      e.preventDefault();
      var fixed;
      if (this.state.index > -1) {
        fixed = this.state.autocomplete[this.state.index].courseId;
      } else {
        fixed = this.state.text.toUpperCase().replace(' ', '-');
      }
      this.setState({ text: fixed }, () => {
        this.props.submit(fixed);
      });
    }
  }

  submitAutocompleteIndex(i) {
    let fixed = this.state.autocomplete[i].courseId;
    this.setState({ text: fixed }, () => {
      this.props.submit(fixed);
      this.setState({
        text: '',
        autocomplete: [],
        index: -1
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.courses.indexOf(this.state.text) > -1) {
      this.setState({ text: '', autocomplete: [], index: -1 });
    }
  }

  keyboardCommandsInInput(e) {
    let { text, text_copy, autocomplete, index } = this.state
    if([37,39].indexOf(e.keyCode) > -1) {
      e.stopPropagation();
    }
    if([38,40].indexOf(e.keyCode) > -1 && autocomplete.length > 0) {
      e.stopPropagation();
    }
    if (38 === e.keyCode) { // up
      let newIndex = (index - 1 > -1) ? index - 1 : -1;
      this.setState({
        index: newIndex,
        text: (index - 1 > -1) ? autocomplete[newIndex].courseId : text_copy
      });
    }
    if (40 === e.keyCode) { //down
      let newIndex = (index + 1 < autocomplete.length) ? index + 1 : autocomplete.length - 1;
      this.setState({
        index: newIndex,
        text: (autocomplete.length > 0) ? autocomplete[newIndex].courseId : text
      });
    }
    if (e.keyCode === 27) {
      this.setState({
        index: -1,
        text: text_copy,
        autocomplete: []
      });
    }
  }

  keyboardCommandsInInputUp(e) {
    let { text, text_copy, autocomplete, index } = this.state
    if ([38,40].indexOf(e.keyCode) > -1 && autocomplete.length > 0) {
      if (this.state.index > -1) {
        this.refs.search.select();
      } else {
        this.refs.search.setSelectionRange(text.length, text.length);
      }
    }
  }

}

export default Search;
