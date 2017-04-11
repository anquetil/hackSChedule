import React, { PropTypes } from 'react';
import classnames from 'classnames';
import has from 'has';
import _ from 'lodash';

import { convertMinToTime } from '../../utils/convertTime';

const Tag = ({ children, className, ...other }) => (
	<span className={classnames('tag', className)} {...other}>{children}</span>
);

const EventData = ({
	className,
	courseId,
	sectionId,
	sectionData,
	blockData,
	...other
}) => {

	// update className
	className = classnames('event-data', className);

	// unravel data
	const {
		title: sectionTitle,
		type: sectionType,
		number_registered,
		spaces_available,
		instructor
	} = sectionData;
	const numberRegistered = parseInt(number_registered);
	const spacesAvailable = parseInt(spaces_available);
	const { location, start, end } = blockData;
	const instructors = !(instructor) ? [] : _.isArray(instructor) ? instructor : [instructor];
	const full = numberRegistered >= spacesAvailable;

	// create tags
	let TitleTag = has(sectionData, 'section_title') ? <Tag>{sectionTitle}</Tag> : null;
	let TypeTag = <Tag>{sectionType}</Tag>;
	let TimeTag = <Tag>{convertMinToTime(start)}—{convertMinToTime(end)}</Tag>;
	let LocationTag = has(sectionData, 'location') ? <Tag>{location}</Tag> : null;
	let SpacesAvailableTag = <Tag className={classnames({ full })}>{full ? 'FULL' : numberRegistered} / {spacesAvailable}</Tag>;
	let InstructorTags = instructors.map((o = {}, i) => (
		<Tag key={i}>{o.first_name || null} {o.last_name || null}</Tag>
	));

	return <div className={className} {...other}>
		<div>
			<span className="courseid">{courseId}</span>
			<span className="sectionid">{sectionId}</span>
		</div>
		<div>
			{TitleTag}
			{TypeTag}
			{TimeTag}
			{LocationTag}
			{SpacesAvailableTag}
			{InstructorTags}
		</div>
	</div>;
};

EventData.propTypes = {
	// html metadata
	className: PropTypes.string,

	// course data
	courseId: PropTypes.string.isRequired,
	sectionId: PropTypes.string.isRequired,
	sectionData: PropTypes.shape({
		title: PropTypes.string,
		type: PropTypes.string,
		number_registered: PropTypes.string.isRequired,
		spaces_available: PropTypes.string.isRequired,
		instructor: PropTypes.oneOfType([
			PropTypes.shape({
				first_name: PropTypes.string,
				last_name: PropTypes.string
			}),
			PropTypes.arrayOf(PropTypes.shape({
				first_name: PropTypes.string,
				last_name: PropTypes.string
			}))
		])
	}),
	blockData: PropTypes.shape({
		location: PropTypes.string,
		start: PropTypes.number,
		end: PropTypes.number
	})
};

export default EventData;
