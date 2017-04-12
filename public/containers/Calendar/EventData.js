import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import has from 'has';
import _ from 'lodash';
import api from '../../utils/api-interface';

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
	rmp,
	...other
}) => {

	// update className
	const newClassName = classnames('event-data', className);

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

	return <div className={newClassName} {...other}>
		<div>
			<span className="courseid">{courseId}</span>
			<span className="sectionid">{sectionId}</span>
		</div>
		<div>
			{has(sectionData, 'section_title') ? <Tag>{sectionTitle}</Tag> : null}
			<Tag>{sectionType}</Tag>
			<Tag>{convertMinToTime(start)}—{convertMinToTime(end)}</Tag>
			{has(sectionData, 'location') ? <Tag>{location}</Tag> : null}
			<Tag className={classnames({ full })}>{full ? 'FULL' : numberRegistered} / {spacesAvailable}</Tag>
			{instructors.map((o = {}, i) => {
				const key = o.first_name + o.last_name;

				if (rmp[key]) {
					return <Tag key={i}>
						{o.first_name || null} {o.last_name || null}, <a href={rmp[key].url} target="_blank" onClick={e => e.stopPropagation()}><b>{rmp[key].quality}</b></a>
					</Tag>;
				}

				return <Tag key={i}>{o.first_name || null} {o.last_name || null}</Tag>;
			})}
		</div>
	</div>;

}

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
				last_name: PropTypes.string,
			}),
			PropTypes.arrayOf(PropTypes.shape({
				first_name: PropTypes.string,
				last_name: PropTypes.string,
			}))
		])
	}),
	rmp: PropTypes.object,
	blockData: PropTypes.shape({
		location: PropTypes.string,
		start: PropTypes.number,
		end: PropTypes.number
	})
};

export default EventData;
