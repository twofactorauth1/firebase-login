var mongoose = require('mongoose');
var Client = mongoose.model('Client');
var Customer = mongoose.model('Customer');
var Site = mongoose.model('Site');

module.exports = function () {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            var userType = req.user.role;
            if (userType === 1) {
                Customer.findOne({
                    user: req.user._id
                }, function (err, customer) {
                    next();
                });
            } else if (userType === 2) {
                if (req.session.subDomains) {
                    if (req.session.subDomains.indexOf(req.subdomains.join('.')) === -1) {
                        return res.send(404, 'View does not exist');
                    } else {
                        next();
                    }
                } else {
                    Client.findOne({
                        user: req.user._id
                    }, function (err, client) {
                        if (err) {
                            return res.send(404, 'View does not exist');
                        } else {
                            if (client) {
                                Site.find({
                                    client: client._id
                                }, function (err, sites) {
                                    if (err) {
                                        return res.send(404, 'View does not exist');
                                    } else {
                                        if (sites) {
                                            var subDomains = [];
                                            sites.forEach(function (element, index, array) {
                                                subDomains.push(element.subDomain);
                                            });
                                            req.session.subDomains = subDomains;
                                            if (subDomains.indexOf(req.subdomains.join('.')) === -1) {
                                                return res.send(404, 'View does not exist');
                                            } else {
                                                next();
                                            }
                                        } else {
                                            return res.send(404, 'View does not exist');
                                        }
                                    }
                                });
                            } else {
                                return res.send(404, 'View does not exist');
                            }
                        }
                    });
                }
            } else {
                next();
            }
        } else {
            var allowedPaths = ['/login', '/login/'];
            if (allowedPaths.indexOf(req.path)) {
                next();
            } else {
                return res.send(404, 'View does not exist.');
            }
        }
    }
};