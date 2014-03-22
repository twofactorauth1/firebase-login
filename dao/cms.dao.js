var baseDao = require('./base.dao');
var fs = require('fs');
var async = require('async');
var accountDao = require('./account.dao');
var themeConfig = require('../configs/themes.config');

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
        var pathToThemes = themeConfig.PATH_TO_THEMES;

        var pathToTheme = pathToThemes + "/" + themeId;

        fs.lstat(pathToTheme, function (err, stats) {
            if (!err && stats.isDirectory()) {
                return fn(null, true);
            }
            return fn(null, false);
        });
    },

    getAllThemes: function (fn) {
        var self = this;
        var pathToThemes = themeConfig.PATH_TO_THEMES;

        var themes = [];
        fs.readdir(pathToThemes, function (err, files) {
            async.eachLimit(files, 25, function (file, cb) {
                fs.lstat(pathToThemes + "/" + file, function (err, stats) {
                    if (!err && stats.isDirectory()) {
                        //Attempt to read config file from directory
                        fs.readFile(pathToThemes + "/" + file + "/config.json", "utf8", function(err, data) {
                            if (err) { return self.log.error("An error occurred reading Theme config File: " + err); }

                            data = JSON.parse(data);

                            themes.push({
                                id: data['theme-id'],
                                name: data['theme-name'],
                                description: data['theme-description']
                            });

                            cb();
                        });
                    }
                })
            }, function (err) {
                fn(err, themes);
            });
        });
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
