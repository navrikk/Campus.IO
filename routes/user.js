// requiring packages
var express		=	require('express'),
	router		=	express.Router(),
	User		=	require('../models/user'),
	middleware 	=	require('../middleware');


// render the home page
router.get('/home', middleware.isLoggedIn, function(req, res) {
	res.render('user/home');
});

// render the profile page
router.get('/:id', middleware.isLoggedIn, function(req, res) {
	res.render('user/profile');
});

module.exports 	=	router;