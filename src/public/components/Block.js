import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import EventBlock from './EventBlock';

const Block = ({
  courseId, sectionId, sectiondata,
  location, start, end, className,
  style, color, height, hovers, anchored,
  ...other
}) => {

  function convertToTime(mins) {
    if (mins === null) return null;
    let hour = Math.floor(mins/60) % 12;
    if (hour == '0') hour += 12;
    let min = ('0' + (mins % 60)).slice(-2);
    let ampm = (Math.floor(mins/60) >= 12) ? 'pm' : 'am';
    return hour + ':' + min + '' + ampm;
  }

  let mins = 60;
  let lowerHrLim = 7;

  let top = Math.round(((start / mins) - lowerHrLim) * height);
  let trueHeight = Math.round((end - start) / mins * height);

  let css = { backgroundColor: 'rgb(' + color + ')' };

  let full = parseInt(sectiondata.number_registered) >= parseInt(sectiondata.spaces_available);

  return (
    <EventBlock {...other}
      className={classNames({
        hover: (hovers),
        full: (full),
        anchored: (anchored)
      }, className)}
      top={top}
      height={trueHeight}
      style={Object.assign(css, style)}>
      <div>
        <span className='courseid'>{courseId}</span>
        <span className='sectionid'>{sectionId}</span>
      </div>
      <div>
        <span className='tag'>{sectiondata.type}</span>
        <span className='tag'>{convertToTime(start)}—{convertToTime(end)}</span>
        {(()=>{
          if (location) return <span className='tag'>{location}</span>;
        })()}
        <span className='tag'>{(full) ? 'FULL / ' + sectiondata.spaces_available : sectiondata.number_registered + '/' + sectiondata.spaces_available + ' seats'}</span>
        {(()=>{
          if ('instructor' in sectiondata) {
            if (!_.isArray(sectiondata.instructor))
              sectiondata.instructor = [sectiondata.instructor];
            return sectiondata.instructor.map((o,i) => (
              <span key={i} className='tag'>{o.first_name} {o.last_name}</span>
            ));
          }
        })()}
      </div>
    </EventBlock>
  );

};

Block.propTypes = {
  courseId: React.PropTypes.string.isRequired,
  sectionId: React.PropTypes.string.isRequired,
  sectiondata: React.PropTypes.object.isRequired,
  location: React.PropTypes.string.isRequired,
  start: React.PropTypes.number.isRequired,
  end: React.PropTypes.number.isRequired,
  className: React.PropTypes.string,
  style: React.PropTypes.object,
  height: React.PropTypes.number,
  anchored: React.PropTypes.bool
};

export default Block;
