// requring packages
var express		=	require('express'),
	router		=	express.Router(),
	passport 	= 	require('passport'),
	User 		= 	require('../models/user'),
	async		=	require('async'),
	nodemailer 	=	require('nodemailer'),
	crypto 		=	require('crypto'),
	middleware  = 	require('../middleware');

// render the landing page
router.get('/', function(req, res) {
	res.render('landing');
});

// render the register page
router.get('/register', function(req, res) {
	res.render('register');
});

// handle the register logic
router.post('/register', middleware.usernameToUpperCase, function(req, res) {
	//Form validation - limiting USN size
	var usnPattern = /^[1-4][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/;
	if (!req.body.username.match(usnPattern) || req.body.username === 0) {
		req.flash('error', 'Invalid USN');
		return res.redirect('/register');
	}
	//Form validation - confirming password
	if(req.body.password === req.body.confirmPassword) {
		var newUser = new User({
			firstname: req.body.fname,
			lastname: req.body.lname,
			username: req.body.username,
			email: req.body.email
		});
		User.register(newUser, req.body.password, function(err, user) {
			if(err) {
				req.flash('error', err.message);
				return res.redirect('register');
			}
			passport.authenticate('local')(req, res, function() {
				// welcome e-mail to user mail address
				var smtpTransport = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
						user: 'campus.io.mailer@gmail.com',
						pass: 'password goes here'
					}
				});
				var mailOptions = {
					to: user.email,
					from: 'campus.io.mailer@gmail.com',
					subject: 'Welcome to CAMPUS.IO',
					text: 'Hello, '+ user.firstname + '\n\n' +
						  'We would like to both confirm and thank you for successfully creating an account at CAMPUS.IO'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					req.flash('success', 'Welcome here, ' + user.firstname + '.');
					res.redirect('/user/home');
				});
			});
		});
	} else {
		req.flash('error', 'Passwords do not match. Try again.');
		return res.redirect('/register');
	}
});

// render the login page
router.get('/login', function(req, res) {
	res.render('login');
});

// handle login logic
router.post('/login', middleware.usernameToUpperCase, function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) { 
			req.flash('error', err.message);
			return next(err); 
		}
		if (!user) {
			req.flash('error', 'Invalid credentials. Try again.');
			return res.redirect('/login'); 
		}
		req.logIn(user, function(err) {
		 	if (err) { 
		 		return next(err); 
		 	}
		 	req.flash('success', 'Welcome back, ' + user.firstname);
		  	return res.redirect('/user/home');
		});
	})(req, res, next);
});


// logout route
router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Successfully logged out.');
	res.redirect('/login');
});

// render the forgot page
router.get('/forgot', function(req, res) {
	res.render('forgot');
});

// handle the forgot password logic
router.post('/forgot', function(req, res, next) {
	async.waterfall([
		function(done) {
			crypto.randomBytes(20, function(err, buf) {
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function(token, done) {
			User.findOne({ email: req.body.email }, function(err, user) {
				if (!user) {
					req.flash('error', 'No account with that email address exists.');
					return res.redirect('/forgot');
				}

				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

				user.save(function(err) {
					done(err, token, user);
				});
			});
		},
		function(token, user, done) {
			var smtpTransport = nodemailer.createTransport({
				service: 'Gmail', 
				auth: {
					user: 'campus.io.mailer@gmail.com',
					pass: 'password goes here'
				}
			});
			var mailOptions = {
				to: user.email,
				from: 'campus.io.mailer@gmail.com',
				subject: 'CAMPUS.IO Password Reset Request',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account at CAMPUS.IO.\n\n' +
				'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
				'http://' + req.headers.host + '/reset/' + token + '\n\n' +
				'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
				done(err, 'done');
			});
		}
	], function(err) {
		if (err) return next(err);
		res.redirect('/forgot');
	});
});

// render the reset password page
router.get('/reset/:token', function(req, res) {
	User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now() }}, function(err, user) {
		if (!user) {
			req.flash('error', 'Password reset token is invalid or has expired');
			return res.redirect('/forgot');
		}
		res.render('reset', {token: req.params.token});
	});
});

// handle the logic for password reset
router.post('/reset/:token', function(req, res) {
	async.waterfall([
		function(done) {
			User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now() }}, function(err, user) {
				if (!user) {
					req.flash('error', 'Password reset token is invalid or has expired');
					return res.redirect('back');
				}
				if (req.body.password === req.body.confirmPassword) {
					user.setPassword(req.body.password, function(err) {
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;
						
						user.save(function(err) {
							req.logIn(user, function(err) {
								done(err, user);
							});
						});		
					});
				} else {
					req.flash('error', 'Passwords do not match');
					return res.redirect('back');
				}
			});
		},
		function(user, done) {
			var smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'campus.io.mailer@gmail.com',
					pass: 'password goes here'
				}
			});
			var mailOptions = {
				to: user.email,
				from: 'campus.io.mailer@gmail.com',
				subject: 'Your CAMPUS.IO account password has been changed',
				text: 'Hello,\n\n' +
					  'This is a confirmation that the password for your account at CAMPUS.IO has just been changed.'
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				req.flash('success', 'Password successfully changed');
				done(err);
			});
		}	
	],
	function(err) {
		res.redirect('/user/home');
	});
});


module.exports	=	router;