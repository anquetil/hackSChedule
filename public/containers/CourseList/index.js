import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import api from '../../utils/api-interface';
import has from 'has';
import _ from 'lodash';

import Instructions from './Instructions';
import Search from './Search';
import CourseList from './CourseList';
import UserPaymentBlock from './UserPaymentBlock';

class CourseListContainer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      show_help: false
    };
		this.addClass = this.addClass.bind(this);
		this.enableClass = this.enableClass.bind(this);
		this.disableClass = this.disableClass.bind(this);
		this.toggleClass = this.toggleClass.bind(this);
		this.removeClass = this.removeClass.bind(this);
  }

	addClass(courseId) {
    const { courses, email, pin, refresh } = this.props;
		if (courseId === '' || has(courses, courseId)) return;

		api.post(api.user.addCourse(email, courseId), { pin })
			.then(response => {
				if (has(response, 'error')) return console.error(response.error);
				refresh();
			});
  }

	enableClass(courseId) {
		let { courses, email, pin, refresh } = this.props;

		// verify that the course exists
		api.post(api.user.enableCourse(email, courseId), { pin })
			.then(response => {
				if (has(response, 'error')) return console.error(response.error);
				refresh();
			});
	}

	disableClass(courseId) {
		const { courses, email, pin, refresh } = this.props;

		// verify that the course exists
		api.post(api.user.disableCourse(email, courseId), { pin })
			.then((response) => {
				if (has(response, 'error')) return console.error(response.error);
				refresh();
			});
	}

	toggleClass(courseId) {
		const { courses, isUserPaid } = this.props;
		if (!isUserPaid) return;
		if (has(courses, courseId) && courses[courseId])
			this.disableClass(courseId);
		else this.enableClass(courseId);
	}

  removeClass(courseId) {
		const { courses, email, pin, refresh } = this.props;
		// don't delete class that isn't there
		if (!has(courses, courseId)) return;

		api.post(api.user.removeCourse(email, courseId), { pin })
			.then((response) => {
				if (has(response, 'error')) return console.error(response.error);
				refresh();
			});
  }

	render() {
		const { show_help } = this.state;
		const { email, pin, isUserPaid, isDisabled } = this.props;
		const { courses, hoverCourseId, setHoverCourseId } = this.props;
		const { coursesData, anchors, colors, refresh } = this.props;
		const arrayedCourses = Object.keys(courses);

		return (
			<section id='courses'>
				<div id='logo' />
				<Search
					courses={arrayedCourses}
					isDisabled={arrayedCourses.length >= 12 || isDisabled}
					submit={this.addClass} />
				<CourseList
					colors={colors}
					isDisabled={isDisabled}
					courses={courses}
					coursesData={coursesData}
					anchors={anchors}
					hoverCourseId={hoverCourseId}
					setHoverCourseId={setHoverCourseId}
					addClass={this.addClass}
					removeClass={this.removeClass}
					toggleClass={this.toggleClass} />

				<Instructions
					courses={arrayedCourses}
					show_help={show_help}
					isDisabled={isDisabled}
					paid={isUserPaid}
					show={bool => { this.setState({ show_help: bool }) }}>
					<UserPaymentBlock
						close={refresh}
						paid={isUserPaid}
						email={email}
						pin={pin} />
				</Instructions>

				<div id="credits">
					<a href={'mailto:andrewji@usc.edu?subject=Feedback%20for%20HackSchedule'}>Feedback</a>
				</div>
			</section>
		);
	}

}

CourseListContainer.propTypes = {
	email: PropTypes.string,
	pin: PropTypes.string,
	isUserPaid: PropTypes.bool,
	isDisabled: PropTypes.bool,

	courses: PropTypes.object,
	hoverCourseId: PropTypes.string,
	setHoverCourseId: PropTypes.func,

	coursesData: PropTypes.object,
	anchors: PropTypes.object,
	colors: PropTypes.array,

	refresh: PropTypes.func,
}

export default CourseListContainer;
