/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var fs = require('fs');
var async = require('async');
var crypto = require('crypto');
var cryptoUtil = require('../../utils/security/crypto');

var accountDao = require('./../../dao/account.dao.js');
var themesConfig = require('../../configs/themes.config.js');

var Website = require('../model/website');
var Page = require('../model/page');
var BlogPost = require('../model/blogpost');

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
        var pathToThemes = themesConfig.PATH_TO_THEMES
            , pathToTheme = pathToThemes + "/" + themeId;

        fs.lstat(pathToTheme, function (err, stats) {
            if (!err && stats.isDirectory()) {
                fn(null, true);
                pathToTheme = pathToThemes = themeId = fn = null;
                return;
            }
            fn(null, false);
            pathToTheme = pathToThemes = themeId = fn = null;
            return;
        });
    },


    /**
     * Retrieves basic theme information for all themes in the system.
     * @param fn
     */
    getAllThemes: function (fn) {
        //TODO - Cache this

        var self = this
            , pathToThemes = themesConfig.PATH_TO_THEMES
            , themes = []
            , obj;

        themes = [];
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
                self = pathToThemes = themes = obj = fn = null;
            });
        });
    },

    getThemePreview: function(themeId, fn) {
        //TODO: this
        var self = this;
        self.log.debug('>> getThemePreview');
        var path = themesConfig.PATH_TO_THEMES + '/' + themeId + '/' + themesConfig.SUBPATH_TO_PREVIEW;
        fs.readFile(path, function(err, data){
            if(err) {
                self.log.error("Error reading file: " + err);
                fn(err, null);
            }
            self.log.debug('<< getThemePreview');
            fn(null, data);
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


    /**
     * Retrieves a signed copy of the theme config by AccountId.  This is suitable
     * for sending out to be modified and returned / updated
     *
     * @param accountId
     * @param fn
     * @private
     */
    getThemeConfigSignedByAccountId: function(accountId, fn) {
        var self = this;
        accountDao.getById(accountId, function(err, value) {
            if (err) {
                fn(err, value);
                fn = null;
            }

            if (value == null) {
                fn("No Account found with ID: [" + accountId + "]");
                fn = value = null;
            }

            var website = value.get("website");
            var themeId = "default";
            if (website != null) {
                themeId = website.themeId || "default";
            }

            self._getThemeConfig(themeId, true, fn);
            value = website = themeId = fn = self = null;
        });
    },


    _getThemeConfig: function (themeId, signed, fn) {
        var self = this
            , pathToThemeConfig = themesConfig.PATH_TO_THEMES + "/" + themeId + "/config.json"
            , themeConfig
            , defaultConfig
            , defaultComponents
            , themeComponents
            , defaultComponent
            , componentType
            , themeComponent
            , index;

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
                        cryptoUtil.signDocument(data, themeId);
                    }

                    themeConfig = data;

                    cb();
                    data = null;
                });
            },

            function (cb) {
                fs.readFile(themesConfig.PATH_TO_THEMES + "/default-config.json", "utf8", function (err, data) {
                    if (err) {
                        self.log.error("An error occurred reading Default theme config File: " + err);
                        return cb("An error occurred reading default theme config file: " + err);
                    }

                    defaultConfig = JSON.parse(data);

                    cb();
                });
            }
        ], function (err) {

            if (err) {
                return fn(err);
            }

            //Merge the default into the Theme Specific configs
            themeConfig = $$.u.objutils.extend({}, defaultConfig, themeConfig);

            //Special case for merging theme components
            defaultComponents = defaultConfig.components;
            themeComponents = themeConfig.components;

            if (themeComponents == null) {
                themeComponents = [];
                themeConfig.components = themeComponents;
            }
            for (var i = 0, l = defaultComponents.length; i < l; i++) {
                defaultComponent = defaultComponents[i];
                componentType = defaultComponent.type;

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
                    index = themeComponents.indexOf(themeComponent);
                    themeComponent = $$.u.objutils.extend(true, {}, defaultComponent, themeComponent);
                    themeComponents[index] = themeComponent;
                }
            }

            fn(null, themeConfig);

            self = pathToThemeConfig = themeConfig = defaultConfig
                = defaultComponents = themeComponents = defaultComponent
                = componentType = themeComponent = index
                = themeId = signed = fn = null;
        });
    },
    //endregion


    //region PAGE
    getPageById: function(pageId, fn) {
        return this.getById(pageId, $$.m.cms.Page, fn);
    },
    getPagesById: function(accountId, fn) {
      //  accountId = accountId.toString();
        var query = {accountId: accountId};
      //  return this.getById(accountId, $$.m.cms.Page, fn);
        this.findMany(query, Page, fn);
    },

    getPageForWebsite: function (websiteId, pageName, fn) {
        var query = {websiteId: websiteId, handle: pageName};
        this.findOne(query, Page, fn);
    },

    getBlogPostForWebsite: function (accountId, blogPostUrl, fn) {
        console.log('Post ID (getBlogPostForWebsite): ' +blogPostUrl+ ' Account ID: '+accountId);
        var self = this;
        accountId = accountId.toString();
        blogPostUrl = blogPostUrl.toString();
        console.log('Account ID: '+accountId+' Blog Post Url: '+JSON.stringify(blogPostUrl));
        var query = {accountId: accountId, post_url: blogPostUrl};
        this.findOne(query, BlogPost, fn);
    },

    getAllBlogPostsForWebsite: function (accountId, fn) {
        var self = this;
        accountId = accountId.toString();
        var query = {accountId: accountId};
        this.findMany(query, BlogPost, fn);
    },

    getBlogPostsWithTagsForWebsite: function (accountId, tag, fn) {
        console.log('Getting Posts with tag: '+tag);
        var self = this;
        accountId = accountId.toString();
        var query = {accountId: accountId, post_tags: tag};
        this.findMany(query, BlogPost, fn);
    },

    getAllTagsFromPosts: function (blogposts, fn) {
        var self = this;

        var tags = new Array();

        for (var i = blogposts.length - 1; i >= 0; i--) {
            var pulledTags = blogposts[i].attributes.post_tags;
            for (var i = pulledTags.length - 1; i >= 0; i--) {
                tags.push(pulledTags[i]);
            };
        };

        var scrubbedTags = self.eliminateDuplicates(tags);
        fn(null, scrubbedTags);
        return;
    },

    getAllCategoriesFromPosts: function (blogposts, fn) {
        var self = this;

        var categories = new Array();

        for (var i = blogposts.length - 1; i >= 0; i--) {
            categories.push(blogposts[i].attributes.post_category);
        };

        var scrubbedCategories = self.eliminateDuplicates(categories);
        fn(null, scrubbedCategories);
        return;
    },

    getBlogPostsWithAuthorForWebsite: function (accountId, author, fn) {
        console.log('Getting Posts with author: '+author);
        var self = this;
        accountId = accountId.toString();
        var query = {accountId: accountId, post_author: author};
        this.findMany(query, BlogPost, fn);
    },

    getBlogPostsWithCategoryForWebsite: function (accountId, category, fn) {
        console.log('Getting Posts with category: '+category);
        var self = this;
        accountId = accountId.toString();
        var query = {accountId: accountId, post_category: category};
        this.findMany(query, BlogPost, fn);
    },

    eliminateDuplicates: function (arr) {
      var i,
          len=arr.length,
          out=[],
          obj={};
      for (i=0;i<len;i++) {
        obj[arr[i]]=0;
      }
      for (i in obj) {
        out.push(i);
      }
      return out;
    },

    //COMPONENTS

    getComponentsByPage: function(pageId, fn) {
        var self = this;
        self.log.debug('>> getComponentsByPage');
        this.getById(pageId, $$.m.cms.Page, function(err, page){
            if(err) {
                self.log.error('Error getting components: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< getComponentsByPage');
                fn(null, page.get('components'));
            }

        });
    },



    //region WEBSITES

    /**
     * Retrieves a Website By Id
     *
     * @param websiteId
     * @param fn
     */
    getWebsiteById: function(websiteId, fn) {
        return this.getById(websiteId, Website, fn);
    },


    /**
     * Retrieves the current website for an account, or creates a new one if
     * one does not exist.
     *
     * @param accountId
     * @param userId
     * @param fn
     */
    getOrCreateWebsiteByAccountId: function (accountId, userId, populateDefaultsFromTheme, fn) {
        if (_.isFunction(populateDefaultsFromTheme)) {
            fn = populateDefaultsFromTheme;
            populateDefaultsFromTheme = false;
        }
        var self = this
            , website
            , websiteId
            , account
            , themeId
            , themeConfig;

        accountDao.getById(accountId, function (err, value) {
            if (err) {
                fn(err, value);
                self = value = null;
                return;
            }

            if (value == null) {
                fn("Account does not exist");
                self = value = null;
                return;
            }

            account = value;
            website = account.get("website");

            if (website != null) {
                websiteId = website.websiteId;
                themeId = website.themeId || "default";
            }

            if (String.isNullOrEmpty(websiteId)) {
                self.createWebsiteForAccount(accountId, userId, fn);
                self = website = fn = null;
                return;
            }

            self.getById(websiteId, Website, function (err, value) {
                if (err) {
                    fn(err, value);
                    self = website = account = fn = null;
                    return;
                }

                var websiteValue = value;
                if (populateDefaultsFromTheme == true) {
                    self._populateWebsiteDefaultsFromThemeConfig(websiteValue, themeId, function(err, value) {
                        self._setLinkListUrlsForWebsite(websiteValue);
                        fn(null, websiteValue);
                        self = website = websiteValue = themeConfig = account = fn = null;
                    });
                } else {
                    self._setLinkListUrlsForWebsite(websiteValue);
                    fn(err, websiteValue);
                    self = website = websiteValue = account = fn = null;
                }
            });
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
        var self = this, website, websiteObj, websiteId, account, themeId, p1;

        website = new Website({
            accountId: accountId
        });

        website.created(userId);

        p1 = $.Deferred();
        accountDao.getById(accountId, function(err, value) {
            if (err) {
                fn(err, value);
                self = website = websiteObj = websiteId = p1 = null;
                return;
            }

            account = value;

            websiteObj == account.get("website");
            if (websiteObj != null) {
                themeId = websiteObj.themeId || "default";
            } else {
                themeId = "default";
            }

            self._populateWebsiteDefaultsFromThemeConfig(website, themeId, function(err, value) {
                self.saveOrUpdate(website, function(err, value) {
                    if (err) {
                        fn(err, value);
                        p1.reject();
                        self = website = websiteObj = websiteId = p1 = account = null;
                        return;
                    }
                    website = value;
                    websiteId = website.id();
                    p1.resolve();
                });
            });
        });


        $.when(p1)
            .done(function() {
                if (websiteObj == null || websiteObj.websiteId == null) {
                    if (websiteObj == null) {
                        websiteObj = {
                            websiteId: websiteId,
                            themeId: "default"
                        };
                        account.set({website: websiteObj});
                    } else {
                        websiteObj.websiteId = websiteId;
                        if (websiteObj.themeId == null) {
                            websiteObj.themeId = "default";
                        }
                    }
                    accountDao.saveOrUpdate(account, function () {
                        self._setLinkListUrlsForWebsite(website);
                        fn(null, website);
                        self = website = websiteObj = websiteId = p1 = account = null;
                        return;
                    });
                } else {
                    self._setLinkListUrlsForWebsite(website);
                    fn(null, website);
                    self = website = websiteObj = websiteId = p1 = account = null;
                    return;
                }
            });
    },


    _populateWebsiteDefaultsFromThemeConfig: function(website, themeId, fn) {
        if (website == null) {
            fn("Website is null");
            fn = null;
            return;
        }

        if (website.get("linkLists") != null && website.get("footer") != null) {
            return fn(null, website);
            fn = null;
            return;
        }

        this.getThemeConfig(themeId, function (err, value) {
            if (err) {
                fn(err, value);
                fn = null;
                return;
            }
            if (value != null) {
                var themeConfig = value;

                if (website.get("linkLists") == null) {
                    website.set({linkLists:themeConfig.linkLists});
                }

                if (website.get("footer") == null) {
                    var footer = $$.u.objutils.extend({}, themeConfig.footer, website.get("footer"));
                    website.set({footer:footer});
                }
            }

            fn(err, website);
            fn = themeConfig = null;
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
        var self = this, accountId;

        this.getById(websiteId, Website, function (err, value) {
            if (err) {
                fn(err, value);
                self = accountId = null;
                return;
            }

            if (value == null) {
                fn("Website [" + websiteId + "] does not exist");
                self = accountId = null;
                return;
            }

            accountId = value.get("accountId");

            self.remove(value, function (err, value) {
                if (err) {
                    fn(err, value);
                    self = accountId = null;
                    return;
                }

                if (accountId > 0) {
                    accountDao.getById(accountId, function (err, value) {
                        if (err) {
                            fn(err, value);
                            self = accountId = null;
                            return;
                        }

                        if (value != null && value.get("website") != null && value.get("website").websiteId == websiteId) {
                            value.get("website").websiteId = null;

                            accountDao.saveOrUpdate(value, function (err, value) {
                                if (err) {
                                    fn(err, value);
                                    self = accountId = null;
                                }

                                fn(null);
                                self = accountId = null;
                            });
                        } else {
                            fn(null);
                            self = accountId = null;
                        }
                    });
                } else {
                    fn(null);
                    self = accountId = null;
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
                fn(err, value);
                accountId = websiteId = fn = null;
                return;
            }

            if (value == null) {
                fn("Website does not exist!");
                accountId = websiteId = fn = null;
                return;
            }

            if (value.get("accountId") != accountId) {
                fn("Website [" + websiteId + "] does not belong to account: " + accountId);
                accountId = websiteId = fn = null;
                return;
            }

            accountDao.getById(accountId, function (err, value) {
                if (err) {
                    fn(err, value);
                    accountId = websiteId = fn = null;
                    return;
                }

                var website = value.get("website");
                if (website.setup == null) {
                    website = {
                        websiteId: websiteId,
                        themeId: "default"
                    };
                    value.set({website: website});
                }
                website.websiteId = websiteId;

                accountDao.saveOrUpdate(value, fn);
                accountId = websiteId = website = fn = null;
                return;
            });
        });
    },

    updateWebsiteSettings: function (newSettings, accountId, websiteId,fn) {
        var self = this, website;
        console.log('New Settings: '+JSON.stringify(newSettings));
        //ensure website exists and belongs to this account
        this.getById(websiteId, Website, function (err, value) {
            if (err) {
                fn(err, value);
                accountId = websiteId = fn = null;
                return;
            }

            if (value == null) {
                fn("Website does not exist!");
                accountId = websiteId = fn = null;
                return;
            }

            if (value.get("accountId") != accountId) {
                fn("Website [" + websiteId + "] does not belong to account: " + accountId);
                accountId = websiteId = fn = null;
                return;
            }

            var settings = value.get('settings');
            console.log('Website Settings: '+JSON.stringify(settings));
            if (settings == null) {
                settings = newSettings;
                value.set('settings', settings);
                console.log('Website Settings2: '+JSON.stringify(value.get('settings')));
            } else {
                settings = newSettings;
                value.set('settings', settings);
            }

             self.saveOrUpdate(value, function() {
                console.log('saved');
             });
             accountId = website = null;
             return;
        });
    },

    getRenderedWebsitePagewithPostForAccount: function (accountId, pageName, blogpost, isEditor, fn) {
        console.log('Post ID (getRenderedWebsitePagewithPostForAccount):'+JSON.stringify(isEditor));
        var self = this, account, website, page, themeId, themeConfig;

        if (_.isFunction(pageName)) {
            fn = pageName;
            pageName = "index";
            isEditor = false;
        }
        else if (_.isFunction(isEditor)) {
            fn = isEditor;
            isEditor = false;
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
                    fn(err);
                    self = account = website = page = themeId = themeConfig = accountId = pageName = fn = null;
                    return;
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
                        fn($$.u.errors._404_PAGE_NOT_FOUND);

                        self = account = website = page = themeId = themeConfig
                            = isNewPage = defaultPage = page = components = pageComponents
                            = settings = seo = linklists = footer = header = body = title = data
                            = accountId = pageName = fn = null;
                        return;
                    }
                    if (page == null) {
                        isNewPage = true;
                        page = new Page({
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

                        var component = require('../model/components/' + type);
                        if (component != null) {
                            component = new component({
                                _id: $$.u.idutils.generateUUID()
                            });
                            pageComponents.push(component.toJSON());
                        }
                    });

                    self.saveOrUpdate(page, function(err, page) {
                        if (!err) {
                            self.log.info("New page saved with ID: " + page.id());
                        }
                    });
                }

                //We now have a proper page object

                //Gather up all of our settings and other info.
                var settings = $$.u.objutils.extend({}, account.get("settings"), website.get("settings"));

                var seo = $$.u.objutils.extend({}, website.get("seo"), page.get("seo"));

                if (website.get("linkLists") == null) {
                    website.set({linkLists:themeConfig.linkLists});
                }
                var linklists = website.get("linkLists");

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
                    title: blogpost.get("post_title"),
                    handle: pageName,
                    linkLists: {},
                    _id: blogpost.get("_id"),
                    post_title: blogpost.get("post_title"),
                    post_author: blogpost.get("post_author"),
                    post_content: blogpost.get("post_content"),
                    post_excerpt: blogpost.get("post_excerpt"),
                    post_status: blogpost.get("post_status"),
                    post_tags: blogpost.get("post_tags"),
                    post_category: blogpost.get("post_category"),
                    comment_status: blogpost.get("comment_status"),
                    comment_count: blogpost.get("comment_count"),
                    created_date: moment(blogpost.get("created").date).format("DD.MM.YYYY")
                };


                if (linklists != null && linklists.length > 0) {
                    for (var i = 0; i < linklists.length; i++) {
                        self._setLinkListUrls(linklists[i].links, isEditor);
                        data.linkLists[linklists[i].handle] = linklists[i].links;
                    }
                }

                var header
                    , footer
                    , editableCssScript
                    , body = {
                        components: []
                    };

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

                                body.components.push({value:value});
                                _cb();
                            })
                        }, function (err) {
                            data.component = null;
                            cb();
                        });
                    },

                    function(cb) {
                        if (isEditor === true) {
                            app.render("cms/editablehelper.hbs", {}, function(err, value) {
                               editableCssScript = value;
                                cb();
                            });
                        } else {
                            cb();
                        }
                    }
                ], function (err) {
                    if (err) {
                        fn(err);

                        self = account = website = page = themeId = themeConfig
                            = isNewPage = defaultPage = page = components = pageComponents
                            = settings = seo = linklists = footer = header = body = title = data
                            = accountId = pageName = fn = null;

                        return;
                    }

                    //render layout page
                    data.component = null;

                    data.header = header;
                    data.footer = footer;
                    data.body = body;

                    if (data.footer != null) {
                        if (isEditor) {
                            //inject editable stuff here
                            //var endHeadReplacement = editableCssScript + " </head>";
                            //value = value.replace("</head>", endHeadReplacement);
                            data.footer = data.footer + " " + editableCssScript;
                        }
                    }
                    self._renderItem(data, themeId, "layout", themeConfig['template-engine'], "default-layout", function (err, value) {
                        if (err) {
                            fn(err, value);

                            self = account = website = page = themeId = themeConfig
                                = isNewPage = defaultPage = page = components = pageComponents
                                = settings = seo = linklists = footer = header = body = title = data
                                = accountId = pageName = fn = null;

                            return;
                        }

                        fn(null, value);

                        self = account = website = page = themeId = themeConfig
                            = isNewPage = defaultPage = page = components = pageComponents
                            = settings = seo = linklists = footer = header = body = title = data
                            = accountId = pageName = fn = null;
                    });
                });
            });
    },


    getRenderedWebsitePageForAccount: function (accountId, pageName, isEditor, tag, author, category, fn) {
        var self = this, account, website, page, blogposts, tags, categories, themeId, themeConfig;
        //console.log('getRenderedWebsitePageForAccount: '+category);
        self.log.debug('>> getRenderedWebsitePageForAccount(' + accountId + ')');
        if (_.isFunction(pageName)) {
            fn = pageName;
            pageName = "index";
            isEditor = false;
        }
        else if (_.isFunction(isEditor)) {
            fn = isEditor;
            isEditor = false;
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

                        self.getPageForWebsite(website.id(), pageName, function (err, value) {
                            if (err) {
                                return cb(err);
                            }

                            page = value;

                               if (pageName === 'blog') {
                                    if (tag != null) {
                                        //get the blog posts and use as variable "blogposts"
                                        self.getBlogPostsWithTagsForWebsite(accountId, tag, function (err, value) {
                                            if (err) {
                                                return cb(err);
                                            }

                                            blogposts = value;

                                            //strip the tags from the posts and get a list
                                            self.getAllTagsFromPosts(blogposts, function (err, value) {
                                                if (err) {
                                                    return cb(err);
                                                }
                                                console.log('Tags (getRenderedWebsitePageForAccount): '+value);
                                                tags = value;

                                                self.getAllCategoriesFromPosts(blogposts, function (err, value) {
                                                    if (err) {
                                                        return cb(err);
                                                    }
                                                    console.log('Tags (getRenderedWebsitePageForAccount): '+value);
                                                    categories = value;

                                                    cb();

                                                });

                                            });

                                        });
                                   } else if (author != null) {
                                        //get the blog posts and use as variable "blogposts"
                                        self.getBlogPostsWithAuthorForWebsite(accountId, author, function (err, value) {
                                            if (err) {
                                                return cb(err);
                                            }

                                            blogposts = value;

                                            //strip the tags from the posts and get a list
                                            self.getAllTagsFromPosts(blogposts, function (err, value) {
                                                if (err) {
                                                    return cb(err);
                                                }
                                                console.log('Tags (getRenderedWebsitePageForAccount): '+value);
                                                tags = value;

                                                self.getAllCategoriesFromPosts(blogposts, function (err, value) {
                                                    if (err) {
                                                        return cb(err);
                                                    }
                                                    console.log('Tags (getRenderedWebsitePageForAccount): '+value);
                                                    categories = value;

                                                    cb();

                                                });

                                            });

                                        });
                                   } else if (category != null) {
                                        //get the blog posts and use as variable "blogposts"
                                        self.getBlogPostsWithCategoryForWebsite(accountId, category, function (err, value) {
                                            if (err) {
                                                return cb(err);
                                            }

                                            blogposts = value;

                                            //strip the tags from the posts and get a list
                                            self.getAllTagsFromPosts(blogposts, function (err, value) {
                                                if (err) {
                                                    return cb(err);
                                                }
                                                console.log('Tags (getRenderedWebsitePageForAccount): '+value);
                                                tags = value;

                                                    self.getAllCategoriesFromPosts(blogposts, function (err, value) {
                                                        if (err) {
                                                            return cb(err);
                                                        }
                                                        console.log('Tags (getRenderedWebsitePageForAccount): '+value);
                                                        categories = value;

                                                        cb();

                                                    });

                                            });

                                        });
                                   } else {
                                        //get the blog posts and use as variable "blogposts"
                                        self.getAllBlogPostsForWebsite(accountId, function (err, value) {
                                            if (err) {
                                                return cb(err);
                                            }

                                            blogposts = value;

                                            //strip the tags from the posts and get a list
                                            self.getAllTagsFromPosts(blogposts, function (err, value) {
                                                if (err) {
                                                    return cb(err);
                                                }

                                                tags = value;

                                                self.getAllCategoriesFromPosts(blogposts, function (err, value) {
                                                    if (err) {
                                                        return cb(err);
                                                    }
                                                    console.log('Tags (getRenderedWebsitePageForAccount): '+value);
                                                    categories = value;

                                                    cb();

                                                });

                                            });

                                        });
                                    }
                               } else {
                                    cb();
                               }
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
                    fn(err);
                    self = account = website = page = themeId = themeConfig = accountId = pageName = fn = null;
                    return;
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
                        fn($$.u.errors._404_PAGE_NOT_FOUND);

                        self = account = website = page = themeId = themeConfig
                            = isNewPage = defaultPage = page = components = pageComponents
                            = settings = seo = linklists = footer = header = body = title = data
                            = accountId = pageName = fn = null;
                        return;
                    }
                    if (page == null) {
                        isNewPage = true;
                        page = new Page({
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

                        var component = require('../model/components/' + type);
                        if (component != null) {
                            component = new component({
                                _id: $$.u.idutils.generateUUID()
                            });
                            pageComponents.push(component.toJSON());
                        }
                    });

                    self.saveOrUpdate(page, function(err, page) {
                        if (!err) {
                            self.log.info("New page saved with ID: " + page.id());
                        }
                    });
                }

                //We now have a proper page object

                //Gather up all of our settings and other info.
                var settings = $$.u.objutils.extend({}, account.get("settings"), website.get("settings"));

                var seo = $$.u.objutils.extend({}, website.get("seo"), page.get("seo"));

                if (website.get("linkLists") == null) {
                    website.set({linkLists:themeConfig.linkLists});
                }
                var linklists = website.get("linkLists");

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
                    linkLists: {},
                    blogposts: null,
                    tags: null,
                    categories: null
                };


                if (linklists != null && linklists.length > 0) {
                    for (var i = 0; i < linklists.length; i++) {
                        self._setLinkListUrls(linklists[i].links, isEditor);
                        data.linkLists[linklists[i].handle] = linklists[i].links;
                    }
                }

                if(blogposts != null) {
                    data.blogposts = new Array();
                    for (var i = 0; i < blogposts.length; i++) {
                        blogposts[i].attributes.created.date = moment(blogposts[i].attributes.created.date).format("DD.MM.YYYY");
                        data.blogposts.push(blogposts[i]);
                    }
                }

                if(tags != null) {
                    data.tags = new Array();
                    for (var i = 0; i < tags.length; i++) {
                        data.tags.push(tags[i]);
                    }
                }

                if(categories != null) {
                    data.categories = new Array();
                    for (var i = 0; i < categories.length; i++) {
                        data.categories.push(categories[i]);
                    }
                }

                var header
                    , footer
                    , editableCssScript
                    , body = {
                        components: []
                    };

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

                                body.components.push({value:value});
                                _cb();
                            })
                        }, function (err) {
                            data.component = null;
                            cb();
                        });
                    },

                    function(cb) {
                        if (isEditor === true) {
                            app.render("cms/editablehelper.hbs", {}, function(err, value) {
                               editableCssScript = value;
                                cb();
                            });
                        } else {
                            cb();
                        }
                    }
                ], function (err) {
                    if (err) {
                        fn(err);

                        self = account = website = page = themeId = themeConfig
                            = isNewPage = defaultPage = page = components = pageComponents
                            = settings = seo = linklists = footer = header = body = title = data
                            = accountId = pageName = fn = null;

                        return;
                    }

                    //render layout page
                    data.component = null;

                    data.header = header;
                    data.footer = footer;
                    data.body = body;

                    if (data.footer != null) {
                        if (isEditor) {
                            //inject editable stuff here
                            //var endHeadReplacement = editableCssScript + " </head>";
                            //value = value.replace("</head>", endHeadReplacement);
                            data.footer = data.footer + " " + editableCssScript;
                        }
                    }
                    self._renderItem(data, themeId, "layout", themeConfig['template-engine'], "default-layout", function (err, value) {
                        if (err) {
                            fn(err, value);

                            self = account = website = page = themeId = themeConfig
                                = isNewPage = defaultPage = page = components = pageComponents
                                = settings = seo = linklists = footer = header = body = title = data
                                = accountId = pageName = fn = null;

                            return;
                        }

                        fn(null, value);

                        self = account = website = page = themeId = themeConfig
                            = isNewPage = defaultPage = page = components = pageComponents
                            = settings = seo = linklists = footer = header = body = title = data
                            = accountId = pageName = fn = null;
                    });
                });
            });
    },


    _renderComponent: function (data, themeId, component, engine, fn) {
        this._renderItem(data, themeId, "components/" + component, engine, null, function (err, value) {
            if (err) {
                return fn(err, value);
            }

            var wrapper = '<div class="component" data-class="' + component + '" data-id="' + data.component._id + '">';
            value = wrapper + value + "</div>";
            fn(err, value);

            data = themeId = component = engine = fn = null;
            return;
        });
    },


    _renderItem: function (data, themeId, item, engine, defaultItem, fn) {
        var self = this
            , path = "cms/themes/"
            , engine = engine || themesConfig.DEFAULT_ENGINE
            , extension = this._getExtensionForEngine(engine);

        data.helpers = data.helpers || {};
        data.helpers.link = this._hbsLinkAnchor;

        if (_.isFunction(defaultItem)) {
            fn = defaultItem;
            defaultItem = null;
        }

        app.render(path + themeId + "/" + item + extension, data, function (err, value) {
            if (err) {
                console.log("ERROR: " + path + themeId + "/" + item + extension + ", " + err);
                if (defaultItem != null) {
                    if (engine != themesConfig.DEFAULT_ENGINE) {
                        extension = self._getExtensionForEngine(themesConfig.DEFAULT_ENGINE);
                    }
                    app.render(path + defaultItem + extension, data, fn);
                    data = themeId = item = engine = fn = null;
                } else {
                    fn(err, value);
                    data = themeId = item = engine = fn = null;
                }
            } else {
                fn(err, value);
                data = themeId = item = engine = fn = null;
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
    },


    _setLinkListUrlsForWebsite: function(website, isEditor) {
        var self = this;
        if (website != null) {
            var linkLists = website.get("linkLists");
            if (linkLists == null) {
                return;
            }

            for (var i = 0; i < linkLists.length; i++) {
                self._setLinkListUrls(linkLists[i].links, isEditor);
            }
        }
    },


    _setLinkListUrls: function(links, isEditor) {
        if (links != null) {
            for(var i = 0; i < links.length; i++) {
                links[i].url = this._getLinkListItemUrl(links[i].linkTo, isEditor);
            }
        }
    },


    _getLinkListItemUrl: function(data, isEditor) {
        if (data == null) {
            return "";
        }

        if (data.linkTo != null) {
            data = data.linkTo;
        }

        var _url;
        switch(data.type) {
            case "page":
                _url = "/page/" + data.data;
                break;
            case "home":
                _url = "/";
                break;
            case "url":
                return data.data;
            case "section":
                return "#" + data.data;
            case "product":
                _url = "";  //Not yet implemented
                break;
            case "collection":
                _url =  "";  //Not yet implemented
                break;
            default:
                return "#";
        }

        if (_url != null && isEditor === true) {
            if (_url.indexOf("?") == -1) {
                _url = _url + "?";
            }
            _url += "&editor=true";
        }
        return _url;
    },


    _hbsLinkAnchor: function(link) {
        if (link == null || link.linkTo == null) {
            return "";
        }
        if (link.linkTo.type == "url") {
            return '<a href="' + link.url + '" target="_blank">' + (link.label || link.url) + '</a>';
        } else {
            return '<a href="' + link.url + '">' + (link.label || link.url) + '</a>';
        }
    }
    //endregion
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.CmsDao = dao;

module.exports = dao;
