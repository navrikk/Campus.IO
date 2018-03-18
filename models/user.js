var mongoose 				= require('mongoose');
var passportLocalMongoose	= require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	firstname: {type: String, required: true},
	lastname: {type: String, required: true},
	username: {type: String, required: true, unique: true},
	email: {type: String, required: true, unique: true},
	avatar: {type: String, default: 'https://www.drupal.org/files/profile_default.png'},
	password: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	isAdmin: {type: Boolean, default: false},
	isSupport: {type: Boolean, default: false}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);