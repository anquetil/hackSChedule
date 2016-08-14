import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Landing from './views/Landing';
import Scheduler from './views/Scheduler';

export default () => (
<Router history={browserHistory}>
  <Route path='/'>
    <IndexRoute component={Scheduler} />
    {/*<Route path='/:userId' component={Scheduler} />*/}
  </Route>
</Router>
);
