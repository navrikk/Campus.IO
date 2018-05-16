// requiring packages
var express		=	require('express'),
	router		=	express.Router(),
	User		=	require('../models/user'),
	Chat 		=	require('../models/chat'),
	middleware 	=	require('../middleware')
	multer		=	require('multer'),
	cloudinary	=	require('cloudinary');

// multer file storage
var storage 	=	multer.diskStorage({
	filename: function(req, file, callback) {
		callback(null, Date.now() + file.originalname);
	}
});

// image filter for multer
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// upload variable for multer
var upload 		=	multer({storage:storage, fileFilter: imageFilter});

// cloudinary configuration
cloudinary.config({
	cloud_name: 'campus-io',
	api_key: '363136259299826',
	api_secret: '2gOt9sGSnwXR3c9epdk0VwSAdZ4'
});

// render the home page
router.get('/home', middleware.isLoggedIn, function(req, res) {
	Quiz.find({'isPosted': true}, function(err, allQuizzes) {
		if(err) {
			req.flash('error', 'Something went wrong. Please try again.');
		} else {
			res.render('user/home', {allQuizzes: allQuizzes, isSupport: req.user.isSupport, userId: req.user._id});
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
router.get('/show', middleware.isLoggedIn, function(req, res) {
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		User.find({firstname: regex}, function(err, foundUsers) {
			if (err) {
				req.flash('error', 'Something went wrong. Try again.');
				res.redirect('/user/home');
			} else {
				res.render('user/show', {users: foundUsers});
			}
		});
	} else {
		User.find({}, function(err, allUsers) {
			if (err) {
				req.flash('error', 'Something went wrong. Try again.');
				res.redirect('/user/home');
			} else {
				res.render('user/show', {users: allUsers});
			}
		});
	}
});

// render the leaderboard page
router.get('/leaderboard', middleware.isLoggedIn, function(req, res) {
	User.find({isSupport: false}, function(err, allStudentUsers) {
		if (err) {
			req.flash('error', 'Something went wrong. Try again.');
			return res.redirect('/user/home');
		}
		res.render('user/leaderboard', {allUsers: allStudentUsers});
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
router.put('/:id', middleware.isLoggedIn, upload.single('image'), function(req, res) {
	// find an delete previously uploaded avatar
	User.findById(req.params.id, function(err, foundUser) {
		cloudinary.v2.uploader.destroy(foundUser.avatarId);
	});
	// upload image to cloudinary file storage
	cloudinary.uploader.upload(req.file.path, function(result) {
		// add cloudinary url for the image to the user db under avatar property
		req.body.user.avatar = result.secure_url;
		req.body.user.avatarId = result.public_id;
		// search and update the respective user prifle db
		User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser) {
			if(err) {
				req.flash('error', 'Something went wrong. Please try again.');
				res.redirect('/user/home');
			} else {
				req.flash('success', 'Successfully updated.');
				res.redirect('/user/' + updatedUser._id);
			}
		});
	});
});

// handles the post method of Posts
router.get('/post/:id', middleware.isLoggedIn, function(req, res) {
	Quiz.update({_id: req.params.id}, {isPosted: true}, function(err, affected, resp) {
	   if (err) {
	   		req.flash('error', 'Something went wrong. Please try again');
	   		res.redirect('/user/home');
	   }
	   else{
	   		User.update({'_id': req.user._id, 'quizzes.id': req.params.id},
	   			{'$set': {'quizzes.$.isPosted': true}}, 
	   			function(err, updatedUser) {
	   				if (err) {
	   					req.flash('error', 'Something went wrong. Please try again');
	   					res.redirect('/user/home');
	   				}else{
	   					req.flash('success', 'Successfully updated.');
	   					res.redirect('/user/' + req.user._id);
	   				}
	   			}
	   		);
	   }
	});
});
function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports 	=	router;