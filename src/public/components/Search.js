import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';

import api from '../api-interface';

class Search extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      text_copy: '',
      autocomplete: [],
      index: -1
    };

    this.onChange = this.onChange.bind(this);
    this.checkSubmit = this.checkSubmit.bind(this);
    this.submitAutocompleteIndex = this.submitAutocompleteIndex.bind(this);
  }

  render() {
    let { disabled, loading } = this.props;
    let { text, autocomplete, index } = this.state;
    let { onChange, checkSubmit, submitAutocompleteIndex } = this;
    return (
      <div id='search'>
        <input type='text'
          ref='search'
          onChange={onChange}
          value={text}
          onKeyDown={checkSubmit}
          disabled={disabled || loading}
          placeholder={(!disabled) ? 'Enter a class ID' : 'Exceeded maximum'} />
        {(()=>{
          if (autocomplete.length > 0) {
            return (
              <ul className='autocomplete'>
                {autocomplete.map((o, i) => (
                  <li
                    key={o.courseId}
                    className={classNames({ hover: (i === index)})}
                    onClick={()=>{ submitAutocompleteIndex(i); }}>
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
    let { disabled } = this.props;
		let text = e.target.value;

    if (!disabled) {
      this.setState({ text, text_copy: text });
			api.get(api.autocomplete(e.target.value))
				.then((response) => {
					this.setState({ autocomplete: response, index: -1 });
				});
    } else {
      this.setState({ autocomplete: [], index: -1 });
    }
  }

  checkSubmit(e) {
    let { disabled, submit } = this.props;
    let { index, autocomplete, text } = this.state;
    if (e.keyCode === 13 && !disabled) {
      e.preventDefault();
      var fixed;
      if (index > -1) {
        fixed = autocomplete[index].courseId;
      } else {
        fixed = text.toUpperCase().replace(' ', '-');
      }
      this.setState({ text: fixed }, () => {
        submit(fixed);
      });
    }
  }

  submitAutocompleteIndex(i) {
    let { submit } = this.props;
    let { autocomplete } = this.state;
    let fixed = autocomplete[i].courseId;
    this.setState({ text: fixed }, () => {
      submit(fixed);
      this.setState({
        text: '',
        autocomplete: [],
        index: -1
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    let { text } = this.state;
    if (nextProps.courses.indexOf(text) > -1) {
      this.setState({ text: '', autocomplete: [], index: -1 });
    }
  }

  componentDidUpdate(nextProps, nextState) {
    if (this.props.loading && !nextProps.loading) {
      this.refs.search.focus();
    }
  }

  keyboardCommandsInInput(e) {
    let { text, text_copy, autocomplete, index } = this.state;
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
    let { text, text_copy, autocomplete, index } = this.state;
    if ([38,40].indexOf(e.keyCode) > -1 && autocomplete.length > 0) {
      if (this.state.index > -1) {
        this.refs.search.select();
      } else {
        this.refs.search.setSelectionRange(text.length, text.length);
      }
    }
  }

}

Search.propTypes = {
  disabled: React.PropTypes.bool,
  loading: React.PropTypes.bool,
  submit: React.PropTypes.func,
  courses: React.PropTypes.array.isRequired
};

export default Search;
