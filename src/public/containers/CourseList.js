import React, { Component } from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import Search from '../components/Search';
import Course from '../components/Course';

import UserPaymentBlock from '../components/UserPaymentBlock';

const HelpBlock = ({ paid }) => (
	<div className='start'>
		<b>Generate a perfect schedule 📅</b>
		<div>
			<p>Instead of you spending hours trying to figure out which sections work, HackSChedule will generate all possible schedules for you. All you have to do is pick the one you prefer.</p>
			<ol>
				<li>Enter the classes that you will be taking. E.g. <span>CSCI-201</span>, <span>CTAN-450C</span>.</li>
				<li>Browse different schedules on the right. Use arrow keys <span>&uarr;</span> and <span>&darr;</span>.</li>
				<li className={classNames({disabled: !paid})}>Enable/disable classes by clicking them on the left.</li>
				<li className={classNames({disabled: !paid})}>Click and drag from anywhere on the calendar to <span>block</span> off that time. Click the blocks to remove them.</li>
				<li className={classNames({disabled: !paid})}>Click the sections you will definitely take to <span>anchor</span> them. The <span>red</span> border tells you they're anchored.</li>
				<li>Export your schedule and enjoy the hours you've saved!</li>
			</ol>
		</div>
	</div>
);



const Instructions = ({ courses, show_help, loading, show, paid, children }) => {
  if ((courses.length <= 0 || show_help) && !loading) {
    return (
      <div id="help">
				<HelpBlock paid={paid} />
        {children}
        {(()=>{
          if (courses.length > 0) {
            return (
              <button onClick={()=>{ show(false) }}>Hide help</button>
            );
          }
        }).bind(this)()}
      </div>
    );
  } else if (!loading) {
    return (
      <div id="help">
        {children}
        <button onClick={()=>{ show(true) }}>Help</button>
      </div>
    );
  } else {
    return (<div id="help" style={{ display: 'none' }}></div>);
  }
}

class CourseList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      show_help: false
    };
  }

	courseList() {
    let { colors, loading } = this.props;
		let { courses, coursesData, anchors, hoverIndex } = this.props;
		let { setHover, addClass, removeClass, toggleClass } = this.props;

		let enabledCourses = Object.keys(courses).filter(id => courses[id]);
		let disabledCourses = Object.keys(courses).filter(id => !courses[id]);
		let arrayedCourses = Object.keys(courses);

		let total_units = _.sum(enabledCourses.map(courseId => {
			if (courseId in coursesData) {
				return parseInt(coursesData[courseId].units[0]);
			} else return 0;
		}));

		if (arrayedCourses.length > 0) {
			return (
				<div>
					<ul id='courselist'>
						{arrayedCourses.map((courseId, i) => (
							<Course key={courseId}
								className={classNames({
									hover: (i === hoverIndex),
									disabled: !courses[courseId]
								})}
								onMouseEnter={setHover.bind(null, i)}
								onMouseLeave={setHover.bind(null, null)}
								onClick={toggleClass.bind(null, courseId)}
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
				</div>
			);
		}
	}

  render() {
		let { show_help } = this.state;
    let { colors, loading, email, pin, paid } = this.props;
		let { courses, coursesData, anchors, hoverIndex } = this.props;
		let { setHover, addClass, removeClass, toggleClass } = this.props;
		let { closeModal } = this.props;

		let arrayedCourses = Object.keys(courses);

    return (
      <section id='courses'>
        <div id='logo' />

        <Search
          courses={arrayedCourses}
          disabled={(arrayedCourses.length >= 12)}
          loading={loading}
          submit={addClass} />

        {this.courseList()}

        <Instructions
          courses={arrayedCourses}
          show_help={show_help}
          loading={loading}
					paid={paid}
          show={(bool) => { this.setState({ show_help: bool }) }}>
					<UserPaymentBlock
						close={closeModal}
						paid={paid}
						email={email}
						pin={pin} />
				</Instructions>

        {/* {(() => {
          if (courses.length > 3) {
            return (
              <div id="support">
                Did HackSchedule help you? Want more features? Consider buying your fellow trojan dev a cup o' coffee so he can keep on making more stuff! (Venmo: @ninjiangstar)
                <div>
                  <button onMouseUp={()=>{window.open('https://venmo.com/?txn=pay&audience=public&recipients=ninjiangstar&amount=3&note=coffee%20for%20hackschedule')}}>☕ $3</button>
                  <button onMouseUp={()=>{window.open('https://venmo.com/?txn=pay&audience=public&recipients=ninjiangstar&amount=5&note=beer%20for%20hackschedule')}}>🍻 $5</button>
                </div>
              </div>
            );
          }
        })()} */}

        <div id='credits'>
          <a href={'mailto:andrewji@usc.edu?subject=Feedback%20for%20HackSchedule'}>Feedback</a>
        </div>
      </section>
    );
  }

};

export default CourseList;
