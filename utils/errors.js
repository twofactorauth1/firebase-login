/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var errors = {
    _401_INVALID_CREDENTIALS: {error: {code:401, message: "Invalid Credentials"}},

    _404_PAGE_NOT_FOUND: {error: {code:404, message: "Page not found"}},

    createError: function(code, message, details) {
        return {error: {code:code, message:message, detail:details}};
    }
};

$$.u.errors = errors;
module.exports = errors;