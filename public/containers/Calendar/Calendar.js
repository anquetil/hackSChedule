import React, { Component, PropTypes } from 'react';
import Loading from 'react-loading';
import classnames from 'classnames';
import has from 'has';
import _ from 'lodash';

import {
	lowerHourLimit, hourHeight,
	times, days, daysOrder,
	blank
} from './constants';

import ActionButtons from './ActionButtons';
import DaysLabel from './DaysLabel';
import Week from './Week';
import NoCombinationsAlert from './NoCombinationsAlert';
import EventStack from './EventStack';
import UserBlock from './UserBlock';
import ExportModal from './ExportModal';

// enumeration
const DragStates = {
	STOP: 0,
	START: 1,
	DRAGGING: 2,
	properties: {
		0: 'STOP',
		1: 'START',
		2: 'DRAGGING',
	},
};

class Calendar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			createBlockDay: null,
			createBlockStartPos: null,
			createBlockEndPos: null,
			dragState: DragStates.STOP
		}

		this.getCursorY = this.getCursorY.bind(this);
		this.createBlockDown = this.createBlockDown.bind(this);
		this.createBlockMove = this.createBlockMove.bind(this);
		this.createBlockUp = this.createBlockUp.bind(this);
		this.createBlockClear = this.createBlockClear.bind(this);
		this.createBlockSet = this.createBlockSet.bind(this);
	}

	getCursorY(e) {
		var bounds = this.refs.calwrap.getBoundingClientRect();
		var y = e.clientY - bounds.top + this.refs.calwrap.scrollTop;
		return y - (y % (hourHeight / 4));
	}

	createBlockDown(e) {
		const cursorY = this.getCursorY(e);
		this.setState({
			createBlockStartPos: cursorY,
			createBlockEndPos: cursorY,
			dragState: DragStates.START,
		});
	}

	createBlockMove(e) {
		const dragState = this.state.dragState;
		const cursorY = this.getCursorY(e);
		if (dragState != DragStates.STOP) {
			this.setState({
				createBlockEndPos: cursorY,
				dragState: DragStates.DRAGGING,
			});
			// this.props.setHover(null);
		} else {
			this.setState({
				createBlockStartPos: cursorY,
				createBlockEndPos: cursorY,
			});
		}
	}

	createBlockUp(e) {
		const {
			createBlockDay: blockDay,
			createBlockStartPos: startPos,
			createBlockEndPos: endPos,
		} = this.state;
		const createBlock = this.props.createBlock;

		const mins = 60;
		const startTimeInMinutes = Math.round(((startPos / hourHeight) + lowerHourLimit) * mins);
		const endTimeInMinutes = Math.round(((endPos / hourHeight) + lowerHourLimit) * mins);

		if (startTimeInMinutes < endTimeInMinutes && blockDay) {
			createBlock(startTimeInMinutes, endTimeInMinutes, blockDay);
		} else if (endTimeInMinutes < startTimeInMinutes && blockDay) {
			createBlock(endTimeInMinutes, startTimeInMinutes, blockDay);
		}

		this.createBlockClear(e);
	}

	createBlockClear(e) {
		const dragState = this.state.dragState;
		if (dragState != DragStates.STOP) {
			this.setState({
				createBlockDay: null,
				createBlockStartPos: null,
				createBlockEndPos: null,
				dragState: DragStates.STOP
			});
		}
	}

	createBlockSet(day) {
		this.setState({ createBlockDay: day });
	}

	render() {
		const {
			isDisabled,
			isLoading,
			courses,
			combination,
			events, // object
			ghostEvents,
			blocks,
			createBlock, // function
			refresh, // function
			...other
		} = this.props;

		const {
			createBlockDay: blockDay,
			createBlockStartPos: startPos,
			createBlockEndPos: endPos,
			dragState
		} = this.state;

		const className = classnames({ disabled: isDisabled });
		const showTBA = events['A'].length > 0;
		const contentWidth = showTBA ? (100 / 8) + '%' : (100 / 7) + '%';

		const isCreatingBlock = dragState != DragStates.STOP;
		const showNoCombinationsAlert = courses.length > 0 && combination.length <= 0 && !isDisabled;
		const showActionButtons = courses.length > 0 && !isDisabled;

		const noCombinationsAlert = showNoCombinationsAlert ? <NoCombinationsAlert /> : null;
		const actionButtons = showActionButtons ? <ActionButtons regenerate={refresh}>
				<ExportModal courses={courses} combination={combination} />
			</ActionButtons> : null;
		const creatingBlockElement = <UserBlock
			positionFromTop={startPos < endPos ? startPos : endPos}
			positionHeight={Math.abs(endPos - startPos)}
			className={classnames({ drag: isCreatingBlock })}
			isCreating={true}
		/>;

		const loading = isLoading ? <div
			style={{
				position: 'absolute',
				zIndex: 999,
				left: '50%',
				top: '50%',
				transform: 'translate(-50%, -50%)',
			}}><Loading
			type="spin"
			color="#e93432"
			/></div> : null;

		return <section id="calendar"
			className={className}
			{...other}>
			<DaysLabel showTBA={showTBA} contentWidth={contentWidth} />
			<div id="calwrap" ref="calwrap"
				onMouseDown={this.createBlockDown}
				onMouseMove={this.createBlockMove}
				onMouseUp={this.createBlockUp}
				onMouseLeave={this.createBlockClear}>
				<ul id="timeOfDay">{times.map(time => <li key={time}>{time}</li>)}</ul>
				<Week showTBA={showTBA}
					contentWidth={contentWidth}
					events={events}
					ghostEvents={ghostEvents}
					blocks={blocks}
					creatingBlockDay={blockDay}
					creatingBlockElement={creatingBlockElement}
					createBlockSet={this.createBlockSet}/>
			</div>
			{noCombinationsAlert}
			{actionButtons}
			{loading}
		</section>;
	}

};

Calendar.propTypes = {
	isDisabled: PropTypes.bool,
	isLoading: PropTypes.bool,
	courses: PropTypes.arrayOf(PropTypes.string),
	combination: PropTypes.object,
	events: PropTypes.objectOf(PropTypes.array),
	ghostEvents: PropTypes.objectOf(PropTypes.array),
	blocks: PropTypes.objectOf(PropTypes.array),
	createBlock: PropTypes.func,
	refresh: PropTypes.func,
};

Calendar.defaultProps = {
	isDisabled: false,
	isLoading: false,
	courses: [],
	combination: {}
}

export default Calendar;
