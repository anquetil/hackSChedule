import React, { Component, PropTypes } from 'react';
import _ from 'lodash';
import api from '../../utils/api-interface';
import { withRouter } from 'react-router'

import {
	Stages,
	EnterEmailCard,
	EnterPinCard,
	CreatePinCard,
	VerifyPinCard
} from '../../components/stages';
import HowItWorks from './HowItWorks';
import PinGroup from '../../components/PinGroup';

class LandingPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
			stage: Stages.ENTER_EMAIL,
      email: '',
			pin: '',
			pinVerify: '',
      errorMessage: '',
    };

		this.emailOnChange = this.emailOnChange.bind(this);
		this.emailSubmit = this.emailSubmit.bind(this);
		this.login = this.login.bind(this);
		this.returnToEnterEmail = this.returnToEnterEmail.bind(this);
		this.continueToVerifyPin = this.continueToVerifyPin.bind(this);
		this.returnToCreatePin = this.returnToCreatePin.bind(this);
		this.verifyPin = this.verifyPin.bind(this);
  }

  emailOnChange(e) {
    this.setState({ email: e.target.value.toLowerCase() });
  }

	emailSubmit(e) {
		api.get(api.validate.email(this.state.email))
			.then(({ email_format_valid, user_exists }) => {
				if (email_format_valid) {
					this.setState({
						stage: user_exists ? Stages.ENTER_PIN : Stages.CREATE_PIN,
						userExists: user_exists,
						errorMessage: '',
					});
				} else {
					this.setState({
						stage: Stages.ENTER_EMAIL,
						userExists: user_exists,
						errorMessage: 'Not a valid email',
					});
				}
			});
	}

	login() {
		const { email, pin } = this.state;
		const { match, location, history } = this.props;

		if (pin.length < 4)
			return this.setState({ errorMessage: 'Not enough digits.' });

		api.post(api.user.data(email), { pin })
			.then((userData) => {
				if ('error' in userData)
					this.setState({ errorMessage: 'Unable to login' });
				else {
					history.push({
						pathname: '/' + userData.email,
						state: { pin }
					});
				}
			});
	}

	returnToEnterEmail() {
		this.setState({
			stage: Stages.ENTER_EMAIL,
			pin: '',
			errorMessage: '',
		});
	}

	continueToVerifyPin() {
		const { pin } = this.state;

		if (pin.length < 4)
			return this.setState({ errorMessage: 'Not enough digits.' });

		this.setState({
			stage: Stages.VERIFY_PIN,
			pinVerify: '',
			errorMessage: '',
		});
	}

	returnToCreatePin() {
		this.setState({
			stage: Stages.CREATE_PIN,
			pinVerify: '',
			errorMessage: '',
		});
	}

	verifyPin() {
		const { pin, pinVerify } = this.state;

		if (pinVerify.length < 4)
			return this.setState({ errorMessage: 'Not enough digits.' });
		if (pin !== pinVerify)
			return this.setState({ errorMessage: 'The pin and verification pin should not be different.' });

		this.login();
	}

	cardConductor() {
		const {
			stage,
			email,
			errorMessage,
			pin,
			pinVerify,
		} = this.state;

		let username = email.split('@')[0].split('.')[0];
		username = username.charAt(0).toUpperCase() + username.slice(1);

		switch (stage) {
			case Stages.ENTER_EMAIL:
				return <EnterEmailCard
					email={email}
					emailOnChange={this.emailOnChange}
					submit={this.emailSubmit}
					alert={errorMessage}/>;
			case Stages.ENTER_PIN:
				return <EnterPinCard
					username={username}
					submit={this.login}
					alert={errorMessage}>
					<PinGroup
						initialPin={pin}
						numberOfDigits={4}
						onClear={this.returnToEnterEmail}
						onEnter={this.login}
						onUpdate={newPin => this.setState({ pin: newPin })}/>
				</EnterPinCard>;
			case Stages.CREATE_PIN:
				return <CreatePinCard
					submit={this.continueToVerifyPin}
					alert={errorMessage}>
					<PinGroup
						initialPin={pin}
						numberOfDigits={4}
						onClear={this.returnToEnterEmail}
						onEnter={this.continueToVerifyPin}
						onUpdate={newPin => this.setState({ pin: newPin })}/>
				</CreatePinCard>;
			case Stages.VERIFY_PIN:
				return <VerifyPinCard
					submit={this.verifyPin}
					alert={errorMessage}>
					<PinGroup
						initialPin={pinVerify}
						numberOfDigits={4}
						onClear={this.returnToCreatePin}
						onEnter={this.verifyPin}
						onUpdate={newPin => this.setState({ pinVerify: newPin })} />
				</VerifyPinCard>;
			default: return null;
		}
	}

  render() {
    return <main id='landing'>
      <div id='logo' />
			{this.cardConductor()}
      <HowItWorks />
    </main>;
  }

};

LandingPage.propTypes = {
	match: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
};

export default withRouter(LandingPage);
