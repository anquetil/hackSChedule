import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import api from '../../utils/api-interface';

import {
	lowerHourLimit,
	hourHeight,
	times,
	days,
	daysOrder,
} from './constants';

import { convertTimeToMin } from '../../utils/convertTime';

import Calendar from './Calendar';
import EventStack from './EventStack';
import EventBlock from './EventBlock';
import EventData from './EventData';
import UserBlock from './UserBlock';

class CalendarContainer extends Component {

	constructor(props) {
		super(props);

		this.state = {
			rmp: {}
		};

		this.getRmp = this.getRmp.bind(this);
		this.addRmp = this.addRmp.bind(this);
		this.getEvents = this.getEvents.bind(this);
		this.toggleAnchor = this.toggleAnchor.bind(this);
		this.addAnchor = this.addAnchor.bind(this);
		this.removeAnchor = this.removeAnchor.bind(this);
		this.getBlocks = this.getBlocks.bind(this);
		this.createBlock = this.createBlock.bind(this);
		this.removeBlock = this.removeBlock.bind(this);
	}

	componentWillReceiveProps() {
		this.getRmp(this.props.coursesSections);
	}

	componentWillReceiveProps(nextProps) {
		if (Object.keys(nextProps.coursesSections).length !== Object.keys(this.props.coursesSections).length)
			this.getRmp(nextProps.coursesSections);
	}

	getRmp(coursesSections) {
		const { rmp } = this.state;
		for (let courseId in coursesSections) {
			const sectionsData = coursesSections[courseId];
			for (let sectionId in sectionsData) {
				const sectionData = sectionsData[sectionId];
				const { instructor } = sectionData;
				const instructors = !(instructor) ? [] : _.isArray(instructor) ? instructor : [instructor];

				for (let person of instructors) {
					const { first_name, last_name } = person;
					const key = first_name+last_name;
					if (rmp[key]) continue;
					api.get(api.rmp(), { first_name, last_name })
						.then(professor => {
							if (professor === null) return;
							this.addRmp(key, professor);
						});
				}
			}
		}
	}

	addRmp(key, data) {
		this.setState({ rmp: {
			...this.state.rmp,
			[key]: data,
		}});
	}

	/* generates events and ghost */

	getEvents(ghost = false) {
		const {
			enabledCourses: courses,
			hoverCourseId,
			setHoverCourseId,
			coursesData,
			coursesSections,
			combinations,
			anchors,
			combinationIndex,
			combinationGhostIndex,
			colors
		} = this.props;
		const { rmp } = this.state;
		const { toggleAnchor } = this;

		const combination = !ghost ? combinations[combinationIndex] : combinations[combinationGhostIndex];
		const events = _.mapValues(days, () => ([]));

		// loop through each section in the current combination and
		// generate each each as a stack of sections
		if (!combination) return events;
		for (let courseId in combination) {
			const sections = coursesSections[courseId];
			const courseCombination = combination[courseId];

			for (let sectionIdsString of courseCombination) {
				const sectionIds = sectionIdsString.split('/');
				const primarySectionId = (() => {
					const courseAnchors = anchors[courseId] || [];
					const intersections = courseAnchors.filter(sId => sectionIdsString.indexOf(sId) > -1);
					if (intersections.length > 0) return intersections[0];
					return sectionIds[0];
				})();

				for (let key in sections[primarySectionId].blocks) {
					const primaryBlock = sections[primarySectionId].blocks[key];
					const isHovering = hoverCourseId === courseId; // flag

					const sectionStack = createSectionStackHelper(
						courseId,
						sectionIds,
						primarySectionId,
						sections,
						isHovering,
						key
					);

					if (!primaryBlock.day) events['A'].push(sectionStack);
					else events[primaryBlock.day].push(sectionStack);
				}
			}
		}

		return events;

		/* ——— helper functions ——— */

		function createSectionStackHelper(
			courseId,
			sectionIds,
			primarySectionId,
			sections,
			isHovering,
			blockKey,
		) {
			const primaryBlock = sections[primarySectionId].blocks[blockKey];

			const { start: blockStart, end: blockEnd } = {
				start: convertTimeToMin(primaryBlock.start),
				end: convertTimeToMin(primaryBlock.end),
			};
			const positionFromTop = Math.round(((blockStart / 60) - lowerHourLimit) * hourHeight);
			const positionHeight = Math.round((blockEnd - blockStart) / 60 * hourHeight);

			const courseAnchors = anchors[courseId] || [];
			const sectionsData = coursesSections[courseId];
			const color = colors[courses.indexOf(courseId)];

			const className = classnames({
				ghost,
				hover: isHovering && !ghost
			});

			return <EventStack
				key={primarySectionId}
				className={className}
				positionFromTop={positionFromTop}
				sectionId={primarySectionId}
				onMouseEnter={e => setHoverCourseId(courseId)}
				onMouseLeave={e => setHoverCourseId(null)}>
				{sectionIds.map(sectionId => <EventBlock
					key={sectionId}
					positionHeight={positionHeight}
					isAnchored={courseAnchors.indexOf(sectionId) > -1}
					color={color}
					onClick={() => toggleAnchor(courseId, sectionId)}>
					<EventData
						courseId={courseId}
						sectionId={sectionId}
						sectionData={sectionsData[sectionId]}
				 		blockData={{
							start: blockStart,
							end: blockEnd,
							location: sectionsData[sectionId].blocks[blockKey].location
						}}
						rmp={rmp}
					/>
				</EventBlock>)}
			</EventStack>;
		}
	}

