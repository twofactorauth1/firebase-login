/**
 * Sleep
 *
 * @module      :: Model
 * @description :: User sleep related attributes. One to many relation between user and sleep.
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
        total_sleep: {
            type: 'decimal',
            required: true
        },
        awake: {
            type: 'decimal',
            required: true
        },
        deep: {
            type: 'decimal',
            required: true
        },
        light: {
            type: 'decimal',
            required: true
        },
        rem: {
            type: 'decimal',
            required: true
        },
        times_woken: {
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
