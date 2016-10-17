import React from 'react';

export default (props) => {

  let {
    courseId, sectionId, type,
    location, start, end,
    spaces_available,
    number_registered,
    style, color, height, hovers,
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

  let className = ['event'];

  if(hovers) className.push('hover');
  if(number_registered >= spaces_available) className.push('full');

  return (
    <li {...other}
      className={className.join(' ')}
      style={Object.assign(css, style)}>
      <div>
        <span className='courseid'>{courseId}</span>
        <span className='sectionid'>{sectionId}</span>
      </div>
      <span className='tag'>{type}</span>
      <span className='tag'>{convertToTime(start)}-{convertToTime(end)}</span>
      {(()=>{
        if(location) return <span className='tag'>{location}</span>;
      })()}
      <span className='tag'>{(()=>{
        if(number_registered >= spaces_available) {
          return 'FULL';
        }
        else {
          return number_registered + '/' + spaces_available + ' seats';
        }
      })()}</span>
    </li>
  );

};
