var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var mongoose = require('mongoose');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
console.log("PORT: " + process.env.PORT);

app.set('port',3001);
console.log("mongoose: " + mongoose);
var mongoDB = 'mongodb://127.0.0.1/my_database';
console.log("mongoose: connecting to: " + mongoDB);
mongoose.connect(mongoDB);
console.log("mongoose: connected?");
// Global promis
mongoose.Promise = global.Promise;
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Create schema
var Schema = mongoose.Schema;

var SomeModelSchema = new Schema({
	a_string: {
		type: String,
		required: [true, 'Missing a_string']
	},
	a_data: String,
});

console.log('SomeModelSchema: ' + SomeModelSchema);

// Model inline
var SomeModel = mongoose.model('SomeModel', SomeModelSchema);

var awesome_instance = new SomeModel({a_string: 'awesome', a_data: "Hello World"});
var promisedSave = awesome_instance.save();
promisedSave.then(function (saved_instance) {
	console.log('MATCH?: ' + awesome_instance._id + ':' + saved_instance._id);
});

console.log(awesome_instance);

var olderId;

SomeModel.find({'a_string': 'awesome'}, 'a_data', function (err, awesomes) {
	if (err) {
		console.log("err: " + err);
		return;
	}
	console.log('FindByName');
	console.log(awesomes);
	olderId = awesomes[3]._id;
	console.log('awesomes[3]:');
	console.log(awesomes[3]);
	console.log('olderId: ' + olderId);
	console.log('FindByName => fini');
	// Here, the findById will work because we have a valid id since we are in the function called when the promise is fulfilled
	SomeModel.findById(olderId, function (err, awesomes) {
		if (err) {
			console.log("err: " + err);
			return;
		}
		console.log('FindByID_chained');
		console.log(awesomes);
		console.log('FindByID_chained => fini');
	})
});

// This one will FAIL because at this time olderId is not yet valid.
console.log("olderId: " + olderId);
SomeModel.findById(olderId, function (err, awesomes) {
	if (err) {
		console.log("err: " + err);
		return;
	}
	console.log('FindByID_olderId');
	console.log(awesomes);
	console.log('FindByID_olderId => fini');
});

console.log("awesome_instance._id: " + awesome_instance._id);
var foo = awesome_instance._id;
var fubar = '5a90838da7a15a2c41807e64';
SomeModel.findById(fubar, function (err, awesomes) {
	if (err) {
		console.log("err: " + err);
		return;
	}
	console.log('FindByID_id');
	console.log(awesomes);
	console.log('FindByID_id => fini');
});

console.log("olderId: " + olderId);
SomeModel.findById(olderId, function (err, awesomes) {
	if (err) {
		console.log("err: " + err);
		return;
	}
	console.log('FindByID_olderId');
	console.log(awesomes);
	console.log('FindByID_olderId => fini');
});

SomeModel.findById('5a90838da7a15a2c41807e64', function (err, awesomes) {
	if (err) {
		console.log("err: " + err);
		return;
	}
	console.log('FindByID_literal');
	console.log(awesomes);
	console.log('FindByID_literal => fini');
});

SomeModel.findOne({_id:'5a90838da7a15a2c41807e64'}, function (err, awesomes) {
	if (err) {
		console.log("err: " + err);
		return;
	}
	console.log('findOne');
	console.log(awesomes);
	console.log('findOne => fini');
});

var query = SomeModel.find({'a_string':'awesome'});
// console.log(query);

query.select('a_string a_data');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
