'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Blog = mongoose.model('Blog'),
	_ = require('lodash');

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = 'Blog already exists';
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

/**
 * Create a blog
 */
exports.create = function(req, res) {
	var blog = new Blog(req.body);
	blog.user = req.user;

	blog.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(blog);
		}
	});
};

/**
 * Show the current blog
 */
exports.read = function(req, res) {
	res.jsonp(req.blog);
};

/**
 * Update a blog
 */
exports.update = function(req, res) {
	var blog = req.blog;

	blog = _.extend(blog, req.body);

	blog.save(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(blog);
		}
	});
};

/**
 * Delete an blog
 */
exports.delete = function(req, res) {
	var blog = req.blog;

	blog.remove(function(err) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(blog);
		}
	});
};

/**
 * List of Blogs
 */
exports.list = function(req, res, next) {
	Blog.find().sort('-created').populate('user', 'username').exec(function(err, blogs) {
		if (err) {
			return res.send(400, {
				message: getErrorMessage(err)
			});
		} else {
			res.jsonp(blogs);
			//req.blogs = blogs;
			//next();
		}
	});
};

/**
 * Blog middleware
 */
exports.blogByID = function(req, res, next, id) {
	Blog.findById(id).populate('user', 'username').exec(function(err, blog) {
		if (err) return next(err);
		if (!blog) return next(new Error('Failed to load blog ' + id));
		req.blog = blog;
		next();
	});
};

/**
 * Blog authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.blog.user.id !== req.user.id) {
		return res.send(403, {
			message: 'User is not authorized'
		});
	}
	next();
};