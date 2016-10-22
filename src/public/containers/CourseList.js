import React, { Component } from 'react';
import _ from 'lodash';

import Search from '../components/Search';
import Course from '../components/Course';

class CourseList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      show_help: false
    };
  }

  render() {

    let { courses, setHover, hoverIndex, anchors,
      removeClass, courseData, colors } = this.props;

    return (
      <section id='courses'>
        <div id='logo' />
        <Search
          courses={courses}
          disabled={(courses.length >= 7)}
          submit={this.addClass.bind(this)} />

          {(() => {
            if (courses.length > 0) {
              let total_units = _.sum(courses.map(courseId => {
                if (courseId in courseData) {
                  return parseInt(courseData[courseId].units[0]);
                } else {
                  return 0;
                }
              }));
              return (
                <div>
                  <ul id='courselist'>
                    {courses.map((courseId, i) => (
                      <Course key={courseId}
                        className={(i === hoverIndex) ? 'hover' : ''}
                        onMouseEnter={setHover.bind(null, i)}
                        onMouseLeave={setHover.bind(null, null)}
                        removeClass={removeClass.bind(null)}
                        courseId={courseId}
                        courseData={courseData[courseId]}
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
          })()}


        {(() => {
          if (courses.length <= 0 || this.state.show_help) {
            return (
              <div id="help">
                <div className='start'>
                  <b>Generate a perfect schedule 📅</b>
                  <div>
                    <p>Instead of you spending hours trying to figure out which sections work, HackSChedule will generate all possible schedules for you. All you have to do is pick the one you prefer.</p>
                    <ol>
                      <li>Enter the classes that you will be taking. E.g. <span>CSCI-201</span>, <span>CTAN-450C</span>.</li>
                      <li>Browse different schedules on the right. Use arrow keys <span>&uarr;</span> and <span>&darr;</span>.</li>
                      <li>Anchor the sections you will definitely take by <span>clicking</span> them. The <span>red</span> border tells you they're anchored.</li>
                      <li>Export your schedule and enjoy the hours you've saved!</li>
                    </ol>
                  </div>
                </div>
                {(()=>{
                  if (courses.length > 0) {
                    return (
                      <button onClick={()=>{this.setState({ show_help: false })}}>Hide help</button>
                    );
                  }
                }).bind(this)()}
              </div>
            );
          } else {
            return (
              <div id="help">
                <button onClick={()=>{this.setState({ show_help: true })}}>Help</button>
              </div>
            );
          }
        })()}

        {(() => {

          if (courses.length > 3) {
          return (
            <div id="support">
              Did HackSchedule help you? Want more features? Consider buying your fellow trojan dev coffee (or beer) so he can keep on making stuff! (Venmo: @ninjiangstar)
              <div>
                <button onMouseUp={()=>{window.open('https://venmo.com/?txn=pay&audience=public&recipients=ninjiangstar&amount=3&note=coffee%20for%20hackschedule')}}>☕ $3</button>
                <button onMouseUp={()=>{window.open('https://venmo.com/?txn=pay&audience=public&recipients=ninjiangstar&amount=5&note=beer%20for%20hackschedule')}}>🍻 $5</button>
              </div>
            </div>
          );
          }
        })()}

        <div id='credits'>
          <a href={'mailto:andrewji@usc.edu?subject=Feedback%20for%20HackSchedule'}>Feedback</a>
        </div>
      </section>
    );
  }

  addClass(courseId) {
    this.props.addClass(courseId);
  }

  removeClass(courseId) {
    this.props.removeClass(courseId);
    this.props.setHover(null)
  }

};

export default CourseList;
