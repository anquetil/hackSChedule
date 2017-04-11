import React from 'react';

const NoCombinationsAlert = ({...other}) => (
	<div className='alert' {...other}>
		<b>🙊 Uh oh!</b>
		<p>It seems like the courses you want to take aren't possible together. There are irresolvable section conflicts. If you have anchors, you can try removing them.</p>
	</div>
);

export default NoCombinationsAlert;
