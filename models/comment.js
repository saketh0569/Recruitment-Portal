var mongoose = require('mongoose');
var commentSchema =  mongoose.Schema({
	que: String,
	username:String,
	ans:String,
	offerID:Number
	
});
module.exports = mongoose.model("Comment",commentSchema);