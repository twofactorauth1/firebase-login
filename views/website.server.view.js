var BaseView = require('./base.server.view');

var view = function(req,resp,options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function(accountId) {
        this._show(accountId, "index");
    },


    showPage: function(accountId, page) {
        this._show(accountId, "page/" + page);
    },


    _show: function(accountId, path) {
        var self = this;

        var cacheKey = "web-" + accountId + "-" + path;
        $$.g.cache.get(cacheKey, function(err, value) {
            if (!err && value) {
                self.resp.send(value);
            } else {
                var data = {};

                //TODO - Construct web page here.

                self.resp.render('page', data, function(err, content) {
                    if (err) { return self.req.next(); }

                    $$.g.cache.set(cacheKey, content);

                    self.resp.send(content);
                });
            }
        });
    }
});

$$.v.WebsiteView = view;

module.exports = view;
