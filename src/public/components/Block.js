import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

export default (props) => {

  let {
    courseId, sectionId, sectiondata,
    location, start, end,
    style, color, height, hovers, anchored,
    ...other
  } = props;

  function convertToTime(mins) {
    if (mins === null) return null;
    return Math.round(mins/60) + ':' + ('0' + (mins % 60)).slice(-2);
  }

  let mins = 60;
  let lowerHrLim = 7;

  let css = {
    top: Math.round(((start / mins) - lowerHrLim) * height),
    height: Math.round((end - start) / mins * height),
    backgroundColor: 'rgb(' + color + ')',
  };

  return (
    <li {...other}
      className={classNames('event', {
        hover: (hovers),
        full: (sectiondata.full),
        anchored: (anchored)
      })}
      style={Object.assign(css, style)}>
      <div>
        <span className='courseid'>{courseId}</span>
        <span className='sectionid'>{sectionId}</span>
      </div>
      <div>
        <span className='tag'>{sectiondata.type}</span>
        <span className='tag'>{convertToTime(start)}-{convertToTime(end)}</span>
        {(()=>{
          if (location) return <span className='tag'>{location}</span>;
        })()}
        {(()=>{
          if (sectiondata.instructor) {
            if (_.isArray(sectiondata.instructor)) {
              return sectiondata.instructor.map((o,i) => (
                <span key={i} className='tag'>{o.first_name} {o.last_name}</span>
              )).join('');
            } else {
              let { first_name, last_name } = sectiondata.instructor;
              return <span className='tag'>{first_name} {last_name}</span>;
            }
          }
        })()}
        <span className='tag'>{(sectiondata.full) ? 'FULL' : sectiondata.number_registered + '/' + sectiondata.spaces_available + ' seats'}</span>
      </div>
    </li>
  );

};
