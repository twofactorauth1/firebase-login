var https = require('https');
var util = require('util');
var TwoNetBase = require('./twonet_base');

var UserRegistration = function() {
    this.init.apply(this, arguments);
}

_.extend(UserRegistration.prototype, TwoNetBase.prototype, {

    USER_REGISTER_ENDPOINT: "/partner/register",

    USER_UNREGISTER_ENDPOINT: String("/partner/user/delete/%s"),

    register: function(user_guid, callback) {

        var body = JSON.stringify({registerRequest:{guid:user_guid}});

        var options = this.twonetOptions(this.HTTP_METHOD.POST, this.USER_REGISTER_ENDPOINT);

        console.log(this.makeUrl(options));
        console.log("==> Request: " + body);

        var req = https.request(options, function(res) {
            console.log("==> Response status code: " + res.statusCode);
            //console.log("headers: ", res.headers);

            res.on('data', function(d) {
                var response = JSON.parse(d);
                console.log("==> Response: " + JSON.stringify(response));
                if (res.statusCode != 200) {
                    //console.log("status:" + response['errorStatus']['status'])
                    //console.log("code:" + response['errorStatus']['code'])
                    //console.log("message:" + response['errorStatus']['message'])
                    return callback(new Error(JSON.stringify(response)), null);
                }

                return callback(null, user_guid);
            });
        });

        req.write(body);
        req.end();
    },

    unregister: function(user_guid, callback) {

        var options = this.twonetOptions(this.HTTP_METHOD.DELETE,
            util.format(this.USER_UNREGISTER_ENDPOINT, user_guid));

        console.log(this.makeUrl(options));

        var req = https.request(options, function(res) {
            console.log("==> Response status code: " + res.statusCode);

            res.on('data', function(d) {
                var response = JSON.parse(d);
                console.log("==> Response: " + JSON.stringify(response));
                if (res.statusCode != 200) {
                    return callback(new Error(JSON.stringify(response)), null);
                }

                return callback(null, user_guid);
            });
        });

        req.end();
    }
});

module.exports = new UserRegistration();