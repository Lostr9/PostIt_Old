var mongoose = require('mongoose');

//var ObjectId = mongoose.Schema.Types.ObjectId;

var Post = new mongoose.Schema({
	author: {
		type: mongoose.Schema.Types.ObjectId
	},
	text: {
		type: String,
	},
	СreationDate: {
		type: Date,
		default: Date.now
	},
	PostDate: {
		type: Date,
		default: Date.now
	},
	VK: {
		type: Boolean,
		default: false
	},
	FB: {
		type: Boolean,
		default: false
	},
	TT: {
		type: Boolean,
		default: false
	}
});

var Post = mongoose.model('posts', Post);
module.exports = mongoose.model('posts', Post);
exports.PostSchema = mongoose.model('posts', Post);