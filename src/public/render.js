import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Landing from './views/Landing';
import Scheduler from './views/Scheduler';

// https only
var loc = window.location.href+'';
if (loc.indexOf('http://')==0){
    window.location.href = loc.replace('http://','https://');
}

render(
  <Router history={browserHistory}>
    <Route path='/'>
      <IndexRoute component={Landing} />
      <Route path='/:userEmail' component={Scheduler} />
    </Route>
  </Router>,
  document.getElementById('app')
);
