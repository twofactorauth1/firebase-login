/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

(function() {

    if (typeof indigenous == 'undefined') {
        indigenous = {};
    }

    if (typeof $$ == 'undefined') {
        $$ = indigenous;
    } else {
        indigenous = $$;
    }

    $$ = $$ || {};
    $$.m = $$.models = $$.models || {};
    $$.v = $$.views = $$.views || {};
    $$.r = $$.routers = $$.routers || {};
    $$.s = $$.security = $$.security || {};
    $$.g = $$.global = $$.global || global;

})();

module.exports = {};
