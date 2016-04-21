/* ***** GLOBAL VARIABLES ***** */

var socket = io("/schedule");

/* ***** GENERIC COMPONENTS ***** */

var Button = React.createClass({
  render: function(){
    return <div className="button" id={this.props.id} onClick={this.props.action}>{this.props.value}</div>
  }
});

/* ***** MASTER APP ***** */

var HackSChedule = React.createClass({
  getInitialState: function(){
    return {
      courseIdArr: [], 
      courseHeap: {},
      courseCombinations: [],
      APP: {}
    };
  },
  componentDidMount: function(){
    var prop = this;

    socket.on('update courses', function(data){
      if(data.add) $(prop.state.APP).trigger('clearText');
      prop.setState({
        courseIdArr: data.courseIdArr,
        courseHeap: data.courseHeap,
        courseCombinations: []
      });
    });

    socket.on('add schedule', function(data){
      var newCourseCombinations = prop.state.courseCombinations.concat([data]);
      newCourseCombinations.sort(compareScore);
      prop.setState({
        courseCombinations: newCourseCombinations
      });
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

        <section id="calendar"><CalendarApp /></section>

        <section id="filtercontainer">
          <FilterApp courseCombinations={this.state.courseCombinations} courseHeap={this.state.courseHeap} />
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
      <li key={item} data-course={item} onMouseEnter={this.itemShow.bind(null, item)} onMouseLeave={this.itemLeave.bind(null, item.text)} style={{backgroundColor:rgb}}>
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
    });
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
            <div></div><p>(Hit enter to add a new class.)</p>
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
  componentDidMount: generateCalendar,
  render: function(){
    return (
      <div id="calwrap"></div>
    );
  }
});

/* ***** FILTERS APP ***** */

var FilterApp = React.createClass({
  updateCal: function(data, index){
    updateCalendar(data.data, this.props.courseHeap, index, data.score);
  },
  createItem: function(data, index){
    return <li key={index} data-key={index} onClick={this.updateCal.bind(null, data, index)}><b>{index+1}</b><br /> <i>{data.score}</i></li>;
  },
  render: function(){
    return <ul id="ranks">{this.props.courseCombinations.map(this.createItem)}</ul>
  }
})

/* ***** FINAL RENDER ***** */

ReactDOM.render(<HackSChedule />, document.getElementById("HackSChedule"));