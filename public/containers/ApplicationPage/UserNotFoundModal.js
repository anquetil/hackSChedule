import React from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';

const UserNotFoundModal = props => (
	<section className={classnames('modal')}>
		<h1 style={{ textAlign: 'center', margin: 100 }}>
			User does not exist. <Link to={`/`}>Go back.</Link>
		</h1>
	</section>
);

export default UserNotFoundModal;
