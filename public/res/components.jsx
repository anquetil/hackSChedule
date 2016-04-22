/* ***** GLOBAL VARIABLES ***** */

var socket = io("/schedule");

/* ***** GENERIC COMPONENTS ***** */

var Button = React.createClass({
  render: function(){
    return <div className="button" id={this.props.id} onClick={this.props.action}>{this.props.value}</div>
  }
});

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

/* ***** MASTER APP ***** */

var HackSChedule = React.createClass({
  getInitialState: function(){
    return {
      courseIdArr: [], 
      courseHeap: {},
      courseCombinations: [],
      tempCombinations: [],
      APP: {}
    };
  },
  componentDidMount: function(){
    var prop = this;
    var time = 0;

    socket.on('update courses', function(data){
      if(data.add) $(prop.state.APP).trigger('clearText');
      prop.setState({
        courseIdArr: data.courseIdArr,
        courseHeap: data.courseHeap,
        courseCombinations: [],
        tempCombinations: []
      });
      time = Date.now();
    });

    socket.on('add schedule', function(data){
      var newCourseCombinations = prop.state.tempCombinations.concat([data]);
      //newCourseCombinations.sort(compareScore);
      prop.setState({
        tempCombinations: newCourseCombinations
      });
    });

    socket.on('end generation', function(){
      prop.setState({
        courseCombinations: prop.state.tempCombinations.sort(compareScore),
        tempCombinations: []
      });

      $(prop.state.APP).trigger('updateCalendar', 0);
      $(prop.state.APP).trigger('resetFilter');
      console.log(Date.now() - time);

      function compareScore(a, b){
        if (a.score < b.score)
          return -1;
        else if (a.score > b.score)
          return 1;
        else 
          return 0;
      }
    });

    $(document.body).on('keydown',function(e){
      if([37,38,39,40].indexOf(e.keyCode) > -1){
        e.preventDefault();
        //console.log(e.keyCode);
        if(e.keyCode == 37 || e.keyCode == 38)
          $(prop.state.APP).trigger('goPrev');
        else $(prop.state.APP).trigger('goNext');
      }
    }).on('keydown','input',function(e){
      if([37,38,39,40].indexOf(e.keyCode) > -1)
        e.stopPropagation();
    });

  },
  render: function(){
    return (
      <main>
        <section id="coursecontainer">
          <div id="hackschedule"></div>
          <div id="courseListApp"><CourseListApp courseIdArr={this.state.courseIdArr} courseHeap={this.state.courseHeap} APP={this.state.APP} /></div>
          <div id="credits"><a href="http://github.com/ninjiangstar/hackSChedule">Github</a></div>
        </section>

        <section id="calendar"><CalendarApp courseIdArr={this.state.courseIdArr} courseCombinations={this.state.courseCombinations} courseHeap={this.state.courseHeap} APP={this.state.APP}/></section>

        <section id="filtercontainer">
          <FilterApp courseCombinations={this.state.courseCombinations} courseHeap={this.state.courseHeap} APP={this.state.APP} />
        </section>
      </main>
    );
  }
});

/* ***** COURSE LIST APP ***** */

var CourseListItem = React.createClass({
  itemShow: function(courseid){
    $("#calwrap").find("li[data-course="+courseid+"]").addClass("hover");
  },
  itemLeave: function(courseid){
    $("#calwrap").find("li[data-course="+courseid+"]").removeClass("hover");
  },
  createItem: function(item, index){
    var count = (this.props.courseIdArr.length > 2) ? this.props.courseIdArr.length : 2;
    var rgb = 'rgb(' + colorFade([233,52,50],[233,167,30], index, count) + ')';
    return (
      <li key={item} data-course={item} onMouseEnter={this.itemShow.bind(null, item)} onMouseLeave={this.itemLeave.bind(null, item)} style={{backgroundColor:rgb}}>
        <span className="close" onClick={this.props.removeClass.bind(null, item)}>×</span>
        <span className="course tag">{item}</span>
        <span className="unit tag">{this.props.courseHeap[item].units} units</span>
        <span className="courseTitle">{this.props.courseHeap[item].title}</span>
      </li>
    );
  },
  render: function(){
    return <ul id="courselist">{this.props.courseIdArr.map(this.createItem)}</ul>;
  }
});

var CourseListApp = React.createClass({
  getInitialState: function(){
    return {text: ''};
  },
  componentDidMount: function(){
    var prop = this;
    $(this.props.APP).on('clearText', function(){
      prop.setState({text: ''});
      $('#dynamicInput input[type=text]').typeahead('close');
    });

    var courses = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('tokens'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      prefetch: '/api/courselistcache.json'
    });

    $('#dynamicInput input[type=text]').typeahead({highlight:true}, {
      name: 'course-code',
      display: 'course',
      limit: 5,
      source: courses,
      templates: {
        empty: [
          '<div class="empty-message">',
            'unable to find any courses that match the current query',
          '</div>'
        ].join('\n'),
        suggestion: Handlebars.compile('<div><strong>{{course}}</strong><br><i>{{title}}</i></div>')
      }
    }).after("<div></div>");
  },
  onChange: function(e){
    this.setState({text: e.target.value});
  },
  checkSubmit: function(e){
    if(e.keyCode == 13){
      this.handleSubmit(e);
    }
  },
  handleSubmit: function(e){
    e.preventDefault();
    this.addClass(this.state.text);
  },
  addClass: function(courseId){
    socket.emit('add class', courseId);
  },
  removeClass: function(courseId){
    socket.emit('remove class', courseId);
  },
  render: function(){
    return (
      <div>
        <ul id="dynamicInput" className="typeahead">
          <li className="search">
            <input 
              onChange={this.onChange} 
              value={this.state.text} 
              onKeyDown={this.checkSubmit}
              type="text" id="classInput" placeholder="Enter a class"/>
            <p>(Hit enter to add a new class.)</p>
          </li>
        </ul>
        <CourseListItem 
          courseIdArr={this.props.courseIdArr} 
          courseHeap={this.props.courseHeap} 
          removeClass={this.removeClass} />
      </div>
    );
  }
});

