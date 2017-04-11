import React from 'react';
import { render } from 'react-dom';
import {
	Router,
	Route
} from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory'

import LandingPage from './containers/LandingPage';
import ApplicationPage from './containers/ApplicationPage';

const history = createBrowserHistory();

render(
  <Router history={history}>
		<div>
	    <Route exact path='/' component={LandingPage} />
	    <Route path='/:userEmail' component={ApplicationPage} />
		</div>
  </Router>,
  document.getElementById('app')
);
