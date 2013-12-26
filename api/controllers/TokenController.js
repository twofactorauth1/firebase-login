/**
 * TokenController
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
     *    `/token/find`
     */
    find: function (req, res) {
        console.log(req.param('organization'));
        var query = {};
        if (req.param('organization')) {
            query.organization = req.param('organization');
        }
        else {
            res.json(ErrorMessageService.errorMessage(29042));
        }
        
        if (req.param('_id')) {
            query._id = req.param('_id');
        }
        else {
            res.json(ErrorMessageService.errorMessage(29043));
        }
        
        User.findOne(query).done(function (err, user) {
            if (err) {
                res.json(err);
            }
            else {
                //TODO: add access token generation and reset logic.
                res.json(user);
            }
        });
    },




    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to TokenController)
     */
    _config: {}

    
};
