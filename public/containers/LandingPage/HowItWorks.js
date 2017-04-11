import React, { Component } from 'react';
import api from '../../utils/api-interface';

import CourseListItem from '../CourseList/CourseListItem';
import colors from '../../utils/colors';

class HowItWorks extends Component {

	constructor(props) {
		super(props);

		this.state = {
			courses: [],
			coursesData: {},
			combinations: [],
			colors: [],
			index: 0,
			hover: null,
			userCount: 0
		};
	}

	componentWillMount() {
		let demoEmail = 'andrewji@usc.edu';
		let pin = '1566';

		// generate courses
		api.get(api.user.schedule(demoEmail))
			.then((response) => {
				response = response || {};
				let courses = response.courses || {};
				let enabledCourses = Object.keys(courses).filter(id => courses[id]);

				this.setState({
					courses: enabledCourses,
					colors: colors.slice(0).splice(0, enabledCourses.length).reverse()
				});

				for (let courseId of enabledCourses) {
					api.get(api.course.data(courseId))
						.then(function (courseData) {
							let coursesData = this.state.coursesData;
							coursesData[courseId] = courseData;
							this.setState({ coursesData });
						}.bind(this));
				}
			});

		api.get(api.user.generateSchedule(demoEmail), { pin })
			.then((results) => {
				this.setState({ combinations: results });
			});

		api.get(api.user.count())
			.then(({count}) => {
				this.setState({ userCount: count });
			});
	}

	render() {
		let { combinations, courses, coursesData, colors, hover, userCount } = this.state;

		return <section id='how_it_works'>
			<h1>How it works</h1>
			<p>The worst part about course registration is making sure the sections in your classes don't overlap.</p>
			<p>HackSChedule solves this by generating a huge list of potential schedules. Let's say you're taking the classes listed below.</p>
			<p>There are {combinations.length} ways to arrange your schedule.</p>

			<ul id='courselist'>
				{courses.map((courseId, i) => {
					let item = [<CourseListItem
						className={(i === hover) ? 'hover' : ''}
						onMouseEnter={(e) => {this.setState({ hover: i })}}
						onMouseLeave={(e) => {this.setState({ hover: null })}}
						removeClass={()=>{}}
						courseId={courseId}
						courseData={coursesData[courseId]}
						color={colors[i]}
						anchors={[]}
					/>];
					if (i !== courses.length - 1) {
						item.push(<li className='txt'>+</li>);
					} else {
						item.push(<li className='txt'>= {combinations.length} schedules</li>);
					}
					return item;
				})}
			</ul>

			<p>Try it out with your schedule!</p>
			<p style={{ fontSize: 10 }}>User count: {userCount}</p>
		</section>;
	}
}

export default HowItWorks;
