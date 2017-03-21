import React from 'react';
import Selector from '../components/Selector';

export default (props) => {

  let { courses, combinations, index, ghostIndex} = props;
	let { updateIndex, updateGhostIndex } = props;

	let enabledCourses = Object.keys(courses).filter(id => courses[id]);

  if (enabledCourses.length > 0) {
    return (
      <section id='selector'>
        <div id="heading">
          <div className="num">{combinations.length}</div>
          <div className="label">schedules</div>
        </div>
        <ul id="ranks">
          {combinations.slice(0,200).map((combination, key) => (
            <Selector key={key}
              index={key}
              active={index}
              onClick={updateIndex.bind(null, key)}
              onMouseEnter={() => { updateGhostIndex(key) }}
              onMouseLeave={() => { updateGhostIndex(null) }}
              score={combination.score} />))}
        </ul>
				<div className='maxed'>
					{combinations.length > 200 ? 'Showing first 200...' : ''}
				</div>
      </section>
    );
  } else {
    return (<section id='selector' />);
  }

};
