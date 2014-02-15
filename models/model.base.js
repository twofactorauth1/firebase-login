var modelBase = function(options) {
    this.init.apply(this, arguments);
};

_.extend(modelBase.prototype, {

    init: function(options) {
        var defaults;
        if (_.isFunction(this.defaults)) {
            defaults = this.defaults();
        } else {
            defaults = $$.u.objutils.deepClone(this.defaults);
        }

        this.attributes = defaults;

        if (options != null) {
            this.set(options);
        }

        if (typeof this.initialize !== 'undefined') {
            this.initialize(options);
        }
    },


    id: function(value) {
        if (value != null) {
            this.attributes._id = value;
        }
        return this.attributes._id;
    },


    get: function(key) {
        return this.attributes[key];
    },


    set: function(props) {
        for(var key in props) {
            this.attributes[key] = props[key];
        }
    },


    storage: function() {
        return this.__proto__.db.storage;
    },


    table: function() {
        return this.__proto__.db.table;
    },


    props: function() {
        return this.attributes;
    },


    toJSON: function() {
        return JSON.stringify(this.attributes);
    }
});


//---------------------------------------------
//  --- Courtesy of Backbone.js
//---------------------------------------------

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
};

modelBase.extend = extend;

$$.m.ModelBase = modelBase;

module.exports.ModelBase = modelBase;
