import React, { PropTypes, Children } from 'react';
import classnames from 'classnames';
import ChildrenTypeof from '../../utils/ChildrenTypeof';
import EventBlock from './EventBlock';

// selects the child of sectionId, and moves it to the front of the array.
function moveToFront(children, sectionId) {
	children.sort((x, y) => {
		return x.props.children.props.sectionId == sectionId ? -1 :
					y.props.children.props.sectionId == sectionId ? 1 : 0;
	});
}

const EventStack = ({
	positionFromTop,
	sectionId,
	className,
	style,
	children,
	...other
}) => {
	style = style || {};

	// update className and style objects
	className = classnames(className, 'event-stack');
	Object.assign(style, {
		position: 'absolute',
		top: positionFromTop
	});

	// regenerate children
	let childrenArray = Children.toArray(children);
	moveToFront(childrenArray, sectionId);
	let childrenCount = childrenArray.length;
	let newChildren = childrenArray.map((child, i) => {
		// if (i > 2) return;
		const style = {
			zIndex: childrenCount - i,
			top: 4 * i,
			opacity: i <= 2 ? 1 / (i + 1) : 0,
		};
		return React.cloneElement(child, { style });
	});

	// render
	return <li
		className={className}
		style={style}
		{...other}>
		{newChildren}
	</li>;
}

EventStack.propTypes = {
	positionFromTop: PropTypes.number,
	sectionId: PropTypes.string.isRequired,

	className: PropTypes.string,
	style: PropTypes.object,
	children: ChildrenTypeof(EventBlock)
};

export default EventStack;
