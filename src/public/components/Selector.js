import React from 'react';
import emoji from 'random-unicode-emoji';

const emojis = emoji.random({ count: 100 });

export default (props) => {

  var { index, active, score, ...other } = props;

  return (
    <li key={index} {...other}
      className={(index === active) ? 'active' : ''}>
      <b>#{index + 1}</b> {emojis[index % 100]}
    </li>
  );
}
