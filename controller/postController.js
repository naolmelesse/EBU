
const Post = require('../model/Post');

exports.viewAddScreen = function(req, res){
    res.render('add-student');
}

exports.addStudent = function(req, res){
    let post = new Post(req.body, req.session.user._id)

    post.addStudent().then(function(newId){
        req.flash("success", "New student successfully added.")
        req.session.save(() => res.redirect("/"))
    }).catch(function(errors){
        // errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/add-student"))
    })
}


exports.search = function(req, res){
    Post.search(req.body.searchTerm).then(posts => {
        res.json(posts)
    }).catch(() => {
        res.json([])
    })
}

exports.viewStudentProfile = function(req, res){
    res.render('profile');
}