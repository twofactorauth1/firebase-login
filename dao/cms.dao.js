var baseDao = require('./base.dao');
var fs = require('fs');
var async = require('async');
var crypto = require('crypto');

var accountDao = require('./account.dao');
var themesConfig = require('../configs/themes.config');

var Website = require('../models/cms/website');
var Page = require('../models/cms/page');

var dao = {

    options: {
        name: "cms.dao",
        defaultModel: null
    },


    //region THEMES

    /**
     * Determines if a theme already exists.  This will be important when
     * end users can create new themes and store them here, we will need to
     * ensure the Theme ID is not already in use.
     *
     * @param themeId
     * @param fn
     */
    themeExists: function (themeId, fn) {
        var pathToThemes = themesConfig.PATH_TO_THEMES;

        var pathToTheme = pathToThemes + "/" + themeId;

        fs.lstat(pathToTheme, function (err, stats) {
            if (!err && stats.isDirectory()) {
                return fn(null, true);
            }
            return fn(null, false);
        });
    },


    /**
     * Retrieves basic theme information for all themes in the system.
     * @param fn
     */
    getAllThemes: function (fn) {
        //TODO - Cache this

        var self = this;
        var pathToThemes = themesConfig.PATH_TO_THEMES;

        var themes = [];
        fs.readdir(pathToThemes, function (err, files) {
            async.eachLimit(files, 25, function (directory, cb) {
                fs.lstat(pathToThemes + "/" + directory, function (err, stats) {
                    if (err) {
                        return cb(err);
                    }
                    if (stats.isDirectory()) {
                        //Attempt to read config file from directory
                        fs.readFile(pathToThemes + "/" + directory + "/config.json", "utf8", function(err, data) {
                            if (err) { return self.log.error("An error occurred reading Theme config File: " + err); }

                            data = JSON.parse(data);

                            var obj ={
                                id: data['theme-id'],
                                name: data['theme-name'],
                                description: data['theme-description'],
                                tags: data.tags || []
                            };

                            if (obj.id != directory) {
                                self.log.error("Configuration ID does not match directory Id for: " + directory);
                                return cb("Configuration ID does not match directory Id for: " + directory);
                            }

                            themes.push(obj);
                            cb();
                        });
                    } else {
                        cb();
                    }
                })
            }, function (err) {
                fn(err, themes);
            });
        });
    },


    /**
     * Retrieves an unsigned copy of the theme config.  This is only suitable
     * for internal or read-only use.
     *
     * @param themeId
     * @param fn
     * @returns {*}
     */
    getThemeConfig: function(themeId, fn) {
        return this._getThemeConfig(themeId, false, fn);
    },


    /**
     * Retrieves a signed copy of the theme config.  This is suitable for sending
     * out to be modified and returned / updated
     *
     * @param themeId
     * @param fn
     * @returns {*}
     */
    getThemeConfigSigned: function(themeId, fn) {
        return this._getThemeConfig(themeId, true, fn);
    },


    _getThemeConfig: function(themeId, signed, fn) {
        var self = this;
        var pathToThemeConfig = themesConfig.PATH_TO_THEMES + "/" + themeId + "/config.json";

        var themeConfig, defaultConfig;
        async.parallel([
            function(cb) {
                // Read theme config
                fs.readFile(pathToThemeConfig, "utf8", function(err, data) {
                    if (err) {
                        self.log.error("An error occurred reading Theme config File: " + err);
                        return cb("An error occurred reading theme config file: " + err);
                    }

                    var data = JSON.parse(data);

                    if (data['theme-id'] != themeId) {
                        self.log.error("Configuration ID does not match directory Id for: " + themeId);
                        return cb("Configuration ID does not match directory Id for: " + themeId);
                    }

                    if (signed === true) {
                        // This ensures the Theme ID has not changed if the user makes modifications and returns this file
                        data.signature = self._getSignature(themeId);
                    }

                    themeConfig = data;

                    cb();
                });
            },

            function(cb) {
                fs.readFile(themesConfig.PATH_TO_THEMES + "/config.json", "utf8", function(err, data) {
                    if (err) {
                        self.log.error("An error occurred reading Default theme config File: " + err);
                        return cb("An error occurred reading default theme config file: " + err);
                    }

                    var data = JSON.parse(data);

                    defaultConfig = data;

                    cb();
                });
            }
        ], function(err) {

            if (err) {
                return fn(err);
            }

            if (signed) {
                themeConfig.signatures = {};
            }

            //We have both the theme config and the default config
            for (var key in defaultConfig) {
                if (themeConfig.hasOwnProperty(key) == false || themeConfig[key] == null) {
                    themeConfig[key] = defaultConfig[key];

                    if (signed) {
                        themeConfig.signatures[key] = self._getSignature(defaultConfig[key]);
                    }
                }
            }

            fn(null, themeConfig);
        });
    },


    _getSignature: function(obj) {
        if (obj == null) {
            obj = "";
        }

        if (_.isObject(obj)) {
            obj = JSON.stringify(obj);
        }

        if (_.isString(obj) == false) {
            obj = obj.toString();
        }

        var signature = crypto.createHmac("sha256", themesConfig.THEME_ID_SIGNATURE_SECRET).update(obj).digest('hex');
        return signature;
    },
    //endregion


    //region Account Websites

    /**
     * Retrieves the current website for an account, or creates a new one if
     * one does not exist.
     *
     * @param accountId
     * @param userId
     * @param fn
     */
    getOrCreateWebsiteByAccountId: function (accountId, userId, fn) {
        var self = this;
        accountDao.getById(accountId, function (err, value) {
            if (err) {
                return fn(err, value);
            }

            var websiteId = value.get("websiteId");
            if (String.isNullOrEmpty(websiteId)) {
                return self.createWebsiteForAccount(accountId, userId, fn);
            }

            self.getById(websiteId, Website, fn);
        });
    },


    /**
     * Creates a website object for an account.
     *
     * @param accountId
     * @param userId
     * @param fn
     */
    createWebsiteForAccount: function (accountId, userId, fn) {
        var self = this;
        var website = new Website({
            accountId: accountId
        });

        website.created(userId);

        this.saveOrUpdate(website, function (err, value) {
            if (err) {
                return fn(err, value);
            }

            website = value;
            var websiteId = website.id();

            accountDao.getById(accountId, function (err, value) {
                if (err) {
                    return fn(err, value);
                }

                if (value.get("websiteId") == null) {
                    value.set({websiteId: websiteId});


                    accountDao.saveOrUpdate(value, function () {
                        return fn(null, website);
                    });
                } else {
                    return fn(null, website);
                }
            });
        });
    },


    /**
     * Deletes a website by ID.  We call this special method, instead of
     * the base #remove() method, as we want to also remove references
     * to the website on Account object
     *
     * @param websiteId
     * @param fn
     */
    deleteWebsite: function (websiteId, fn) {
        var self = this;
        this.getById(websiteId, Website, function (err, value) {
            if (err) {
                return fn(err, value);
            }

            if (value == null) {
                return fn("Website [" + websiteId + "] does not exist");
            }

            var accountId = value.get("accountId");

            self.remove(value, function (err, value) {
                if (err) {
                    return fn(err, value);
                }

                if (accountId > 0) {
                    accountDao.getById(accountId, function (err, value) {
                        if (err) {
                            return fn(err, value);
                        }

                        if (value != null && value.get("websiteId") == websiteId) {
                            value.set({websiteId: null});

                            accountDao.saveOrUpdate(value, function (err, value) {
                                if (err) {
                                    return fn(err, value);
                                }

                                return fn(null);
                            });
                        } else {
                            return fn(null);
                        }
                    });
                } else {
                    fn(null);
                }
            });
        });
    },


    /**
     * An account has a default website. This switches the default website
     * to the ID passed in.
     *
     * @param accountId
     * @param websiteId
     * @param fn
     */
    switchDefaultWebsite: function (accountId, websiteId, fn) {
        //ensure website exists and belongs to this account
        this.getById(websiteId, Website, function (err, value) {
            if (err) {
                return fn(err, value);
            }

            if (value == null) {
                return fn("Website does not exist!");
            }

            if (value.get("accountId") != accountId) {
                return fn("Website [" + websiteId + "] does not belong to account: " + accountId);
            }

            accountDao.getById(accountId, function (err, value) {
                if (err) {
                    return fn(err, value);
                }

                value.set({websiteId: websiteId});

                accountDao.saveOrUpdate(value, fn);
            });
        });
    }
    //endregion
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.CmsDao = dao;

module.exports = dao;
