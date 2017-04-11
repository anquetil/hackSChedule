function convertMinToTime(mins) {
	if (mins === null) return null;
	let hour = Math.floor(mins/60) % 12;
	if (hour == '0') hour += 12;
	let min = ('0' + (mins % 60)).slice(-2);
	let ampm = (Math.floor(mins/60) >= 12) ? 'pm' : 'am';
	return hour + ':' + min + '' + ampm;
}

function convertTimeToMin(time) {
	// ex: convert '13:50' to '830'
	if (!time) return null;
	if (Number.isInteger(time)) return time;
	var time = time.split(':');
	if (time.length != 2) return parseInt(time);
	return Math.round(time[0]) * 60 + Math.round(time[1]);
}

export {
	convertMinToTime, 
	convertTimeToMin 
};
