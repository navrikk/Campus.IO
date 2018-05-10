var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
	author : {
				id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User'
				},
				name: {type: String, required: true},
				avatar: {type: String, required: true}

	},
	title : {type: String, required: true},
	postType: {type: String, default: "quiz"},
	postId: {
			type: mongoose.Schema.Types.ObjectId,
			unique: true,
			required: true
	}
});

module.exports = mongoose.model('Post', postSchema);