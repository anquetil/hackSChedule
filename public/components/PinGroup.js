import React, { Component, PropTypes } from 'react';

class PinGroup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			pin: props.initialPin
		};

		this.listenToPinKeys = this.listenToPinKeys.bind(this);
		this.onUpdate = this.onUpdate.bind(this);
	}

	componentDidMount() {
		document.addEventListener('keydown', this.listenToPinKeys, false);
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.listenToPinKeys);
	}

	listenToPinKeys(e) {
		const isMeta = e.metaKey || e.shiftKey || e.altKey || e.ctrlKey;
		const isBackspace = e.keyCode === 8;
		const isNumber = e.keyCode >= 48 && e.keyCode <= 57;
		const isEnter = e.keyCode === 13;

		// don't perform action if combined with ctrl, shift, alt, or command
		if (isMeta) return;

		const { pin } = this.state;
		const {
			numberOfDigits,
			onClear,
			onOverflow,
			onEnter
		} = this.props;

		if (isBackspace || isNumber || isEnter) e.preventDefault();

		if (isBackspace) {
			const newPin = pin.slice(0, -1);
			if (pin.length > 0) this.setState({ pin: newPin }, this.onUpdate);
			else onClear();
		}
		else if (isNumber) {
			const newPin = pin + String(e.keyCode - 48);
			if (pin.length < numberOfDigits) this.setState({ pin: newPin }, this.onUpdate);
			if (newPin.length === numberOfDigits) onOverflow();
		}
		else if (isEnter) {
			const isFilled = pin.length === numberOfDigits;
			onEnter(pin, isFilled);
		}
	}

	onUpdate() {
		const { pin } = this.state;
		const { onUpdate, numberOfDigits } = this.props;
		const isFilled = pin.length === numberOfDigits;
		onUpdate(pin);
	}

	render() {

		const {
			initialPin,
			numberOfDigits,
			onClear,
			onOverflow,
			onEnter,
			onUpdate,
			...other
		} = this.props;

		const { pin } = this.state;

		return <ul id='pin_group' {...other}>
			{new Array(numberOfDigits).fill(null).map((_, index) =>
				<li key={index} className={pin.length === index ? 'active' : ''}>{pin[index] || null}</li>
			)}
		</ul>;
	}
}

PinGroup.propTypes = {
	initialPin: PropTypes.string,
	numberOfDigits: PropTypes.number,

	onClear: PropTypes.func,
	onOverflow: PropTypes.func,
	onEnter: PropTypes.func,
	onUpdate: PropTypes.func,
};

PinGroup.defaultProps = {
	initialPin: '',
	numberOfDigits: 4,
	onClear: () => {},
	onOverflow: () => {},
	onEnter: () => {},
	onUpdate: () => {},
};

export default PinGroup;
