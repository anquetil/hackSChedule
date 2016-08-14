import React from 'react';

export default (props) => {

  var { index, active, ...other } = props;

  return (
    <li key={index} {...other}
      className={(index === active) ? 'active' : ''}>
      <b>{index}</b>
    </li>
  );
}
