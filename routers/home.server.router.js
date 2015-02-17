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

var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "home",

    initialize: function() {
        app.get("/", this.setup.bind(this), this.index.bind(this));

        //send all routes to index and let the app router to navigate to the appropiate view
        app.get("/index", this.setup.bind(this), this.index.bind(this));
        app.get("/blog", this.setup.bind(this), this.index.bind(this));
        app.get("/blog/*", this.setup.bind(this), this.index.bind(this));
        app.get("/tag/*", this.setup.bind(this), this.index.bind(this));
        app.get("/category/*", this.setup.bind(this), this.index.bind(this));
        app.get("/author/*", this.setup.bind(this), this.index.bind(this));
        app.get("/page/*", this.setup.bind(this), this.index.bind(this));
        app.get("/signup", this.setup.bind(this), this.index.bind(this));
        app.get("/post", this.setup.bind(this), this.index.bind(this));

        app.get("/index_temp_page", this.setup.bind(this), this.indexTempPage.bind(this));
        // app.get("/page/blog", this.setup, this.showMainBlog.bind(this));
        // app.get("/page/:page", this.setup, this.showWebsitePage.bind(this));

        // app.get("/page/blog/:posturl", this.setup, this.showBlogPage.bind(this));
        // app.get("/page/tag/:tag", this.setup, this.showTagPage.bind(this));
        // app.get("/page/author/:author", this.setup, this.showAuthorPage.bind(this));
        // app.get("/page/category/:category", this.setup, this.showCategoryPage.bind(this));

//        app.post("/signupnews", this.signUpNews.bind(this));

        app.get("/home", this.isHomeAuth.bind(this), this.showHome.bind(this));
        app.get("/home/*", this.isHomeAuth.bind(this), this.showHome.bind(this));

        app.get("/admin", this.isAuth.bind(this), this.showAngularAdmin.bind(this));
        app.get("/admin/*", this.isAuth.bind(this), this.showAngularAdmin.bind(this));

        app.get("/admin1", this.isAuth.bind(this), this.showAngularAdmin.bind(this));
        app.get("/admin1/*", this.isAuth.bind(this), this.showAngularAdmin.bind(this));

        app.get("/demo", this.setup.bind(this), this.demo.bind(this));
        app.get('/reauth/:id', this.setup.bind(this), this.handleReauth.bind(this));

        app.get('/redirect', this.setup.bind(this), this.externalRedirect.bind(this));

        app.get('/main/:page', this.setup.bind(this), this.serveMainHtml.bind(this));

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

