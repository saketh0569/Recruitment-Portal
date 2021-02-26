var mongoose = require('mongoose');
var feedbackSchema =  mongoose.Schema({
	feedback: String,
    username:String,
    offerID:Number,
    suggestions:String,
    cId:String,
    rating: 
	{
		type: Number,
		min: 0,
		max: 5
	}
});
module.exports = mongoose.model("Feedback",feedbackSchema);