var express =require("express");
var app =express();
var request =require("request");
var mongoose =  require("mongoose");
var bodyParser  =  require("body-parser");
var passport  = require("passport");
var LocalStrategy =require("passport-local");
var User =require("./models/user");


mongoose.connect("mongodb://localhost/api", { useNewUrlParser: true , useUnifiedTopology: true });
app.use(bodyParser.urlencoded({extended: true}));



app.set("view engine","ejs");


var dataSchema =new mongoose.Schema({
	name:String,
	author : {
		id : {
			type : mongoose.Schema.Types.ObjectId,
			ref:"User"
		}
		
	},
	username:String,
	image:String,
	college:String,
	url:String,
	// rating:String,
	// max_rating:String,
	group:String
	
});

var Data =mongoose.model("Data",dataSchema);

app.use(require("express-session")({
	secret: "Shubham",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//ROUTES

app.get("/",function(req,res){
	res.render("home");
});

//AUTH RUTES
app.get("/signup",function(req,res){
	res.render("signup",{currentUser:req.user});
});

app.post("/signup",function(req,res){
	var newUser=new User({username:req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			return res.render("signup");
		}
		passport.authenticate("local")(req,res,function(){
			res.redirect("/");
		});
	});
});

app.get("/login",function(req,res){
	res.render("login",{currentUser:req.user});
});

app.post("/login",passport.authenticate("local",{
	successRedirect:"/easyinfo",
	failureRedirect:"/login"
}),function(req,res){
	
});

app.get("/logout",function(req,res){
		req.logout();
		res.redirect("/");
});



//=======//


app.get("/easyinfo",isLoggedIn,function(req,res){
	res.render("easyinfo");
});

app.post("/easyinfo",isLoggedIn,function(req,res){
	var name=req.body.name;
	var username = req.body.username;
	var author ={
		id : req.user._id,
	};
	var image=req.body.image;
	var college=req.body.college;
	var url=req.body.url;
	// var rating=req.body.rating;
	// var max_rating=req.body.max_rating;
	var group=req.body.group;
	
	
	var newData={name:name,username:username,author:author,image:image,college:college,url:url,group:group}
	
	Data.create(newData,function(err,newData){
		if(err){
			console.log(err);
		}else{
			res.redirect("/easyinfo");
		}
	});	
	
});

app.get("/mylist", isLoggedIn ,function(req,res){
 	
	Data.find({'author.id': req.user._id}, function(err, data){
	if(err) {
	console.log(err);
	} else {
		
		res.render("mylist",{data:data});
		//console.log(req.user._id);
		//console.log(data);
	}
		
	});
});

app.get("/person",function(req,res){
	var query=req.query.username;
	var url="https://codeforces.com/api/user.info?handles="+ query ;
	var u="https://codeforces.com/profile/"+query;
	//console.log(u);
	request(url,function(error,response,body){
		if(!error && response.statusCode == 200){
			var result=JSON.parse(body);
			//console.log(result);
			//console.log(result["result"][0]["avtar"]);
			res.render("person",{data:result,url:u});
		}
	});
	//res.send("Hi");
	
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
	   	return next();
	   }
	res.redirect("/login");
}

app.listen(process.env.PORT || 3000, process.env.IP,function(){
	console.log("your project is ready to go...");  
});
 