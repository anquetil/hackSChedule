import { Link } from 'react-router';
import classNames from 'classnames';

const UserNotFoundModal = props => (
	<section className={classNames('modal')}>
		<h1 style={{ textAlign: 'center', margin: 100 }}>
			User does not exist. <Link to={`/`}>Go back.</Link>
		</h1>
	</section>
);

export default UserNotFoundModal;
