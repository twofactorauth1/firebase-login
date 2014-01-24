/**
 * Global adapter config
 * 
 * The `adapters` configuration object lets you create different global "saved settings"
 * that you can mix and match in your models.  The `default` option indicates which 
 * "saved setting" should be used if a model doesn't have an adapter specified.
 *
 * Keep in mind that options you define directly in your model definitions
 * will override these settings.
 *
 * For more information on adapter configuration, check out:
 * http://sailsjs.org/#documentation
 */

var mongo_settings = {};
if (process.env.NODE_ENV === 'production') {
    mongo_settings = {module: 'sails-mongo',
                      host: 'novus.modulusmongo.net',
                      port: 27017,
                      user: 'indigenous',
                      password: 'oxf25ufo',
                      database: 'H2inesux'};
}
else {
    mongo_settings = {module: 'sails-mongo',
                      host: 'localhost',
                      port: 27017,
                      user: '',
                      password: '',
                      database: 'bioindigenous'};
}

module.exports.adapters = {

    // refer to https://github.com/balderdashy/sails-mongo for advance config
    'default': 'mongo',
    mongo: mongo_settings
};
