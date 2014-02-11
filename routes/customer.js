var crypto = require('crypto');
var mongoose = require('mongoose');
var deepcopy = require('deepcopy');
var User = mongoose.model('User');
var Customer = mongoose.model('Customer');
var Site = mongoose.model('Site');

exports.check = function (req, res) {
    var model = mongoose.model(req.param('type'));
    var property = req.param('property');
    var value = req.param('value');
    model.find({property: value}, function (err, docs) {
        if (err) {
            return res.json({status: false, message: err.message});
        }
        else {
            if (docs.length) {
                return res.json({status: false, message: 'Not unique.'});
            }
            else {
                return res.json({status: true, message: 'Unique'});
            }
        }
    });
};

exports.add = function (req, res) {
    var userInsert = {email: req.body.email, role: 1};
    userInsert.password = crypto.createHash('md5').update(req.body.email).digest('hex');
    User.create(userInsert, function (err, user) {
        if (err) {
            return res.json({status: false, message: err.message});
        }
        else {
            if (user) {
                var customerInsert = deepcopy(req.body);
                customerInsert.user = user._id;
                //TODO add site ref.
                Customer.create(customerInsert, function (err, customer) {
                    if (err) {
                        return res.json({status: false, message: err.message});
                    }
                    else {
                        if (customer) {
                            return res.json({status: true, message: 'customer created', user: user, customer: customer});
                        }
                        else {
                            return res.json({status: false, message: 'customer not created'});
                        }
                    }
                });
            }
            else {
                return res.json({status: false, message: 'User not ceated'});
            }
        }
    });
};
