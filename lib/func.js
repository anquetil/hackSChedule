
/*
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
*/

var convertToMin = function(time){
	time = time.split(":");
	/*
	if(time[1].indexOf("am")){
		time[1] = time[1].replace("am","");
		if(time[0] == 12) time[0] = 0;
	}
	else if(time[1].indexOf("pm")){
		time[1] = time[1].replace("pm","");
		if(time[0] != 12) time[0] += 12;
	}*/

	return parseInt(time[0])*60 + parseInt(time[1]);
}

var checkConflictTime = function(t1s, t1e, t2s, t2e){
	if(t1s == '' || t1e == '' || t2s == '' || t2e == '') return false; 
	if(t1s == 'TBA' || t1e == 'TBA' || t2s == 'TBA' || t2e == 'TBA') return false; 

	if(convertToMin(t1s) == convertToMin(t2s)) return true; // definite conflict

	if(convertToMin(t1s) < convertToMin(t2s)){
		if(convertToMin(t1e) > convertToMin(t2s)) return true;
		else return false;
	}
	
	if(convertToMin(t2s) < convertToMin(t1s)){
		if(convertToMin(t2e) > convertToMin(t1s)) return true;
		else return false;
	}
}

var convertToArray = function(item){
	if(typeof item === 'object') return item;
	if(typeof item === 'undefined') return [];
	return [item];
}

var checkConflict = function(t1, t2){
	// given 2 section data, check for conflict.
	if(t1.day == '' || t2.day == '') return false;
	if(t1.type == 'Qz' || t2.type == 'Qz') return false;
	
	// convert everything to arrays:
	// sometimes there are subsections
	var t1d = convertToArray(t1.day);
	var t2d = convertToArray(t2.day);
	var t1s = convertToArray(t1.start_time);
	var t1e = convertToArray(t1.end_time);
	var t2s = convertToArray(t2.start_time);
	var t2e = convertToArray(t2.end_time);

	for(var d1key in t1d){
		for(var d2key in t2d){

			// cross-check each day of week
			var i = t1d[d1key].length;
			dance:
			while (i--) {
				var j = t2d[d2key].length;
				while(j--) {
					// found a common day!
					if(t1d[d1key][i] == t2d[d2key][j]) {
						// only return true if there is a conflict
						if(checkConflictTime(t1s[d1key], t1e[d1key], t2s[d2key], t2e[d2key])) {
							return true;
						}
						break dance;
					}
				}
			}
			// end of cross-check each day

		}
	}

	// found no conflict
	return false;
}

var isDuplicate = function(array, newelem){
	/*
		Lec
		Dis
		Lab
		Qz
		Lec-Lab
		Lec-Dis
	*/
	
	if(newelem =="Lec"){
		if(array.indexOf("Lec") > -1) return true; // duplicate of Lec
		else if(array.indexOf("Lec-Lab") > -1) return true; // what
		else if(array.indexOf("Lec-Dis") > -1) return true; // what
	}

	if(newelem == "Lec-Lab"){
		if(array.indexOf("Lec-Lab") > -1) return true;
		else if(array.indexOf("Lec") > -1) return true;
		else if(array.indexOf("Lec-Dis") > -1) return true;
		else if(array.indexOf("Lab") > -1) return true;
	}

	if(newelem == "Lec-Dis"){
		if(array.indexOf("Lec-Dis") > -1) return true;
		else if(array.indexOf("Lec") > -1) return true;
		else if(array.indexOf("Lec-Lab") > -1) return true;
		else if(array.indexOf("Dis") > -1) return true;
	}

	if(newelem == "Dis"){
		if(array.indexOf("Dis") > -1) return true;
		else if(array.indexOf("Lec-Dis") > -1) return true;
	}

	if(newelem == "Lab"){
		if(array.indexOf("Lab") > -1) return true;
		else if(array.indexOf("Lec-Lab") > -1) return true;
	}

	if(newelem == "Qz"){
		if(array.indexOf("Qz") > -1) return true;
	}

	return false;
}

//module.exports.formatDate = formatDate;
module.exports.convertToMin = convertToMin;
module.exports.checkConflict = checkConflict;
module.exports.isDuplicate = isDuplicate;