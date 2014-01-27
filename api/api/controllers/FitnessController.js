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
var deepcopy = require('deepcopy');

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
                            if (err) {
                                return res.json(err);
                            }
                            else {
                                if (fitness) {
                                    return res.json(fitness);
                                }
                                else {
                                    return res.json(ErrorMessageService.errorMessage(290413));
                                }
                            }
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
     * Action blueprints:
     *    `/fitness/create`
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
        var insertDict = deepcopy(req.body);
        delete insertDict[organization];
        delete insertDict[access_token];
        OrganizationService.checkOrganizationExist(req.body.organization, function (orgExist) {
            if (orgExist) {
                UserService.UserExists(req.body._id, req.body.uid, req.body.access_token, function (userExists) {
                    if (userExists) {
                        Fitness.create(insertDict).done(function (err, fitness) {
                            if (err) {
                                return res.json(err);
                            }
                            else {
                                if (fitness) {
                                    return res.json(fitness);
                                }
                                else {
                                    return res.json(ErrorMessageService.errorMessage(290413));
                                }
                            }
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
     * Action blueprints:
     *    `/fitness/update`
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
        var insertDict = deepcopy(req.body);
        delete insertDict[organization];
        delete insertDict[access_token];
        OrganizationService.checkOrganizationExist(req.body.organization, function (orgExist) {
            if (orgExist) {
                UserService.UserExists(req.body._id, req.body.uid, req.body.access_token, function (userExists) {
                    if (userExists) {
                        Fitness.update({_id: req.body._id}, insertDict, function (err, fitness) {
                            if (err) {
                                return res.json(err);
                            }
                            else {
                                if (fitness) {
                                    return res.json(fitness);
                                }
                                else {
                                    return res.json(ErrorMessageService.errorMessage(290413));
                                }
                            }
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
