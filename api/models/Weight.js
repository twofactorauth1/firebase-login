/**
 * Weight
 *
 * @module      :: Model
 * @description :: User weight related attributes. One to many relation between user and weight.
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
        weight: {
            type: 'decimal',
            required: true
        },
        height: {
            type: 'decimal',
            required: true
        },
        free_mass: {
            type: 'decimal',
            required: true
        },
        fat_percent: {
            type: 'decimal',
            required: true
        },
        mass_weight: {
            type: 'decimal',
            required: true
        },
        bmi: {
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
