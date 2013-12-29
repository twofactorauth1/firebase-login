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
        if (!(req.param('access_token'))) {
            return res.json(ErrorMessageService.errorMessage(29045));
        }
        User.findOne({'access_token': req.param('access_token'), isActive: true}).done(function (err, user) {
            if (err) {
                return res.json(err);
            }
            else {
                if (user) {
                    return res.json({_id: user._id});
                }
                else {
                    return res.json(ErrorMessageService.errorMessage(29044));
                }
            }
        });
    },


    /**
     * Action blueprints:
     *    `/user/create`
     */
    create: function (req, res) {
        if (!(req.body.organization)) {
            return res.json(ErrorMessageService.errorMessage(29042));
        }
        if (!(req.body._id || req.body.uid)) {
            return res.json(ErrorMessageService.errorMessage(29043));
        }
        if (!(req.body.access_token)) {
            return res.json(ErrorMessageService.errorMessage(29045));
        }
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
        if (!(req.body.organization)) {
            return res.json(ErrorMessageService.errorMessage(29042));
        }
        if (!(req.body._id || req.body.uid)) {
            return res.json(ErrorMessageService.errorMessage(29043));
        }
        if (!(req.body.access_token)) {
            return res.json(ErrorMessageService.errorMessage(29045));
        }
        User.update(req.body, {isActive: false}, function (err, users) {
            if (err) {
                return res.json(err);
            }
            else {
                if (users && users.length) {
                    var user = users[0];
                    user.code = 201;
                    user.message = 'Ok';
                    return res.json(user);
                }
                else {
                    sails.log.error('no user updated');
                    return res.json(ErrorMessageService.errorMessage(29043));
                }
            }
        });
    },


    /**
     * Action blueprints:
     *    `/user/destroy`
     */
    destroy: function (req, res) {
        if (!(req.body.organization)) {
            return res.json(ErrorMessageService.errorMessage(29042));
        }
        if (!(req.body._id || req.body.uid)) {
            return res.json(ErrorMessageService.errorMessage(29043));
        }
        if (!(req.body.access_token)) {
            return res.json(ErrorMessageService.errorMessage(29045));
        }
        var query = req.body;
        query.isActive = true;
        User.findOne(query).done(function (err, user) {
            if (err) {
                return res.json(err);
            }
            else {
                if (user) {
                    user.destroy(function (err) {
                        if (err) {
                            return res.json(err);
                        }
                        else {
                            return res.json({code: 200, message: 'Ok'});
                        }
                    });
                }
                else {
                    return res.json(ErrorMessageService.errorMessage(29044));
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
