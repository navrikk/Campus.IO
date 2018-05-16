var mongoose 				= require('mongoose');
var passportLocalMongoose	= require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	firstname: {type: String, required: true},
	lastname: {type: String, required: true},
	username: {type: String, required: true, unique: true},
	email: {type: String, required: true, unique: true},
	college: {type: String},
	branch: {type: String},
	avatar: {type: String, default: 'https://www.drupal.org/files/profile_default.png'},
	avatarId: {type: String},
	password: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	isAdmin: {type: Boolean, default: false},
	isSupport: {type: Boolean, default: false},
	quizzes: [{
			id : {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Quiz',
				required: true
			},
			title: {type: String, required: true},
			isPosted: {type: Boolean, default: false},
			score : {type: Number, default: 0.0}
	}],
	oop: {sum: {type: Number, default: 0.0}, numberOfQuizzes: {type: Number, default:0} },
	ds: {sum: {type: Number, default: 0.0}, numberOfQuizzes: {type: Number, default:0} },
	dbs: {sum: {type: Number, default: 0.0}, numberOfQuizzes: {type: Number, default:0} },
	nw: {sum: {type: Number, default: 0.0}, numberOfQuizzes: {type: Number, default:0} },
	os: {sum: {type: Number, default: 0.0}, numberOfQuizzes: {type: Number, default:0} },
	apt: {sum: {type: Number, default: 0.0}, numberOfQuizzes: {type: Number, default:0} }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);