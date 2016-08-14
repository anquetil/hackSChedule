import React, { Component } from 'react';
import _ from 'lodash';

import Block from '../components/Block';

class Calendar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      times: [ '7a', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p' ],
      days: { U: 'Sun', M: 'Mon', T: 'Tue', W: 'Wed', H: 'Thu', F: 'Fri', S: 'Sat', A: 'TBA' },
      events: {},
    };
  }

  render() {

    let blank = [];
    for (var i in this.state.times) {
      blank.push(<li key={i} />);
    }

    return (
      <div id='calwrap'>
        <ul className='time'>
          <li className='day' />
          {this.state.times.map(time => (<li key={time}>{time}</li>))}
        </ul>
        {Object.keys(this.state.days).map(day => {
          return (
            <ul key={day} id={day} className='col'>
              <li className='day'>{this.state.days[day]}</li>
              {(() => { if (day !== 'A') return blank })()}
              {this.state.events[day]}
            </ul>
          );
        })}
      </div>
    );
  }

  componentWillMount() {
    // component will mount, set up
  }

  componentDidMount() {
    // component did mount, manipulate DOM here
  }

  componentWillReceiveProps(nextProps) {
    if (Object.keys(nextProps.courseData).length === nextProps.courses.length) {
      this.generateEvents(nextProps.courseData, nextProps.combinations[nextProps.index]);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // do something after component updated
  }

  componentWillUnmount() {
    // stop any unnecessary processes just before unmount
  }

  generateEvents(courseData, combinations) {
    let events = _.mapValues(this.state.days, () => ([]));
    for (let courseId in combinations) {
      let sections = courseData[courseId].sections;
      for (let sectionId of combinations[courseId]) {
        for (let block of sections[sectionId].blocks) {
          let newBlock = (<Block
            key={courseId+'.'+sectionId}
            courseId={courseId}
            sectionId={sectionId}
            type={sections[sectionId].type}
            location={block.location}
            spaces_available={sections[sectionId].spaces_available}
            number_registered={sections[sectionId].number_registered} />);
          console.log(block.day);
          if (block.day === null) events['A'].push(newBlock);
          else events[block.day].push(newBlock);
        }
      }
    }

    this.setState({ events });
  }

};

export default Calendar;
