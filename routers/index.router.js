var routes = require('../routes');
var crmRoutes = require('../routes/crm');
var clientRoutes = require('../routes/client');
var customerRoutes = require('../routes/customer');

var router = function() {
};

_.extend(router.prototype, {

    initialize: function() {
        var app = global.app;

        app.get('/', routes.index);
        app.get('/crm', crmRoutes.index);
        app.post('/client/add/', clientRoutes.add);
        app.post('/customer/add/', customerRoutes.add);
        app.get('/customer/check/unique/', customerRoutes.check);
        app.get('/customer/find/', customerRoutes.find);
        app.del('/customer/delete/:id/', customerRoutes.destroy);

        return this;
    }
});

module.exports.router = new router().initialize();

