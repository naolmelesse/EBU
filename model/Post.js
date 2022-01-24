const postCollection = require('../db').db().collection("students")
// const ObjectID = require('mongodb').ObjectID

const sanitizeHTML = require('sanitize-html');


let Post = function(data, userid, requestedPostId){
    this.data = data
    this.errors = []
    this.userid = userid
    this.requestedPostId
}

Post.prototype.cleanUp = function() {
    if (typeof(this.data.firstName) != "string") {this.data.firstName = ""}
    if (typeof(this.data.lastName) != "string") {this.data.lastName = ""}
    if (typeof(this.data.phoneNumber) != "string") {this.data.phoneNumber = ""}
    if (typeof(this.data.date) != "string") {this.data.date = ""}
    if (typeof(this.data.age) != "string") {this.data.age = ""}
    if (typeof(this.data.gender) != "string") {this.data.gender = ""}
    if (typeof(this.data.email) != "string") {this.data.email = ""}
    if (typeof(this.data.department) != "string") {this.data.department = ""}
    if (typeof(this.data.description) != "string") {this.data.description = ""}

  
    // get rid of any bogus properties
    this.data = {
      firstName: sanitizeHTML(this.data.firstName.trim(), {allowedTags: [], allowedAttributes: {}}),
      lastName: sanitizeHTML(this.data.lastName.trim(), {allowedTags: [], allowedAttributes: {}}),
      phoneNumber: sanitizeHTML(this.data.phoneNumber.trim(), {allowedTags: [], allowedAttributes: {}}),
      date: sanitizeHTML(this.data.date.trim(), {allowedTags: [], allowedAttributes: {}}),
      age: sanitizeHTML(this.data.age.trim(), {allowedTags: [], allowedAttributes: {}}),
      eail: sanitizeHTML(this.data.email.trim(), {allowedTags: [], allowedAttributes: {}}),
      department: sanitizeHTML(this.data.department.trim(), {allowedTags: [], allowedAttributes: {}}),
      gender: sanitizeHTML(this.data.gender.trim(), {allowedTags: [], allowedAttributes: {}}),
      description: sanitizeHTML(this.data.description.trim(), {allowedTags: [], allowedAttributes: {}}),
      createdDate: new Date(),
      author: ObjectID(this.userid)
    }
}

Post.prototype.validate = function() {
    if (this.data.firstName == "") {this.errors.push("You must provide a first name.")}
    if (this.data.lastName == "") {this.errors.push("You must provide post last name.")}
    if (this.data.phoneNumber == "") {this.errors.push("You must provide post phone number.")}
    if (this.data.date == "") {this.errors.push("You must provide post date .")}
    if (this.data.age == "") {this.errors.push("You must provide post age .")}
    if (this.data.gender == "") {this.errors.push("You must provide post gender .")}
    if (this.data.description == "") {this.errors.push("You must provide post description .")}
}

Post.prototype.addStudent = function(){
    return new Promise((resolve, reject)=>{
        // this.cleanUp();
        // this.validate();

        if(!this.errors.length){
            //save to the database
            postCollection.insertOne(this.data).then((info)=>{
                resolve(info.ops[0]._id)
            }).catch(()=>{
                this.errors.push("Please try again later.")
                reject(this.errors)
            })
        }else{
            reject(this.errors)
        }
    })
}

Post.search = function(searchTerm){
    return new Promise(async (resolve, reject) => {
        if(typeof(searchTerm) == "string"){
            let posts = await Post([{$match: {$text: {$search: searchTerm}}}]
                ,undefined, [{$sort: {score: {$meta: "textScore"}}}])
                resolve(posts)
            }else{
                reject()
            }
    })
}

module.exports = Post;