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
            status: 'inactive', //auto_inactive, active, inactive, backorder
            public: true,
            sku: null,
            name: null,
            type: null,
            description: null,
            regular_price: 0,
            cost: 0,
            on_sale: false,
            sale_price: 0,
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
            product_attributes: {},
            /* Example:
                {
                    “name”:”attribute”,
                    “values”: [‘one’, ’two’,’three']
                }
            */
            total_sales: 0,

            hasVariations: false,

            variations: [],

            /* Example:
                {
                    "id": 609,
                    "created_at": "2015-01-22T20:37:14Z",
                    "updated_at": "2015-01-22T20:37:14Z",
                    "downloadable": false,
                    "virtual": false,
                    "permalink": "https://example/product/ship-your-idea-10/?attribute_pa_color=black",
                    "sku": "",
                    "price": "19.99",
                    "regular_price": "19.99",
                    "sale_price": null,
                    "taxable": true,
                    "tax_status": "taxable",
                    "tax_class": "",
                    "managing_stock": false,
                    "stock_quantity": 0,
                    "in_stock": true,
                    "backordered": false,
                    "purchaseable": true,
                    "visible": true,
                    "on_sale": false,
                    "weight": null,
                    "dimensions": {
                      "length": "",
                      "width": "",
                      "height": "",
                      "unit": "cm"
                    },
                    "shipping_class": "",
                    "shipping_class_id": null,
                    "image": [
                      {
                        "id": 610,
                        "created_at": "2015-01-22T20:37:18Z",
                        "updated_at": "2015-01-22T20:37:18Z",
                        "src": "http://example/wp-content/uploads/2015/01/ship-your-idea-black-front.jpg",
                        "title": "",
                        "alt": "",
                        "position": 0
                      }
                    ],
                    "attributes": [
                      {
                        "name": "Color",
                        "slug": "color",
                        "option": "black"
                      }
                    ],
                    "downloads": [],
                    "download_limit": 0,
                    "download_expiry": 0
                }
            */
            created: {
                date: new Date(),
                by: null
            },
            modified: {
                date: new Date(),
                by: null
            },
            _v: "0.1",
            is_image: false,
            starred: false,
            tags: null
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
