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

  function convertToMin(time) {
    // ex: convert '13:50' to '830'
    if (time === null) return null;
    var time = time.split(':');
    return Math.round(time[0]) * 60 + Math.round(time[1]);
  }

  let startMin = convertToMin(start);
  let endMin = convertToMin(end);

  let mins = 60;
  let lowerHrLim = 7;

  let css = {
    top: Math.round(((startMin / mins) - lowerHrLim) * height),
    height: Math.round((endMin - startMin) / mins * height),
    backgroundColor: 'rgb(' + color + ')',
  };

  return (
    <li {...other} className={'event' + ((hovers) ? ' hover' : '')} style={Object.assign(css, style)}>
      <b>{courseId}</b> ({type})<br />
      {sectionId}, {location}<br />
      {start}-{end}, {number_registered}/{spaces_available}
    </li>
  );

};