	toggleAnchor(courseId, sectionId) {
		const { anchors } = this.props;
		const { removeAnchor, addAnchor } = this;
		if (anchors[courseId] && anchors[courseId].indexOf(sectionId) >= 0)
			removeAnchor(courseId, sectionId);
		else addAnchor(courseId, sectionId);
	}

	addAnchor(courseId, sectionId) {
		const {
			email,
			pin,
			isUserPaid,
			refresh,
			combinations,
			combinationIndex,
			anchors
		} = this.props;
		const combination = combinations[combinationIndex] || {};
		const courseCombination = combination[courseId] || [];
		const courseAnchors = anchors[courseId] || [];

		findStacks:
		for (let sId of courseAnchors) {
			for (let sIds of courseCombination) {
				if (sIds.indexOf(sId) > -1 && sIds.indexOf(sectionId) > -1) {
					this.removeAnchor(courseId, sId);
					break findStacks;
				}
			}
		}

		if (!isUserPaid) return;
		api.post(api.user.enableAnchor(email, courseId, sectionId), { pin })
			.then(response => {
				if ('error' in response) return console.error(response.error);
				refresh();
			});
	}

	removeAnchor(courseId, sectionId) {
		const { email, pin, refresh, anchors } = this.props;

		api.post(api.user.disableAnchor(email, courseId, sectionId), { pin })
			.then((response) => {
				if ('error' in response) return console.error(response.error);
				refresh();
			});
	}

	getBlocks() {
		const { blocks } = this.props;
		const userBlocks = _.mapValues(days, () => ([]));

		for (let key in blocks) {
			const block = blocks[key];
			const positionFromTop = Math.round(((block.start / 60) - lowerHourLimit) * hourHeight);
			const positionHeight = Math.round((block.end - block.start) / 60 * hourHeight);

			userBlocks[block.day].push(<UserBlock
				key={key}
				positionFromTop={positionFromTop}
				positionHeight={positionHeight}
				onClick={() => this.removeBlock(key)}
			/>);
		}

		return userBlocks;
	}

	createBlock(start, end, day) {
		const { email, pin, isUserPaid, blocks, refresh } = this.props;
		const block = { start, end, day };

		api.post(api.user.addBlock(email), { pin, block })
			.then((response) => {
				if ('error' in response) return console.error(response.error);
				refresh();
			});
	}

	removeBlock(blockKey) {
		const { email, pin, blocks, refresh } = this.props;

		api.post(api.user.removeBlock(email, blockKey), { pin })
			.then((response) => {
				if ('error' in response) return console.error(response.error);
				refresh();
			});
	}

	render() {
		const {
			isDisabled,
			isLoading,
			enabledCourses: courses,
			combinations,
			combinationIndex,
			refresh, // function
		} = this.props;

		const combination = combinations[combinationIndex]; // for export modal
		const events = this.getEvents(false);
		const ghostEvents = this.getEvents(true);
		const blocks = this.getBlocks();

		return <Calendar
			isDisabled={isDisabled}
			isLoading={isLoading}
			courses={courses}
			combination={combination}
			events={events}
			ghostEvents={ghostEvents}
			blocks={blocks}
			createBlock={this.createBlock}
			refresh={refresh}
		/>;
	}

}

CalendarContainer.propTypes = {
	email: PropTypes.string,
	pin: PropTypes.string,
	isUserPaid: PropTypes.bool,
	isDisabled: PropTypes.bool,
	isLoading: PropTypes.bool,

	enabledCourses: PropTypes.array,
	hoverCourseId: PropTypes.string,
	setHoverCourseId: PropTypes.func,

	combinations: PropTypes.array,
	combinationIndex: PropTypes.number,
	combinationGhostIndex: PropTypes.number,

	coursesData: PropTypes.object,
	coursesSections: PropTypes.object,
	anchors: PropTypes.object,
	blocks: PropTypes.object,
	colors: PropTypes.array,

	refresh: PropTypes.func,
};

export default CalendarContainer;
