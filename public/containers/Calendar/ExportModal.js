import React, { Component, PropTypes } from 'react';

class Span extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    let { children } = this.props;

    return (<span
      className='selectableSpan'
      ref='select'
      onClick={this.selectText.bind(this)}>
      {children}
    </span>);
  }

  selectText() {
    var doc = document;
    var text = this.refs.select;

    if (doc.body.createTextRange) { // ms
      var range = doc.body.createTextRange();
      range.moveToElementText(text);
      range.select();
    } else if (window.getSelection) { // moz, opera, webkit
      var selection = window.getSelection();
      var range = doc.createRange();
      range.selectNodeContents(text);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

}

const ExportModal = ({ courses, combination, ...other}) => {

  if (courses.length > 0) {
    return (
      <section className="export-modal">
        <ul>
          {courses.map(courseId => (
            <li key={courseId}>
              <Span><b>{courseId}</b></Span>
              {(courseId in combination) ? combination[courseId].map(sid => (<Span key={sid}>{sid}</Span>)) : ''}
            </li>
          ))}
        </ul>
      </section>
    );
  } else {
    return null;
  }

};

ExportModal.propTypes = {
  courses: PropTypes.arrayOf(React.PropTypes.string).isRequired,
  combination: PropTypes.object.isRequired,
};

export default ExportModal;
