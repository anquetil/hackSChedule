import React, { PropTypes } from 'react';
import classnames from 'classnames';

const EventBlock = ({
	positionHeight,
	style,
	className,
	isAnchored,
	color,
	children,
	...other
}) => {
	className = classnames({
		anchored: isAnchored
	}, 'event-block', className);

	const newStyle = {
		...style,
		position: 'absolute',
		height: positionHeight,
		minHeight: positionHeight,
		backgroundColor: 'rgb(' + color + ')'
	};

	return <div
		className={className}
		style={newStyle}
		{...other}>
		{children}
	</div>;
};

EventBlock.propTypes = {
	positionHeight: PropTypes.number,
	isAnchored: React.PropTypes.bool,
	className: React.PropTypes.string,
	style: React.PropTypes.object,
	color: React.PropTypes.array,
};

EventBlock.defaultProps = {
	isAnchored: false,
	style: {},
};

export default EventBlock;
