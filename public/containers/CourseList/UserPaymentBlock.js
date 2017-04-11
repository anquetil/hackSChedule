import React, { Component } from 'react';
import classnames from 'classnames';
import api from '../../utils/api-interface';
import StripeCheckout from 'react-stripe-checkout';

class UserPaymentBlock extends Component {
	constructor(props) {
		super(props);

		this.state = {
			errorMessage: '',
			paymentInProgress: false,
			paid: false
		};

		if (window.location.hostname == 'hackschedule.com') {
			this.stripeKey = 'pk_live_qmovCOmw8NHmyjlH9PPu3Jgp';
		} else {
			this.stripeKey = 'pk_test_VJUKGjbH9Amo8DwJhqDeCAtM';
		}

		this.socket = io();
		this.onToken = this.onToken.bind(this);
		this.close = this.close.bind(this);
		this.userChangedPaid = this.userChangedPaid.bind(this);
	}

	componentWillMount() {
		this.socket.on('receive:userChangedPaid', this.userChangedPaid);
	}

	componentWillUnmount() {
		this.socket.off('receive:userChangedPaid', this.userChangedPaid);
	}

	userChangedPaid({ email: userChangedEmail, paid }) {
		const { email } = this.props;
		if (email == userChangedEmail && paid)
			this.setState({ paid });
	}

	renderPayment() {
		const { email } = this.props;
		const { errorMessage, paymentInProgress } = this.state;

		return <div className='start upgrade'>
			<h3 className='red'>Upgrade Features for $2 🙏</h3>
			<div>
				<p>Hosting and maintaining this service is expensive!
				I need your help to offset the costs of building and running this app.
				For $2, you get to unlock the ability to <b>see more than 25 options, pin class sections, and block out unavailabilities</b>!</p>
			</div>

			<div>
				<StripeCheckout
					token={this.onToken}
					stripeKey={this.stripeKey}
					name="HackSChedule Upgrade"
					description="by Andrew Jiang"
					amount={200}
					currency="USD"
					allowRememberMe={false}
					email={email}>
					<button className="red">Pay With Card</button>
				</StripeCheckout>
				<button className="blue" onClick={() => {
					window.open('https://venmo.com/?txn=pay&audience=friends&recipients=ninjiangstar&amount=2&note=hackschedule_id:' + email.split('@')[0])
				}}>Venmo</button>
			</div>
			{(() => {
				if (errorMessage.length > 0) return <div className='alert'>{errorMessage}</div>;
			})()}
		</div>;
	}

	renderThankYou() {
		return <div className='start upgrade'>
			<p><b>Thank you and good luck!</b></p>
			<button onClick={this.close}>Activate Upgrades Now</button>
		</div>;
	}

	render() {
		const { paid } = this.state;
		const { paid: isUserPaid } = this.props;

		if (isUserPaid) return null;
		else if(!paid) return this.renderPayment();
		else return this.renderThankYou();
	}

	onToken(token) {
		let { email, pin } = this.props;

		this.setState({ paymentInProgress: true, errorMessage: '' });

		api.post(api.user.pay(email), { pin, token })
			.then(response => {
				if (response.paid) {
					this.setState({ paid: true });
				} else {
					this.setState({
						paymentInProgress: false,
						paid: false,
						errorMessage: 'Unable to process payment: ' + response.error
					});
				}
			});
  }

	close() {
		this.props.close({
			action: 'PAYMENT',
			paid: this.state.paid
		});
	}
}


export default UserPaymentBlock;
