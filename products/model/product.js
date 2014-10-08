/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var product = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            accountId: null,
            websiteId: null,
            sku: null,
            name: null,
            type: null,
            description: null,
            regular_price: 0,
            cost: 0,
            sales_price: 0,
            sale_date_from: null,
            sale_date_to: null,
            featured: true,
            weight: "",
            height: "",
            width: "",
            length: "",
            downloads: [],
            /* Example:
                {
                    “file_name”:”example_name.zip”,
                    “file_size”:”5.2mb”,
                    “limit”:”100”,
                    “date_expired”:” 1397761951291”,
                    “days_avaliable”:”30”,
                    “total_downloads”:”400”,
                }
            */
            product_attributes: [],
            /* Example:
                {
                    “name”:”attribute”,
                    “values”: [‘one’, ’two’,’three']
                }
            */
            total_sales: 0,
            created: {
                date: new Date(),
                by: null
            },
            modified: {
                date: new Date(),
                by: null
            },
            _v:"0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "products",
        idStrategy: "uuid"
    }
});

$$.m.Product = product;

module.exports = product;
