import React, { Component } from 'react';
import classNames from 'classnames';
import _ from 'lodash';

import Block from '../components/Block';
import ExportModal from '../components/ExportModal';
import EventBlock from '../components/EventBlock';

class Calendar extends Component {

	constructor(props) {
		super(props);
		this.state = {
			lowerHrLim: 7,
			times: [ '', '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p' ],
			days: { U: 'Sun', M: 'Mon', T: 'Tue', W: 'Wed', H: 'Thu', F: 'Fri', S: 'Sat', A: 'TBA' },
			events: { A: []},
			ghostEvents: {},
			hour: 64,
			hoverIndex: null,
			show_export: false,
			createBlock: null,
			startPos: null,
			endPos: null,
			dragState: "STOP",
		};
		this.createBlockDown = this.createBlockDown.bind(this);
		this.createBlockMove = this.createBlockMove.bind(this);
		this.createBlockUp = this.createBlockUp.bind(this);
		this.createBlockClear = this.createBlockClear.bind(this);
	}

	getCursorY(e) {
		var bounds = this.refs.calwrap.getBoundingClientRect();
		var y = e.clientY - bounds.top + this.refs.calwrap.scrollTop;
		return y - (y % (this.state.hour / 4));
	}

	createBlockDown(e) {
		this.setState({
			startPos: this.getCursorY(e),
			endPos: this.getCursorY(e),
			dragState: "START"
		});
	}

	createBlockMove(e) {
		if (this.state.dragState != "STOP") {
			this.setState({ endPos: this.getCursorY(e), dragState: "DRAGGING" });
			this.props.setHover(null);
		} else {
			this.setState({ startPos: this.getCursorY(e), endPos: this.getCursorY(e) });
		}
	}

	createBlockUp(e) {
		let { startPos, endPos, hour, lowerHrLim, createBlock } = this.state;
		let { addBlock } = this.props;

		let mins = 60;
		startPos = Math.round(((startPos / hour) + lowerHrLim) * mins);
		endPos = Math.round(((endPos / hour) + lowerHrLim) * mins);

		if (startPos < endPos && createBlock) {
			addBlock(startPos, endPos, createBlock);
		} else if (endPos < startPos && createBlock) {
			addBlock(endPos, startPos, createBlock);
		}

		this.createBlockClear(e);
	}

	createBlockClear(e) {
		let { dragState } = this.state;
		if (dragState != "STOP") {
			this.setState({
				createBlock: null,
				startPos: null,
				endPos: null,
				dragState: "STOP"
			});
		}
	}

	componentWillReceiveProps(nextProps) {

		this.generateEvents(
			nextProps.coursesData,
			nextProps.coursesSections,
			nextProps.combinations[nextProps.index],
			nextProps.index,
			nextProps.hoverIndex
		);

		if (this.props.ghostIndex != nextProps.ghostIndex) {
			this.generateEvents(
				nextProps.coursesData,
				nextProps.coursesSections,
				nextProps.combinations[nextProps.ghostIndex],
				nextProps.ghostIndex, -1, true
			);
		}
	}

	// just believe that this works :)
	generateEvents(coursesData, sectionsData, combinations, index, hoverIndex, ghost = false) {
		let { days, lowerHrLim, hour, dragState } = this.state;
		let { courses, anchors, toggleAnchor, setHover } = this.props;

		function convertToMin(time) {
		  // ex: convert '13:50' to '830'
		  if (!time) return null;
		  if (Number.isInteger(time)) return time;
		  var time = time.split(':');
		  if (time.length != 2) return parseInt(time);
		  return Math.round(time[0]) * 60 + Math.round(time[1]);
		}

		let events = _.mapValues(this.state.days, () => ([]));
		if (combinations && (!ghost || index != this.props.index)) {
			for (let courseId in combinations) {
				let courseIndex = Object.keys(courses).indexOf(courseId);
				let sections = sectionsData[courseId];
				if (!sections) continue;
				let combination = combinations[courseId];
				for (let sectionId of combination) {
					let firstSectionId = sectionId.split('/')[0];
					for (let key in sections[firstSectionId].blocks) {
						let block = sections[firstSectionId].blocks[key];
						let anchored = (anchors[courseId] && anchors[courseId].indexOf(sectionId) >= 0);

						let blockStart = convertToMin(block.start);
						let blockEnd = convertToMin(block.end);

						let mins = 60;
						let top = Math.round(((blockStart / mins) - lowerHrLim) * hour);
						let height = Math.round((blockEnd - blockStart) / mins * hour);

						let newBlock = <Block
							key={courseId + '.' + firstSectionId + '.' + key}
							className={classNames({ ghost: (ghost) })}
							hovers={(hoverIndex === courseIndex)}
							onMouseEnter={function (e) { setHover(courseIndex) }}
							onMouseLeave={function (e) { setHover(null) }}
							top={top} height={height}
							lowerHrLim={this.state.lowerHrLim}
							color={this.props.colors[courseIndex]}
							courseId={courseId}
							sectionId={sectionId}
							onMouseUp={(e) => {
								if (dragState != "DRAGGING") {
									toggleAnchor(courseId, sectionId);
								}
							}}
							anchored={anchored}
							start={blockStart}
							end={blockEnd}
							location={block.location}
							sectionData={sections[firstSectionId]} />;

						if (!block.day) events['A'].push(newBlock);
						else events[block.day].push(newBlock);
					}
				}
			}
		}

		if (!ghost) {
			this.setState({ events, hoverIndex });
		} else {
			this.setState({ ghostEvents: events });
		}
	}


