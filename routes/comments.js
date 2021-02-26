var express = require("express"),
	router	= express.Router({mergeParams:true}),
	Movie 	= require("../models/movies"),
	middleware=require("../middleware"),
	Comment	= require("../models/comment");

//Comments NEW
router.get("/new/:offerID", middleware.isLoggedIn, (request,respond)=>{

	respond.render("comments/new",{ currentUser:request.user,offerID:request.params.offerID});
	
});

//Comments Create
router.post("/:offerID",middleware.isLoggedIn,(request,respond)=>{
	
	console.log(request.body);
	Comment.create(request.body,(err,newComment)=>{

		if(err){
			console.log(err);
		}else{
			newComment.username=request.user.username;
			newComment.offerID=request.params.offerID;
			newComment.save();
		}
	});
	respond.redirect(`/movies/${request.params.offerID}`);
});
//Recruiter comment
router.get("/edit/:_id",middleware.isLoggedIn, (request,respond)=>{
	
	respond.render("comments/edit",{ currentUser:request.user,_id:request.params._id});
	
});

router.post("/response/:_id",middleware.isLoggedIn, (request,respond)=>{

	Comment.findById(request.params._id,function(err,result){

		result.ans=request.body.ans;
		result.save();
		respond.redirect(`/movies/${result.offerID}`);
	});
	
	
});

//EDit
router.get("/:comment_id/edit",middleware.checkCommentOwnership,(request,respond)=>{
	Comment.findById(request.params.comment_id,(err,foundComment)=>{
		if(err){
			request.flash("error","Something went wrong");
			respond.redirect("back");
		}else{
			respond.render("comments/edit",{movie:request.params.id,comment:foundComment});
		}
	});
});
//Update
router.put("/:comment_id",middleware.checkCommentOwnership,(request,respond)=>{
	Comment.findByIdAndUpdate(request.params.comment_id,request.body.com,(err,updatedComment)=>{
		if(err){
			respond.redirect("back");
		}else{
			respond.redirect("/movies/"+request.params.id);
		}
	});
});
//Delete
router.delete("/:comment_id",middleware.checkCommentOwnership,(request,respond)=>{
	Comment.findByIdAndRemove(request.params.comment_id,(err)=>{
		if(err){
			console.log(err);
			respond.redirect("back");
		}else{
			request.flash("success","Successfully deleted comment");
			respond.redirect("/movies/"+request.params.id);
		}
	});
});

module.exports = router;