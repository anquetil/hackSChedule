import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import api from '../../utils/api-interface';
import { EnterPinCard } from '../../components/stages';
import PinGroup from '../../components/PinGroup';

class UserEnterPinModal extends Component {
	constructor (props) {
		super(props);
		this.state = {
			email: props.email,
			pin: '',
			errorMessage: ''
		};
		this.login = this.login.bind(this);
	}

	login() {
		const { email, pin } = this.state;
		const { close } = this.props;

		if (pin.length < 4)
			return this.setState({ errorMessage: 'Not enough digits.' });

		api.post(api.user.data(email), { pin })
			.then((userData) => {
				if ('error' in userData)
					this.setState({ errorMessage: 'Unable to login' });
				else {
					close({
						action: 'LOGIN',
						user: userData,
						pin: pin
					});
				}
			});
	}

	render() {
		let { email, errorMessage, pin } = this.state;

		let username = email.split('@')[0].split('.')[0];
		username = username.charAt(0).toUpperCase() + username.slice(1);

		return <section className={classnames('modal')}>
			<EnterPinCard
				username={username}
				submit={this.login}
				alert={errorMessage}>
				<PinGroup
					initialPin={pin}
					numberOfDigits={4}
					onEnter={this.login}
					onUpdate={newPin => this.setState({ pin: newPin })}/>
			</EnterPinCard>
		</section>;
	}
}

UserEnterPinModal.propTypes = {
	close: PropTypes.func
};

export default UserEnterPinModal;
