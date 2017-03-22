import React, { Component } from 'react';
import classNames from 'classnames';
import api from '../api-interface';
import StripeCheckout from 'react-stripe-checkout';

class UserPaymentModal extends Component {
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

		this.onToken = this.onToken.bind(this);
		this.close = this.close.bind(this);
	}

	renderPayment() {
		let { email } = this.props;
		let { errorMessage, paymentInProgress } = this.state;
		return <section className={classNames('modal')}>
			<h1>A Cup of Cold Brew for Andrew ($3)</h1>
			<div style={{ maxWidth: 500, fontSize: 16, textAlign: 'left' }}>
				Hosting and maintaining this service is expensive.
				Please help me offset the server and maintainence costs by buying me a cup of coffee!
				In return, you'll get these features:
			</div>
			<div style={{ textAlign: 'left', maxWidth: 500, fontSize: 14, textAlign: 'left' }}>
				<ol>
					<li>See more than the first 5 options</li>
					<li><b>Anchor</b> the sections that you will definitely take</li>
					<li><b>Block</b> out time that you don't want classes</li>
					<li><b>Enable and disable classes</b> to see combinations works</li>
					<li><b>Optimize</b> for time and/or compactness (w.i.p.)</li>
					<li>Shuffle between options in the same time block (w.i.p.)</li>
				</ol>
			</div>

			<div>
				<StripeCheckout
					token={this.onToken}
					stripeKey={this.stripeKey}
					name="A Cup of Cold Brew for Andrew"
					description="HackSChedule"
					amount={300}
					currency="USD"
					allowRememberMe={false}
					email={email}
				/>
				<button onClick={this.close}>Maybe later</button>
			</div>
			<div className='alert'>{errorMessage}</div>
		</section>;
	}

	renderThankYou() {
		return <section className={classNames('modal')}>
			<h1>Thank you!</h1>
			<div style={{ maxWidth: 400, fontSize: 16 }}>
				All features are unlocked. Good luck!
			</div>
			<br /><br /><br />
			<button onClick={this.close} className="accent">Close</button>
		</section>;
	}

	render() {
		if(!this.state.paid) {
			return this.renderPayment();
		} else {
			return this.renderThankYou();
		}
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


export default UserPaymentModal;
