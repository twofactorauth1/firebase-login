/**
 * FitnessController
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
     *    `/fitness/find`
     */
    find: function (req, res) {
        if (!(req.body.organization)) {
            return res.json(ErrorMessageService.errorMessage(29042));
        }
        if (!(req.body._id || req.body.uid)) {
            return res.json(ErrorMessageService.errorMessage(29043));
        }
        if (!(req.body.access_token)) {
            return res.json(ErrorMessageService.errorMessage(29045));
        }
        OrganizationService.checkOrganizationExist(req.body.organization, function (orgExist) {
            if (orgExist) {
                UserService.UserExists(req.body._id, req.body.uid, req.body.access_token, function(userExists) {
                    if (userExists) {
                        Fitness.find({user: req.body._id}).done(function (err, fitness) {
                            return res.json(fitness);
                        });
                    }
                    else {
                        return res.json(ErrorMessageService.errorMessage(29044));
                    }
                });
            }
            else {
                return res.json(ErrorMessageService.errorMessage(29041));
            }
        });
    },


    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to FitnessController)
     */
    _config: {}

    
};
