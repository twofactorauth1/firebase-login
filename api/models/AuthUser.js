/**
 * AuthUser
 *
 * @module      :: Model
 * @description :: Authenticated user representation.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */
var bcrypt = require('bcrypt');

module.exports = {
    attributes: {
        username: {type: 'string', required: true, unique: true},
        password: {type:'string', required: true},
        toJSON: function () {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }
    },
    beforeCreate: function (authUser, callback) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(authUser.password, salt, function (err, hash) {
                if (err) {
                    sails.log.error(err);
                }
                else {
                    authUser.password = hash;
                    callback(null, authUser);
                }
            });
        });
    }
};
