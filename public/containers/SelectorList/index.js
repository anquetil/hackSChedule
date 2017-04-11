import React, { Component, PropTypes } from 'react';
import SelectorListItem from './SelectorListItem';

class SelectorListContainer extends Component {

	constructor(props) {
		super(props);
		this.keyboardCommands = this.keyboardCommands.bind(this);
		this.goPrev = this.goPrev.bind(this);
		this.goNext = this.goNext.bind(this);
	}

	componentDidMount() {
		document.addEventListener('keydown', this.keyboardCommands, false);
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.keyboardCommands);
	}

	keyboardCommands(e) {
		if([37, 38, 39, 40].indexOf(e.keyCode) > -1){
			e.preventDefault();
			if(e.keyCode == 37 || e.keyCode == 38) this.goPrev();
			else this.goNext();
		}
	}

	goPrev() {
		const {
			combinationIndex: index,
			isUserPaid,
			setCombinationIndex
		} = this.props;
		if (index > 0 && (isUserPaid || index < 25))
			setCombinationIndex(index - 1);
	}

	goNext() {
		const {
			combinationIndex: index,
			isUserPaid,
			combinations,
			setCombinationIndex
		} = this.props;
		let max = combinations.length;
		if (!isUserPaid) max = 25;

		if (index < max - 1) setCombinationIndex(index + 1);
		else setCombinationIndex(max - 1);
	}

	render() {
		const {
			isUserPaid,
			isDisabled,
			hasCourses,
			combinations,
			combinationIndex: index,
			combinationGhostIndex: ghostIndex,
			setCombinationIndex,
			setCombinationGhostIndex
		} = this.props;

	  if (!hasCourses) return <section id="selector" />;
    return <section id='selector'>
      <div id="heading">
        <div className="num">{combinations.length}</div>
        <div className="label">schedules</div>
      </div>
      <ul id="ranks">
        {combinations.slice(0,250).map((combination, key) =>
					<SelectorListItem key={key}
            index={key}
            active={key === index}
            onClick={e => setCombinationIndex(key)}
            onMouseEnter={e => setCombinationGhostIndex(key)}
            onMouseLeave={e => setCombinationGhostIndex(null)}
						disabled={!isUserPaid && key >= 25}
            score={combination.score}
					/>
				)}
      </ul>
			<div className="maxed">{combinations.length > 250 ? 'Showing first 250...' : ''}</div>
    </section>;
	}

}

SelectorListContainer.propTypes = {
	isUserPaid: PropTypes.bool,
	isDisabled: PropTypes.bool,
	hasCourses: PropTypes.bool,

	combinations: PropTypes.array,
	combinationIndex: PropTypes.number,
	combinationGhostIndex: PropTypes.number,

	setCombinationIndex: PropTypes.func,
	setCombinationGhostIndex: PropTypes.func,
};

export default SelectorListContainer;
