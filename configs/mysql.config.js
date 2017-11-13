

var useConnectionPool = true;
var connectionLimit = process.env.MYSQL_CONNECTION_LIMIT || 10;
var host  = process.env.MYSQL_HOST || '67.227.213.214';
var user = process.env.MYSQL_USER || 'ten8vps_indigenous';
var password = process.env.MYSQL_PASSWORD || 'Dn9C%iOS8D78K16Ln8d*Z62v';
var database = process.env.MYSQL_DATABASE || 'ten8vps_tessco-connect';

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