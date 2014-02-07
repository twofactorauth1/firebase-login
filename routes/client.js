var mongoose = require('mongoose');
var User = mongoose.model('User');
var Client = mongoose.model('Client');
var Site = mongoose.model('Site');

exports.add = function (req, res) {
    User.findOne({email: req.body.email}, function (err, user) {
        if (err) {
            return res.json({status: false, message: err.message});
        }
        else {
            if (user) {
                return res.json({status: false, message: 'User Exists'});
            }
            else {
                User.create({email: req.body.email, password: req.body.password}, function (err, newUser) {
                    if (err) {
                        return res.json({status: false, message: err.message});
                    }
                    else {
                        if (newUser) {
                            Client.create({user: newUser._id}, function (err, client) {
                                if (err) {
                                    return res.json({status: false, message: err.message});
                                }
                                else {
                                    if (client) {
                                        Site.create({client: client._id, subDomain: req.body.subdomain}, function (err, site) {
                                            if (err) {
                                                return res.json({status: false, message: err.message});
                                            }
                                            else {
                                                if (site) {
                                                    return res.json({status: true, message: 'Site created successfully'});
                                                }
                                                else {
                                                    return res.json({status: false, message: 'Failed to create site'});
                                                }
                                            }
                                        });
                                    }
                                    else {
                                        return res.json({status: false, message: 'Failed to create client'});
                                    }
                                }
                            });
                        }
                        else {
                            return res.json({status: false, message: 'Failed to create user'});
                        }
                    }
                });
            }
        }
    });
};
