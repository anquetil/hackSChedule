import React from 'react';
import _ from 'lodash';

export default props => {

  var { removeClass, courseId, courseData, color, ...other } = props;

  var rgb = 'rgb(' + color + ')';

  if (_.isUndefined(courseData)) {
    return (
      <li key={courseId} {...other} style={{ backgroundColor: rgb }}>
        Loading {courseId}...
      </li>
    );
  } else {
    return (
      <li key={courseId} {...other} style={{ backgroundColor: rgb }}>
        <a className='close' onClick={removeClass.bind(null, courseId)}>×</a>
        <span className='course tag'>{courseId}</span>
        <span className='unit tag'>{courseData.units} units</span>
        <span className='courseTitle'>{courseData.title}</span>
      </li>
    );
  }

}
