const bcrypt = require('bcryptjs');
const usersCollection = require('../db').db().collection("Users");
const validator = require('validator');
const nodeMailer = require('nodemailer')
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

let User = function(data){
    this.data = data;
    this.errors = [];
}
//cleanUp
User.prototype.cleanUp = function(){
    if(typeof(this.data.firstName) != "string"){this.data.firstName = ""}
    if(typeof(this.data.middleName) != "string"){this.data.middleName = ""}
    if(typeof(this.data.lastName) != "string"){this.data.lastName = ""}
    if(typeof(this.data.courses) != "string"){this.data.courses = ""}
    if(typeof(this.data.email) != "string"){this.data.email = ""}
    if(typeof(this.data.gender) != "string"){this.data.gender = ""}
    if(typeof(this.data.phoneNumber) != "string"){this.data.phoneNumber = ""}
    if(typeof(this.data.address) != "string"){this.data.address = ""}
    if(typeof(this.data.password) != "string"){this.data.password = ""}
    if(typeof(this.data.confirmPassword) != "string"){this.data.confirmPassword = ""}

    //get rid of bouges properties 
    this.data = {
        firstName: this.data.firstName.trim().toLowerCase(),
        middleName: this.data.middleName.trim().toLowerCase(),
        lastName: this.data.lastName.trim().toLowerCase(),
        courses: this.data.courses,
        gender: this.data.gender,
        email: this.data.email.trim().toLowerCase(),
        CountryCode: this.data.CountryCode,
        phoneNumber: this.data.phoneNumber.trim().toLowerCase(),
        password: this.data.password,
        confirmPassword: this.data.confirmPassword,
        token: "",
    }
}
//validation
User.prototype.validate = function(){
    return new Promise((resolve, reject)=>{
        if(this.data.firstName == ""){this.errors.push("YOU MUST PROVIDE First name")}
        if(this.data.middleName == ""){this.errors.push("YOU MUST PROVIDE Middle name")}
        if(this.data.lastName == ""){this.errors.push("YOU MUST PROVIDE Last name")}
        if(this.data.courses == ""){this.errors.push("YOU MUST PROVIDE a course")}
        if(this.data.email == ""){this.errors.push("YOU MUST PROVIDE Email address")}
        if(this.data.gender == ""){this.errors.push("You must select gender")}
        if(this.data.phoneNumber == ""){this.errors.push("YOU MUST PROVIDE a Phone Number")}
        if(this.data.address == ""){this.errors.push("YOU MUST PROVIDE an Resdetional Address")}
        if(this.data.password == ""){this.errors.push("You MUST PROVIDE A password")}
        if(this.data.confirmPassword == ""){this.errors.push("You MUST confirm the password")}
        resolve();
    })
}

//Register function
User.prototype.register = function(){
    return new Promise(async (resolve, reject)=>{
        //step 1 validate user data
        this.cleanUp();
        await this.validate();

        //step 2 if there are no validation error then save the data to database
        if(!this.errors.length){
            let salt = bcrypt.genSaltSync(10);
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            await usersCollection.insertOne(this.data);
            resolve();
        }else{
            reject(this.errors);
        }
    })
}

//Login function
User.prototype.login = function(){
    return new Promise((resolve, reject) => {
        this.cleanUp();
        usersCollection.findOne({email: this.data.email}).then((attemptedUser)=>{
            
            if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){
                this.data =  attemptedUser;
                
                resolve("Login successfull");
            }else{
                reject("Invalid Eamil/Password");
            }
        }).catch(function(){
            reject("Please try again later")
        });
    });
}

User.prototype.forgotPassword = function(){
    return new Promise((resolve, reject) =>{

        usersCollection.findOne({email: this.data.email}).then((user)=> {
            // console.log(attemptedUser);
            if(user && this.data.email === user.email){

            // Generating link for user using token
            // let tokenSchema = usersCollection.findOne({token: user.token});

            
            // token = new user.tokenSchema({token: crypto.randomBytes(32).toString("hex")}).save();
            // token =  new user.token({token: crypto.randomBytes(32).toString("hex")}).save();
            let value = crypto.randomBytes(32).toString("hex");
            
               let newValues = { $set: {token: value}}
            //    console.log(this.data.email)
                usersCollection.updateOne({email: this.data.email}, newValues, (err, res)=>{
                    if(err){
                    console.log(err);
                    };
                })
               
            

            const link = `${process.env.BASE_URL}/resetPassword/${value}`;

                //********* Sending the link **************/
                let transporter = nodeMailer.createTransport({
                    service: process.env.SERVICE,
                    port: 587,
                    secure: false,
                    auth: {
                    user: process.env.USER,
                    pass: process.env.PASS
                    },
                    tls: {
                        rejectUnauthorized:false
                    }
                    
                });
            
                let message = {
                    from: 'projectsis226@gmail.com', // sender address
                    to: `${user.email}`, // list of receivers
                    subject: "Reset password link", // Subject line
                    text: `Here's your password reset link: ${link} Go to this link to reset your password.` // plain text body
            
                }
                // send mail with defined transport object
                transporter.sendMail(message, function (err, data){
                    if(err){
                        console.log("error occurred", err);
                    }else{
                        console.log("mail sent");
                    }
                })
                
            
                resolve("<h1>Link has been sent to the email</h1>");
            }else{
                reject("User with this email doesn't exist")
            }
        }).catch(function(){
            reject("Error occurred, try again")
        });
    
    })

}


module.exports = User;