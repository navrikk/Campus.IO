var mongoose		=	require('mongoose');

var joinCodeSchema 	= 	new mongoose.Schema({
	code: {type: String, default: '1234567'}
});

module.exports = mongoose.model('JoinCode', joinCodeSchema);