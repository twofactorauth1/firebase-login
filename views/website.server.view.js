/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');

var cmsDao = require('../cms/dao/cms.dao.js');
var segmentioConfig = require('../configs/segmentio.config.js');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    log: $$.g.getLogger('website.server.view'),

    show: function(accountId) {
            this._show(accountId, "index");
    },
    showTempPage: function(accountId) {
        this._show(accountId, "index_temp_page");
    },

    showPage: function(accountId, page) {
        this._show(accountId, page);
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

    renderNewIndex: function(accountId) {
        var data = {}, self = this;
        self.log.debug('>> renderNewIndex');
        /*
        var data = {
            settings: settings,
            seo: seo,
            footer: footer,
            title: title,
            segmentIOWriteKey: segmentioConfig.SEGMENT_WRITE_KEY,
            handle: pageName,
            linkLists: {},
            blogposts: null,
            tags: null,
            categories: null,
            accountUrl: account.get('accountUrl'),
            account: account
        };
        */
        var isEditor = self.req.query.editor;
        self.log.debug('isEditor: ', isEditor);
        cmsDao.getDataForWebpage(accountId, 'index', function(err, value){
            data.account = value;
            data.title = 'Indigenous.IO';
            data.author = 'Indigenous.IO';
            data.segmentIOWriteKey = segmentioConfig.SEGMENT_WRITE_KEY;
            data.website = value.website || {};
            data.seo={
                description: '',
                keywords: ''
            };
            data.includeEditor = isEditor;
            //self.log.debug('>> data');
            //console.dir(data);
            //self.log.debug('<< data');
            if(!data.account.website.settings) {
                self.log.warn('Website Settings is null for account ' + accountId);
                data.account.website.settings = {};
            }

            app.render('index', data, function(err, html){
                if(err) {
                    self.log.error('Error during render: ' + err);
                }

                self.resp.send(html);
                self.cleanUp();
                self = data = value = null;
            });
        });



        //self.resp.send(value);
    },

    _renderWebsite: function(accountId, path, cacheKey, isEditor) {
        var data = {}, self = this;

        self.log.debug('Path: '+path);

        cmsDao.getRenderedWebsitePageForAccount(accountId, path, isEditor, null, null, null, function(err, value) {
            if (err) {
                if (err.error && err.error.code && err.error.code == 404) {
                    self.resp.render('index.html');
                } else {
                    self.resp.render('index.html');
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
