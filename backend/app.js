

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var useRoute = require('./routes/useRoute');
var activeprojects = require('./routes/activeprojects');
var completedprojects = require('./routes/completedprojects');
var information = require('./routes/information');
var showdetails = require('./routes/showdetails');
var admininfo = require('./routes/admininfo');
var add = require('./routes/add');
var professorinfo = require('./routes/professorinfo');
var project = require('./routes/project');
var scoreprojects = require('./routes/scoreprojects');
var scoredept = require('./routes/scoredept');
var addproject = require('./routes/addproject');
var projectnames = require('./routes/projectnames');
var submiteval = require('./routes/submiteval');
var newproject = require('./routes/newproject');
var createTeam = require('./routes/createTeam');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/useRoute', useRoute);
app.use('/activeprojects', activeprojects);
app.use('/completedprojects', completedprojects);
app.use('/information', information);
app.use('/showdetails', showdetails);
app.use('/add', add);
app.use('/admininfo', admininfo);
app.use('/professorinfo', professorinfo);
app.use('/project', project);
app.use('/scoreprojects', scoreprojects);
app.use('/scoredept', scoredept);
app.use('/addproject', addproject);
app.use('/projectnames', projectnames);
app.use('/submiteval', submiteval);
app.use('/newproject', newproject);
app.use('/createTeam', createTeam);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Start the server and print the port number to the console
var server = app.listen(8080, function() {
  var port = server.address().port;
  console.log('Express server listening on port ' + port);
});

module.exports = app;
