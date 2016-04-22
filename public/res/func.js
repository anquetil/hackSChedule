function generateCalendar(){
  var calendar = document.getElementById("calwrap");
  // clear all
  calendar.innerHTML = '<ul id="time"><li class="day"></li></ul>';

  var days = ['U', 'M', 'T', 'W', 'H', 'F', 'S', 'A'];
  var daysLegend = {time: "", U:'Sun', M:'<b>Mon</b>', T:'<b>Tue</b>', W:'<b>Wed</b>', H:'<b>Thu</b>', F:'<b>Fri</b>', S:'Sat', A:'<i>TBA</i>'};
  var timeArr = ['6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p'];
  
  for(var key in days) 
    calendar.innerHTML = calendar.innerHTML + '<ul id="'+ days[key] +'" class="cal-col"></ul>';

  calendar = calendar.getElementsByTagName("ul");

  for(var elem in calendar){
    calendar[elem].innerHTML = '<li class="day">'+daysLegend[elem]+'</li>';
    if(days.indexOf(elem) > -1)
      for(var i=0; i<16; i++)
        calendar[elem].innerHTML = calendar[elem].innerHTML + '<li></li>';
    else if(elem == 'time')
      for(var time in timeArr)
        calendar[elem].innerHTML = calendar[elem].innerHTML + '<li>' + timeArr[time] + '</li>';
  }

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

function updateCalendar(data, courseHeap, index){
  var calendar = document.getElementById("calwrap");
  generateCalendar(); // reset calendar

  var courseList = document.getElementById('courselist');
  courseList = courseList.getElementsByTagName('li');

  for(var course in data){
    var color = '';
    for(var li in courseList){
      if(courseList.item(li).getAttribute('data-course') == course){
        color = window.getComputedStyle(courseList.item(li)).getPropertyValue('background-color');
        break;
      }
    }
    for(var section in data[course]){
      for(var key in data[course][section]){
        for(var subKey in data[course][section][key].day){
          createEvent(data[course][section][key].day[subKey], data[course][section][key].start, data[course][section][key].end, course, section, color, data[course][section][key].closed);
        }
      }
    }
  }

  var ranks = document.getElementById("ranks");
  var rankli = ranks.getElementsByTagName("li");
  for(var elem in rankli){
    if(rankli.item(elem).getAttribute('data-key') == index){
      rankli.item(elem).className = 'active';
    }
    else {
      rankli[elem].className = '';
    }
  }

  function createEvent(day, start, end, courseID, sectionID, color, closed){
    var elem = document.getElementById(day);
    var elemStyle = 'background-color:'+color+';';
    if(day != 'A'){
      var top = Math.round(((start - 360) / 60) * 50 + 60);
      var height = Math.round((end - start) * 50 / 60);
      elemStyle += 'top:'+top+'px;height:'+height+'px;';
    }
    if(closed){
      elemStyle += 'opacity:0.5;'
    }

    var data = courseHeap[courseID].SectionData[sectionID];
    //console.log(data)
    var content = '<span><b>'+courseID+'</b> ('+data.type+')<br>'+sectionID+', '+data.location+'<br>'+data.start_time+'-'+data.end_time+', '+(data.spaces_available-data.number_registered)+'</span>';

    var newElem = '<li class="event" onmouseenter="makeHover(\''+courseID+'\')" onmouseleave="removeHover(\''+courseID+'\')" data-course="'+courseID+'" style="'+ elemStyle +'"><span>'+ content +'</span></li>';
    elem.innerHTML = elem.innerHTML + newElem;
  }
}

function makeHover(courseId){
  $('*[data-course='+courseId+']').addClass("hover").on("click",function(e){
    $(this).toggleClass("superhover");
  });
}

function removeHover(courseId){
  $('*[data-course='+courseId+']').removeClass("hover").removeClass("superhover").on("click",function(e){
    $(this).toggleClass("superhover");
  });
}

var compareScore = function(a, b){
  if (a.score < b.score)
    return -1;
  else if (a.score > b.score)
    return 1;
  else 
    return 0;
}