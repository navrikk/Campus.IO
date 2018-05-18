var mongoose = require('mongoose');

var quizSchema = new mongoose.Schema({
	title : {type: String, required: true},
	category : {type: String, required: true},
	isPosted : {type: Boolean, default: false},
	author: {
				id: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User'
				},
				name: {type: String, required: true}
	},
	questions : [
				{
					question : {type: String, required: true},
					options : [
						{
							option : {type: String}
						}
					],
					answer : {type: String, required: true}
				}
	],
	takenByUsers : [
	        {
	        	name : {type: String, required: true},
	        	id : {
	        	            type: mongoose.Schema.Types.ObjectId,
	        	            ref: 'User',
	        	            required: true
	        	        }, 
	        	score : {type: Number, required: true, default : 0.0}  
	        }      
	    ]
});


module.exports = mongoose.model('Quiz', quizSchema);