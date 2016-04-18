function generateCalendar(){
  var calendar = document.getElementById("calwrap");

  calendar.innerHTML = '<ul id="time"><li class="day"></li></ul>';

  var days = ['U', 'M', 'T', 'W', 'H', 'F', 'S', 'A'];
  for(var key in days) 
    calendar.innerHTML = calendar.innerHTML + '<ul id="'+ days[key] +'" class="cal-col"></ul>';

  calendar = calendar.getElementsByTagName("ul");

  for(var elem in calendar){
    if(elem == 'U') calendar[elem].innerHTML = '<li class="day">Sun</li>';
    else if(elem == 'M') calendar[elem].innerHTML = '<li class="day"><b>Mon</b></li>';
    else if(elem == 'T') calendar[elem].innerHTML = '<li class="day"><b>Tue</b></li>';
    else if(elem == 'W') calendar[elem].innerHTML = '<li class="day"><b>Wed</b></li>';
    else if(elem == 'H') calendar[elem].innerHTML = '<li class="day"><b>Thu</b></li>';
    else if(elem == 'F') calendar[elem].innerHTML = '<li class="day"><b>Fri</b></li>';
    else if(elem == 'S') calendar[elem].innerHTML = '<li class="day">Sat</li>';
    else if(elem == 'A') calendar[elem].innerHTML = '<li class="day"><i>TBA</i></li>';
    
    if('UMTWHFS'.indexOf(elem) > -1)
      for(var i=0; i<16; i++)
        calendar[elem].innerHTML = calendar[elem].innerHTML + '<li></li>';
    
    if(elem == 'time'){
      var timeArr = ['6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p'];
      for(var time in timeArr)
        calendar[elem].innerHTML = calendar[elem].innerHTML + '<li>' + timeArr[time] + '</li>';
    }
  }
}

function getCourse(courseid, callback, err) {
  $.getJSON('/api/method.course',{course: courseid},function(data){
    if(typeof data.error === 'undefined'){
      var obj = {};
      obj[data.prefix + '-' + data.number] = data;
      callback(obj);
    }
    else{
      callback(false);
      err(data.error);
    }
  })
}

function generateCourses(courseHeap, callback, err) {
  $.getJSON('/api/generate.fromHeap',{courseHeap: courseHeap},function(data){
    callback(data);
  });
}

function colorFade(startColor, endColor, index, count){
  var diffR = endColor[0] - startColor[0],
      diffG = endColor[1] - startColor[1],
      diffB = endColor[2] - startColor[2],
      percentFade = (index + 1) / count;
  diffR = Math.round((diffR * percentFade) + startColor[0]);
  diffG = Math.round((diffG * percentFade) + startColor[1]);
  diffB = Math.round((diffB * percentFade) + startColor[2]);
  return [diffR, diffG, diffB];
}

function establishFilters(data){
  var ranksUL = document.getElementById("ranks");
  ranksUL.innerHTML = "";
  for(var i in data){
    ranksUL.innerHTML = ranksUL.innerHTML + '<li data-key="'+ i +'">'+ i +'</li>';
  }
}

function updateCalendar(data, courseHeap){
  var calendar = document.getElementById("calwrap");
  generateCalendar(); // reset calendar

  var colorarr = ["EF5350","AB47BC","5C6BC0","039BE5","009688","689F38","EF6C00","795548","EC407A"];

  var count = 0;
  for(var course in data){
    for(var section in data[course]){
      for(var key in data[course][section]){
        for(var subKey in data[course][section][key].day){
          createEvent(data[course][section][key].day[subKey], data[course][section][key].start, data[course][section][key].end, course, section, colorarr[count]);
        }
      }
    }
    count++;
  }

  function createEvent(day, start, end, courseID, sectionID, color){
    var elem = document.getElementById(day);
    var elemStyle = 'background-color:#'+color+';';
    if(day != 'A'){
      var top = Math.round(((start - 360) / 60) * 50 + 60);
      var height = Math.round((end - start) * 50 / 60);
      elemStyle += 'top:'+top+'px;height:'+height+'px;';
    }

    var newElem = '<li class="event" style="'+ elemStyle +'"><span>'+ courseID + ',' + sectionID+'</span></li>';
    elem.innerHTML = elem.innerHTML + newElem;
  }
}