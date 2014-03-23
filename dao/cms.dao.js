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
                if (directory == "assets") {
                    return cb();
                }
                fs.lstat(pathToThemes + "/" + directory, function (err, stats) {
                    if (err) {
                        return cb(err);
                    }
                    if (stats.isDirectory()) {
                        //Attempt to read config file from directory
                        fs.readFile(pathToThemes + "/" + directory + "/config.json", "utf8", function (err, data) {
                            if (err) {
                                self.log.error("An error occurred reading Theme config File: " + err);
                                return cb();
                            }

                            data = JSON.parse(data);

                            var obj = {
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
    getThemeConfig: function (themeId, fn) {
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
    getThemeConfigSigned: function (themeId, fn) {
        return this._getThemeConfig(themeId, true, fn);
    },


    _getThemeConfig: function (themeId, signed, fn) {
        var self = this;
        var pathToThemeConfig = themesConfig.PATH_TO_THEMES + "/" + themeId + "/config.json";

        var themeConfig, defaultConfig;
        async.parallel([
            function (cb) {
                // Read theme config
                fs.readFile(pathToThemeConfig, "utf8", function (err, data) {
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

            function (cb) {
                fs.readFile(themesConfig.PATH_TO_THEMES + "/default-config.json", "utf8", function (err, data) {
                    if (err) {
                        self.log.error("An error occurred reading Default theme config File: " + err);
                        return cb("An error occurred reading default theme config file: " + err);
                    }

                    var data = JSON.parse(data);

                    defaultConfig = data;

                    cb();
                });
            }
        ], function (err) {

            if (err) {
                return fn(err);
            }

            //Special case for merging theme components
            var defaultComponents = defaultConfig.components;
            var themeComponents = themeConfig.components;

            if (themeComponents == null) {
                themeComponents = [];
                themeConfig.components = themeComponents;
            }
            for (var i = 0, l = defaultComponents.length; i < l; i++) {
                var defaultComponent = defaultComponents[i];
                var componentType = defaultComponent.type;

                //Get the theme component of same type
                var themeComponent = _.findWhere(themeComponents, {type: componentType});

                if (themeComponent == null) {
                    //Do not add it if it is an excluded component from the theme
                    if (themeConfig['excluded-components'].indexOf(componentType) == -1) {
                        themeComponents.push(defaultComponent);
                    } else {
                        console.log("NOT ADDING: " + componentType);
                    }
                } else {
                    //Merge these together
                    var index = themeComponents.indexOf(themeComponent);
                    themeComponent = $$.u.objutils.extend(true, {}, defaultComponent, themeComponent);
                    themeComponents[index] = themeComponent;

                }
            }

            fn(null, themeConfig);
        });
    },


    _getSignature: function (obj) {
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

    //region PAGE
    getPageForWebsite: function (websiteId, pageName, fn) {
        var query = {websiteId: websiteId, handle: pageName};

        this.findOne(query, Page, fn);
    },
    //endregion

    //region WEBSITES

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

            var website = value.get("website"), websiteId = null;

            if (website != null) {
                websiteId = website.websiteId;
            }
            if (String.isNullOrEmpty(websiteId)) {
                return self.createWebsiteForAccount(accountId, userId, fn);
            }

            return self.getById(websiteId, Website, fn);
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

                var websiteObj = value.get("website");
                if (websiteObj == null || websiteObj.websiteId == null) {
                    if (websiteObj == null) {
                        websiteObj = {
                            websiteId: websiteId,
                            themeId: "default"
                        };
                        value.set({website: websiteObj});
                    } else {
                        websiteObj.websiteId = websiteId;
                        if (websiteObj.themeId == null) {
                            websiteObj.themeId = "default";
                        }
                    }
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

                        if (value != null && value.get("website") != null && value.get("website").websiteId == websiteId) {
                            value.get("website").websiteId = null;

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

                var website = value.get("website");
                if (website == null) {
                    website = {
                        websiteId: websiteId,
                        themeId: "default"
                    };
                    value.set({website: website});
                }
                website.websiteId = websiteId;

                accountDao.saveOrUpdate(value, fn);
            });
        });
    },


    getRenderedWebsitePageForAccount: function (accountId, pageName, fn) {
        var self = this, account, website, page, themeId, themeConfig;

        if (_.isFunction(pageName)) {
            fn = pageName;
            pageName = "index";
        }

        if (String.isNullOrEmpty(pageName)) {
            pageName = "index";
        }

        var p1 = $.Deferred();
        accountDao.getById(accountId, function (err, value) {
            if (err) {
                return p1.reject(err);
            }

            account = value;

            var accountWebsite = account.get("website");
            if (accountWebsite == null) {
                themeId = "default";
            } else {
                themeId = accountWebsite.themeId || "default";
            }

            async.parallel([
                function (cb) {

                    //Get Website and page
                    self.getOrCreateWebsiteByAccountId(accountId, null, function (err, value) {
                        if (err) {
                            return cb(err);
                        }

                        website = value;

                        self.getPageForWebsite(website.id(), pageName, function (er, value) {
                            if (err) {
                                return cb(err);
                            }

                            page = value;

                            cb();
                        });
                    });
                },

                function (cb) {

                    //Load theme config
                    self.getThemeConfig(themeId, function (err, value) {
                        if (err) {
                            return cb(err);
                        }

                        themeConfig = value;
                        cb();
                    });
                }

            ], function (err) {
                if (err) {
                    p1.reject();
                    return fn(err);
                }

                p1.resolve();
            })
        });

        $.when(p1)
            .done(function () {
                //We now have website, page, themeId, themeConfig, account

                if (page == null || page.get("components") == null) {
                    //Lets pull the default from the theme config
                    var isNewPage = false;
                    var defaultPage = _.findWhere(themeConfig.pages, {handle: pageName});
                    if (defaultPage == null) {
                        return fn($$.u.errors._404_PAGE_NOT_FOUND);
                    }
                    if (page == null) {
                        isNewPage = true;
                        var page = new Page({
                            title: defaultPage.title,
                            handle: defaultPage.handle,
                            websiteId: website.id(),
                            accountId: accountId
                        });
                    }

                    page.created(null);
                    var pageComponents = page.get("components");
                    if (pageComponents == null) {
                        pageComponents = [];
                        page.set({components: pageComponents});
                    }

                    var components = defaultPage.components;

                    components.forEach(function (component) {
                        var type = component;

                        var component = require('../models/cms/components/' + type);
                        if (component != null) {
                            component = new component({
                                _id: $$.u.idutils.generateUUID()
                            });
                            pageComponents.push(component.toJSON());
                        }
                    });
                }

                //We now have a proper page object

                //Gather up all of our settings and other info.
                var settings = $$.u.objutils.extend({}, account.get("settings"), website.get("settings"));

                var seo = $$.u.objutils.extend({}, website.get("seo"), page.get("seo"));

                var linklists = $$.u.objutils.extend({}, themeConfig.linkLists, website.get("linkLists"));

                var footer = $$.u.objutils.extend({}, themeConfig.footer, website.get("footer"));

                var title = page.get("title");
                if (title == null) {
                    title = website.get("title");
                }
                if (title == null && seo.title != null) {
                    title = seo.title;
                }

                var data = {
                    settings: settings,
                    seo: seo,
                    footer: footer,
                    title: title,
                    handle: pageName,
                    linkLists: {}
                };

                if (linklists != null && linklists.length > 0) {
                    for (var i =0; i < linklists.length; i++) {
                        data.linkLists[linklists[i].handle] = linklists[i].links;
                    }
                }

                var header, footer, body = "";
                // render header, footer, and body
                async.parallel([
                    //render header
                    function (cb) {
                        self._renderItem(data, themeId, "header", themeConfig['template-engine'], "default-header", function (err, value) {
                            if (err) {
                                return cb(err);
                            }

                            header = value;
                            cb();
                        });
                    },

                    //render footer
                    function (cb) {
                        self._renderItem(data, themeId, "footer", themeConfig['template-engine'], "default-footer", function (err, value) {
                            if (err) {
                                return cb(err);
                            }

                            footer = value;
                            cb();
                        });
                    },

                    //render components in series
                    function (cb) {

                        if (page.isVisible() == false) {
                            self._renderItem(data, themeId, "404", themeConfig['template-engine'], "default-404", function (err, value) {
                                if (err) {
                                    cb(err);
                                }

                                body = value;
                                cb();
                            });
                            return;
                        }

                        var components = page.get("components");
                        if (components == null || components.length == 0) {
                            body = "";
                            return cb();
                        }

                        async.eachSeries(components, function (component, _cb) {
                            data.component = component;

                            self._renderComponent(data, themeId, component.type, themeConfig['template-engine'], function (err, value) {
                                if (err) {
                                    return _cb(err);
                                }

                                body += value;
                                _cb();
                            })
                        }, function (err) {
                            cb();
                        });
                    }
                ], function (err) {
                    if (err) {
                        return fn(err);
                    }

                    //render layout page
                    data.component = null;

                    data.header = header;
                    data.footer = footer;
                    data.body = body;

                    self._renderItem(data, themeId, "layout", themeConfig['template-engine'], "default-layout", function (err, value) {
                        if (err) {
                            return fn(err, value);
                        }

                        return fn(null, value);
                    });
                });
            });
    },


    _renderComponent: function (data, themeId, component, engine, fn) {
        return this._renderItem(data, themeId, "components/" + component, engine, null, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            return fn(err, value);
        });
    },


    _renderItem: function (data, themeId, item, engine, defaultItem, fn) {
        var self = this
            , path = "cms/themes/"
            , engine = engine || themesConfig.DEFAULT_ENGINE
            , extension = this._getExtensionForEngine(engine);


        if (_.isFunction(defaultItem)) {
            fn = defaultItem;
            defaultItem = null;
        }

        app.render(path + themeId + "/" + item + extension, data, function (err, value) {
            if (err) {
                console.log("ERROR: " + path + themeId + "/" + item + extension);
                if (defaultItem != null) {
                    if (engine != themesConfig.DEFAULT_ENGINE) {
                        extension = self._getExtensionForEngine(themesConfig.DEFAULT_ENGINE);
                    }
                    app.render(path + defaultItem + extension, data, fn);
                } else {
                    fn(err, value);
                }
            } else {
                fn(err, value);
            }
        });
    },


    _getExtensionForEngine: function (engine) {
        if (engine == "handlebars" || engine == "hbs") {
            return ".hbs";
        } else if (engine == "jade") {
            return ".jade";
        } else if (engine == "dot") {
            return ".dot";
        } else if (engine == "html") {
            return ".html";
        } else {
            return ".html";
        }
    }
    //endregion
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.CmsDao = dao;

module.exports = dao;
