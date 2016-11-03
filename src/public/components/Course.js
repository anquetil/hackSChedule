import React from 'react';
import _ from 'lodash';

export default props => {

  var { removeClass, courseId, courseData, color, anchors, ...other } = props;

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
        <span className='courseid'>{courseId}</span>
        <span className='unit tag'>{courseData.units} units</span>
        <span className='courseTitle'>{courseData.title}</span>
        {(() => {
          if (anchors.length > 0) {
            return(
              <span className='anchors'>⚓ {anchors.join(', ')}</span>
            );
          }
        })()}
      </li>
    );
  }

}
