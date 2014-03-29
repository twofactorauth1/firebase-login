/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define([
    'backboneNested'
], function() {

    var model = Backbone.NestedModel.extend({

        idAttribute: "_id",

        setContent: function(dataClass, content, targetData, config) {
            if (this.attributes.hasOwnProperty(dataClass)) {
                this.set(dataClass, content);
                return;
            }

            var isCollection = false;
            var collection = null;
            var itemClass = null;
            var itemIndex = null;
            if (dataClass.indexOf(".item.") > -1) {
                dataClass = dataClass.replace(".item.", ".");
                collection = dataClass.split(".")[0];
                itemClass = config.classes["collection.item"];
                itemIndex = $(targetData).parent("." + itemClass).index();
                isCollection = true;
            }

            if (isCollection === false) {
                this.set(dataClass, content);
            } else {
                var setterKey = collection + "[" + itemIndex + "]." + dataClass.split(".")[1];
                this.set(setterKey, content);
            }
        },


        url: ""
    });


    $$.m.cms = $$.m.cms || {};
    $$.m.cms.components = $$.m.cms.components || {};
    $$.m.cms.components.ComponentBase = model;

    return model;
});

