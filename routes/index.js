var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var User = require('../models/account');
var Post = require('../models/post');
var request = require('request');
var router = express.Router();
var fun = require('./functions')
//import * as fun from "./functions"

router.get('/', function(req, res, next){
    if (req.user) {res.redirect('/profile');}
    res.render('index');
});

router.post('/', function(req, res, next) {
    if (req.body.passwordAgain == undefined){
        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.redirect('/'); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/profile');
            });
        })(req, res);
    }
    else{
        if (req.body.password == req.body.passwordAgain){
        User.register(new User({ username: req.body.username , email: req.body.email}), req.body.password, function(err, user) {

            passport.deserializeUser(function(id, done) {
                getUser(id).then(function(user) {
                    user.created = Date.now;
                    user.posts = 0;
                    user.VK_id = -1;
                    user.VK_access_token = null;
                    return done(null, user);
                });
            });

            if (err) {
                return res.render('register', { error : err.message });
            }

            passport.authenticate('local')(req, res, function () {
                req.session.save(function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.redirect('/profile');
                });
            });
        });
        }
        else{
            res.render('register', {error: "Пароли не совпадают"});
        }
    }
});

router.get('/logout', function(req, res, next) {
    req.logout();
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.get('/profile', function(req, res, next){
    if (!req.user) {res.redirect('/');}
    created = String(req.user.created);
    res.render('profile', {username: req.user.username, posts: req.user.posts, created: fun.Pars_reg_data(created)});
});

router.get('/post', function(req, res, next){
    if (!req.user) {res.redirect('/');}
    res.render('post');
});

router.post('/post', function(req, res, next){
    if (!req.user) {res.redirect('/');}

    console.log(req.body.date);
    console.log(req.body.time);

    if (req.body.VK && req.body.text != ""){
        if (!req.body.date && !req.body.time){
            PARAMETERS = 'owner_ids=' + req.user.VK_id + '&message=' + req.body.text + '&signed=1&v=5.52&access_token=' + req.user.VK_access_token;
            request({
                method: 'POST',
                uri: 'https://api.vk.com/method/wall.post?' + PARAMETERS
            }, function (error, response, body) {
                resp = "";
                for(i=2; i < 10; i++)
                    resp = resp + response.body[i];
                if("response" == resp){
                    Post.create({ //создание новой записи в коллекции Posts
                        author: req.user._id,
                        text: req.body.text,
                        VK: req.body.VK,
                        FB: req.body.FB,
                        TT: req.body.TT
                    }, function(err, post){ console.log(err); });
                    User.update({username: req.user.username}, // изменение в количестве постов пользователя
                        {
                            posts: req.user.posts + 1
                        }, function (err){ console.log(err); });
                } else {
                    console.log('error: '+ body);
                }
            });
            res.redirect('/profile');
        }
        else{
            post_time = fun.Pars_post_time(req.body.date, req.body.time, fun.Unixtime);
            PARAMETERS = 'owner_ids=' + req.user.VK_id + '&message=' + req.body.text + '&signed=1&publish_date=' + post_time + '&v=5.52&access_token=' + req.user.VK_access_token;
            request({
                method: 'POST',
                uri: 'https://api.vk.com/method/wall.post?' + PARAMETERS
            }, function (error, response, body) {
                resp = "";
                for(i=2; i < 10; i++)
                    resp = resp + response.body[i];
                if("response" == resp){
                    Post.create({
                        author: req.user._id,
                        text: req.body.text,
                        VK: req.body.VK,
                        FB: req.body.FB,
                        TT: req.body.TT
                    }, function(err, post){ console.log(err); });
                    User.update({username: req.user.username},
                        {
                            posts: req.user.posts + 1
                        }, function (err){ console.log(err); });
                } else {
                    console.log('error: '+ body);
                }
            });
            res.redirect('/profile');
        }
    }
    res.redirect('/post');
});

router.get('/networks', function(req, res, next){
    if (!req.user) {res.redirect('/');}
    res.render('networks');
});

router.get('/networks/vk', function(req, res, next){
    if (!req.user) {res.redirect('/');}
    res.render('vk_callback');
});

router.post('/networks/vk', function(req, res, next){
    if (!req.user) {res.redirect('/');}
    //<a href="/networks/vk" onclick="this.target='_blank';"> <img src="img/VK1.png" class="images" style="margin-top: 40px"> click</a>
    User.update({username: req.user.username},
        {
            VK_access_token: fun.Pars_token(req.body.url),
            VK_id: fun.Pars_id(req.body.url)
        }, function (err){
            console.log(err);
        }
    );
    res.redirect('/networks');
});

router.get('/contacts', function(req, res, next){
    if (!req.user) {res.redirect('/');}
    res.render('contacts');
});

router.get('/history', function(req, res, next){
    if (!req.user) {res.redirect('/');}
    var post_list = [];
    Post.find({author: req.user._id}, function(err, posts){
            for(i in posts){
                for(j = 0; j < 6; j++)
                    post_list[i] = [];
                date = "";
                date = posts[i].PostDate.getDate() + "." + posts[i].PostDate.getMonth() + "." + posts[i].PostDate.getFullYear() + " " + posts[i].PostDate.getHours() + ":" + posts[i].PostDate.getMinutes();
                post_list[i][0] = posts[i].text;
                if (posts[i].TT == false)
                    post_list[i][1] = "Нет";
                if (posts[i].FB == false)
                    post_list[i][2] = "Нет";
                if (posts[i].VK == true)
                    post_list[i][3] = "Да";
                post_list[i][4] = date;
                date = "";
                date = posts[i].СreationDate.getDate() + "." + posts[i].СreationDate.getMonth() + "." + posts[i].СreationDate.getFullYear() + " " + posts[i].СreationDate.getHours() + ":" + posts[i].СreationDate.getMinutes();
                post_list[i][5] = date;
            }
        //console.log(JSON.parse(JSON.stringify(post_list)));
        //console.log(post_list);
        res.render('history', {
            posts: JSON.parse(JSON.stringify(post_list))
        });
    });
    
});
module.exports = router;