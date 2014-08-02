/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/account/commerce.view',
    'views/account/commercesingle.view'
], function(CommerceView, CommerceSingleView) {

    var router = Backbone.Router.extend({

        routes: {
            "commerce":"showCommerce",
            "commerce/":"showCommerce",

            "commerce/:productId":"showSingleProduct"
        },

        showCommerce: function() {
            console.log('showing commerce');
            var view = new CommerceView();
            $$.viewManager.replaceMain(view);
        },

        showSingleProduct: function(productId) {
            console.log('showing single product '+productId);
            var view = new CommerceSingleView();
            $$.viewManager.replaceMain(view);
        }
    });


    $$.r.account = $$.r.account || {};
    $$.r.account.CommerceRouter = router;
    $$.r.account.commerceRouter = new router();

    return $$.r.account.commerceRouter;
});