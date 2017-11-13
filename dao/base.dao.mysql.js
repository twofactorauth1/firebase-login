
var config = require('../configs/mysql.config');
var mysql = require('mysql');
var connectionHolder;
if(config.useConnectionPool) {
    connectionHolder  = mysql.createPool({
        connectionLimit : config.connectionLimit,
        host            : config.host,
        user            : config.user,
        password        : config.password,
        database        : config.database
    });
} else {
    connectionHolder = mysql.createConnection({
        host     : config.host,
        user     : config.user,
        password : config.password
    });
}
$$.g.mysqls = $$.g.mysqls || [];

var LOGGER = $$.g.getLogger("base_dao_mysql");

var mysqldao = {

    log: LOGGER,

    _getRawByIdMysql: function (id, type, fn) {
        var self = this;
        var table = this.getTable(type);
        connectionHolder.query('SELECT * FROM ' + table + ' WHERE id = ?', [id], function (error, results, fields) {
            if (error){
                self.log.error('Error querying mysql:', error);
                fn(error);
            } else {
                fn(null, results);
            }
        });
    },

    _findOneRawMysql: function (query, type, fn) {

    },

    _findManyRawMysql: function (query, type, fn) {
        var self = this;
        var table = this.getTable(type);
        var whereClause = '';
        if(query) {
            whereClause += query;
        }
        connectionHolder.query('SELECT * FROM ' + table + ' ' + whereClause,null, function (error, results, fields) {
            if (error){
                self.log.error('Error querying mysql:', error);
                fn(error);
            } else {
                fn(null, results);
            }
        });
    },


    _createModel: function (object, type, xFields) {
        if (object == null) {
            return null;
        }
        if (_.isFunction(type)) {
            return new type(object, xFields);
        } else {
            return new this.defaultModel(object, xFields);
        }
    }
};

module.exports = mysqldao;