/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

(function() {

    var passThroughs = [
        "/home",
        "/login",
        "/logout",
        "/forgotpassword",
        "/signup/facebook",
        "/signup/twitter",
        "/signup/linkedin",
        "/signup/google",
        "/",
        ""
    ];

    //ensure we don't have any changed
    $(document).on("click", "a", function(event) {
        if ($(event.currentTarget).attr("target") == "_blank") {
            return;
        }
        if ($(event.currentTarget).attr("href") == "#") {
            return;
        }
        var hasUnsaved = $$.viewManager.hasUnsavedInMain();
        if (hasUnsaved === true || _.isString(hasUnsaved)) {
            var str = "There are unsaved changes on the page.  Are you sure you want to continue?";
            if (!(hasUnsaved === true)) {
                str = hasUnsaved + " Are you sure you want to continue?";
            }

            var continueWithLoad = window.confirm(str);

            if (continueWithLoad === false) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        }
    });


    $(document).on("click", "a.authenticated", function(event) {
        var accountId = $(event.currentTarget).data("accountid");
        var path = $(event.currentTarget).attr("href");

        if (accountId != null) {
            event.stopImmediatePropagation();
            event.preventDefault();

            require(['services/authentication.service'], function() {
                $$.svc.AuthenticationService.getAuthenticatedUrl(accountId, path)
                    .done(function(url) {
                        window.location.href=url;
                    });
            })
        }
    });


    //# Globally capture clicks. If they are internal and not in the pass
    //# through list, route them through Backbone's navigate method.
    $(document).on("click", "a[href^='/']", function(event) {
        var href = $(event.currentTarget).attr("href");

        var currPath = window.location.pathname;

        var passThrough;
        for(var i = 0; i < passThroughs.length; i++) {
            if (href.indexOf(passThroughs[i]) >= 0) {
                //if this is a passthrough, ensure we're not already on that base
                if (passThroughs[i] !== "/" && currPath.indexOf(passThroughs[i]) === 0) {
                    passThrough = false;
                    break;
                } else if (passThroughs[i] === "/") {
                    passThrough = false;
                    break;
                } else {
                    passThrough = true;
                    break;
                }
            }
        }

        if (!passThrough && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
            event.preventDefault();
            var url = $(event.currentTarget).attr("href").replace(/^\//, "");
            $$.r.mainAppRouter.navigate(url, { trigger: true });
            return false;
        }
    });

    //in your application, rather than using window.location to get the current url
    if (typeof $$ === 'undefined') {
        $$ = {};
    }

    $$.getLocation = function(){
        return window.location.protocol + '//' + window.location.host
            + '/' + Backbone.history.options.root + Backbone.history.getFragment()
    }
}).call(this);