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
    
    
    /**
     * Action blueprints:
     *    `/user/find`
     */
    find: function (req, res) {
        
        // Send a JSON response
        return res.json({
            hello: 'world'
        });
    },


    /**
     * Action blueprints:
     *    `/user/create`
     */
    create: function (req, res) {
        OrganizationService.checkOrganizationExist(req.body.organization, function (org_exist) {
            if (org_exist) {
                User.create(req.body).done(function (err, user) {
                    if (err) {
                        return res.json(err);
                    }
                    else {
                        user.code = 201;
                        user.message = 'Ok';
                        return res.json(user);
                    }
                });
            }
            else {
                return res.json(ErrorMessageService.errorMessage(29041));
            }
        });
    },


    /**
     * Action blueprints:
     *    `/user/update`
     */
    update: function (req, res) {
        
        // Send a JSON response
        return res.json({
            hello: 'world'
        });
    },


    /**
     * Action blueprints:
     *    `/user/destroy`
     */
    destroy: function (req, res) {
        if (!(req.body.organization)) {
            res.json(ErrorMessageService.errorMessage(29042));
        }
        if (!(req.body._id || req.body.uid)) {
            res.json(ErrorMessageService.errorMessage(29043));
        }
        User.findOne(req.body).done(function (err, user) {
            if (err) {
                res.json(err);
            }
            else {
                if (user) {
                    user.destroy(function (err) {
                        if (err) {
                            res.json(err);
                        }
                        else {
                            res.json({code: 200, message: 'Ok'});
                        }
                    });
                }
                else {
                    res.json(ErrorMessageService.errorMessage(29044));
                }
            }
        });
    },




    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to UserController)
     */
    _config: {}

    
};
