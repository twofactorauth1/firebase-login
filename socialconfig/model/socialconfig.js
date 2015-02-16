/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var socialconfig = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            accountId: null,

            /*
             * Objects in this array are like the following:
             * {
             * "id" : uuid,
             * "type" : "fb",
             "username" : "thekylejmiller",
             "socialUrl" : "https://www.facebook.com/thekylejmiller",
             "socialId" : "10152581541594814",
             "accessToken" : "CAAI13KqWRXQBABGNi9RhYZC4nh8j6pJj8ZBnOfNE7Hfxo1rZBBZCutFEY3VYeZCmfS04RZBsK8ZBVXBStLuTlZC1ZClWb9u6q4gGZBW5lYczqFmY4g4KELjzmfFsWKVV042RXBLLtJOMEO43ayAU1gVOnW6fJbgSWyIGlE2i52EphFaWVGmbhDLS7YcGYyrYy3GNfQComJa4Vpvs57BZAZCFVNbB",
             "expires" : 1424479834189,
             "scope" : "[\"user_friends\",\"email\",\"read_insights\",\"read_stream\"]"
             }
             */
            socialAccounts:[],

            /*
             * Objects in this array are like the following:
             * {
             *   socialId: uuid, //points to object in socialAccounts
             *   type: feed, //feed, wall, messages, search, user, pages, numberTweets, numberFollowers
             *   term: "",//search term, username, etc
             * }
             */
            trackedObjects:[],

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

    getSocialAccountById: function(id) {
        var account = null;
        account = _.find(this.attributes.socialAccounts, function(_account){return _account.socialId === id});
        return account;
    },

    getSocialAccountsByType: function(type) {
        var accounts = [];
        _.each(this.attributes.socialAccounts, function(_account){if(_account.type === type){accounts.push(_account);}});
        return accounts;
    },




    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "socialconfig",
        idStrategy: "uuid"
    }
});

$$.m.SocialConfig = socialconfig;

module.exports = socialconfig;
