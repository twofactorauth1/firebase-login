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
    $$.s = $$.security = $$.security || {};
    $$.g = $$.global = global = $$.global || {};

})();

module.exports = {};
