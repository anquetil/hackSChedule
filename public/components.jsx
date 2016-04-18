/* ***** COURSE LIST APP ***** */

var CourseListItem = React.createClass({
  createItem: function(item, index){
    var count = (this.props.courses.length > 2) ? this.props.courses.length : 2;
    var rgb = 'rgb(' + colorFade([233,52,50],[233,167,30], index, count) + ')';
    return (
      <li key={item.id} style={{backgroundColor:rgb}}>
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
      var courseHeap = prop.state.courseHeap;
      var nextItems = prop.state.courses;
      // Combine courseHeap
      for (var courseKey in courseData) {
        // Check if already exists in the array
        if(!(typeof prop.state.courses.find(function(item){
          return prop.text === courseKey;
        })  === 'undefined')) return;
        nextItems = nextItems.concat([{text: courseKey, id: Date.now()}]);
        courseHeap[courseKey] = courseData[courseKey]; 
      }
      prop.setState({courses: nextItems, courseHeap:courseHeap, text: ''});
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
        <CourseListItem courses={this.state.courses} courseHeap={this.state.courseHeap} />
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