var mongoose 				= require('mongoose');
var passportLocalMongoose	= require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	username: {type: String, required: true, unique: true},
	email: {type: String, required: true, unique: true},
	password: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);