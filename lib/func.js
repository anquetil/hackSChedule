var convertToMin = function(time){
  time = time.split(":");

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

var compareScore = function(a, b){
  if (a.score < b.score)
    return -1;
  else if (a.score > b.score)
    return 1;
  else 
    return 0;
}

module.exports.convertToMin = convertToMin;
module.exports.checkConflict = checkConflict;
module.exports.compareScore = compareScore;