/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseRouter = require('./base.server.router.js');
var HomeView = require('../views/home.server.view');
var AdminView = require('../views/admin.server.view');
var AngularAdminView = require('../views/angular.admin.server.view');
var WebsiteView = require('../views/website.server.view');

var contactDao = require('../dao/contact.dao');
var cookies = require("../utils/cookieutil");
var appConfig = require('../configs/app.config.js');
var authenticationDao = require('../dao/authentication.dao');
var fs = require('fs');
var userActivityManager = require('../useractivities/useractivity_manager');
var sitemigration_middleware = require('../sitemigration/middleware/sitemigration_middleware');
var userManager = require('../dao/user.manager');
var accountDao = require('../dao/account.dao');
var pageCacheManager = require('../cms/pagecache_manager');
var BlogView = require('../views/blog.server.view');
var RSSView = require('../views/rss.server.view');

var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "home",

    initialize: function() {
        app.get("/", this.setupForPages.bind(this), this.optimizedIndex.bind(this));

        //send all routes to index and let the app router to navigate to the appropriate view
        app.get("/index", this.setupForPages.bind(this), this.optimizedIndex.bind(this));
        app.get("/blog", this.setupForPages.bind(this), this.renderBlogPage.bind(this));
        //app.get("/blog/*", this.setup.bind(this), this.optimizedIndex.bind(this));
        app.get('/blog/feed/rss', this.setupForPages.bind(this), this.blogRSS.bind(this));
        app.get("/blog/:postName", this.setupForPages.bind(this), this.renderBlogPost.bind(this));
        app.get("/tag/*", this.setupForPages.bind(this), this.renderBlogByAuthorOrPost.bind(this));
        app.get("/category/*", this.setupForPages.bind(this), this.optimizedIndex.bind(this));
        app.get("/author/*", this.setupForPages.bind(this), this.renderBlogByAuthorOrPost.bind(this));
        app.get("/page/*", [sitemigration_middleware.checkForRedirect, this.setupForPages.bind(this)], this.optimizedIndex.bind(this));
        app.get("/signup", this.setupForSocialSignup.bind(this), this.optimizedIndex.bind(this));
        app.get("/post", this.setupForPages.bind(this), this.optimizedIndex.bind(this));

        app.get("/index_temp_page", this.setup.bind(this), this.indexTempPage.bind(this));

        app.get("/home", this.isHomeAuth.bind(this), this.showHome.bind(this));
        app.get("/home/*", this.isHomeAuth.bind(this), this.showHome.bind(this));

        app.get("/admin", this.isAuth.bind(this), this.showAngularAdmin.bind(this));
        app.get("/admin/*", this.isAuth.bind(this), this.rerouteToAngularAdmin.bind(this));

        app.get("/admin1", this.isAuth.bind(this), this.showAngularAdmin.bind(this));
        app.get("/admin1/*", this.isAuth.bind(this), this.rerouteToAngularAdmin.bind(this));

        app.get("/demo", this.setup.bind(this), this.demo.bind(this));
        app.get('/reauth/:id', this.setup.bind(this), this.handleReauth.bind(this));

        app.post('/addaccount', this.setup.bind(this), this.handleAddAccount.bind(this));
        app.get('/redirect', this.setup.bind(this), this.externalRedirect.bind(this));

        app.get('/main/:page', [sitemigration_middleware.checkForRedirect, this.setup.bind(this)], this.serveMainHtml.bind(this));
        app.get('/interim*', this.setup.bind(this), this.serveInterim.bind(this));

        /*
         * This is a POC route for page caching.
         */
        app.get('/cached/:page', this.frontendSetup.bind(this), this.optimizedIndex.bind(this));
        app.get('/template', this.frontendSetup.bind(this), this.getOrCreateTemplate.bind(this));
        app.get('/template/:page', this.frontendSetup.bind(this), this.getOrCreateTemplate.bind(this));

        app.get('/scripts/*', this.frontendSetup.bind(this), this.serveNodeModules.bind(this));
        return this;
    },


    index: function(req,resp) {
        var self = this
            , accountId = this.accountId(req);
        self.log.debug('>> index ' + accountId);
        if (accountId > 0)  {
            //new WebsiteView(req, resp).show(accountId);
            new WebsiteView(req, resp).renderNewIndex(accountId);
        } else {
            //resp.redirect("/home");
            new WebsiteView(req, resp).renderNewIndex(appConfig.mainAccountID);
        }
        self.log.debug('<< index ... req.session.accountId:' + req.session.accountId);
    },
    indexTempPage: function(req,resp) {
        var self = this
            , accountId = this.accountId(req);

        if (accountId > 0)  {
            new WebsiteView(req, resp).showTempPage(accountId);
        } else {
            //resp.redirect("/home");
            new WebsiteView(req, resp).show(appConfig.mainAccountID);
        }
    },

    demo: function(req, res) {
        res.redirect('/dist');
    },

    showWebsitePage: function(req, resp) {

        var self = this
            , accountId = this.accountId(req);

        var page = req.params.page;
        if (accountId > 0)  {
            new WebsiteView(req, resp).showPage(accountId, page);
        } else {
            resp.redirect("/home");
        }
    },

    showMainBlog: function(req, res) {
        var self = this
            , accountId = this.accountId(req);

        var page = req.params.page;
        if (accountId > 0)  {
            new WebsiteView(req, res).showPage(accountId, 'blog');
        } else {
            new WebsiteView(req, res).showPage(appConfig.mainAccountID, 'blog');
        }
    },

    showBlogPage: function(req, resp) {
        var self = this
            , accountId = this.accountId(req);

        var postUrl = req.params.posturl;
        console.log('Params: '+JSON.stringify(req.params));
        if (accountId > 0)  {
            new WebsiteView(req, resp).showPost(accountId, postUrl);
        } else {
            //resp.redirect("/home");
            new WebsiteView(req, resp).showPost(appConfig.mainAccountID, postUrl);
        }
    },

    showTagPage: function(req, resp) {
        console.log('Show tag page');
        var self = this
            , accountId = this.accountId(req);

        var tag = req.params.tag;
        console.log('Params: '+JSON.stringify(req.params));
        if (accountId > 0)  {
            new WebsiteView(req, resp).showTag(accountId, tag);
        } else {
            resp.redirect("/home");
        }
    },

    showAuthorPage: function(req, resp) {
        console.log('Show author page');
        var self = this
            , accountId = this.accountId(req);

        var author = req.params.author;
        console.log('Params: '+JSON.stringify(req.params));
        if (accountId > 0)  {
            new WebsiteView(req, resp).showAuthor(accountId, author);
        } else {
            resp.redirect("/home");
        }
    },

    showCategoryPage: function(req, resp) {
        console.log('Show category page');
        var self = this
            , accountId = this.accountId(req);

        var category = req.params.category;
        console.log('Params: '+JSON.stringify(req.params));
        if (accountId > 0)  {
            new WebsiteView(req, resp).showCategory(accountId, category);
        } else {
            resp.redirect("/home");
        }
    },

    showHome: function(req,resp) {
        var self = this;
        var accountId = this.accountId(req);
        this._showHome(req, resp);

        /*
        if (accountId > 0) {
            //This is an account based url, there is no /home
            resp.redirect("/admin");
        } else {
            this._showHome(req,resp);
        }
        */
    },

    showAdmin: function(req,resp) {
        var accountId = this.accountId(req);
        if (accountId > 0) {
            new AdminView(req,resp).show();
        } else {
            //send them back to the main home
            resp.redirect("/admin");
        }
    },

    showAngularAdmin: function(req,resp) {
        var accountId = this.accountId(req);
        if (accountId > 0) {
            new AngularAdminView(req,resp).show();
        } else {
            //send them back to the main home
            resp.redirect("/admin");
        }
    },

    rerouteToAngularAdmin: function(req, res) {
      var path = req.url;
      var angularPath = path.slice(6, path.length);
      res.redirect('/admin/#' + angularPath);
    },

    _showHome: function(req,resp) {
        var self = this;
        var userId = self.userId(req);
        var isGroupAdmin = false;
        userManager.getUserAccountPermissions(userId, appConfig.mainAccountID, function(err, perms){
            if(perms && _.contains(perms, 'designer')){
                isGroupAdmin = true;
            }
            new HomeView(req,resp,{isGroupAdmin:isGroupAdmin}).show("home");
        });

    },

    signUpNews: function(req, resp) {
        var self = this, contact, accountToken, deferred;
        console.log(req.body);
        var email = req.body.email;
        console.log('Email: '+JSON.stringify(email));

        var accountToken = cookies.getAccountToken(req);
        console.log('Account Token: '+accountToken);

        contactDao.createContactFromData(req.body, accountToken, function (err, value) {
            if (!err) {
                req.flash("info", "Account created successfully");
                return resp.redirect("/");
            } else {
                req.flash("error", value.toString());
                return resp.redirect("/");
            }
        });
    },

    handleReauth: function(req, resp) {
        var self = this;
        self.log.debug('>> handleReauth');
        var activeAccountId = parseInt(req.params.id);
        var accountAry = _.pluck(req.session.accounts, 'id');
        if(_.contains(accountAry, activeAccountId)){
            req.session.accountId = activeAccountId;
            req.session.unAuthAccountId = activeAccountId;
            var dataObj = _.find(req.session.accounts, function(previewData){if(previewData.id === activeAccountId)return true;});
            req.session.subdomain = dataObj.subdomain;
            req.session.domain = dataObj.domain;
        } else {
            self.log.debug('authorized accounts does not contain ' + activeAccountId);
        }



        if(req.isAuthenticated()) {
            self.log.debug('isAuthenticated');

        }
        if(req.session.accountId === -1) {
            self.log.debug('AccountId is -1');
            resp.redirect('/home');
        } else {
            self.log.debug('AccountId is ' + req.session.accountId);
            var _path = cookies.getRedirectUrl(req, resp, '/admin', true);
            var userId = self.userId(req);
            authenticationDao.getAuthenticatedUrlForAccount(req.session.accountId, userId, _path, 30, function(err, value){
                if(err) {
                    self.log.error('Error getting authenticated url for redirect: ' + err);
                    resp.redirect('/login');
                } else {
                    self.log.debug('<< handleReauth');
                    resp.redirect(value);
                    userActivityManager.createUserReauthActivity(req.session.accountId, self.userId(req), function(){});
                }
            });

        }

    },

    handleAddAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> handleAddAccount');
        var subdomain = req.params.subdomain || req.body.subdomain;
        self.log.debug('subdomain:', subdomain);

        var userId = self.userId(req);
        var roleAry = ['super','admin','member'];

        accountDao.getAccountBySubdomain(subdomain, function(err, account){
            if(err || !account) {
                self.log.error('Error finding account by subdomain:', err);
                resp.redirect('/home');
            } else {
                var userActivity = new $$.m.UserActivity({
                    accountId: account.id(),
                    userId: userId,
                    activityType:$$.m.UserActivity.types.ADD_USER_TO_ACCOUNT_OK
                });
                //check if user is in whitelist://TODO: switch to permissions for account
                userManager.getUserAccountPermissions(userId, appConfig.mainAccountID, function(err, perms){
                    if(err) {
                        self.log.error('Error getting account permissions:', err);
                        return resp.redirect('/home');
                    }
                    if(_.contains(perms, 'designer')) {

                        userManager.addUserToAccount(account.id(), userId, roleAry, userId, function(err, user){
                            req.session.accounts = user.getAllAccountIds();
                            accountDao.getPreviewData(req.session.accounts, function(err, data) {
                                self.log.debug('updated preview data');
                                req.session.accounts = data;
                                userActivityManager.createUserActivity(userActivity, function(err, value){
                                    self.log.debug('<< handleAddAccount');
                                    resp.redirect('/home');
                                });
                            });

                        });
                    } else {
                        self.log.warn('userId:' + userId + ' does not have the role DESIGNER');
                        userActivity.set('activityType', $$.m.UserActivity.types.ADD_USER_TO_ACCOUNT_NOK);
                        userActivityManager.createUserActivity(userActivity, function(err, value){
                            self.log.debug('<< handleAddAccount');
                            resp.redirect('/home');
                        });
                    }
                });


            }
        });

    },

    externalRedirect: function(req, resp) {
        resp.render('redirect', {next: encodeURIComponent(req.query.next),socialNetwork: encodeURIComponent(req.query.socialNetwork)});
    },

    serveInterim: function(req, resp) {
        var pageName = 'public/static/interim.html';
        fs.readFile(pageName, function(err, page) {
            if(err) {
                resp.status(404);
                resp.render('404.html', {title: '404: File Not Found'});
                return;
            } else {
                resp.writeHead(200, {'Content-Type': 'text/html'});
                resp.end(page, 'utf8');
                req.session.cookie = null;
                req.session.accountId = null;
                this.logout(req, resp);
                req.session.destroy();
                req.session = null;
                req.user = null;
            }

        });
    },

    serveMainHtml: function(req, resp) {
        var self = this;
        var accountId = self.accountId(req);
        if(accountId !== appConfig.mainAccountID && accountId !== 7) {//7 is a made-up account launch.
            //resp.redirect("/");
            resp.status(404);
            resp.render('404.html', {title: '404: File Not Found'});
            return;
        } else {

            var pageName = req.params.page;
            if(pageName.indexOf('.html') === -1) {
                pageName +=".html";
            }
            pageName = 'public/static/' + pageName;
            fs.readFile(pageName, function(err, page) {
                if(err) {
                    resp.status(404);
                    resp.render('404.html', {title: '404: File Not Found'});
                    return;
                } else {
                    resp.writeHead(200, {'Content-Type': 'text/html'});
                    resp.end(page, 'utf8');
                }

            });

        }
    },

    /*
    serveCachedPage: function(req, resp) {
        var self = this;
        var accountId = self.unAuthAccountId(req);
        var pageName = req.params.page;
        if(pageName.indexOf('.html') === -1) {
            pageName +=".html";
        }
        pagecacheManager.getLocalCachedPageForTesting(accountId, pageName, resp);
        //pagecacheManager.getCachedPage(accountId, pageName, resp);
    },
    */

    optimizedIndex: function(req,resp) {
        var self = this;
        var accountId = self.unAuthAccountId(req) || appConfig.mainAccountID;
        if(accountId === 'new') {//we are on the signup page
            accountId = appConfig.mainAccountID;
        }
        var pageName = req.params.page || 'index';
        self.log.debug('>> optimizedIndex ' + accountId + ', ' + pageName);

        new WebsiteView(req, resp).renderCachedPage(accountId, pageName);

        self.log.debug('<< optimizedIndex');
    },

    renderBlogPage: function(req, resp) {
        var self = this;
        var accountId = self.unAuthAccountId(req) || appConfig.mainAccountID;
        self.log.debug(accountId, null, '>> renderBlogPage');
        //account.showhide.ssbBlog
        accountDao.getAccountByID(accountId, function(err, account){
            if(err) {
                resp.status(500);
                resp.render('500.html', {title: '500: File Not Found'});
                return;
            } else {
                var showHide = account.get('showhide');
                if(showHide && showHide.ssbBlog && showHide.ssbBlog===true) {
                    //TODO: This is where the magic happens
                    new BlogView(req, resp).renderBlogPage(accountId);
                    self.log.debug(accountId, null, '<< renderBlogPage');



                } else {
                    //treat as legacy blog
                    if(accountId === 'new') {//we are on the signup page
                        accountId = appConfig.mainAccountID;
                    }
                    var pageName = req.params.page || 'blog';
                    self.log.debug('>> optimizedIndex ' + accountId + ', ' + pageName);

                    new WebsiteView(req, resp).renderCachedPage(accountId, pageName);

                    self.log.debug('<< optimizedIndex');
                }
            }
        });

    },



    renderBlogPost: function(req, resp) {
        var self = this;
        var accountId = self.unAuthAccountId(req) || appConfig.mainAccountID;
        var postName = req.params.postName;
        self.log.debug(accountId, null, '>> renderBlogPost[' + postName + ']');
        //account.showhide.ssbBlog
        accountDao.getAccountByID(accountId, function(err, account){
            if(err) {
                resp.status(500);
                resp.render('500.html', {title: '500: File Not Found'});
                return;
            } else {
                var showHide = account.get('showhide');
                if(showHide && showHide.ssbBlog && showHide.ssbBlog===true) {
                    new BlogView(req, resp).renderBlogPost(accountId, postName);
                    self.log.debug(accountId, null, '<< renderBlogPost');

                } else {
                    //treat as legacy blog
                    if(accountId === 'new') {//we are on the signup page
                        accountId = appConfig.mainAccountID;
                    }
                    var pageName = req.params.page || 'blog';
                    self.log.debug('>> optimizedIndex ' + accountId + ', ' + pageName);

                    new WebsiteView(req, resp).renderCachedPage(accountId, pageName);

                    self.log.debug('<< optimizedIndex');
                }
            }
        });
    },

    blogRSS: function(req, resp) {
        var self = this;
        var accountId = self.unAuthAccountId(req) || appConfig.mainAccountID;
        self.log.debug(accountId, null, '>> blogRSS');
        new RSSView(req, resp).renderBlogFeed(accountId);
        self.log.debug(accountId, null, '<< blogRSS');
    },

    getOrCreateTemplate: function(req, resp) {
        var self = this;
        var accountId = self.unAuthAccountId(req) || appConfig.mainAccountID;
        if(accountId === 'new') {//we are on the signup page
            accountId = appConfig.mainAccountID;
        }
        var pageName = req.params.page || 'index';
        var update = req.query.cachebuster || false;
        self.log.debug('>> getOrCreateTemplate ' + accountId + ', ' + pageName + ', ' + update);
        //return pageCacheManager.getOrCreateLocalTemplate(accountId, pageName, resp);
        return pageCacheManager.getOrCreateS3Template(accountId, pageName, update, resp);
    },

    renderBlogByAuthorOrPost: function(req, resp) {
        var self = this;
        var accountId = self.unAuthAccountId(req) || appConfig.mainAccountID;
        self.log.debug(accountId, null, '>> renderBlogPage');
        //account.showhide.ssbBlog
        accountDao.getAccountByID(accountId, function(err, account){
            if(err) {
                resp.status(500);
                resp.render('500.html', {title: '500: File Not Found'});
                return;
            } else {
                var showHide = account.get('showhide');
                if(showHide && showHide.ssbBlog && showHide.ssbBlog===true) {
                    //TODO: This is where the magic happens
                    new BlogView(req, resp).renderBlogPage(accountId);
                    self.log.debug(accountId, null, '<< renderBlogPage');

                } else {
                    //treat as legacy blog
                    if(accountId === 'new') {//we are on the signup page
                        accountId = appConfig.mainAccountID;
                    }
                    var pageName = req.params.page || 'blog';
                    self.log.debug('>> optimizedIndex ' + accountId + ', ' + pageName);

                    new WebsiteView(req, resp).renderCachedPage(accountId, pageName);

                    self.log.debug('<< optimizedIndex');
                }
            }
        });
    },

    serveNodeModules: function(req, resp) {
        var path = req.path.replace(/\/scripts\//, 'node_modules/');
        return resp.sendfile(path);
    }

});


module.exports = new router();
