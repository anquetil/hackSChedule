import React, { Component, PropTypes } from 'react';
import { withRouter } from 'react-router'
import Promise from 'bluebird';
import _ from 'lodash';
import classnames from 'classnames';
import has from 'has';

import api from '../../utils/api-interface';
import colors from '../../utils/colors';

import Calendar from '../Calendar';
import CourseList from '../CourseList';
import SelectorList from '../SelectorList';

import ModalConductor, { ModalStates } from './ModalConductor';

class ApplicationPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
			// user info
			email: '',
			pin: '',
			isUserPaid: false,

			// courses info
      courses: {},
      coursesData: {},
			coursesSections: {},
      combinations: [],
      anchors: {},
      blocks: {},

			// visuals
      colors: [],
      combinationIndex: 0,
      combinationGhostIndex: null,
      hoverCourseId: null,

			// flags
      init: true,
      enabled: false,
      loading: false,

			// modals
			showModal: false
    };

		this.socket = io();
		this.refreshUserInfo = this.refreshUserInfo.bind(this);
		this.refresh = this.refresh.bind(this);
		this.downloadNewCourseData = this.downloadNewCourseData.bind(this);
		this.updateCoursesCache = this.updateCoursesCache.bind(this);
		this.generateCombinations = this.generateCombinations.bind(this);
		this.generateColors = this.generateColors.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.setHoverCourseId = this.setHoverCourseId.bind(this);
		this.setCombinationIndex = this.setCombinationIndex.bind(this);
		this.setCombinationGhostIndex = this.setCombinationGhostIndex.bind(this);
  }

	componentWillMount() {
		const { match, location, history } = this.props;
		const { userEmail: email } = match.params;
		const { pin } = location.state || { pin: '' };
		this.setState({
			email: email,
			pin: pin,
		}, this.refresh);
	}

	componentDidMount() {
		const { courses } = this.state;
		const { downloadNewCourseData, generateCombinations } = this;

		this.socket.on('receive:courseData', function (courseId) {
      if (has(courses, courseId)) {
				downloadNewCourseData();
				generateCombinations();
			}
    });
	}

	refreshUserInfo() {
		const { email, pin } = this.state;
		return api.get(api.validate.email(email))
			.then(response => { // no pin needed
				const email = response.email;
				const emailFormatValid = response.email_format_valid;
				const userExists = response.user_exists;
				const isUserPaid = response.paid;

				const newLoggedOutState = {
					email: email || '',
					init: false,
					enabled: false,
					showModal: userExists ?
						ModalStates.USER_ENTER_PIN :
						ModalStates.USER_NOT_FOUND,
				};

				const newLoggedInState = {
					email,
					pin,
					isUserPaid,
					init: false,
					enabled: true,
					showModal: false
				};

				if (userExists && emailFormatValid && pin.length > 0) {
					api.get(api.user.data(email), { pin })
						.then(response => {
							if (has(response, 'error')) this.setState(newLoggedOutState);
							else this.setState(newLoggedInState);
						});
				} else this.setState(newLoggedOutState)
			});
	}

	// downloads user's schedule data from database and saves to state
	refresh() {

		const { email, pin, coursesData, coursesSections } = this.state;
		const {
			downloadNewCourseData,
			generateColors,
			generateCombinations,
			updateCoursesCache,
			refreshUserInfo
		} = this;

		this.setState({ loading: true, hover: null }, () => {
			api.get(api.user.schedule(email), { pin })
				.then(response => {
					response = response || {};
				if (has(response, 'error')) return console.error(response.error);
					const courses = response.courses || {};
					const blocks = response.blocks || {};
					const anchors = _.mapValues(response.anchors || {}, (value, key) => {
						return Object.keys(value);
					});

					this.setState({ courses, anchors, blocks }, () => {
						downloadNewCourseData();
						generateColors();
						generateCombinations();
					});
				});

			refreshUserInfo();
			updateCoursesCache();
		});

	}

	// downloads course data for each courseId and saves to state
	downloadNewCourseData() {
		const { courses } = this.state;
		const courseIds = Object.keys(courses);

		const coursesDataPromises = courseIds.map(courseId => api.get(api.course.data(courseId)));
		const coursesSectionsPromises = courseIds.map(courseId => api.get(api.course.sections(courseId)));

		Promise.all(coursesDataPromises)
			.then(coursesDataArray => _.zipObject(courseIds, coursesDataArray))
			.then(coursesData => this.setState({ coursesData }));

		Promise.all(coursesSectionsPromises)
			.then(coursesSectionsArray => _.zipObject(courseIds, coursesSectionsArray))
			.then(coursesSections => this.setState({ coursesSections }));
	}

	// does not immediately affect state, but tells server to
	// pull new data from the course website to be recached to our database
	updateCoursesCache() {
		const courses = Object.keys(this.state.courses);
		const depts = _.uniq(courses.map(course => course.split('-')[0]));
		for (let dept of depts)
			api.get(api.course.updateDept(dept));
	}

	// saves the combinations generated by the server
	generateCombinations() {
		const { courses, email, pin, index } = this.state;

		if (_.isEmpty(courses)) {
			return this.setState({
				coursesData: {},
				coursesSections: {},
				combinations: [],
				loading: false,
				index: 0
			});
		}

		api.get(api.user.generateSchedule(email), { pin })
			.then(results => {
				if (has(results, 'error')) return console.error(results.error);
				let newIndex = index;
				if (newIndex >= results.length) newIndex = results.length - 1;
				if (newIndex <= 0) newIndex = 0;

				this.setState({
					combinations: results,
					loading: false,
					index: newIndex
				});
			});
	}

  generateColors() {
		const size = Object.keys(this.state.courses).length;
		const newColors = colors.slice(0).splice(0, size).reverse();
    this.setState({ colors: newColors });
  }

	closeModal(data) {
		const { match, location, history } = this.props;

		if (data) {
			if (data.action == 'LOGIN') {
				this.setState({
					pin: data.pin,
					init: false
				}, this.refresh);
				history.replace({
					state: { pin: data.pin }
				});
			} else if(data.action == 'PAYMENT') {
				this.setState({
					isUserPaid: data.paid
				});
			}
		}

		this.setState({
			showModal: false,
			enabled: true
		});
	}

	setHoverCourseId(courseId) {
		const { loading, init, enabled } = this.state;
		if (!loading && !init && enabled)
			this.setState({ hoverCourseId: courseId });
	}

	setCombinationIndex(i) {
		if (this.state.isUserPaid || i < 25)
			this.setState({ combinationIndex: i });
	}

	setCombinationGhostIndex(i) {
		if (this.state.isUserPaid)
			this.setState({ combinationGhostIndex: i });
	}

  render() {
    const { init, loading, enabled, showModal } = this.state; // flags
		const { email, pin, isUserPaid } = this.state; // user info
		const { courses, coursesData, coursesSections, combinations, anchors, blocks } = this.state;
		const { colors, combinationIndex, combinationGhostIndex, hoverCourseId } = this.state;

		const enabledCourses = Object.keys(courses).filter(courseId => courses[courseId]);
		const hasCourses = enabledCourses.length > 0; // flag
		const className = classnames({ blur: (!enabled || showModal != false) });

    return (
      <section>
				<section id="main-section" className={className}>
	        <CourseList
						email={email}
						pin={pin}
						isUserPaid={isUserPaid}
						isDisabled={init || !enabled}

	          courses={courses}
	          hoverCourseId={hoverCourseId}
	          setHoverCourseId={this.setHoverCourseId} // function

	          coursesData={coursesData}
	          anchors={anchors}
						colors={colors}

					 	refresh={this.refresh} // function
					/>
	        <Calendar
						email={email}
						pin={pin}
						isUserPaid={isUserPaid}
						isDisabled={loading || init || !enabled}
						isLoading={loading || init}

						enabledCourses={enabledCourses}
						hoverCourseId={hoverCourseId}
						setHoverCourseId={this.setHoverCourseId} // function

						combinations={combinations}
						combinationIndex={combinationIndex}
						combinationGhostIndex={combinationGhostIndex}

						anchors={anchors}
						blocks={blocks}
						coursesData={coursesData}
						coursesSections={coursesSections}
						colors={colors}

						refresh={this.refresh} // function
					/>
	        <SelectorList
						isUserPaid={isUserPaid}
						isDisabled={init || !enabled}
						hasCourses={hasCourses}

	          combinations={combinations}
	          combinationIndex={combinationIndex}
	          combinationGhostIndex={combinationGhostIndex}

	          setCombinationIndex={this.setCombinationIndex} // function
	          setCombinationGhostIndex={this.setCombinationGhostIndex} // function
					/>
				</section>
				<ModalConductor
					currentModal={showModal}
					email={email}
					pin={pin}
					close={this.closeModal}
				/>
      </section>
    );
  }

};

ApplicationPage.propTypes = {
	match: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
};

export default withRouter(ApplicationPage);
