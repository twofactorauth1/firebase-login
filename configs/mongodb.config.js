var config = require('./app.config');

var connectionString = "mongodb://localhost/bioindigenous";

if (process.env.MONGO_CONNECT != null) {
    connectionString = process.env.MONGO_CONNECT;
}

module.exports = {
    MONGODB_CONNECT: connectionString,
};


