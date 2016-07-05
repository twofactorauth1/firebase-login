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
                fixed: false,
                custom: false
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
            global:false,
            globalHeader: false,
            globalFooter:false,
            canAddComponents: false,
            version: '1',
            txtcolor: null,
            border: {},
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
            hiddenOnPages: {},
            created: {
                date: new Date(),
                by: null
            },
            modified: {
                date: new Date(),
                by: null
            },
            _v:0
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
            if(lastIndex !== -1) {
                version = parseInt(this.id().slice(lastIndex+1));
            }
        } catch(Exception) {
            //whatever
        }

        return version;
    },

    setVersion: function(newver) {
        var lastIndex = this.id().lastIndexOf('_');
        var originalId = this.id().toString();
        var tempId;
        var updatedId;

        if(lastIndex !== -1) {
            tempId = originalId.slice(0, lastIndex);
            updatedId = tempId + '_' + newver;
        } else {
            updatedId = originalId + '_' + newver;
        }

        this.id(updatedId);

    },

    equals:function(other) {
        var idEqual = this.id() === other.id();
        var componentsEqual = _.isEqual(this.get('components'), other.get('components'));
        var bgEqual = _.isEqual(this.get('bg'), other.get('bg'));
        var spacingEqual = _.isEqual(this.get('spacing'), other.get('spacing'));
        var layoutEqual = _.isEqual(this.get('layoutModifiers'), other.get('layoutModifiers'));
        var hiddenEqual = _.isEqual(this.get('hiddenOnPages'), other.get('hiddenOnPages'));
        var fieldNames = [
            'anchor',
            'accountId',
            'layout',
            'name',
            'title',
            'type',
            'icon',
            'description',
            'filter',
            'preview',
            'enabled',
            'reusable',
            'global',
            'globalHeader',
            'globalFooter',
            'canAddComponents',
            'txtcolor',
            'version',
            'visibility'
        ];
        var self = this;
        var fieldsEqual = _.every(fieldNames, function(fieldName){
            return self.get(fieldName) === other.get(fieldName);
        });
        return idEqual && componentsEqual && bgEqual && spacingEqual && fieldsEqual && layoutEqual && hiddenEqual;
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
