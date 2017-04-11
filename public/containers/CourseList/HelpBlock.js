import React from 'react';
import classnames from 'classnames';

const HelpBlock = ({ paid }) => (
	<div className='start'>
		<b>Generate a perfect schedule 📅</b>
		<div>
			<p>Instead of you spending hours trying to figure out which sections work, HackSChedule will generate all possible schedules for you. All you have to do is pick the one you prefer.</p>
			<ol>
				<li>Enter the classes that you will be taking. E.g. <span>CSCI-201</span>, <span>CTAN-450C</span>.</li>
				<li>Browse different schedules on the right. Use arrow keys <span>&uarr;</span> and <span>&darr;</span>.</li>
				<li className={classnames({disabled: !paid})}>Enable/disable classes by clicking them on the left.</li>
				<li className={classnames({disabled: !paid})}>Click and drag from anywhere on the calendar to <span>block</span> off that time. Click the blocks to remove them.</li>
				<li className={classnames({disabled: !paid})}>Click the sections you will definitely take to <span>anchor</span> them. The <span>red</span> border tells you they're anchored.</li>
				<li>Export your schedule and enjoy the hours you've saved!</li>
			</ol>
		</div>
	</div>
);

export default HelpBlock;
