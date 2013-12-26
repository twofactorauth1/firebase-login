var ERROR_MSGS = {};
ERROR_MSGS[29041] = 'Organization doesnt exist';
ERROR_MSGS[29042] = 'Organization param missing';
ERROR_MSGS[29043] = 'user ID param missing';

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
