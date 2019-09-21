var express = require("express");
var app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.listen(3000);

// Body Parser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

//Mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://khoapham:44TyKrF2VErql3fT@cluster0-qah5q.mongodb.net/buoi9?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true}, function(err){
    if(err){
        console.log("Mongodb connect error!!! " + err);
    }else{
        console.log("Mongodb connected successfully.");
    }
});

// Model
const User = require("./models/User");

// Bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

// JWT
var jwt = require('jsonwebtoken');
var secret = "TroiMuaRoi";

// Session
var session = require('express-session');
app.use(session({ secret: 'Suahotga', cookie: { maxAge: 10000 }, resave: true,
saveUninitialized: true}));

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    if( req.body.username != null && req.body.password != null ){
        
        // Tim User theo Username
        User.findOne({username: req.body.username}, function(err, u){
            if(err || u==null){
                console.log("FindOne error " + err);
                res.json({kq:0});
            }else{
                
                // so sanh password
                bcrypt.compare(req.body.password, u.password, function(err, res2) {
                    if(err || res2==false){
                        res.json({kq:0});
                    }else{

                        // Tao Token
                        u.password="";
                        jwt.sign(u.toJSON() , secret, { }, function(err, token) {
                            if(err){
                                console.log("Token loi " + err);
                                res.json({kq:0});
                            }else{

                                //Save session
                                req.session.token = token
                                res.json( {kq:1, token:token} );
                            }
                        });

                    }
                });

            }
        });


    }
});

var checkAuthentication = function(req, res, next){
    if( req.session.token ){

        // Verify
        jwt.verify(req.session.token, secret, function(err, decoded) {
            if(err){
                console.log("Token sai");
                res.redirect("./login");
            }else{
                req.currentUser = decoded;
                return next();
            }
        });

    }else{
        console.log("Khong tim thay session");
        res.redirect("./login");
    }
}

app.get("/admin", checkAuthentication, function(req, res){
    res.send( req.currentUser );
});

// Them user
app.get("/register", function(req, res){
    
    // Tao password
    bcrypt.hash("123", saltRounds, function(err, hash) {
        var teo = new User({
            username: "ti",
            password: hash,
            email: "ti@yahoo.com",
            hoten: "Trần Văn Tí"
        });
        teo.save(function(err){
            if(!err){ console.log("Save ok"); }
            res.send("OK");
        });
    });

});
