/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');

var cmsDao = require('../dao/cms.dao');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function(accountId) {
        this._show(accountId, "index");
    },


    showPage: function(accountId, page) {
        this._show(accountId, page);
    },

    showTag: function(accountId, tag) {
        this._showTag(accountId, tag);
    },

    showAuthor: function(accountId, author) {
        this._showAuthor(accountId, author);
    },

    showCategory: function(accountId, category) {
        this._showCategory(accountId, category);
    },

    showPost: function(accountId, blogPostUrl) {
        console.log('showPost '+blogPostUrl+' Account ID:'+accountId);
        this._showPost(accountId, blogPostUrl);
    },

    _showPost: function(accountId, blogPostUrl) {
        console.log('Post ID:(_showPost) '+blogPostUrl+' Account ID: '+accountId);
        var self = this;

        cmsDao.getBlogPostForWebsite(accountId, blogPostUrl, function(err, blogPost) {
            console.log('Blog Post :(_showPost) '+blogPost+' Post Url: '+blogPostUrl+' Account ID: '+accountId);

            var path = 'single-post';

            var isEditor = false;

            var cacheKey = "web-" + accountId + "-" + blogPost;

            if (blogPost == null) {
                self.resp.render('404.html');
                self.cleanUp();
                self = data = null;
                return;
            }

            cmsDao.getRenderedWebsitePagewithPostForAccount(accountId, path, blogPost, isEditor, function(err, value) {
                if (err) {
                    if (err.error && err.error.code && err.error.code == 404) {
                        self.resp.render('404.html');
                    } else {
                        self.resp.render('500.html');
                    }

                    self.cleanUp();
                    self = data = null;
                    return;
                }

                if (isEditor !== true) {
                    $$.g.cache.set(cacheKey, value, "websites");
                }


                self.resp.send(value);

                self.cleanUp();
                self = data = value = null;
            });
        });
    },

    _showTag: function(accountId, tag) {
        console.log('Tag:(_showPost) '+tag+' Account ID: '+accountId);
        var self = this;

        var path = 'blog';
        var isEditor = 'false';

        var cacheKey = "web-" + accountId + "-" + path;

        cmsDao.getRenderedWebsitePageForAccount(accountId, path, isEditor, tag, null, null, function(err, value) {
            if (err) {
                if (err.error && err.error.code && err.error.code == 404) {
                    self.resp.render('404.html');
                } else {
                    self.resp.render('500.html');
                }

                self.cleanUp();
                self = data = null;
                return;
            }

            if (isEditor !== true) {
                $$.g.cache.set(cacheKey, value, "websites-tag");
            }

            self.resp.send(value);

            self.cleanUp();
            self = data = value = null;
        });
    },

    _showAuthor: function(accountId, author) {
        console.log('Author:(_showPost) '+author+' Account ID: '+accountId);
        var self = this;

        var path = 'blog';
        var isEditor = 'false';

        var cacheKey = "web-" + accountId + "-" + path;

        cmsDao.getRenderedWebsitePageForAccount(accountId, path, isEditor, null, author, null, function(err, value) {
            if (err) {
                if (err.error && err.error.code && err.error.code == 404) {
                    self.resp.render('404.html');
                } else {
                    self.resp.render('500.html');
                }

                self.cleanUp();
                self = data = null;
                return;
            }

            if (isEditor !== true) {
                $$.g.cache.set(cacheKey, value, "websites-author");
            }

            self.resp.send(value);

            self.cleanUp();
            self = data = value = null;
        });
    },

    _showCategory: function(accountId, category) {
        console.log('Category:(_showPost) '+category+' Account ID: '+accountId);
        var self = this;

        var path = 'blog';
        var isEditor = 'false';

        var cacheKey = "web-" + accountId + "-" + path;

        cmsDao.getRenderedWebsitePageForAccount(accountId, path, isEditor, null, null, category, function(err, value) {
            if (err) {
                if (err.error && err.error.code && err.error.code == 404) {
                    self.resp.render('404.html');
                } else {
                    self.resp.render('500.html');
                }

                self.cleanUp();
                self = data = null;
                return;
            }

            if (isEditor !== true) {
                $$.g.cache.set(cacheKey, value, "websites-category");
            }

            self.resp.send(value);

            self.cleanUp();
            self = data = value = null;
        });
    },

    _show: function(accountId, path) {
        var self = this;

        var cacheKey = "web-" + accountId + "-" + path;
        if (this.req.query.editor== "true") {
            self._renderWebsite(accountId, path, cacheKey, true);
            return;
        }

        $$.g.cache.get(cacheKey, "websites", function(err, value) {
            if (!err && value) {
                self.resp.send(value);

                self.cleanUp();
                value = null;
            } else {
                self._renderWebsite(accountId, path, cacheKey);
            }
        });
    },


    _renderWebsite: function(accountId, path, cacheKey, isEditor) {
        var data = {}, self = this;

        console.log('Path: '+path);

        cmsDao.getRenderedWebsitePageForAccount(accountId, path, isEditor, null, null, null, function(err, value) {
            if (err) {
                if (err.error && err.error.code && err.error.code == 404) {
                    self.resp.render('404.html');
                } else {
                    self.resp.render('500.html');
                }

                self.cleanUp();
                self = data = null;
                return;
            }

            if (isEditor !== true) {
                $$.g.cache.set(cacheKey, value, "websites");
            }

            self.resp.send(value);

            self.cleanUp();
            self = data = value = null;
        });
    }
});

$$.v.WebsiteView = view;

module.exports = view;
