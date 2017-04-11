import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import has from 'has';
import _ from 'lodash';
import api from '../../utils/api-interface';

import { convertMinToTime } from '../../utils/convertTime';

const Tag = ({ children, className, ...other }) => (
	<span className={classnames('tag', className)} {...other}>{children}</span>
);

class EventData extends Component {

	constructor(props) {
		super(props);

		this.state = {
			rmp: {}
		};

		this.addRmp = this.addRmp.bind(this);
	}

	componentWillMount() {
		this.getRmp(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.sectionId === this.props.sectionId) return;
		this.getRmp(nextProps);
	}

	getRmp(nextProps) {
		const { sectionData } = nextProps;
		const { instructor } = sectionData;
		const instructors = !(instructor) ? [] : _.isArray(instructor) ? instructor : [instructor];

		for (let person of instructors) {
			const { first_name, last_name } = person;
			api.get(api.rmp(), { first_name, last_name })
				.then(professor => {
					if (professor === null) return;
					const key = first_name+last_name;
					this.addRmp(key, professor.quality);
				});
		}
	}

	addRmp(key, quality) {
		this.setState({ rmp: {
			...this.state.rmp,
			[key]: quality,
		}});
	}

	render() {
		const {
			className,
			courseId,
			sectionId,
			sectionData,
			blockData,
			...other
		} = this.props;

		const { rmp } = this.state;

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
					const rating = (rmp[key]) ? <span>, <b>{rmp[key]}</b></span> : null;
					return <Tag key={i}>{o.first_name || null} {o.last_name || null}{rating}</Tag>;
				})}
			</div>
		</div>;

	}

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
