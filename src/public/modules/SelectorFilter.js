import React from 'react';
import Selector from '../components/Selector';

export default (props) => {

  var { updateCal, combinations, index, ...other} = props;

  return (
    <section id='selector'>
      <ul id="ranks">
        {combinations.map((combination, key) => (<Selector key={key} index={key} active={index} onClick={updateCal.bind(null, key)} />))}
      </ul>
    </section>
  );

};
