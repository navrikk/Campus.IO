// requiring packages
var express		=	require('express'),
router		=	express.Router(),
User		=	require('../models/user'),
Quiz		=	require('../models/quiz'),
middleware 	=	require('../middleware');

// Crating new quiz
router.get('/addNewQuiz', middleware.isLoggedIn, function(req, res) {
	res.render('quiz/addNewQuiz');
});

// Adding the title to the quizz
router.post('/addNewQuiz', middleware.isLoggedIn, function(req, res) {
	User.findById(req.user._id, function(error, foundUser) {
		if(error)
			req.flash('error', 'Something went wrong. Please try again.');
		else{
			var newQuiz = new Quiz({
				title : req.body.title,
				author : {
					id : req.user._id
				}
			});
			Quiz.create(newQuiz,function(err, newlyCreated){
				if(err) {
					req.flash('error', 'Something went wrong. Please try again.');
				} else {
					User.update(
						{ _id: req.user._id },
						{ $push: {posts: {title: req.body.title, id: newlyCreated._id}}},
						function(err, data) {
							if(err)
								req.flash('error', 'Something went wrong. Please try again.');
							else{
								req.flash('success', 'Successfully created.');
								res.redirect('/quiz/addQuestions/' + newlyCreated._id);
							}
						});

				}
			})
		}
	});
});

// Adding questions to quiz
router.get('/addQuestions/:quizId', middleware.isLoggedIn, function(req, res) {
	Quiz.findById(req.params.quizId, function(error, foundQuiz) {
		if(error)
			req.flash('error', 'Something went wrong. Please try again.');
		else{
			if(foundQuiz.author.id.equals(req.user._id)){
				res.render('quiz/addQuestions', {
					quizId : req.params.quizId,
					questionNo : foundQuiz.questions.length + 1
				});
			}
			else
				res.redirect('/user/home');
		}
	});
});

// Adding the question to the quizz
router.post('/addQuestions/:quizId', middleware.isLoggedIn, function(req, res) {
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
		});
});

//preview the Quiz
router.get('/preview/:quizId', middleware.isLoggedIn, function(req, res) {
	Quiz.findById(req.params.quizId, function(error, foundQuiz) {
		if(error)
			req.flash('error', 'Something went wrong. Please try again.');
		else{
			res.render('quiz/takeQuiz', {currentQuiz: foundQuiz, preview: true});
		}
	});
	
});


// Taking quiz 
router.get('/takeQuiz/:quizId', middleware.isLoggedIn, function(req, res) {
	Quiz.findById(req.params.quizId, function(error, foundQuiz) {
		if(error)
			req.flash('error', 'Something went wrong. Please try again.');
		else{
			res.render('quiz/takeQuiz', {currentQuiz: foundQuiz, preview: false});
		}
	});
	
});

//handle post request of view results
router.post('/takeQuiz/:quizId', middleware.isLoggedIn, function(req, res) {
	Quiz.findById(req.params.quizId, function(error, foundQuiz) {
		if(error)
			req.flash('error', 'Something went wrong. Please try again.');
		else{
			var result = 0;
			for (var i = 0; i < foundQuiz.questions.length; i++) {
				if(req.body[foundQuiz.questions[i].id] === foundQuiz.questions[i].answer){
					result++;
				}
			}
			res.render('quiz/viewResult',{result : result});
		}
	});

});


module.exports 	=	router;