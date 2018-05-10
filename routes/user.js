// requiring packages
var express		=	require('express'),
	router		=	express.Router(),
	User		=	require('../models/user'),
	Chat 		=	require('../models/chat'),
	Posts		=	require('../models/post'),
	middleware 	=	require('../middleware');


// render the home page
router.get('/home', middleware.isLoggedIn, function(req, res) {
	Posts.find({}, function(err, allPosts) {
		if(err) {
			req.flash('error', 'Something went wrong. Please try again.');
		} else {
			res.render('user/home', {posts: allPosts});
		}
	});
});

// render the chatroom page
router.get('/chatroom', middleware.isLoggedIn, function(req, res) {
	Chat.find({}, function(err, chats) {
		if (err) {
			req.flash('error', 'Something went wrong. Try again.');
			res.redirect('/user/home');
		} else {
			res.render('user/chatroom', {chats: chats});
		}
	});
});

// handle the logic to save chat messages
router.post('/chatroom', middleware.isLoggedIn, function(req, res) {
	var newChat ={
		message: req.body.message
	};
	Chat.create(newChat, function(err, newlyCreatedChat) {
		if (err) {
			req.flash('error', 'Something went wrong. Try again.');
			res.redirect('/user/home');
		}
	});
});

// render the show all users page
router.get('/show', function(req, res) {
	User.find({}, function(err, allUsers) {
		if (err) {
			req.flash('error', 'Something went wrong. Try again.');
			res.redirect('/user/home');
		} else {
			res.render('user/show', {users: allUsers});
		}
	});
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

// render the edit profile page
router.get('/:id/edit', middleware.isLoggedIn, function(req, res) {
	User.findById(req.params.id, function(err, foundUser) {
		if (err) {
			req.flash('error', 'You do not have privileges to do that.');
			res.redirect('/user/home');
		} else {
			res.render('user/edit', {user: foundUser});
		}
	});
});

// handle the logic for edit profile
router.put('/:id', middleware.isLoggedIn, function(req, res) {
	User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser) {
		if(err) {
			console.log(err);
			req.flash('error', 'Something went wrong. Please try again.');
			res.redirect('/user/home');
		} else {
			req.flash('success', 'Successfully updated.');
			res.redirect('/user/' + updatedUser._id);
		}
	});
});

// handles the post method of Posts
router.get('/post/:id', middleware.isLoggedIn, function(req, res) {
	Quiz.findById(req.params.id, function(err, foundQuiz) {
		if (err) {
			req.flash('error', 'Quiz not found');
			res.redirect('/user/home');
		}
		else{
			User.findById(req.user._id, function(err, foundUser) {
				if (err) {
					req.flash('error', 'User not found');
					res.redirect('/user/home');
				}
				else
				{
					var post = {
						author: {
							id : foundUser._id,
							name : foundUser.firstname + foundUser.lastname,
							avatar: foundUser.avatar
						},
						title: foundQuiz.title,
						postId: foundQuiz._id,
					}
					Posts.create(post ,function(err, newlyCreated){
						if (err) {
							req.flash('error', 'Quiz already posted');
							res.redirect('/user/' + foundUser._id);
						}
						else{
							req.flash('success', 'Quiz sucessfully posted');
							res.redirect('/user/' + foundUser._id);
						}
					});
				}
			});
		}	
	});
});


module.exports 	=	router;