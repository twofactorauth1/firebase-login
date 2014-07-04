/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

(function() {
    if (typeof indigenous == 'undefined') {
        indigenous = {};
    }

    if (typeof $$ == 'undefined') {
        $$ = indigenous;
    } else {
        $$ = _.extend($$, indigenous);
        indigenous = $$;
    }

    $$.m = $$.models = $$.models || {};
    $$.c = $$.collections = $$.collections || {};
    $$.v = $$.views = $$.views || {};
    $$.r = $$.routers = $$.routers || {};
    $$.u = $$.utils = $$.utils || {};
    $$.s = $$.security = $$.security || {};
    $$.g = $$.global = $$.global || {};
    $$.svc =  $$.services = $$.services || {};
    $$.constants = $$.constants || {};

    // namespace for social dashboard
    $$.modules = {};
    $$.Charts = {};
})();
