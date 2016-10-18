import React from 'react';
import Selector from '../components/Selector';

export default (props) => {

  var { courses, updateCal, combinations, index, ...other} = props;

  if (courses.length > 0) {
    return (
      <section id='selector'>
        <div id="heading">
          <div className="num">{combinations.length}</div>
          <div className="label">schedules</div>
        </div>
        <ul id="ranks">
          {combinations.map((combination, key) => (
            <Selector key={key}
              index={key}
              active={index}
              onClick={updateCal.bind(null, key)}
              score={combination.score} />))}
        </ul>
      </section>
    );
  } else {
    return (<section id='selector' />);
  }

};
