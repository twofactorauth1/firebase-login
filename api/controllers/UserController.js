/**
 * UserController
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
    create: function(req, res) {
        console.log(req.method);
        OrganizationService.checkOrganizationExist(req.body.organization, function (org_exist) {
            if (org_exist) {
                
            }
            else {
                return res.json(ErrorMessageService.errorMessage(29041));
            }
        });
    },
    _config: {}
};
