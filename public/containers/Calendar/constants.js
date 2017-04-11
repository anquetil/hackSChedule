import React from 'react';

const lowerHourLimit = 7; // morning
const hourHeight = 64; // pixels
const times = [ '', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p' ];
const days = { U: 'Sun', M: 'Mon', T: 'Tue', W: 'Wed', H: 'Thu', F: 'Fri', S: 'Sat', A: 'TBA' };
const daysOrder = ['U', 'M', 'T', 'W', 'H', 'F', 'S', 'A'];
const blank = times.map(i => <li key={i} style={{ height: hourHeight }} />);

export {
	lowerHourLimit,
	hourHeight,
	times,
	days,
	daysOrder,
	blank
};
