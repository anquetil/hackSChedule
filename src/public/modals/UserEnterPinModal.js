import React, { Component } from 'react';
import classNames from 'classnames';
import api from '../api-interface';

class UserEnterPinModal extends Component {
	constructor (props) {
		super(props);
		this.state = {
			email: props.email,
			pin: '',
			errorMessage: ''
		};

		this.listenToPinKeys = this.listenToPinKeys.bind(this);
		this.login = this.login.bind(this);
	}

	componentDidMount() {
		document.addEventListener('keydown', this.listenToPinKeys, false);
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.listenToPinKeys);
	}

	listenToPinKeys(e) {
		let { pin } = this.state;
		if (e.keyCode === 8) { // backspace
			e.preventDefault();
			if (pin.length > 0) {
				this.setState({
					pin: pin.slice(0, -1)
				});
			}
		} else if (e.keyCode >= 48 && e.keyCode <= 57) { // is number
			e.preventDefault();
			if (pin.length < 4) {
				this.setState({ pin: pin + String(e.keyCode - 48) });
			}
		} else if (e.keyCode === 13) { // enter
			e.preventDefault();
			if (pin.length == 4) return this.login();
			this.setState({
				errorMessage: 'Not enough digits'
			});
		}
	}

	login() {
		let { email, pin } = this.state;
		api.post(api.user.data(email), { pin })
			.then((userData) => {
				if ('error' in userData) {
					this.setState({
						errorMessage: 'Unable to login'
					});
				} else {
					this.props.close({
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

		return <section className={classNames('modal')}>
			<div id='blurb'>
				<b>Welcome Back, {username}!</b><br />
				Warming up the scheduling algorithm...
			</div>
			<div id='login'>
				<div className='prompt'>Enter your 4-digit pin number:</div>

				<ul id='pin_group'>
					<li className={pin.length == 0 ? 'active' : ''}>{pin[0]}</li>
					<li className={pin.length == 1 ? 'active' : ''}>{pin[1]}</li>
					<li className={pin.length == 2 ? 'active' : ''}>{pin[2]}</li>
					<li className={pin.length == 3 ? 'active' : ''}>{pin[3]}</li>
				</ul>

				<button onClick={this.login} className="accent">Go</button>
				<div className='alert'>{errorMessage}</div>
			</div>
		</section>;
	}
}

export default UserEnterPinModal;
