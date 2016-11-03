import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

const EventBlock = ({ style, top, height, className, children, ...other }) => {

  let css = {
    top: top,
    height: height,
    minHeight: height
  };

  return (
    <li {...other}
      className={classNames('event', className)}
      style={Object.assign(css, style)}>
      {children}
    </li>
  );

};

EventBlock.propTypes = {
  top: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  className: React.PropTypes.string,
  style: React.PropTypes.object
};

export default EventBlock;
