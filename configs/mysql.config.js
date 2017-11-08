

var useConnectionPool = true;
var connectionLimit = process.env.MYSQL_CONNECTION_LIMIT || 10;
var host  = process.env.MYSQL_HOST;
var user = process.env.MYSQL_USER;
var password = process.env.MYSQL_PASSWORD;
var database = process.env.MYSQL_DATABASE;

if(process.env.MYSQL_USE_CONNECTION_POOL !== null && process.env.MYSQL_USE_CONNECTION_POOL !== undefined) {
    useConnectionPool = (process.env.MYSQL_USE_CONNECTION_POOL.toLowerCase() == 'true');
}


module.exports = {
    useConnectionPool : useConnectionPool,
    connectionLimit : connectionLimit,
    host : host,
    user : user,
    password: password,
    database : database
};