import React, { Component } from 'react';
import _ from 'lodash';
import classNames from 'classnames';

import CourseList from '../containers/CourseList';
import Calendar from '../containers/Calendar';
import SelectorFilter from '../containers/SelectorFilter';

import UserEnterPinModal from '../modals/UserEnterPinModal';
import UserNotFoundModal from '../modals/UserNotFoundModal';
import UserPaymentModal from '../modals/UserPaymentModal';

import colors from '../func/colors';
import api from '../api-interface';

const ModalConductor = props => {
	switch (props.currentModal) {
		case 'USER_NOT_FOUND':
			return <UserNotFoundModal {...props} />;

		case 'USER_ENTER_PIN':
			return <UserEnterPinModal {...props} />;

		case 'USER_PAYMENT':
			return <UserPaymentModal {...props} />;

		default: return null;
	}
}

class Scheduler extends Component {

  constructor(props) {
    super(props);

    this.state = {
			// user info
			email: '',
			pin: '',
			paid: false,

			// courses info
      courses: {},
      coursesData: {},
			coursesSections: {},
      combinations: [],
      anchors: {},
      blocks: {},

			// visuals
      colors: [],
      index: 0,
      ghostIndex: null,
      hover: null,

			// flags
      init: true,
      enabled: false,
      loading: false,

			// modals
			showModal: false
    };

		this.addClass = this.addClass.bind(this);
		this.removeClass = this.removeClass.bind(this);
		this.enableClass = this.enableClass.bind(this);
		this.disableClass = this.disableClass.bind(this);
		this.toggleClass = this.toggleClass.bind(this);
		this.toggleAnchor = this.toggleAnchor.bind(this);
		this.addAnchor = this.addAnchor.bind(this);
		this.removeAnchor = this.removeAnchor.bind(this);
		this.addBlock = this.addBlock.bind(this);
		this.removeBlock = this.removeBlock.bind(this);
		this.generate = this.generate.bind(this);
		this.generateColors = this.generateColors.bind(this);
		this.updateIndex = this.updateIndex.bind(this);
		this.updateGhostIndex = this.updateGhostIndex.bind(this);
		this.keyboardCommands = this.keyboardCommands.bind(this);
		this.goPrev = this.goPrev.bind(this);
		this.goNext = this.goNext.bind(this);
		this.setHover = this.setHover.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.openUpgrade = this.openUpgrade.bind(this);
  }

	componentWillMount() {
		let { location, params } = this.props;
		api.get(api.validate.email(params.userEmail))
			.then((response) => {
				let email = response.email;
				let user_exists = response.user_exists;
				if (user_exists && location.state && location.state.pin) {
					this.setState({
						email: email,
						pin: location.state.pin,
						init: false,
						enabled: true,
						paid: response.paid
					}, this.initialize);
				} else {
					this.setState({
						email: email || '',
						init: false,
						enabled: false,
						showModal: user_exists ? 'USER_ENTER_PIN' : 'USER_NOT_FOUND'
					});
				}
			});
	}

	componentDidMount() {
		document.addEventListener('keydown', this.keyboardCommands, false);
	}

	initialize() {
		let { email, pin, coursesData, coursesSections } = this.state;

		api.get(api.user.schedule(email))
			.then((response) => {
				response = response || {};
				let courses = response.courses || {};
				let anchors = response.anchors || {};
				let blocks = response.blocks || {};


				anchors = _.mapValues(anchors, (value, key) => {
					return Object.keys(value);
				});
				this.setState({ courses, anchors, blocks }, this.generate);

				for (let courseId in courses) {
					// grab course data
					api.get(api.course.data(courseId))
						.then((courseData) => {
							coursesData[courseId] = courseData;
							this.setState({ coursesData });
						});

					// grab course sections
					api.get(api.course.sections(courseId))
						.then((courseSections) => {
							coursesSections[courseId] = courseSections;
							this.setState({ coursesSections });
						});
				}

			});
	}

