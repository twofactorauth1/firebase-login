/**
 * Fitness
 *
 * @module      :: Model
 * @description :: User fitness information model. One to many relation between user and fitness.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        timestamp: {
            type: 'DATETIME', 
            required: true
        },
        utc_offset: {
            type: 'STRING',
            required: true
        },
        type: {
            type: 'STRING',
            required: true,
            in: ['Cycling', 'Mountain Biking', 'Walking, Hiking', 
                 'Downhill Skiing', 'Cross-country Skiing', 'Snowboarding', 
                 'Skating', 'Swimming', 'Rowing', 'Elliptical', 'Other']
        },
        intensity: {
            type: 'STRING', 
            required: true, 
            in: ['low', 'medium', 'high'],
            defaultsTo: 'medium'
        },
        start_time: {
            type: 'DATETIME',
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
