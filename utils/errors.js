var errors = {
    _401_INVALID_CREDENTIALS: {error: {code:401, message: "Invalid Credentials"}},

    createError: function(code, message, details) {
        return {error: {code:code, message:message, detail:details}};
    }
};

$$.u.errors = errors;
module.exports = errors;