/**
 * Fitness
 *
 * @module      :: Model
 * @description :: User fitness information model. One to many relation between user and fitness.
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
        type: {
            type: 'string',
            required: true,
            in: ['Cycling', 'Mountain Biking', 'Walking, Hiking', 
                 'Downhill Skiing', 'Cross-country Skiing', 'Snowboarding', 
                 'Skating', 'Swimming', 'Rowing', 'Elliptical', 'Other']
        },
        intensity: {
            type: 'string', 
            required: true, 
            in: ['low', 'medium', 'high'],
            defaultsTo: 'medium'
        },
        start_time: {
            type: 'datetime',
            required: true
        },
        distance: {
            type: 'decimal',
            required: true
        },
        duration: {
            type: 'decimal',
            required: true
        },
        calories: {
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
