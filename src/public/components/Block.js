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

  return (
    <li {...other} className={'event' + ((hovers) ? ' hover' : '')} style={Object.assign(css, style)}>
      <b>{courseId}</b> ({type})<br />
      {sectionId}, {location}<br />
      {convertToTime(start)}-{convertToTime(end)}, {number_registered}/{spaces_available}
    </li>
  );

};
