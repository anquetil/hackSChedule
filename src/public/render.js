import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Landing from './views/Landing';
import Scheduler from './views/Scheduler';

render(
  <Router history={browserHistory}>
    <Route path='/'>
      <IndexRoute component={Landing} />
      <Route path='/:userEmail' component={Scheduler} />
    </Route>
  </Router>,
  document.getElementById('app')
);
