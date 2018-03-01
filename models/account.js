var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: String,
    password: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    created: {
    	type: Date,
    	default: Date.now
    },
    posts: {
        type: Number,
        default: 0
    },
    VK_id: {
        type: Number,
        default: -1
    },
    VK_access_token: {
        type: String,
        default: null
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', User);