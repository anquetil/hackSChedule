import React from 'react';

export default (props) => {

  let {
    courseId, sectionId, type,
    location, start, end,
    spaces_available,
    number_registered,
    ...other
  } = props;

  return (
    <li {...other} className='event'>
      <b>{courseId}</b> ({type})<br />
      {sectionId}, {location}<br />
      {start}-{end}, {number_registered}/{spaces_available}
    </li>
  );

};
