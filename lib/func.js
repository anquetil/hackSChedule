

var formatDate = function(date){
	return date == "Mon, Wed" ? "MW"
		: date == "Tuesday" ? "T"
		: date == "Thursday" ? "H"
		: date == "Friday" ? "F"
		: date == "Tue, Thu" ? "TH"
		: date == "Monday" ? "M"
		: date == "Wednesday" ? "W"
		: date == "MWF" ? "MWF"
		: date == "MTuWTh" ? "MTWH"
		: date == "MTuWThF" ? "MTWHF"
		: date == "Wed, Fri" ? "WF"
		: date == "Mon, Fri" ? "MF"
		: date == "TuWThF" ? "TWHF"
		: date == "MTuThF" ? "MTHF"
		: date == "Saturday" ? "S"
		: date == "MThFSU" ? "MTFSU"
		: date == "TuThF" ? "THF"
		: date == "MWTh" ? "MWH"
		: date == "Tue, Fri" ? "TF"
		: date == "Mon, Thu" ? "MH"
		: date == "Thu, Fri" ? "HF"
		: date == "Sat, U" ? "SU"
		: date == "FSU" ? "FSU"
		: date == "Thu, Sat" ? "HS"
		: "";
}

var convertToMin = function(time){
	time = time.split(":");
	if(time[1].indexOf("am")){
		time[1] = time[1].replace("am","");
		if(time[0] == 12) time[0] = 0;
	}
	else if(time[1].indexOf("pm")){
		time[1] = time[1].replace("pm","");
		if(time[0] != 12) time[0] += 12;
	}

	return parseInt(time[0])*60 + parseInt(time[1]);
}

var checkConflict = function(t1s, t1e, t2s, t2e){
	if(t1s == '' || t1e == '' || t2s == '' || t2e == '') return 0; 

	if(convertToMin(t1s) == convertToMin(t2s)) return 1; // definite conflict

	if(convertToMin(t1s) < convertToMin(t2s)){
		if(convertToMin(t1e) > convertToMin(t2s)) return 1;
		else return 0;
	}
	
	if(convertToMin(t2s) < convertToMin(t1s)){
		if(convertToMin(t2e) > convertToMin(t1s)) return 1;
		else return 0;
	}
}

var isDuplicate = function(array, newelem){
	/*
		Lecture
		Discussion
		Lab
		Quiz
		Lecture-Lab
		Lecture-Discussion
	*/
	
	if(newelem =="Lecture"){
		if(array.indexOf("Lecture") > -1) return true; // duplicate of Lecture
		else if(array.indexOf("Lecture-Lab") > -1) return true; // what
		else if(array.indexOf("Lecture-Discussion") > -1) return true; // what
	}

	if(newelem == "Lecture-Lab"){
		if(array.indexOf("Lecture-Lab") > -1) return true;
		else if(array.indexOf("Lecture") > -1) return true;
		else if(array.indexOf("Lecture-Discussion") > -1) return true;
		else if(array.indexOf("Lab") > -1) return true;
	}

	if(newelem == "Lecture-Discussion"){
		if(array.indexOf("Lecture-Discussion") > -1) return true;
		else if(array.indexOf("Lecture") > -1) return true;
		else if(array.indexOf("Lecture-Lab") > -1) return true;
		else if(array.indexOf("Discussion") > -1) return true;
	}

	if(newelem == "Discussion"){
		if(array.indexOf("Discussion") > -1) return true;
		else if(array.indexOf("Lecture-Discussion") > -1) return true;
	}

	if(newelem == "Lab"){
		if(array.indexOf("Lab") > -1) return true;
		else if(array.indexOf("Lecture-Lab") > -1) return true;
	}

	if(newelem == "Quiz"){
		if(array.indexOf("Quiz") > -1) return true;
	}

	return false;
}

module.exports.formatDate = formatDate;
module.exports.convertToMin = convertToMin;
module.exports.checkConflict = checkConflict;
module.exports.isDuplicate = isDuplicate;