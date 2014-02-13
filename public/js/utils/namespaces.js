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
    $$.c = $$.collections = $$.collections || {};
    $$.v = $$.views = $$.views || {};
    $$.r = $$.routers = $$.routers || {};
    $$.u = $$.utils = $$.utils || {};
    $$.s = $$.security = $$.security || {};
    $$.g = $$.global = $$.global || {};
    $$.constants = $$.constants || {};
})();