	render() {

		let { paid, loading, colors } = this.props;
		let { courses, coursesData, coursesSections, combinations, anchors, blocks } = this.props;
		let { index, hoverIndex, ghostIndex } = this.props;
		let { sethover, toggleAnchor, addBlock, removeBlock, regenerate, openUpgrade } = this.props;

		let { events, days, times, hour, lowerHrLim, createBlock, startPos, endPos, dragState, show_export, ghostEvents } = this.state;
		let { createBlockDown, createBlockMove, createBlockUp, createBlockClear } = this;

		let blank = [];
		for (var i in times) {
			blank.push(<li key={i} style={{ height: hour }}/>);
		}

		let width = (events['A'].length > 0) ? 100 / 8 + '%' : 100 / 7 + '%';

		let enabledCourses = Object.keys(courses).filter(id => courses[id]);

		let eventBlocks = _.toArray(_.mapValues(blocks, (value, key) => ({ key, block: value })));

		return (
			<section id='calendar' className={classNames({ full: false, loading })}>
				<ul id='days'>
					{Object.keys(days).map(day => {
						if (day !== 'A' || (day === 'A' && events.A.length > 0)) {
							return <li key={day} style={{width}}>{days[day]}</li>;
						}
					})}
				</ul>
				<div id='calwrap' ref='calwrap'
					onMouseDown={createBlockDown}
					onMouseMove={createBlockMove}
					onMouseUp={createBlockUp}
					onMouseLeave={createBlockClear}>

					<ul className='time'>{times.map(time => (<li key={time}>{time}</li>))}</ul>
					{Object.keys(this.state.days).map(day => {
						if (day !== 'A' || (day === 'A' && events['A'].length > 0)) {
							return (
								<ul key={day} id={day} className='col' style={{width}}
									onMouseOver={() => this.setState({ createBlock: day })}>

									{(() => { if (day !== 'A') return blank })()}

									{events[day]}

									{eventBlocks.map(({ block, key }) => {
										if (day === block.day) {
											let mins = 60;
											let top = Math.round(((block.start / mins) - lowerHrLim) * hour);
											let height = Math.round((block.end - block.start) / mins * hour);

											return <EventBlock
												key={key}
												top={top}
												height={height}
												className="block"
												onClick={() => this.props.removeBlock(key)} />;
											}
										})}

										{ghostEvents[day]}

										{(() => {
											if (createBlock === day && startPos) {
												let top = (startPos <= endPos) ? startPos : endPos;
												let height = Math.abs(endPos - startPos);
												return <EventBlock top={top} height={height}
													className={classNames('create', { drag: dragState == "DRAGGING" })} />;
											}
										})()}

									</ul>
								);
							}
						})}
					</div>

					{(() => {
						if (enabledCourses.length > 0 && combinations.length <= 0 && !loading) {
							return (
								<div className='alert'>
									<b>🙊 Uh oh!</b>
									<p>It seems like the courses you want to take aren't possible together. There are irresolvable section conflicts. If you have anchors, you can try removing them.</p>
								</div>
							);
						}
					})()}

					{(() => {
						if (!paid) {
							return (
								<div id="upgrade_button">
									<button onClick={openUpgrade} className="accent">Upgrade</button>
								</div>
							)
						}
					})()}

					{(() => {
						if (enabledCourses.length > 0 && !loading) {
							return (
								<div id="courses_actions">
									<button onClick={regenerate}>Regenerate</button>
									<button onClick={()=>{
										this.setState({ show_export: !show_export });
									}} className='blue'>{!show_export ? 'Export' : 'Close'}</button>
									{(() => {
										if (show_export) {
											return(<ExportModal
												courses={enabledCourses}
												combination={(index in combinations) ? combinations[index] : {}}
											/>);
										}
									})()}
								</div>
							);
						}
					})()}
				</section>
			);
		}

	}

	export default Calendar;
