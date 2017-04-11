import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';

import api from '../../utils/api-interface';

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
		this.renderAutocomplete = this.renderAutocomplete.bind(this);
    this.submitAutocompleteIndex = this.submitAutocompleteIndex.bind(this);
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

  componentWillReceiveProps(nextProps) {
    const { text } = this.state;
    if (nextProps.courses.indexOf(text) > -1)
      this.setState({ text: '', autocomplete: [], index: -1 });
  }

  componentDidUpdate(nextProps, nextState) {
    if (this.props.isDisabled && !nextProps.isDisabled)
      this.refs.search.focus();
  }

  onChange(e) {
    const { isDisabled } = this.props;
		const text = e.target.value;

    if (isDisabled) return this.setState({ autocomplete: [], index: -1 });

		this.setState({ text, text_copy: text });
		api.get(api.autocomplete(e.target.value))
			.then(response => this.setState({
				autocomplete: response,
				index: -1
			}));
  }

  checkSubmit(e) {
    const { isDisabled, submit } = this.props;
    const { index, autocomplete, text } = this.state;
    if (e.keyCode === 13 && !isDisabled) {
      e.preventDefault();
      let fixed = text.toUpperCase().replace(' ', '-');
      if (index > -1) fixed = autocomplete[index].courseId;
      this.setState({ text: fixed }, () => {
				if (fixed.length > 4) submit(fixed);
      });
    }
  }

  submitAutocompleteIndex(i) {
    const { submit } = this.props;
    const { autocomplete } = this.state;
    const fixed = autocomplete[i].courseId;
    this.setState({ text: fixed }, () => {
      submit(fixed);
      this.setState({
        text: '',
        autocomplete: [],
        index: -1
      });
    });
  }

  keyboardCommandsInInput(e) {
    const { text, text_copy, autocomplete, index } = this.state;
    if([37,39].indexOf(e.keyCode) > -1) {
      e.stopPropagation();
    }
    if([38,40].indexOf(e.keyCode) > -1 && autocomplete.length > 0) {
      e.stopPropagation();
    }
    if (38 === e.keyCode) { // up
      const newIndex = (index - 1 > -1) ? index - 1 : -1;
      this.setState({
        index: newIndex,
        text: (index - 1 > -1) ? autocomplete[newIndex].courseId : text_copy
      });
    }
    if (40 === e.keyCode) { //down
      const newIndex = (index + 1 < autocomplete.length) ? index + 1 : autocomplete.length - 1;
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
    const { text, text_copy, autocomplete, index } = this.state;
    if ([38,40].indexOf(e.keyCode) > -1 && autocomplete.length > 0) {
      if (index > -1) {
        this.refs.search.select();
      } else {
        this.refs.search.setSelectionRange(text.length, text.length);
      }
    }
  }



	renderAutocomplete() {
		const { text, autocomplete, index } = this.state;
		const { submitAutocompleteIndex } = this;
		if (autocomplete.length > 0) {
			return <ul className='autocomplete'>
				{autocomplete.map((o, i) => <li
					key={o.courseId}
					className={classnames({ hover: i === index})}
					onClick={()=>{ submitAutocompleteIndex(i); }}>
					<b>{o.courseId}</b><br /><i>{o.title}</i>
				</li>)}
			</ul>;
		}
		return null;
	}

	render() {
		const { isDisabled } = this.props;
		const { text, autocomplete, index } = this.state;
		const { onChange, checkSubmit, renderAutocomplete } = this;
		return <div id="search">
			<input ref="search"
				type="text"
				value={text}
				onChange={onChange}
				onKeyDown={checkSubmit}
				disabled={isDisabled}
				placeholder="Enter a class ID"
			/>
			{renderAutocomplete()}
		</div>;
	}

}

Search.propTypes = {
  isDisabled: PropTypes.bool,
  submit: PropTypes.func,
  courses: PropTypes.array.isRequired
};

export default Search;
