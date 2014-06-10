/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'backboneNested'
], function() {

    var model = Backbone.NestedModel.extend({

        idAttribute: "_id",

        setContent: function(dataClass, content, targetData, config) {
            console.log('setting content with Data Class: '+dataClass+' Content'+content+' Target Data: '+targetData+' Config:'+config);
            if (this.attributes.hasOwnProperty(dataClass)) {
                console.log('has own property');
                this.set(dataClass, content);
                return;
            }

            var isCollection = false;
            var collection = null;
            var itemClass = null;
            var itemIndex = null;
            if (dataClass.indexOf(".item.") > -1) {
                console.log('has an item');
                dataClass = dataClass.replace(".item.", ".");
                console.log('Data Class: '+dataClass);
                collection = dataClass.split(".")[0];
                console.log('Collection: '+collection);
                itemClass = config.classes[collection+".item"];
                console.log('Item Class: '+itemClass);
                itemIndex = $(targetData).parent("." + itemClass).index();
                console.log('Item Index: '+itemIndex+' Target Class'+$(targetData).parent().html());
                isCollection = true;
            }

            if (isCollection === false) {
                console.log('Data Class: '+dataClass);
                this.set(dataClass, content);
            } else {
                var setterKey = collection + "[" + itemIndex + "]." + dataClass.split(".")[1];
                console.log('Setter Key: '+setterKey);
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

