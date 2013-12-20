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
            type: 'DATETIME', 
            required: true
        },
        utc_offset: {
            type: 'STRING',
            required: true
        },
        steps: {
            type: 'INTEGER',
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
            type: 'STRING',
            required: true
        },
        source_name: {
            type: 'STRING',
            required: true
        },
        last_updated: {
            type: 'DATETIME',
            required: true
        }
    }
};
