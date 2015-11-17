


var logger = $$.g.getLogger("cms_manager");
var templateDao = require('./dao/template.dao');

module.exports = {
    log: logger,

    listTemplates: function(accountId, fn) {
        var self = this;
        self.log.debug('>> listTemplates');
        var query = {
            $or : [{'accountId': accountId}, {'public': true}],
            ssb:true
        };
        templateDao.findMany(query, $$.m.ssb.Template, function(err, list){
            if(err) {
                self.log.error('Error listing templates:', err);
                return fn(err, null);
            } else {
                self.log.debug('<< listTemplates');
                return fn(null, list);
            }
        });
    },

    getTemplate: function(templateId, fn) {
        var self = this;
        self.log.debug('>> getTemplate');
        templateDao.getById(templateId, $$.m.ssb.Template, function(err, template){
            if(err) {
                self.log.error('Error getting template:', err);
                return fn(err, null);
            } else {
                self.log.debug('<< getTemplate');
                return fn(null, template);
            }
        });
    }
};