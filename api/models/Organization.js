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
            type: 'string',
            required: true
        },
        address: 'text',
        isActive: {
            type: 'boolean',
            defaultsTo: true
        }
    }
};
