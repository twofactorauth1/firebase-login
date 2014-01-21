/**
 * StripeController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
    
    /**
     * Action blueprints:
     *    `/stripe/checkout`
     */
    checkout: function (req, res) {
        if (req.method === 'POST') {
            StripeService.charge(req.body.stripeEmail, 2000, req.body.stripeToken, 1);
        }
        return res.view();
    },
    /**
     * Action blueprints:
     *    `/stripe/checkout/charge/`
     */
    charge: function (req, res) {
        if (req.method === 'POST') {
            StripeService.orderCharge(req.body);
            return res.json(ErrorMessageService.ErrorMessage(290414));
        }
        else {
            return res.view('404');
        }
    },

    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to StripeController)
     */
    _config: {}

    
};
