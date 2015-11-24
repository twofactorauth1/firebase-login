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


var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "home",

    initialize: function() {
        app.get("/:page", [sitemigration_middleware.checkForRedirect, this.setup.bind(this)], this.optimizedIndex.bind(this));
        return this;
    },


    index: function(req,resp) {
        var self = this
            , accountId = this.accountId(req);
        self.log.debug('>> index');
        if (accountId > 0)  {
            //new WebsiteView(req, resp).show(accountId);
            new WebsiteView(req, resp).renderNewIndex(accountId);
        } else {
            //resp.redirect("/home");
            new WebsiteView(req, resp).renderNewIndex(appConfig.mainAccountID);
        }
        self.log.debug('<< index ... req.session.accountId:' + req.session.accountId);
    },

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
        new HomeView(req,resp).show("home");
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
            req.session.accountId = activeAccountId
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

            authenticationDao.getAuthenticatedUrlForAccount(req.session.accountId, req.user.attributes._id, '/admin', 30, function(err, value){
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

    externalRedirect: function(req, resp) {
        resp.render('redirect', {next: encodeURIComponent(req.query.next),socialNetwork: encodeURIComponent(req.query.socialNetwork)});
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
    }
});


module.exports = new router();
