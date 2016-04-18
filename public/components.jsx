/* ***** GLOBAL VARIABLES ***** */

var MASTERCourseHeap = {};
var MASTERCombinationHeap = [];
var APP = {}; // look for certain triggers.

/* ***** GENERIC COMPONENTS ***** */

var Button = React.createClass({
  render: function(){
    return <div className="button" id={this.props.id} onClick={this.props.action}>{this.props.value}</div>
  }
});


/* ***** COURSE LIST APP ***** */

var CourseListItem = React.createClass({
  createItem: function(item, index){
    var count = (this.props.courses.length > 2) ? this.props.courses.length : 2;
    var rgb = 'rgb(' + colorFade([233,52,50],[233,167,30], index, count) + ')';
    return (
      <li key={item.id} data-course={item.text} style={{backgroundColor:rgb}}>
        <span className="close" onClick={this.props.removeCourse.bind(null, index)}>×</span>
        <span className="course tag">{item.text}</span>
        <span className="unit tag">{this.props.courseHeap[item.text].units} units</span>
        <span className="courseTitle">{this.props.courseHeap[item.text].title}</span>
      </li>
    );
  },
  render: function(){
    return <ul id="courselist">{this.props.courses.map(this.createItem)}</ul>;
  }
});

var CourseListApp = React.createClass({
  getInitialState: function(){
    return {courses: [], courseHeap: {}, text: ''};
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
    var prop = this;
    getCourse(prop.state.text, function(courseData){
      // Check if course actually exists
      if(courseData == false) return;
      var nextCourseHeap = prop.state.courseHeap;
      var nextItems = prop.state.courses;
      // Combine courseHeap
      for (var courseKey in courseData) {
        // Check if already exists in the array
        if(!(typeof prop.state.courses.find(function(item){
          return prop.text === courseKey;
        })  === 'undefined')) return;
        nextItems = nextItems.concat([{text: courseKey, id: Date.now()}]);
        nextCourseHeap[courseKey] = courseData[courseKey]; 
      }
      MASTERCourseHeap = nextCourseHeap;
      // set state
      prop.setState({courses: nextItems, courseHeap:nextCourseHeap, text: ''});
      prop.generate();
    });
  },
  removeCourse: function(index){
    var rCourses = this.state.courses,
        rCourseHeap = this.state.courseHeap;
    delete rCourses[index];
    delete rCourseHeap[index];
    rCourses.length--;
    rCourseHeap.length--;
    MASTERCourseHeap = rCourseHeap;
    // set state
    this.setState({courses:rCourses, courseHeap:rCourseHeap, text:this.state.text});
    this.generate();
  },
  generate: function(){
    // var convertedCourseArr = [];
    // for(var key in this.state.courses) convertedCourseArr.push(this.state.courses[key].text);
    generateCourses(this.state.courseHeap, function(data){
      MASTERCombinationHeap = data;
      $(APP).trigger('update');
    });
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
          courses={this.state.courses} 
          courseHeap={this.state.courseHeap} 
          removeCourse={this.removeCourse} />
      </div>
    );
  }
});

ReactDOM.render(<CourseListApp />, document.getElementById('courseListApp'));

/* ***** CALENDAR APP ***** */

var CalendarApp = React.createClass({
  componentDidMount: generateCalendar,
  render: function(){
    return (
      <div id="calwrap"></div>
    );
  }
});

ReactDOM.render(<CalendarApp />, document.getElementById('calendar'));

/* ***** FILTERS APP ***** */

var FilterApp = React.createClass({
  componentDidMount: function(){
    var props = this;
    $(APP).on('update',function(){
      props.forceUpdate();
    });
  },
  updateCal: function(data, index){
    updateCalendar(data.data, MASTERCourseHeap, index, data.score);
  },
  createItem: function(data, index){
    return <li key={index} data-key={index} onClick={this.updateCal.bind(null, data, index)}>{index+1}, {data.score}</li>;
  },
  render: function(){
    return <ul id="ranks">{MASTERCombinationHeap.map(this.createItem)}</ul>
  }
})

ReactDOM.render(<FilterApp />, document.getElementById('filtercontainer'));