/**
 * Nutrition
 *
 * @module      :: Model
 * @description :: User nutrition information model. One to many relation between user and nutrition.
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
        calories: {
            type: 'decimal',
            required: true
        },
        carbohydrates: {
            type: 'decimal',
            required: true
        },
        fat: {
            type: 'decimal',
            required: true
        },
        fiber: {
            type: 'decimal',
            required: true
        },
        protein: {
            type: 'decimal',
            required: true
        },
        sodium: {
            type: 'decimal',
            required: true
        },
        water: {
            type: 'decimal',
            required: true
        },
        meal: {
            type: 'string',
            required: true,
            in: ['breakfast', 'lunch', 'dinner', 'snack', 'other', 'unspecified']
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
