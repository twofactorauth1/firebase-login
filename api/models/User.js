/**
 * User
 *
 * @module      :: Model
 * @description :: User and profile attribute model. One to many relation between organization and user.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        organization: {
            type: 'uuid',
            required: true
        },
        uid: {
            type: 'alphanumeric', 
            required: true
        },
        access_token: {
            type: 'alphanumeric', //TODO: require computation logic
            required: true
        },
        gender: {
            type: 'string',
            required: false,
            in: ['M', 'F']
        },
        location: {
            type: 'string', //TODO: require location code list for restriction
            required: false,
            maxLength: 2
        },
        country: {
            type: 'string', //TODO: require country list for restriction
            required: false
        },
        birth_year: {
            type: 'string',
            required: false,
            len: 4
        },
        height: {
            type: 'decimal',
            required: false,
        },
        weight: {
            type: 'decimal',
            required: false
        },
        applications: {
            type: 'array',
            required: false
        }
    }
};