  render() {
    let { init, loading, enabled, showModal } = this.state; // flags
		let { email, pin, paid, courses, coursesData, coursesSections, combinations, anchors, blocks } = this.state;
		let { colors, index, hover, ghostIndex } = this.state;

    return (
      <section>
				<section id="main-section" className={classNames({ blur: (!enabled || showModal != false) })}>
	        <CourseList
						colors={colors}
						loading={init}

	          courses={courses}
	          coursesData={coursesData}
	          anchors={anchors}
	          hoverIndex={hover}

	          setHover={this.setHover}
	          addClass={this.addClass}
	          removeClass={this.removeClass}
						toggleClass={this.toggleClass}
						paid={paid}
	        />
	        <Calendar
						loading={(loading || init)}
						colors={colors}

	          courses={courses}
	          coursesData={coursesData}
						coursesSections={coursesSections}
	          combinations={combinations}
	          anchors={anchors}
	          blocks={blocks}
	          index={index}
	          hoverIndex={hover}
	          ghostIndex={ghostIndex}

	          setHover={this.setHover}
	          toggleAnchor={this.toggleAnchor}
	          addBlock={this.addBlock}
	          removeBlock={this.removeBlock}
	          regenerate={this.generate}
						openUpgrade={this.openUpgrade}
						paid={paid}
	        />
	        <SelectorFilter
	          courses={courses}
	          combinations={combinations}
	          index={index}
	          ghostIndex={ghostIndex}
	          updateIndex={this.updateIndex}
	          updateGhostIndex={this.updateGhostIndex}
						paid={paid}
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

	closeModal(data) {
		if (data) {
			if (data.action == 'LOGIN') {
				this.setState({
					pin: data.pin,
					init: false,
					enabled: true
				}, this.initialize);
				this.context.router.push({
					pathname: this.props.location.pathname,
					state: { pin: data.pin }
				});
			} else if(data.action == 'PAYMENT') {
				this.setState({
					paid: data.paid
				});
			}
		}

		this.setState({
			showModal: false,
			enabled: true
		});
	}

	openUpgrade(){
		this.setState({
			showModal: 'USER_PAYMENT',
			enabled: false
		})
	}

  addClass(courseId) {
    let { courses, coursesData, coursesSections, email, pin } = this.state;
		let { generate } = this;

    // don't re-add class
    if (courseId in courses) return;

    // verify that the course exists
		api.post(api.user.addCourse(email, courseId), { pin })
			.then((response) => {
				if ('error' in response) return;
				courses[courseId] = response[courseId];
				this.setState({ courses }, generate);
			});

		// grab course data
		api.get(api.course.data(courseId))
			.then((courseData) => {
				coursesData[courseId] = courseData;
				this.setState({ coursesData });
			});

		// grab course sections
		api.get(api.course.sections(courseId))
			.then((courseSections) => {
				coursesSections[courseId] = courseSections;
				this.setState({ coursesSections });
			});
  }

	enableClass(courseId) {
		let { courses, coursesData, coursesSections, email, pin } = this.state;

		// verify that the course exists
		api.post(api.user.enableCourse(email, courseId), { pin })
			.then((response) => {
				if ('error' in response) return;
				courses[courseId] = response[courseId];
				this.setState({ courses }, this.generate);
			});
	}

	disableClass(courseId) {
		let { courses, coursesData, coursesSections, email, pin } = this.state;

		// verify that the course exists
		api.post(api.user.disableCourse(email, courseId), { pin })
			.then((response) => {
				if ('error' in response) return;
				courses[courseId] = response[courseId];
				this.setState({ courses }, this.generate);
			});
	}

	toggleClass(courseId) {
		if (!this.state.paid) return;
		let { courses } = this.state;
		if (courseId in courses && courses[courseId]) {
			this.disableClass(courseId);
		} else {
			this.enableClass(courseId);
		}
	}

  removeClass(courseId) {
		let { courses, coursesData, coursesSections, email, pin, anchors } = this.state;
		let { generate } = this;

		// don't delete class that isn't there
		if (!(courseId in courses)) return;

		api.post(api.user.removeCourse(email, courseId), { pin })
			.then((response) => {
				if ('error' in response) return;

				if (anchors[courseId]) {
		      delete anchors[courseId];
		    }

				if (courseId in courses) {
					delete courses[courseId];
				}

				if (courseId in coursesData) {
					delete coursesData[courseId];
				}

				if (courseId in coursesSections) {
					delete coursesSections[courseId];
				}

				this.setState({
					courses,
					coursesData,
					coursesSections,
					anchors,
					hover: null
				}, generate);
			});
  }

  toggleAnchor(courseId, sectionId) {
    let { anchors } = this.state;
		let { removeAnchor, addAnchor } = this;
    if (anchors[courseId] && anchors[courseId].indexOf(sectionId) >= 0) {
    	removeAnchor(courseId, sectionId);
    } else {
    	addAnchor(courseId, sectionId);
    }
  }

  addAnchor(courseId, sectionId) {
		if (!this.state.paid) return;
    let { anchors, email, pin } = this.state;
		api.post(api.user.enableAnchor(email, courseId, sectionId), { pin })
			.then((response) => {
				if ('error' in response) return;

		    if (!_.isArray(anchors[courseId]))
		      anchors[courseId] = [];

		    if (anchors[courseId].indexOf(sectionId) > -1) return;

		    anchors[courseId].push(sectionId);
		    this.setState({ anchors }, this.generate);

			});
  }

  removeAnchor(courseId, sectionId) {
		let { anchors, email, pin } = this.state;

		api.post(api.user.disableAnchor(email, courseId, sectionId), { pin })
			.then((response) => {
				if ('error' in response) return;
		    if (!anchors[courseId]) return;
		    if (anchors[courseId].indexOf(sectionId) < 0) return;
		    anchors[courseId] = _.pull(anchors[courseId], sectionId)
		    if (anchors[courseId].length <= 0) {
		      delete anchors[courseId];
		    }
		    this.setState({ anchors }, this.generate);
			});
  }

  addBlock(start, end, day) {
		if (!this.state.paid) return;
		let { blocks, email, pin } = this.state;
		let block = { start, end, day };

		api.post(api.user.addBlock(email), { pin, block })
			.then((response) => {
				if ('error' in response) return;
		    blocks[response.block_key] = block;
				this.setState({ blocks }, this.generate);
			});
  }

  removeBlock(blockKey) {
		let { blocks, email, pin } = this.state;

		api.post(api.user.removeBlock(email, blockKey), { pin })
			.then((response) => {
				if ('error' in response) return;
		    delete blocks[blockKey];
				this.setState({ blocks }, this.generate);
			});
  }

	updateCoursesCache() {
		let courses = Object.keys(this.state.courses);
		let depts = courses.map(course => course.split('-')[0]);
		depts = _.uniq(depts);
		for (let dept of depts) {
			api.get(api.course.updateDept(dept));
		}
	}

	generate() {
		let { courses, email, pin, index } = this.state;

		this.generateColors();
		this.updateCoursesCache();

		if (_.isEmpty(courses)) {
			this.setState({
				coursesData: {},
				coursesSections: {},
				combinations: [],
				loading: false,
				index: 0
			});
		} else {
			this.setState({ loading: true, hover: null }, () => {
				api.get(api.user.generateSchedule(email), { pin })
					.then((results) => {
						if (index >= results.length) index = results.length - 1;
						if (index <= 0) index = 0;
						console.log(results);
						this.setState({
							combinations: results,
							loading: false,
							index: index
						});
					});
			});
		}
	}

  generateColors() {
		let { courses } = this.state;
    this.setState({
      colors: colors.slice(0).splice(0, Object.keys(courses).length).reverse()
    });
  }

  updateIndex(i) {
		if (this.state.paid || i < 20) {
	    this.setState({ index: i });
		} else {
			this.openUpgrade();
		}
  }

  updateGhostIndex(i) {
		if (this.state.paid) {
	    this.setState({ ghostIndex: i });
		}
  }

  keyboardCommands(e) {
    if([37,38,39,40].indexOf(e.keyCode) > -1){
      e.preventDefault();
      if(e.keyCode == 37 || e.keyCode == 38) this.goPrev();
      else this.goNext();
    }
  }

  goPrev() {
		let { index } = this.state;

    if (index > 0 && (this.state.paid || index < 20)) {
      this.setState({ index: index - 1 });
    }
  }

  goNext() {
		let { index, combinations } = this.state;

		let max = combinations.length;
		if (!this.state.paid) max = 20;

    if (index < max - 1) {
      this.setState({ index: index + 1 });
    } else {
      this.setState({ index: max - 1});
    }
  }

  setHover(i) {
		let { loading } = this.state;

    if (!loading) {
      this.setState({ hover: i });
    }
  }

};

Scheduler.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Scheduler;
