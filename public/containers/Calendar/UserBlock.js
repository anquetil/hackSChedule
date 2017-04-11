import React, { PropTypes }from 'react';
import classnames from 'classnames';

const UserBlock = ({
	positionHeight,
	positionFromTop,
	isCreating,
	style,
	className,
	children,
	...other
}) => {

	className = classnames('event-block', {
		'user-block': !isCreating,
		'create': isCreating,
	}, className);

	const newStyle = {
		...style,
		position: 'absolute',
		top: positionFromTop,
		height: positionHeight,
		minHeight: positionHeight
	};
	return <div
		className={className}
		style={newStyle}
		{...other}>
		{children}
	</div>;
};

UserBlock.propTypes = {
	positionFromTop: PropTypes.number,
	positionHeight: PropTypes.number,
	className: PropTypes.string,
	style: PropTypes.object,
	isCreating: PropTypes.bool,
};

UserBlock.defaultProps = {
	isCreating: false,
};

export default UserBlock;
