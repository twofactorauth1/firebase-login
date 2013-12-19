/**
 * Organization
 *
 * @module      :: Model
 * @description :: Organization attribute model.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        name: {
            type: 'STRING',
            required: true
        },
        address: 'TEXT',
        isActive: {
            type: 'BOOLEAN',
            defaultsTo: true
        }
    }
};
