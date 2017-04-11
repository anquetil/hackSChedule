import React from 'react';

import HelpBlock from './HelpBlock';

const Instructions = ({ courses, show_help, loading, show, paid, children }) => {
  if ((courses.length <= 0 || show_help) && !loading) {
    return (
      <div id="help">
				<HelpBlock paid={paid} />
        {children}
        {(()=>{
          if (courses.length > 0) {
            return (
              <button onClick={()=>{ show(false) }}>Hide help</button>
            );
          }
        }).bind(this)()}
      </div>
    );
  } else if (!loading) {
    return (
      <div id="help">
        {children}
        <button onClick={()=>{ show(true) }}>Help</button>
      </div>
    );
  } else {
    return (<div id="help" style={{ display: 'none' }}></div>);
  }
};

export default Instructions;
