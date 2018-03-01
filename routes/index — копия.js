var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var User = require('../models/account');
var Post = require('../models/post');
var request = require('request');
//var url = require('url');
var router = express.Router();


router.get('/', function (req, res) {
    //console.log(req.params);
    if (req.user) {res.redirect('/profile');}
    res.render('index');//, { user : req.user });
});

router.get('/register', function(req, res) {
    if (req.user) {res.redirect('/profile');}
    res.render('register', { error: "" });
});

router.post('/register', function(req, res, next) {
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
});

router.get('/login', function(req, res) {
    if (req.user) {res.redirect('/profile');}
    //console.log(req.user);

    res.render('login');//, { user : req.user, error : req.flash('error')});
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res, next) {
    req.session.save(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/profile');
    });
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
    //if (err) return next(err);
    if (!req.user) {res.redirect('/');}
    res.render('profile', {username: req.user.username, created: req.user.created, posts: req.user.posts})
});

router.get('/post', function(req, res, next){
    if (!req.user) {res.redirect('/');}
    res.render('post');
});

router.post('/post', function(req, res, next){
    Post.create({
        author: req.user._id,
        text: req.body.text,
    }, function(err, post){
        console.log(post); 
    });
    var value = req.user.posts + 1;
    User.update({username: req.user.username},
        {
            posts: value
        }, function (err){
            console.log(err);
        }
    );
    METHOD_NAME = "wall.post";
    ACCESS_TOKEN = req.user.VK_access_token;
    ID = req.user.VK_id;
    PARAMETERS = 'owner_id=' + ID + '&from_group=1&message=' + req.body.text + '&signed=1&v=5.5';
    //user.findOne({username: req.user.username}, function (err, user){   
    //});
    request({
        method: 'GET',
        uri: 'https://api.vk.com/method/' + METHOD_NAME + '?' + PARAMETERS + '&access_token=' + ACCESS_TOKEN
    }, function (error, response, body) {
        //if(response.statusCode == 200){
            console.log(body);
        //} else {
        //    console.log('error: '+ response.statusCode);
        //    console.log(body);
        //}
    });
    res.redirect('/profile');
});

router.get('/networks', function(req, res, next){
    if (!req.user) {res.redirect('/');}
    res.render('networks');
});
// token vk
router.get('/networks/vk', function(req, res, next){
    if (!req.user) {res.redirect('/');}
    client_id = "5456613";
    redirect_uri = "http://localhost:3000/networks/vk/callback";
    scope = "wall,friends,photos,offline,audio";
    client_secret = "o6IWHTwyextN7jyhfcjl";
    //if (count == 0){
        //console.log("Получение кода");
        //count = 1;
        res.redirect("https://oauth.vk.com/authorize?client_id=" + client_id + "&display=page&redirect_uri=" + redirect_uri + "&scope=" + scope + "&response_type=code&v=5.52");
    //}
    //if (count == 1){
    //  console.log("Получение токена");
    //  count = 2;
    //  res.redirect("https://oauth.vk.com/access_token?client_id=" + client_id + "&client_secret=" + client_secret + "&redirect_uri=" + redirect_uri + "&code=" + req.query.code);
    //}
    //console.log("Вне условия");
    //count = 0;
});
router.get('/networks/vk/callback', function(req, res, next){
    client_id = "5456613";
    client_secret = "o6IWHTwyextN7jyhfcjl";
    redirect_url = "http://localhost:3000/networks/vk/callback";
    code = req.query.code;
    request({
        method: 'GET',
        uri: "https://oauth.vk.com/access_token?client_id=" + client_id + "&client_secret=" + client_secret + "&redirect_uri=" + redirect_url + "&code=" + code
    }, function (error, response, body) {
        if(response.statusCode == 200){
            access_token  = "";
            user_id = "";
            // парсинг
            for (i = 17; ; i++){
                if (body[i] != '"')
                    access_token = access_token + body[i];
                else
                    break;
            }
            for (i = 129; ; i++){
                if (body[i] != '}')
                    user_id = user_id + body[i];
                else
                    break;
            }
            //{"access_token":"ebd73dcf664306cf2ff4e37c1c15bea39bbab6ba57c8ff9778e4b8086765f6f71f593d59df585c7e710fe","expires_in":0,"user_id":61486425}
            User.update({username: req.user.username},
                {
                    VK_access_token: access_token,
                    VK_id: user_id
                }, function (err){
                    console.log(err);
                }
            );
        } else {
            console.log('error: '+ response.statusCode);
        }
    });
    res.redirect('/networks');
});

/*router.get('/ping', function(req, res){
    res.status(200).send("pong!");
    #access_token=:token&expires_in=:expires&user_id=:user
});*/

module.exports = router;
