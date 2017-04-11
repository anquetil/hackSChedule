import React, { PropTypes } from 'react';
import classnames from 'classnames';
import has from 'has';
import CourseListItem from './CourseListItem';

const CourseList = ({
	colors,
	isDisabled,
	courses,
	coursesData,
	anchors,
	hoverCourseId,
	setHoverCourseId,
	addClass,
	removeClass,
	toggleClass,
}) => {

	const arrayedCourses = Object.keys(courses);
	const enabledCourses = arrayedCourses.filter(id => courses[id]);
	const disabledCourses = arrayedCourses.filter(id => !courses[id]);

	const total_units = _.sum(enabledCourses.map(courseId => {
		if (has(coursesData, courseId)) {
			return parseInt(coursesData[courseId].units[0]);
		} else return 0;
	}));

	if (arrayedCourses.length > 0) {
		return <div>
			<ul id='courselist'>
				{arrayedCourses.map((courseId, i) => (
					<CourseListItem key={courseId}
						className={classnames({
							hover: (courseId === hoverCourseId),
							disabled: !courses[courseId]
						})}
						onMouseEnter={e => setHoverCourseId(courseId)}
						onMouseLeave={e => setHoverCourseId(null)}
						onClick={e => toggleClass(courseId)}
						removeClass={removeClass}
						courseId={courseId}
						courseData={coursesData[courseId]}
						color={colors[i]}
						anchors={(anchors[courseId]) ? anchors[courseId] : []} />
				))}
			</ul>
			<div className='total_units'>
				<span>{total_units}</span> units total
			</div>
		</div>;
	} else return null;
}

CourseList.propTypes = {
	colors: PropTypes.array,
	isDisabled: PropTypes.bool,
	courses: PropTypes.object,
	coursesData: PropTypes.object,
	anchors: PropTypes.object,
	hoverCourseId: PropTypes.string,
	setHoverCourseId: PropTypes.func,
	addClass: PropTypes.func,
	removeClass: PropTypes.func,
	toggleClass: PropTypes.func,
};

export default CourseList;
