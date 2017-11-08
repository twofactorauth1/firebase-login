
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

var mysqldao = {

    _getByIdMysql: function (id, type, fn) {
        var table = this.getTable(type);
        connectionHolder.query('SELECT * FROM ' + table + ' WHERE id = ?', [id], function (error, results, fields) {
            if (error) throw error;
            // ...
        });
    },

    _findOneMysql: function (query, type, fn) {

    },

    _findManyMysql: function (query, type, fn) {

    }
};

module.exports = mysqldao;