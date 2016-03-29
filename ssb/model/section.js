/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

/**
 * @class Section
 */
var section = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            _id: null,
            anchor: null,
            accountId:null,
            layout: '',
            layoutModifiers: {
                fixed: false
            },
            components: [],//array of components, similar to what's on pages now
            name:'',
            title:'',
            type : "ssb-page-section",
            icon: '',
            description:'',
            filter:'',
            preview:'',
            enabled:true,
            reusable:true,
            globalHeader: false,
            globalFooter:false,
            canAddComponents: false,
            version: '1',
            txtcolor: null,
            bg: {
                img: {
                    url : "",
                    width : null,
                    height : null,
                    parallax : false,
                    blur : false,
                    overlay : false,
                    show : false
                },
                color : ""
            },
            visibility : true,
            spacing : {
                "mt" : 0,
                "ml" : 0,
                "pt" : 0,
                "pl" : 0,
                "pr" : 0,
                "pb" : 0,
                "mr" : 0,
                "mb" : 0
            },
            created: {
                date: new Date(),
                by: null
            },
            modified: {
                date: new Date(),
                by: null
            }
        }
    },

    initialize: function(options) {

    },

    toReference: function() {
        return {_id: this.id()};
    },

    getVersion: function() {
        var version = 0;
        try {
            var lastIndex = this.id().lastIndexOf('_');
            if(lastIndex != -1) {
                version = parseInt(this.id().slice(lastIndex+1));
            }
        } catch(Exception) {
            //whatever
        }

        return version;
    },

    setVersion: function(newver) {
        var lastIndex = this.id().lastIndexOf('_');
        if(lastIndex != -1) {
            this.id(this.id().slice(0,lastIndex) + '_' + newver)
        } else {
            this.id(this.id() + '_' + newver);
        }
    }


}, {
    db: {
        storage: "mongo",
        table: "sections",
        idStrategy: "uuid"
    }
});

$$.m.ssb = $$.m.ssb || {};
$$.m.ssb.Section = section;

module.exports = section;
