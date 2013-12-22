/**
 * Routine
 *
 * @module      :: Model
 * @description :: User fitness routine and attributes. One to many relation between user and routine.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        user: {
            type: 'uuid',
            required: true
        },
        timestamp: {
            type: 'datetime', 
            required: true
        },
        utc_offset: {
            type: 'string',
            required: true
        },
        steps: {
            type: 'integer',
            required: true
        },
        distance: {
            type: 'decimal',
            required: true
        },
        floors: {
            type: 'decimal',
            required: true
        },
        elevation: {
            type: 'decimal',
            required: true
        },
        calories_burned: {
            type: 'decimal',
            required: true
        },
        source: {
            type: 'string',
            required: true
        },
        source_name: {
            type: 'string',
            required: true
        },
        last_updated: {
            type: 'datetime',
            required: true
        }
    }
};
