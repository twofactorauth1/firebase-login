/**
 * ProfileController
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
        if (!(req.param('access_token'))) {
            return res.json(ErrorMessageService.errorMessage(29045));
        }
        User.findOne({'access_token': req.param('access_token')}).done(function (err, user) {
            if (err) {
                return res.json(err);
            }
            else {
                if (user && user.isActive) {
                    return res.json(user);
                }
                else {
                    return res.json(ErrorMessageService.errorMessage(29044));
                }
            }
        });
    },


    /**
     * Action blueprints:
     *    `/profile/create`
     */
    create: function (req, res) {
        
        // Send a JSON response
        return res.json({
            hello: 'world'
        });
    },




    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to ProfileController)
     */
    _config: {}

    
};
