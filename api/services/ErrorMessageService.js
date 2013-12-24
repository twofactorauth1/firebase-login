var ERROR_MSGS = {};
ERROR_MSGS[29041] = 'Organization doesnt exist';

exports.errorMessage = function (err) {
    if (ERROR_MSGS.hasOwnProperty(err)) {
        var ret = {};
        ret.status = false;
        ret.error = err;
        ret.message = ERROR_MSGS[err];
        return ret;
    }
    else {
        console.log('ErrorMsgMissing:', err);
    }
};
