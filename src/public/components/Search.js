import React, { Component } from 'react';
import classNames from 'classnames';

import ApiInterface from '../api-interface';
let api = new ApiInterface();

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      autocomplete: [],
      index: -1
    };
  }

  render() {
    let _this = this;
    return (
      <div id='search'>
        <input type='text'
          onChange={this.onChange.bind(this)}
          value={this.state.text}
          onKeyDown={this.checkSubmit.bind(this)}
          placeholder='Enter a class ID' />
        {(()=>{
          if (this.state.autocomplete.length > 0) {
            return (
              <ul className='autocomplete'>
                {this.state.autocomplete.map((o, i) => (
                  <li
                    key={o.courseId}
                    className={classNames({ hover: (i == this.state.index)})}
                    onClick={()=>{ _this.submitAutocompleteIndex(i); }}>
                    {o.courseId}<br /><i>{o.title}</i>
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
  }

  onChange(e) {
    this.setState({ text: e.target.value });
    let _this = this;
    api.autocomplete(e.target.value).then(function (arr) {
      _this.setState({ autocomplete: arr, index: -1 });
    });
  }

  checkSubmit(e) {
    if (e.keyCode === 13) {
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
      })
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.courses.indexOf(this.state.text) > -1) {
      this.setState({ text: '', autocomplete: [], index: -1 });
    }
  }

  keyboardCommandsInInput(e) {
    if([37,38,39,40].indexOf(e.keyCode) > -1) {
      e.stopPropagation();
    }
    if (38 == e.keyCode) { // up
      this.setState({
        index: (this.state.index - 1 > -1) ? this.state.index - 1 : -1
      });
    }
    if (40 == e.keyCode) { //down
      this.setState({
        index: (this.state.index + 1 < this.state.autocomplete.length) ? this.state.index + 1 : this.state.autocomplete.length - 1
      });
    }
  }

}

export default Search;
