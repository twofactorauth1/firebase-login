/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

var bcrypt = require('bcrypt');
var crypto = require('crypto');
var appConfig = require('../../configs/app.config');

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


var signDocument = function(document, keys) {
    if (keys == null) {
        keys = "";
    }

    if (_.isObject(keys)) {
        keys = JSON.stringify(keys);
    }

    if (_.isString(keys) == false) {
        keys = keys.toString();
    }

    var signature = getSignature(keys);

    if (document.hasOwnProperty("attributes")) {
        document.attributes.__signature = signature;
    } else {
        document.__signature = signature;
    }
};


var verifySignature = function(document, keys) {
    var signature;
    if (document.hasOwnProperty("attributes")) {
        signature = document.attributes.__signature;
    }

    if (signature == null) {
        signature = document.__signature;
    }

    if (signature == null) {
        return false;
    }

    if (signature == getSignature(keys)) {
        return true;
    }
    return false;
};


var getSignature = function(keys) {
    if (keys == null) {
        keys = "";
    }

    if (_.isObject(keys)) {
        keys = JSON.stringify(keys);
    }

    if (_.isString(keys) == false) {
        keys = keys.toString();
    }

    return crypto.createHmac("sha256", appConfig.SIGNATURE_SECRET).update(keys).digest('hex');
};

module.exports.hash = hash;
module.exports.verify = verify;
module.exports.signDocument = signDocument;
module.exports.verifySignature = verifySignature;
module.exports.getSignature = getSignature;