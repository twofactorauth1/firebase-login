/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014-2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./base.model.js');
var appConfig = require('../configs/app.config');

var account = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            orgId:0,
            company: {
                name:"",
                type:0,
                size:0,
                logo:""
            },

            subdomain:"",
            domain:"",
            customDomain:"",
            token:"",

            website: {

                /**
                 * The global settings for websites on this account.
                 * This may be overridden at the Website level
                 *
                 * @type {Object}
                 * @default null
                 *
                 * @example
                 * {
                 *      logoImage: {url}
                 *      logoClickUrl: {url}
                 *      favicon: null
                 * }
                 */
                settings: null,
                websiteId:null,             //The current Inidenous template being used, defaults to "default"
                themeId:"default"           //The current template data id being referenced (may have more than one)
            },
            "business" : {
                "logo" : '',
                "name" : '',
                "description" : '',
                "category" : '',
                "size" : '',
                "phones" : [],
                "addresses" : [],
                "type" :'',
                "nonProfit" : false,
                "emails": [],
                'splitHours': false,
                'hours': [
                   {'day': "Mon", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
                   {'day': "Tue", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
                   {'day': "Wed", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
                   {'day': "Thu", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
                   {'day': "Fri", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
                   {'day': "Sat", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':true, 'split':false, 'wholeday':false},
                   {'day': "Sun", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':true, 'split':false, 'wholeday':false}]
            },

            "billing" : {
                "userId" : '', //logged in user that added Stripe details
                "stripeCustomerId": '', //Stripe customerId... also stored on User
                "cardToken": '', //optional. Not sure if we need this if we have the customer reference
                "signupDate": new Date(),
                "trialLength": 31
            },

            'credentials': [],

            "firstLogin": true,

            "showhide": {
                "blog": true,
                "ssbSiteBuilder": true,
                "dohy": true,
                "userScripts": false,
                "ssbBlog": true,
                "ssbEmail": true,
                "ssbFeatureFixedElements": true,
                "blogSocialSharing": false,
                "editHTML": false,
                blogPostSecondCol:false
            },
            "email_preferences": {
                new_contacts: true,
                new_orders: true,
                helpful_tips: true,
                no_notifications: false,
                senderAddress:null,
                receiveInsights: true
            },
            commerceSettings : {
                taxes : false,
                taxbased : "business_location",
                taxnexus : []
            },
            activated:false,
            oem:false,
            useCDN:true,
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


    getOrGenerateSubdomain: function() {
        var subdomain = this.get("subdomain");
        if ($$.u.stringutils.isNullOrEmpty(subdomain)) {
            var companyName = this.get("company").name;
            if ($$.u.stringutils.isNullOrEmpty(companyName) == false) {
                subdomain = companyName.trim().replace(" ", "");
            } else {
                subdomain = "indig-" + Math.round(Math.random() * 1000000);
            }
        }

        return subdomain;
    },


    serializers: {
        public: function(json) {
            if (this.get("subdomain") != null) {
                json.accountUrl = appConfig.getServerUrl(this.get("subdomain"), this.get("domain"));
            }
        },
        db: function(json) {
            if(!String.isNullOrEmpty(json.subdomain)) {
                json.subdomain = json.subdomain.toLowerCase();
            }
        }
    },

    transients: {
        db: ['trialDaysRemaining'],
        public: ['blocks']
    },


    initialize: function(options) {
        if ($$.u.stringutils.isNullOrEmpty(this.get("token"))) {
            var token = $$.u.idutils.generateUUID();
            this.set({token:token});
        }

        if ($$.u.stringutils.isNullOrEmpty(this.get("subdomain"))) {
            var subdomain = this.get("subdomain");
            subdomain = subdomain.trim().replace(" ", "");
            this.set({subdomain:subdomain});
        }
    },

    getSignUpDate: function(){
        if(this.get("billing") && this.get("billing").signupDate){
            return moment(this.get("billing").signupDate).format("M/d/YY");
        }
    },
    getBillingZip: function(){
        if(this.get("billing") && this.get("billing").details){
            return this.get("billing").details.zip;
        }
    },
    getBillingState: function(){
        if(this.get("billing") && this.get("billing").details){
            return this.get("billing").details.state;
        }
    },
    getBillingPlan: function(){
        if(this.get("billing")){
            return this.get("billing").plan;
        }
    }

}, {
    db: {
        storage: "mongo",
        table: "accounts",
        idStrategy: "increment",
        cache: true
    }
});

$$.m.Account = account;

module.exports = account;
