var mongoose 				= require('mongoose');

var chatSchema = new mongoose.Schema({
	message: {type: String}
});

module.exports = mongoose.model('Chat', chatSchema);