/* ***** CALENDAR APP ***** */

var CalendarApp = React.createClass({
  getInitialState: function(){
    return {index:0};
  },
  componentDidMount: function(){
    var prop = this;

    $(".day").width($(".cal-col").width()-17);
    $(window).resize(function(){
      $(".day").width($(".cal-col").width()-17);
    });

    $(this.props.APP).on('updateCalendar', function(e, index){
      prop.setState({index:index});
      console.log(index)
    });
  },
  makeHover: function(courseId){
    $('*[data-course='+courseId+']').addClass("hover").on("click",function(e){
      $(this).addClass("superhover");
      var sectionID = $(this).attr("data-section");
      $('*[data-section='+sectionID+']').addClass("anchor");
    });
  }, 
  removeHover: function(courseId){
    $('*[data-course='+courseId+']').removeClass("hover").removeClass("superhover").on("click",function(e){
      $(this).removeClass("superhover");
    });
  },
  createEvent: function(day, start, end, courseID, sectionID, color, closed, key){
    var style = {}
    style.backgroundColor = color;
    if(day != 'A'){
      style.top = Math.round(((start - 420) / 60) * 50 + 60) + 'px';
      style.height = Math.round((end - start) * 50 / 60) + 'px';
    }
    if(closed) style.opacity = '0.5';

    var data = this.props.courseHeap[courseID].SectionData[sectionID];

    return (
      <li onMouseEnter={this.makeHover.bind(null, courseID)} onMouseLeave={this.removeHover.bind(null, courseID)} className="event" key={sectionID} data-course={courseID} data-section={sectionID} style={style}>
        <span>
          <span>
          <b>{courseID}</b> ({data.type})<br />
          {sectionID}, {data.location[key]}<br />
          {data.start_time[key]}-{data.end_time[key]}, {data.spaces_available-data.number_registered}
          </span>
        </span>
      </li>
    );
  },
  generateEvents: function(day){

    var daysLegend = {U:'Sun' , M:<b>Mon</b>, T:<b>Tue</b>, W:<b>Wed</b>, H:<b>Thu</b>, F:<b>Fri</b>, S:'Sat', A:<i>TBA</i>};
    var emptyCols = []; for(var i=0; i<16; i++) emptyCols.push(<li key={i}></li>);

    var generatedEvents = [];
    var data = this.props.courseCombinations[this.state.index];
    var courseList = this.props.courseIdArr;
    if(!(typeof data === 'undefined')){
      data = data.data;

      for(var course in data){
        var index = courseList.indexOf(course);
        var count = (this.props.courseIdArr.length > 2) ? courseList.length : 2;
        var color = 'rgb(' + colorFade([233,52,50],[233,167,30], index, count) + ')';

        for(var section in data[course]){
          for(var key in data[course][section])
            if((data[course][section][key].day).indexOf(day) > -1)
              generatedEvents.push(this.createEvent(day, data[course][section][key].start, data[course][section][key].end, course, section, color, data[course][section][key].closed, key));
        }
      }
    }

    return (
      <ul key={day} id={day} className="cal-col">
        <li className="day" key={0}>{daysLegend[day]}</li>
        {emptyCols}
        {generatedEvents.map(function(item){return item})}
      </ul>
    );
  },
  render: function(){

    var prop = this;
    var timeArr = ['7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p', '10p'];
    var days = ['U', 'M', 'T', 'W', 'H', 'F', 'S', 'A'];

    return (
      <div id="calwrap">
        <ul id="time">
          <li className="day"></li>
          {timeArr.map(function(time){ return <li key={time}>{time}</li>; })}
        </ul>
        {days.map(this.generateEvents)}
      </div>
    );
  }
});

/* ***** FILTERS APP ***** */

var FilterApp = React.createClass({
  getInitialState: function(){
    return {index:0};
  },
  componentDidMount: function(){
    var prop = this;
    $(this.props.APP).on('goPrev',function(){
      var data = prop.props.courseCombinations;
      if(prop.state.index > 0){
        prop.setState({index: prop.state.index-1});
        $(prop.props.APP).trigger('updateCalendar', prop.state.index);
      }
    }).on('goNext',function(){
      var data = prop.props.courseCombinations;
      if(prop.state.index < prop.props.courseCombinations.length - 1){
        prop.setState({index: prop.state.index+1});
        $(prop.props.APP).trigger('updateCalendar', prop.state.index);
      }
    }).on('resetFilter',function(){
      prop.setState({index: 0});
    });
  },
  updateCal: function(data, index){
    this.setState({index: index});
    $(this.props.APP).trigger('updateCalendar', index);
  },
  createItem: function(data, index){
    var active = (this.state.index == index) ? 'active' : '';
    return <li className={active} key={index} data-key={index} onClick={this.updateCal.bind(null, data, index)}><b>{index+1}</b><br /> <i>{data.score}</i></li>;
  },
  render: function(){
    return <ul id="ranks">{this.props.courseCombinations.map(this.createItem)}</ul>
  }
})

/* ***** FINAL RENDER ***** */

ReactDOM.render(<HackSChedule />, document.getElementById("HackSChedule"));