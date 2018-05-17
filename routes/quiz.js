// requiring packages
var express		=	require('express'),
router		=	express.Router(),
User		=	require('../models/user'),
Quiz		=	require('../models/quiz'),
middleware 	=	require('../middleware');

// Crating new quiz
router.get('/add', middleware.isLoggedIn, function(req, res) {
	if (req.user.isSupport) {	
		res.render('quiz/add');
	}else{
		req.flash('error', 'You don\'t have permission to this page');
		res.redirect('/user/home');
	}
});

// Adding the title to the quizz
router.post('/add', middleware.isLoggedIn, function(req, res) {
	if (req.user.isSupport) {
		var newQuiz = new Quiz({
			title : req.body.title,
			category : req.body.category,
			author : {
				id : req.user._id,
				name: req.user.firstname + " " + req.user.lastname,
				avatar: req.user.avatar
			}
		});
		Quiz.create(newQuiz,function(err, newlyCreated){
			if(err) {
				req.flash('error', 'Something went wrong. Please try again.');
				res.redirect('/user/home');
			} else {
				User.update(
					{ _id: req.user._id },
					{ $push: {quizzes: {title: req.body.title, id: newlyCreated._id}}},
					function(err, data) {
						if(err)
							req.flash('error', 'Something went wrong. Please try again.');
						else{
							req.flash('success', 'Successfully created.');
							res.redirect('/quiz/addQuestions/' + newlyCreated._id);
						}
					}
					);
			}
		});
	} else {
		req.flash('error', 'You don\'t have permission to this page');
		res.redirect('/user/home');
	}
});

// Adding questions to quiz
router.get('/addQuestions/:quizId', middleware.isLoggedIn, function(req, res) {
	if (req.user.isSupport) {
		Quiz.findById(req.params.quizId, function(error, foundQuiz) {
			if(error){
				req.flash('error', 'Something went wrong. Please try again.');
				res.redirect('/user/home');
			}
			else{
				if(foundQuiz.author.id.equals(req.user._id)){
					res.render('quiz/addQuestions', {
						quizId : req.params.quizId,
						questionNo : foundQuiz.questions.length + 1
					});
				}
				else{
					req.flash('error', 'You don\'t have permission to this page');
					res.redirect('/user/home');
				}
			}
		});
	}else{
		req.flash('error', 'You don\'t have permission to this page');
		res.redirect('/user/home');
	}
});

// Adding the question to the quizz
router.post('/addQuestions/:quizId', middleware.isLoggedIn, function(req, res) {
	if (req.user.isSupport) {
		var newQuestion = {
			question : req.body.question,
			answer : req.body[req.body.answer],
			options : []
		};
		for(var i=1;i<Object.keys(req.body).length - 1;i++){
			newQuestion.options.push({ option : req.body["option" + i]});
		}
		Quiz.update(
			{ _id: req.params.quizId },
			{ $push: { questions: newQuestion } },
			function(err, data) {
				if(err)
					req.flash('error', 'Something went wrong. Please try again.');
				else{
					res.redirect('/quiz/addQuestions/' + req.params.quizId);				
				}
			}
			);
	}else{
		req.flash('error', 'You don\'t have permission to this page');
		res.redirect('/user/home');
	}			
});

//preview the Quiz
router.get('/preview/:quizId', middleware.isLoggedIn, function(req, res) {
	if (req.user.isSupport) {
		Quiz.findById(req.params.quizId, function(error, foundQuiz) {
			if(error)
				req.flash('error', 'Something went wrong. Please try again.');
			else{
				res.render('quiz/take', {currentQuiz: foundQuiz, preview: true});
			}
		});
	}else{
		req.flash('error', 'You don\'t have permission to this page');
		res.redirect('/user/home');
	}
});


// Taking quiz 
router.get('/take/:quizId', middleware.isLoggedIn, function(req, res) {
	if (!req.user.isSupport) {
		Quiz.findById(req.params.quizId, function(error, foundQuiz) {
			if(error)
				req.flash('error', 'Something went wrong. Please try again.');
			else{
				var taken = false;
				foundQuiz.takenByUsers.forEach(function(quiz){
					if (quiz.id.equals(req.user._id)) {
						taken = true;
					}
				});
				if (!taken) {
					Quiz.update(
						{ _id: req.params.quizId },
						{ $push: {takenByUsers: { 
							name: req.user.firstname + " " + req.user.lastname,
							id: req.user._id,
							score: 0
						}
					}},function(err, updatedQuiz) {
						if(err) {
							req.flash('error', 'Something went wrong. Please try again.');
							res.redirect('/user/home');
						} else {
							res.render('quiz/take', {currentQuiz: foundQuiz, preview: false});
						}
					});
				}
				else{
					req.flash('error', 'You have already taken quiz.');
					res.redirect('/user/home');
				}
			}
		});
	}else{
		req.flash('error', 'You don\'t have permission to this page');
		res.redirect('/user/home');
	}	
});

//handle post request of view results
router.post('/take/:quizId', middleware.isLoggedIn, function(req, res) {
	if (!req.user.isSupport) {
		Quiz.findById(req.params.quizId, function(error, foundQuiz) {
			if(error){
				req.flash('error', 'Something went wrong. Please try again.', error);
				res.redirect('/user/home');
			}
			else{
				var result = 0;
				for (var i = 0; i < foundQuiz.questions.length; i++) {
					if(req.body[foundQuiz.questions[i].id] === foundQuiz.questions[i].answer){
						result++;
					}
				}
				var score = result/foundQuiz.questions.length;
				for (var i = 0; i < foundQuiz.takenByUsers.length; i++) {
					if(foundQuiz.takenByUsers[i].id.equals(req.user._id)){
						foundQuiz.takenByUsers[i].score = score;
						break;
					}
				}
				Quiz.findByIdAndUpdate(foundQuiz._id,foundQuiz,function(err, updatedQuiz) {
					if(err){
						req.flash('error', 'Something went wrong. Please try again.');
						res.redirect('/user/home');
					}
					else{
						User.findById(req.user._id,function(err, foundUser) {
							if (err) {
								req.flash('error', 'Something went wrong. Please try again.');
								res.redirect('/user/home');
							}
							foundUser[foundQuiz.category].sum += score;
							foundUser[foundQuiz.category].numberOfQuizzes += 1;
							foundUser.quizzes.push({
								id: req.params.quizId,
								title: foundQuiz.title,
								score: score
							});
							User.findByIdAndUpdate(foundUser._id, foundUser, function(err, updatedUser) {
								if(err) {
									req.flash('error', 'Something went wrong. Please try again.');
									res.redirect('/user/home');
								} else {
									req.flash('success', 'Successfully updated.');
									res.redirect("/quiz/viewResult/" + foundQuiz._id)								}
							});
						})
					}
				}
				);
			}
		});
	}else{
		req.flash('error', 'You are not allowed to take quiz');
		res.redirect('/user/home');
	}
});

//preview the Quiz
router.get('/viewResult/:quizId', middleware.isLoggedIn, function(req, res) {
	Quiz.findById(req.params.quizId, function(error, foundQuiz) {
		if(error)
			req.flash('error', 'Something went wrong. Please try again.');
		else{
			res.render('quiz/viewResult', {currentQuiz: foundQuiz});
		}
	});
});

module.exports 	=	router;