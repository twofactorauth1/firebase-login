/**
 * OrderController
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
     *    `/profile/find`
     */
    find: function (req, res) {
        if (!(req.param('id'))) {
            //TODO: add error msg
        }
        if (!(req.param('organization'))) {
            //TODO: error msg
        }
        Order.findOne({id: req.param('id'), organization: req.param('organization')}).done(function (err, order) {
            if (err) {
                res.json(err);
            }
            else {
                if (order) {
                    order.getOrderItems(function (err, orderProducts) {
                        if (orderProducts) {
                            order.items = orderProducts;
                        }
                        return res.json(order);
                    });
                }
                else {
                    return res.json(ErrorMessageService.errorMessage(290412));
                }
            }
        });
    },

    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to OrderController)
     */
    _config: {}

    
};
