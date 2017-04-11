import React, { Component } from 'react';

const Stages = {
	ENTER_EMAIL: 0,
	ENTER_PIN: 1,
	CREATE_PIN: 2,
	VERIFY_PIN: 3,
};

const BlobCardTemplate = ({
	title,
	description,
	prompt,
	alert,

	submitText,
	onSubmit,

	children,
}) => {

	const displayTitle = (title) ? <h1 style={{ fontWeight: 100 }}>{title}</h1> : null;

	return <section id='blob'>
		<div id='blurb'>
			{displayTitle}
			{description}
		</div>
		<div id='login'>
			<div className='prompt'>{prompt}</div>
			{children}
			<button onClick={onSubmit} className="accent">{submitText}</button>
			<div className='alert'>{alert}</div>
		</div>
	</section>;
};

class EnterEmailCard extends Component {

	constructor(props) {
		super(props);
		this.checkSubmit = this.checkSubmit.bind(this);
	}

	componentDidMount() {
		this.refs.emailtextfield.focus();
	}

	checkSubmit(e) {
		const { submit } = this.props;
		if (e.keyCode === 13) {
			e.preventDefault();
			submit(e);
		}
	}

	render() {
		const {
			email,
			emailOnChange,
			submit,
			alert,
		} = this.props;

		const title = "It's Back!";
		const description = <div>Design your perfect class schedule in 10 seconds. <br />
		USC's <b>Fall 2017</b> course catalog is now available.</div>;
		const prompt = "Enter your USC email to get started.";
		const submitText = "Go";
		const placeholder = "tommytrojan@usc.edu";

		return <BlobCardTemplate
			title={title}
			description={description}
			prompt={prompt}
			alert={alert}
			submitText={submitText}
			onSubmit={submit}>
			<input type="text"
				ref="emailtextfield"
				value={email}
				onChange={emailOnChange}
				onKeyDown={this.checkSubmit}
				placeholder={placeholder}/>
		</BlobCardTemplate>;
	}

}

const EnterPinCard = ({
	username,
	children,
	submit,
	alert,
}) => {

	const description = username => <div><b>Welcome Back, {username}!</b><br />
	Warming up the scheduling algorithm...</div>;
	const prompt = "Enter your 4-digit pin number:";
	const submitText = "Go";

	return <BlobCardTemplate
		description={description(username)}
		prompt={prompt}
		alert={alert}
		submitText={submitText}
		onSubmit={submit}>
		{children}
	</BlobCardTemplate>;
};

const CreatePinCard = ({
	children,
	submit,
	alert,
}) => {

	const description = <div><b>Create An Account</b><br />
	Warming up the scheduling algorithm...</div>;
	const prompt = "Enter a new 4-digit pin number:";
	const submitText = "Next";

	return <BlobCardTemplate
		description={description}
		prompt={prompt}
		alert={alert}
		submitText={submitText}
		onSubmit={submit}>
		{children}
	</BlobCardTemplate>;
};

const VerifyPinCard = ({
	children,
	submit,
	alert,
}) => {

	const description = <div><b>Please Remember Your Pin</b><br />
	You will need this to login the next time you come back.</div>;
	const prompt = "Re-Enter your 4-digit pin number:";
	const submitText = "Verify";

	return <BlobCardTemplate
		description={description}
		prompt={prompt}
		alert={alert}
		submitText={submitText}
		onSubmit={submit}>
		{children}
	</BlobCardTemplate>;
};

export {
	Stages,
	EnterEmailCard,
	EnterPinCard,
	CreatePinCard,
	VerifyPinCard
};
