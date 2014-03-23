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


    _show: function(accountId, path) {
        var self = this;

        var cacheKey = "web-" + accountId + "-" + path;
        $$.g.cache.get(cacheKey, "websites", function(err, value) {
            if (!err && value) {
                self.resp.send(value);
            } else {
                var data = {};

                var view = cmsDao.getRenderedWebsitePageForAccount(accountId, path, function(err, value) {
                    if (err) {
                        if (err.error && err.error.code && err.error.code == 404) {
                            return self.resp.render('404.html');
                        }
                        return self.resp.render('500.html');
                    }

                    $$.g.cache.set(cacheKey, value, "websites", 30);

                    self.resp.send(value);
                });
            }
        });
    }
});

$$.v.WebsiteView = view;

module.exports = view;
