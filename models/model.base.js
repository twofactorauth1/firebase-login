var _ = require("underscore");

var modelBase = function(options) {
    this.init.apply(this, arguments);
};

_.extend(modelBase.prototype, {

    init: function(options, xFields) {
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

        if (xFields != null) {
            for(var key in this.attributes) {
                if (xFields[key] == null) {
                    delete this.attributes[key];
                }
            }
        }
    },

    /**
     * @transients
     *
     * Array of keys to mark whether or not certain properties get serialized
     * when sent either publicly through the API, or serialized to the DB.  If a
     * key is added here, it will not go out.
     *
     * for instance.
     *
     * transients: {
     *      deepCopy: true
     *      public: ["password", "internalId"],  //neither password nor internalId will be serialized to client
     *      db: ["sessionid"],                   //current sessionid will not be serialized to database
     * }
     *
     * You may also pass in a custom function that takes in the JSON and can remove any necessary properties manually.
     * This is useful for removal of nested properties.
     *
     * Note, setting deepCopy to true will force the toJSON method to do a deep copy. this is useful if you have to
     * remove deeper embedded objects that will be affected, as the standard toJSON method is a shallow copy.
     *
     * function(json) {};
     */
    transients: {
        deepCopy: false,
        public: null,
        db: null
    },


    /**
     * @serializers
     *
     * Allows you to specify a callback function that is called while serializing toJSON, and allows the model
     * class to set custom properties to send to either the database ("db") or the public ("public");
     *
     * Invokes a function that should have a signature as:  function(json);
     *
     * @param value
     * @returns {}
     */
     serializers: {
        public: null,  //function(json);
        db: null       //function(json);
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
        if (arguments.length == 2 && _.isString(arguments[0])) {
            this.attributes[arguments[0]] = arguments[1];
        } else {
            for(var key in props) {
                this.attributes[key] = props[key];
            }
        }
    },


    clear: function(key) {
        delete this.attributes[key];
    },


    created: function(userId) {
        var created = this.get("created");
        if (created == null) {
            created = {};
            this.set({created:created});
        }

        created.by = userId;
        created.date = new Date().getTime();
    },


    modified: function(userId) {
        var modified = this.get("modified");
        if (modified == null) {
            modified = {};
            this.set({modified:modified});
        }

        modified.by = userId;
        modified.date = new Date().getTime();
    },


    storage: function() {
        Object.getPrototypeOf(this).constructor.db.storage;
    },


    table: function() {
        Object.getPrototypeOf(this).constructor.db.table;
    },

    idStrategy: function() {
        Object.getPrototypeOf(this).constructor.db.idStrategy || "increment";
    },

    /**
     * @toJSON
     *
     * Serializes the model object to JSON for send to client or DB or any other use
     *
     * @param transientMode - null|{empty}|public|db.  When public or db are passed in
     *      we will remove any properties marked as transient for the given mode.  See
     *      @transients
     *
     * @param options - set of options the model should understand, common options are
     *      1) accountId - this accountId on the current request
     */
    toJSON: function(transientMode, options) {
        var json;
        if (this.transients != null) {
            if (this.transients.deepCopy === true) {
                json = JSON.parse(JSON.stringify(this.attributes));
            } else {
                json = _.clone(this.attributes); //shallow copy
            }
            var keys;
            if (transientMode == "public") keys = this.transients.public;
            else if(transientMode == "db") keys = this.transients.db;

            if (keys != null) {
                for (var i = 0; i < keys.length; i++) {
                    if (_.isFunction(keys[i])) {
                        keys[i].call(this, json, options);
                    } else {
                        delete json[keys[i]];
                    }
                }
            }
        }

        if (this.serializers != null) {
            if (transientMode == "public" && _.isFunction(this.serializers.public)) {
                this.serializers.public.call(this, json, options);
            } else if(transientMode == "db" && _.isFunction(this.serializers.db)) {
                this.serializers.db.call(this,json, options);
            }
        }
        return json;
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

module.exports = modelBase;
