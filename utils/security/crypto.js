var bcrypt = require('bcrypt');

var hash = function(data, fn) {
    if (fn == null) {
        return bcrypt.hashSync(data, 12);
    }


    bcrypt.hash(data, 12, function(err, hash) {
       if (!err) {
           fn(null, hash);
       } else {
           fn(err, hash);
       }
    });
};

var verify = function(unencrypted, encrypted, fn) {
    if (fn == null) {
        return bcrypt.compareSync(unencrypted, encrypted);
    }

    bcrypt.compare(unencrypted, encrypted, function(err, value) {
       if (!err) {
           fn(null, value)
       } else {
           fn(err, value);
       }
    });
};

module.exports.hash = hash;
module.exports.verify = verify;