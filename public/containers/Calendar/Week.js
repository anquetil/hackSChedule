import React, { PropTypes } from 'react';
import { daysOrder, blank } from './constants';

const Week = ({
	showTBA, // flag: show the TBA column on the calendar
	contentWidth, // number: sets the width of the styles
	events, ghostEvents, blocks, // arrays of blocks
	creatingBlockDay,
	creatingBlockElement, // single block that is currently being created
	createBlockSet, // function: sets the day for creating blocks
	...other
}) => (
	<div {...other}>{daysOrder.map(day => {
		if (day === 'A' && !showTBA) return null;
		const creatingBlock = (day !== 'A' && day === creatingBlockDay) ? creatingBlockElement : null;
		return <ul key={day} id={day}
			className="col"
			style={{ width: contentWidth }}
			onMouseOver={() => createBlockSet(day)}>
			{(day !== 'A') ? blank : null}
			{events[day]}
			{blocks[day]}
			{ghostEvents[day]}
			{creatingBlock}
		</ul>;
	})}</div>
);

Week.propTypes = {
	showTBA: PropTypes.bool,
	contentWidth: PropTypes.string,
	events: PropTypes.object,
	ghostEvents: PropTypes.object,
	blocks: PropTypes.object,
	creatingBlockDay: PropTypes.string,
	creatingBlockElement: PropTypes.object,
	createBlockSet: PropTypes.func
};

export default Week;
