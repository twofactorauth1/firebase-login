var ERROR_MSGS = {};
ERROR_MSGS[29041] = 'organization doesnt exist';
ERROR_MSGS[29042] = 'organization param missing';
ERROR_MSGS[29043] = 'user ID param missing';
ERROR_MSGS[29044] = 'user does not exist or is inactive';
ERROR_MSGS[29045] = 'access token missing';
ERROR_MSGS[29046] = 'login failed';
ERROR_MSGS[29047] = 'login successful';
ERROR_MSGS[29048] = 'logout successful';
ERROR_MSGS[29049] = 'unknown user';
ERROR_MSGS[290410] = 'invalid password';
ERROR_MSGS[290411] = 'unauthenticated user';

exports.errorMessage = function (err) {
    if (ERROR_MSGS.hasOwnProperty(err)) {
        var ret = {};
        ret.code = err;
        ret.message = ERROR_MSGS[err];
        return ret;
    }
    else {
        sails.log.warn('missing error code ', err);
    }
};
