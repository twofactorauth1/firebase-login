/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

var ModelBase = require('models/model.base');
var _ = require('underscore');

var associatedInstance = function() {
    this.init.apply(this, arguments);
};

_.extend(associatedInstance.prototype, {

    init: function(association, model) {
        this.association = association;
        this.model = model;
    },

    association: null,
    model: null,

    toJSON: function() {
        if (this.association.type == "single") {
            var obj = this.model.attributes[this.association.field];
            if (obj != null && _.isFunction(obj.toJSON)) {
                return obj.toJSON();
            }
        } else if (this.association.type == "collection") {
            var arr = this.model.attributes[this.association.field];
            var _arr = [];
            if (arr != null) {
                for (var i = 0, l = arr.length; i < l; i++) {
                    var child = arr[i];
                    if (_.isFunction(child.toJSON)) {
                        _arr.push(child.toJSON());
                    }
                }
            }
            return _arr;
        }
        return null;
    }
});


var associatedModel = function() {
    this.init.apply(this, arguments);
};


_.extend(associatedModel.prototype, ModelBase.prototype, {

    /**
     * Association types used to define
     * an association
     */
    ASSOCIATION_TYPES: {
        SINGLE:"single",
        COLLECTION:"collection"
    },


    /**
     * associations is an array of items defined as:
     *
     * {
     *   field: {property name}
     *   type: SINGLE | COLLECTION
     *   model: model instance (e.g. $$.m.Account)
     * }
     */
    associations: [],

    toJSON: function() {
        var obj = _.clone(this.attributes);

        var associated = {};

        this.associations.forEach(function(assocation) {
            associated[assocation.field] = assocation;
        });

        for (var key in this.attributes) {
            if (associated.hasOwnProperty(key)) {
                var association = associated[key];

                var json = new associatedInstance(association, this).toJSON();
                obj[key] = json;
            }
        }

        return obj;
    },


    props: function() {
        var obj = {};
        var associated = {};

        this.associations.forEach(function(assocation) {
            associated[assocation.field] = assocation;
        });

        for (var key in this.attributes) {
            if (associated.hasOwnProperty(key)) {
                var association = associated[key];
            }
        }
    }
});