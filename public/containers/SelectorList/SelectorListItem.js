import React, { PropTypes } from 'react';
import emoji from 'random-unicode-emoji';
import classnames from 'classnames';

const emojis = emoji.random({ count: 100 });

const SelectorListItem = ({
	index,
	active,
	score,
	disabled,
	...other
}) => (
  <li key={index} {...other}
    className={classnames({ active, disabled })}>
    <b>#{index + 1}</b> {emojis[index % 100]}
  </li>
);

SelectorListItem.propTypes = {
  index: PropTypes.number,
  active: PropTypes.bool,
  score: PropTypes.number
}

export default SelectorListItem;
