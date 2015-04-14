/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var order = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            "_id" : null,
            "account_id": null,
            "customer_id" : null,
            "session_id" : null,
            "completed_at" : null,
            "updated_at" : null,
            "created_at" : new Date(),
            "status" : "processing", //pending, on-hold, processing, completed, refunded, failed, and cancelled
            "total" : 0.0,
            "cart_discount" : 0.0,
            "total_discount" : 0.0,
            "total_shipping" : 0.0,
            "total_tax" : 0.0,
            "shipping_tax" : 0.0,
            "cart_tax" : 0.0,
            "currency" : "usd",
            "line_items" : [
                /*
                {
                    "product_id" : 31,
                    "quantity" : 1,
                    "variation_id" : 7,
                    "subtotal" : "20.00",
                    "tax_class" : null,
                    "sku" : "",
                    "total" : "20.00",
                    "name" : "Product Name",
                    "total_tax" : "0.00"
                }
                */
            ],
            "total_line_items_quantity" : 0,
            "payment_details" : {
                "method_title" : null,//Check Payment, Credit Card Payment
                "method_id" : null,//check, cc
                "card_token": null,//Stripe card token if applicable
                "charge_description": null, //description of charge if applicable
                "statement_description": null,//22char string for cc statement if applicable
                "paid" : false
            },
            "shipping_methods" : "",// "Free Shipping",
            "shipping_address" : {
                /*
                "first_name" : "John",
                "last_name" : "Doe",
                "phone" : "000-000-0000",
                "city" : "San Diego",
                "country" : "US",
                "address_1" : "123 Sunshine Road",
                "company" : "ACME",
                "postcode" : "12534",
                "email" : "admin@indigenous.io",
                "address_2" : "",
                "state" : "CA"
                */
            },
            "billing_address" : {
                /*
                "first_name" : "John",
                "last_name" : "Doe",
                "phone" : "000-000-0000",
                "city" : "San Diego",
                "country" : "US",
                "address_1" : "123 Sunshine Road",
                "company" : "ACME",
                "postcode" : "12534",
                "email" : "admin@indigenous.io",
                "address_2" : "",
                "state" : "CA"
                */
            },
            "notes" : [
                /*
                {
                    "note" : "Order status changed from processing to completed",
                    "user_id" : 1,
                    "date" : ISODate("2015-04-13T12:02:18.055Z")
                }
                */
            ],
            created: {
                date: new Date(),
                by: null
            },
            modified: {
                date: null,
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
        table: "orders",
        idStrategy: "uuid"
    },
    status: {
        PROCESSING : 'processing',
        PENDING: 'pending',
        ON_HOLD: 'on-hold',
        COMPLETED: 'completed',
        REFUNDED: 'refunded',
        FAILED: 'failed',
        CANCELLED: 'cancelled'

    }
});

$$.m.Order = order;

module.exports = order;
