const { use } = require('marked');
const User = require('../model/User');
const usersCollection = require('../db').db().collection("Users");
const bcrypt = require('bcryptjs');

exports.mustBeLoggedIn = function(req, res, next){
    if(req.session.user){
        next();
    }else{
        req.flash("errors", "you must be logged in to perform the action")
        req.session.save(function(){
            res.redirect('/')
        })
    }
}

//home
exports.home = function(req, res){
    if(req.session.user){
        if(req.session.user.email == 5000){
            res.render('dashbord', {email: req.session.user.email})
        }else{
            res.render('student-page', {email: req.session.user.email})
        }
    }else{
        res.render('home');
    }
}
//Register Users
exports.registerPage = function(req, res){
    res.render('register', {regErrors: req.flash('regErrors')});
}

exports.register = function(req, res){
    let user = new User(req.body);
    user.register().then(()=>{
        req.session.user = {email: user.data.email}
        req.session.save(function(){
            res.redirect('/');
        });
    }).catch((error)=>{
        // regErrors.forEach(function(error){
            req.flash('regErrors', error)
        // })
        req.session.save(function(){
            res.redirect('/register');
        });
    });
}

//Login 
exports.loginPage = function(req, res){
    res.render('login', {errors: req.flash('errors')});
}


exports.login = function(req, res){
    let user = new User(req.body);
    // console.log(user)
    user.login().then(function(result){
        // console.log(user.data.email)
        req.session.user = {email: user.data.email}
        req.session.save(function(){
            res.redirect('/');
        })
    }).catch(function(e){
        req.flash('errors', e);
        req.session.save(function(){
            res.redirect('/login');
        });
    });
}
//LOGOUT
exports.logout = function(req, res){
    req.session.destroy(function(){
        res.redirect('/')
    })
}

exports.forgotPasswordPage = function(req, res){
    res.render('forgotPassword');
}

exports.forgotPassword = function(req, res){
    let user = new User(req.body);
    user.forgotPassword().then((result) =>{
        res.send(result);
    
    }).catch((e) =>{
        res.send(e);
    })

    
}

exports.resetPasswordPage = function(req, res){

    usersCollection.findOne({token: req.params.token}).then((user) =>{
        if(user && req.params.token == user.token){
            
        if(!user.token)
            return res.send("Invalid or expired link.");
        }
        
        let emptyToken = { $set: {token:""} };
       
        usersCollection.updateOne({token: user.token}, emptyToken, (err, res)=>{
            if(err) throw err;
            
        })
        res.render('resetPassword');
    }).catch((e)=>{
        res.send(e);
    })
    
}

exports.resetPassword = function(req, res){

    usersCollection.findOne({email: req.body.email}).then((user) =>{
        user = new User(req.body)

        if(user && req.body.email == user.data.email){
            
            if(user.data.password == user.data.confirmPassword){

                let salt = bcrypt.genSaltSync(10);
                let pass = bcrypt.hashSync(req.body.password, salt);
                let conPass = req.body.confirmPassword;

                let newValues = { $set: {password: pass, confirmPassword: conPass}}
                usersCollection.updateOne({email: user.data.email}, newValues, (err, res)=>{
                    if(err) throw err;
                })
                res.send("Password reset succesfully")
            }
        
        }

    }).catch((e)=>{
        res.send("An error occurred.");
        console.log(e);
    })
  
}
