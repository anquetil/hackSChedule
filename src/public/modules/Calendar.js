import React, { Component } from 'react';
import _ from 'lodash';

import Block from '../components/Block';

class Calendar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      times: [ '', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p' ],
      days: { U: 'Sun', M: 'Mon', T: 'Tue', W: 'Wed', H: 'Thu', F: 'Fri', S: 'Sat', A: 'TBA' },
      events: { A: []},
      hour: 64,
      index: null,
      hoverIndex: null,
    };
  }

  render() {

    let blank = [];
    for (var i in this.state.times) {
      blank.push(<li key={i} style={{ height: this.state.hour }}/>);
    }

    let width = (this.state.events.A.length > 0) ? 100 / 8 + '%' : 100 / 7 + '%';

    return (
      <section id='calendar'>
        <ul id='days'>
          {Object.keys(this.state.days).map(day => {
            if (day !== 'A' || (day === 'A' && this.state.events.A.length > 0)) {
              return (
                <li key={day} style={{width}}>{this.state.days[day]}</li>
              );
            }
          })}
        </ul>
        <div id='calwrap'>
          <ul className='time'>
            {this.state.times.map(time => (<li key={time}>{time}</li>))}
          </ul>
          {Object.keys(this.state.days).map(day => {
            if (day !== 'A' || (day === 'A' && this.state.events.A.length > 0)) {
              return (
                <ul key={day} id={day} className='col' style={{width}}>
                  {(() => { if (day !== 'A') return blank })()}
                  {this.state.events[day]}
                </ul>
              );
            }
          })}
        </div>
      </section>
    );
  }

  componentWillMount() {
    // component will mount, set up
  }

  componentDidMount() {
    // component did mount, manipulate DOM here
  }

  componentWillReceiveProps(nextProps) {
    if (
      Object.keys(nextProps.courseData).length === nextProps.courses.length
      && nextProps.courses.length !== this.state.numberOfCourses
      || nextProps.hoverIndex !== this.state.hoverIndex
      || nextProps.index !== this.state.index
    ) {
      this.generateEvents(
        nextProps.courseData,
        nextProps.combinations[nextProps.index],
        nextProps.courses.length,
        nextProps.index,
        nextProps.hoverIndex
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // do something after component updated
  }

  componentWillUnmount() {
    // stop any unnecessary processes just before unmount
  }

  generateEvents(courseData, combinations, numberOfCourses, index, hoverIndex) {
    let events = _.mapValues(this.state.days, () => ([]));
    for (let courseId in combinations.combination) {
      let courseIndex = this.props.courses.indexOf(courseId);
      let sections = courseData[courseId].sections;
      for (let sectionId of combinations.combination[courseId]) {
        for (let key in sections[sectionId].blocks) {
          let block = sections[sectionId].blocks[key];
          let newBlock = (<Block
            hovers={(hoverIndex === courseIndex)}
            onMouseEnter={this.props.setHover.bind(null, courseIndex)}
            onMouseLeave={this.props.setHover.bind(null, null)}
            key={courseId + '.' + sectionId + '.' + key}
            height={this.state.hour}
            color={this.props.colors[courseIndex]}
            courseId={courseId}
            sectionId={sectionId}
            type={sections[sectionId].type}
            start={block.start}
            end={block.end}
            location={block.location}
            spaces_available={sections[sectionId].spaces_available}
            number_registered={sections[sectionId].number_registered} />);
          if (!block.day) events['A'].push(newBlock);
          else events[block.day].push(newBlock);
        }
      }
    }

    this.setState({ events, numberOfCourses, hoverIndex });
  }

};

export default Calendar;
