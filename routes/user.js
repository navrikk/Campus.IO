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
	User.findById(req.params.id, function(err, foundUser) {
		if (err) {
			req.flash('error', 'Profile does not exist.');
			res.redirect('/user/home');
		} else {
			res.render('user/profile', {user: foundUser});
		}
	});
});

module.exports 	=	router;