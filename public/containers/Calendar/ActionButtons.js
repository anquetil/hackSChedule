import React, { Component, PropTypes } from 'react';

class ActionButtons extends Component {

	constructor(props) {
		super(props);

		this.state = {
			isExportHidden: true
		};

		this.toggleExport = this.toggleExport.bind(this);
	}

	toggleExport() {
		const { isExportHidden } = this.state;

		this.setState({
			isExportHidden: !isExportHidden
		});
	}

	render() {
		const { toggleExport } = this;
		const { regenerate, children } = this.props;
		const { isExportHidden } = this.state;

		return <div id="courses_actions">
			<button onClick={regenerate}>Regenerate</button>
			<button onClick={toggleExport} className="blue">{isExportHidden ? 'Export' : 'Close'}</button>
			{!isExportHidden ? children : null}
		</div>;
	}

}

ActionButtons.propTypes = {
	regenerate: PropTypes.func.isRequired
};

export default ActionButtons;
