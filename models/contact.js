require('./model.base');

var contactDetails = $$.m.ModelBase.extend({
        
});


var contact = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,

            /**
             * @details
             *
             * stores an array of information collected from different sources,
             * either local or social.
             * [{
             *      type:int
             *      email:string
             *      phones: [{
             *          type: string "m|w|h" //mobile, work, home
             *          number: string
             *      }],
             *      address: {
             *          address:string
             *          address2:string
             *          city:string
             *          state:string
             *          zip:string
             *          country:string
             *      }
             *  }]
             */
            details: []



        }
    },


    initialize: function(options) {

    }


}, {
    db: {
        storage: "mongo",
        table: "accounts"
    }
});

$$.m.Account = account;

module.exports = account;
