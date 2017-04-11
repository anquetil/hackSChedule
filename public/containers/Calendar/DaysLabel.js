import React, { PropTypes } from 'react';
import {
	days,
	daysOrder
} from './constants';

const DaysLabel = ({
	showTBA,
	contentWidth
}) => (
	<ul id="daysOfWeek">
		{daysOrder.map(day => {
			if (day === 'A' && !showTBA) return null;
			return <li key={day}
				style={{ width: contentWidth }}>
				{days[day]}
			</li>;
		})}
	</ul>
);

DaysLabel.propTypes = {
	showTBA: PropTypes.bool,
	contentWidth: PropTypes.string
};

export default DaysLabel;
