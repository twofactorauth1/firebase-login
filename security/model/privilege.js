/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var privilege = $$.m.ModelBase.extend({

    //userId, userName, roleAry, accountAry, privAry
    defaults: function() {
        return {
            _id: null,
            userId: null,
            userName: null,
            roles:[],
            accountIds: [],
            privs: [],
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
        table: "privileges",
        idStrategy: "uuid"
    }
});

$$.m.Privilege = privilege;

module.exports = privilege;
