/**
 * User
 *
 * @module      :: Model
 * @description :: User attribute and profile model.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        uid: {
            type: 'alphanumeric', 
            required: true
        },
        access_token: {
            type: 'alphanumeric', //TODO: require computation logic
            required: true
        },
        gender: {
            type: 'STRING',
            required: false,
            maxLength: 1,
                in: ['M', 'F']
        },
        location: {
            type: 'STRING', //TODO: require location code list for restriction
            required: false,
            maxLength: 2
        },
        country: {
            type: 'STRING', //TODO: require country list for restriction
            required: false
        },
        birth_year: {
            type: 'STRING',
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
            type: 'ARRAY',
            required: false
        }
    }
};
