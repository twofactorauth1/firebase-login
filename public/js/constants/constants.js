if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([], function() {

    var constants = {
        account: {
            company_types: {
                PROFESSIONAL:1,
                BUSINESS:2
            },

            company_size: {
                SINGLE: 1,
                SMALL: 2,
                MEDIUM: 3,
                LARGE: 4,
                ENTERPRISE: 5
            }
        }
    };

    $$ = $$ || {};
    $$.constants = $$.constants || {};
    $$.constants = _.extend($$.constants, constants);

    return $$.constants;
});
