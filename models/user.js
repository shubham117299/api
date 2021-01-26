var mongoose = require("mongoose"),
	passportLocalMongoose= require("passport-local-mongoose");

// mongoose.connect("mongodb://localhost/name");

var UserSchema =new mongoose.Schema({
	username:String,
	passport:String
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);