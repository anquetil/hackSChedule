import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

export default (props) => {

  let { style, top, height, className, children, ...other } = props;

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
