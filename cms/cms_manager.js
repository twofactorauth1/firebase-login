require('./dao/cms.dao.js');

module.exports = {

    getAllThemes: function(fn) {
        $$.dao.CmsDao.getAllThemes(fn);
    }
};