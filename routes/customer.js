var mongoose = require('mongoose');
var User = mongoose.model('User');
var Customer = mongoose.model('Customer');

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
    return res.json({status: false, message: 'Customer not added'});
};
