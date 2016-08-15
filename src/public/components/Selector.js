import React from 'react';

export default (props) => {

  var { index, active, score, ...other } = props;

  return (
    <li key={index} {...other}
      className={(index === active) ? 'active' : ''}>
      <b>{index}</b><br />
      <i>{score}</i>
    </li>
  );
}
