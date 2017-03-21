import React, { Component } from 'react';
import _ from 'lodash';

import Course from '../components/Course';

import colors from '../func/colors';

import api from '../api-interface';

class Landing extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
			pin: '',
			pinVerify: '',
			readyToEnterPin: false,
			readyToEnterPinVerification: false,
			userAlreadyExists: false,
      errorMessage: '',

      courses: [],
      coursesData: {},
      combinations: [],
      colors: [],
      index: 0,
      hover: null,
      userCount: 0
    };

		this.renderFirstCard = this.renderFirstCard.bind(this);
		this.renderSecondCard = this.renderSecondCard.bind(this);
		this.renderThirdCard = this.renderThirdCard.bind(this);
		this.renderHowItWorks = this.renderHowItWorks.bind(this);
		this.emailOnChange = this.emailOnChange.bind(this);
		this.emailCheckSubmit = this.emailCheckSubmit.bind(this);
		this.emailSubmit = this.emailSubmit.bind(this);

		this.listenToPinKeys = this.listenToPinKeys.bind(this);
		this.goBackToFirst = this.goBackToFirst.bind(this);
		this.goBackToSecond = this.goBackToSecond.bind(this);
		this.goForwardToThird = this.goForwardToThird.bind(this);
		this.verifyPins = this.verifyPins.bind(this);
		this.login = this.login.bind(this);

  }

	componentDidMount() {
		this.refs.email.focus();

		// enables pin typing without input field
		document.addEventListener('keydown', this.listenToPinKeys, false);

		let demoEmail = 'andrewji@usc.edu';
		let pin = '1566';

		// generate courses
		api.get(api.user.schedule(demoEmail))
			.then((response) => {
				response = response || {};
				let courses = response.courses || {};
				let enabledCourses = Object.keys(courses).filter(id => courses[id]);

				this.setState({
					courses: enabledCourses,
					colors: colors.slice(0).splice(0, enabledCourses.length).reverse()
				});

				for (let courseId of enabledCourses) {
					api.get(api.course.data(courseId))
						.then(function (courseData) {
							let coursesData = this.state.coursesData;
							coursesData[courseId] = courseData;
							this.setState({ coursesData });
						}.bind(this));
				}
			});

		api.get(api.user.generateSchedule(demoEmail), { pin })
			.then((results) => {
				this.setState({ combinations: results });
			});

		api.get(api.user.count())
			.then(({count}) => {
				this.setState({ userCount: count });
			});
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.listenToPinKeys);
	}

	renderFirstCard() {
		let { email, errorMessage } = this.state;
		let { emailOnChange, emailCheckSubmit, emailSubmit } = this;
		return (
			<section id='blob'>
				<div id='blurb'>
					Design your perfect class schedule in 10 seconds. <br />
					USC's Spring 2017 course catalog is now available.
				</div>
				<div id='login'>
					<div className='prompt'>Enter your USC email to get started.</div>
					<input type='text'
						ref='email'
						onChange={emailOnChange}
						value={email}
						onKeyDown={emailCheckSubmit}
						placeholder='tommytrojan@usc.edu' />
					<button onClick={emailSubmit}>Go</button>
					<div className='alert'>{errorMessage}</div>
				</div>
			</section>
		);
	}

  emailOnChange(e) {
    this.setState({
			email: e.target.value.toLowerCase()
		});
  }

	emailCheckSubmit(e) {
		if (e.keyCode === 13) {
			e.preventDefault();
			this.emailSubmit();
		}
	}

	emailSubmit(e) {
		let { email } = this.state;
		api.get(api.validate.email(email))
			.then(({ email_format_valid, user_exists }) => {
				this.setState({
					readyToEnterPin: email_format_valid,
					userAlreadyExists: user_exists,
					errorMessage: email_format_valid ? '' : 'Not a valid email'
				});
			});
	}

	renderSecondCard() {
		let { userAlreadyExists, pin, errorMessage } = this.state;
		let { goForwardToThird, login } = this;

		return (
			<section id='blob'>
				<div id='blurb'>
					<b>{userAlreadyExists ? 'Welcome Back!' : 'Create An Account'}</b><br />
					I'm warming up the scheduling algorithm for you
				</div>
				<div id='login'>
					<div className='prompt'>Enter your 4-digit pin number:</div>

					<ul id='pin_group'>
						<li className={pin.length == 0 ? 'active' : ''}>{pin[0]}</li>
						<li className={pin.length == 1 ? 'active' : ''}>{pin[1]}</li>
						<li className={pin.length == 2 ? 'active' : ''}>{pin[2]}</li>
						<li className={pin.length == 3 ? 'active' : ''}>{pin[3]}</li>
					</ul>

					<button onClick={userAlreadyExists ? login : goForwardToThird}>{userAlreadyExists ? 'Go' : 'Next'}</button>
					<div className='alert'>{errorMessage}</div>
				</div>
			</section>
		);
	}

	renderThirdCard() {
		let { pinVerify, errorMessage } = this.state;
		let { verifyPins } = this;

		return (
			<section id='blob'>
				<div id='blurb'>
					<b>Please Remember Your Pin</b><br />
					You will need this to login the next time you come back
				</div>
				<div id='login'>
					<div className='prompt'>Re-Enter your 4-digit pin number:</div>

					<ul id='pin_group'>
						<li className={pinVerify.length == 0 ? 'active' : ''}>{pinVerify[0]}</li>
						<li className={pinVerify.length == 1 ? 'active' : ''}>{pinVerify[1]}</li>
						<li className={pinVerify.length == 2 ? 'active' : ''}>{pinVerify[2]}</li>
						<li className={pinVerify.length == 3 ? 'active' : ''}>{pinVerify[3]}</li>
					</ul>

					<button onClick={verifyPins}>Verify</button>
					<div className='alert'>{errorMessage}</div>
				</div>
			</section>
		);
	}

	listenToPinKeys(e) {
		let { readyToEnterPin, readyToEnterPinVerification, pin, pinVerify, userAlreadyExists } = this.state;
		let { goBackToFirst, goBackToSecond, goForwardToThird, verifyPins, login } = this;

		if (readyToEnterPin || readyToEnterPinVerification) {
			if (e.keyCode === 8) { // backspace
				e.preventDefault();
				if (readyToEnterPin) {
					if (pin.length > 0) {
						this.setState({
							pin: pin.slice(0, -1)
						});
					} else {
						goBackToFirst();
					}
				} else {
					if (pinVerify.length > 0) {
						this.setState({
							pinVerify: pinVerify.slice(0, -1)
						});
					} else {
						goBackToSecond();
					}
				}
			} else if (e.keyCode >= 48 && e.keyCode <= 57) { // is number
				e.preventDefault();
				if (readyToEnterPin) {
					if (pin.length < 4) {
						this.setState({
							pin: pin + String(e.keyCode - 48)
						});
					}
				} else {
					if (pinVerify.length < 4) {
						this.setState({
							pinVerify: pinVerify + String(e.keyCode - 48)
						});
					}
				}
			} else if (e.keyCode === 13) { // enter
				e.preventDefault();
				if (readyToEnterPin && pin.length == 4) {
					if (userAlreadyExists) login();
					else goForwardToThird();
				} else if (pinVerify.length == 4) {
					verifyPins();
				} else {
					this.setState({
						errorMessage: 'Not enough digits'
					});
				}
			}
		}
	}

	goBackToFirst() {
		this.setState({
			pin: '',
			readyToEnterPin: false,
			errorMessage: ''
		}, () => {
		    this.refs.email.focus();
		});
	}

	goBackToSecond() {
		this.setState({
			pinVerify: '',
			readyToEnterPinVerification: false,
			readyToEnterPin: true,
			errorMessage: ''
		});
	}

	goForwardToThird() {
		let { pin } = this.state;
		if (pin.length < 4) {
			this.setState({
				errorMessage: 'Not enough digits.'
			});
		} else {
			this.setState({
				pinVerify: '',
				readyToEnterPinVerification: true,
				readyToEnterPin: false,
				errorMessage: ''
			});
		}
	}

	verifyPins() {
		let { pin, pinVerify } = this.state;
		let { login } = this;

		if (pinVerify.length < 4) {
			this.setState({
				errorMessage: 'Not enough digits.'
			});
		} else {
			this.setState({
				errorMessage: ''
			});
			if (pin === pinVerify) {
				login();
			}
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
					this.context.router.push({
						pathname: '/' + userData.email,
						state: { pin }
					});
				}
			});
	}

	renderHowItWorks() {
		let { combinations, courses, coursesData, colors, hover, userCount } = this.state;

		return (<section id='how_it_works'>
			<h1>How it works</h1>
			<p>The worst part about course registration is making sure the sections in your classes don't overlap.</p>
			<p>HackSChedule solves this by generating a huge list of potential schedules. Let's say you're taking the classes listed below.</p>
			<p>There are {combinations.length} ways to arrange your schedule.</p>

			<ul id='courselist'>
				{courses.map((courseId, i) => {
					let item = [<Course
						className={(i === hover) ? 'hover' : ''}
						onMouseEnter={(e) => {this.setState({ hover: i })}}
						onMouseLeave={(e) => {this.setState({ hover: null })}}
						removeClass={()=>{}}
						courseId={courseId}
						courseData={coursesData[courseId]}
						color={colors[i]}
						anchors={[]}
					/>];
					if (i !== courses.length - 1) {
						item.push(<li className='txt'>+</li>);
					} else {
						item.push(<li className='txt'>= {combinations.length} schedules</li>);
					}
					return item;
				})}
			</ul>

			<p>Try it out with your schedule!</p>
			<p style={{ fontSize: 10 }}>User count: {userCount}</p>
		</section>);
	}

  render() {
		let { readyToEnterPin, readyToEnterPinVerification } = this.state;
		let { renderFirstCard, renderSecondCard, renderThirdCard, renderHowItWorks } = this;
    return (
      <main id='landing'>
        <div id='logo' />
				{readyToEnterPinVerification ? renderThirdCard() : readyToEnterPin ? renderSecondCard() : renderFirstCard()}
        {renderHowItWorks()}
      </main>
    );
  }

};

Landing.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default Landing;
