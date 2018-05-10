// requiring packages
var express 			= 	require('express'),
	app 				= 	express(),
	bodyParser 			= 	require('body-parser'),
	mongoose 			= 	require('mongoose'),
	passport			= 	require('passport'),
	LocalStrategy 		= 	require('passport-local'),
	methodOverride		= 	require('method-override'),
	flash				=	require('connect-flash'),
	http				=	require('http').Server(app),
	io 					=	require('socket.io')(http);

// port configuration
var port		=	process.env.PORT || 4000;
	Quiz 		= 	require('./models/quiz');
	quizRoutes 		= require('./routes/quiz');


// requiring models
var User 		=	require('./models/user');

// requiring routes
var indexRoutes	=	require('./routes/index'),
	userRoutes  = 	require('./routes/user');

// mongodb connection
mongoose.connect('mongodb://localhost/campus_io');
// , {useMongoClient: true});

// custom middleware
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use(flash());

// passport configuration begins
// PASSPORT CONFIGURATION
app.use(require('express-session')({
	secret: 'This is a secret message',
	resave: false,
	saveUninitialized: false
}));

// MORE PASSPORT CONFIGURATION
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passport configuration ends

// globalize the authenticated user and setup flash messages
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

// using required routes
app.use('/', indexRoutes);
app.use('/user/', userRoutes);
app.use('/quiz/', quizRoutes);


// socket.io connection
io.on('connection', function(socket) {
	socket.on('chat message', function(msg) {
    	io.emit('chat message', msg);
  	});
});

// deployment
http.listen(port, function() {
	console.log('Server online at port ' + port);
});