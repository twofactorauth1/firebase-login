(function() {
//---------------------------------------------------------
//
//  MAPS MODEL METHODS TO HTTP METHODS
//
//---------------------------------------------------------

    Backbone.methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'read': 'GET'
    };


//---------------------------------------------------------
//
    //
//  BACKBONE MODEL EXTEND
//
//---------------------------------------------------------

    _.extend(Backbone.Model.prototype, {

        idAttribute: "_id",
        fetched: false,
        fetching: false,
        promise: null,

        fetchCustomUrl: function (url, nocache) {
            var origUrl = this.url;
            this.url = url;

            var promise;
            if (nocache === true) {
                promise = this.fetch({nocache: true});
            } else {
                promise = this.fetch();
            }

            if (this.hasCache === true && nocache !== true) {
                var self = this;
                promise.always(function () {
                    self.url = origUrl;
                });
            } else {
                this.url = origUrl;
            }
            return promise;
        },

        saveCustomUrl: function (url) {
            var origUrl = this.url;
            this.url = url;
            var promise = this.save();
            this.url = origUrl;
            return promise;
        },

        getPromise: function () {
            return this.promise;
        },

        isNew: function () {
            return this.id == null || this.id === 0;
        },

        unique: function () {
            return new Date().getTime();
        },

        /**
         * Return the constructor, which loosely resembles the static values on the view
         */
        statics: function () {
            return this.constructor;
        }
    });


//---------------------------------------------------------
//
//  BACKBONE COLLECTION EXTEND
//
//---------------------------------------------------------

    _.extend(Backbone.Collection.prototype, {
        fetched: false,
        fetching: false,

        fetchCustomUrl: function (url, nocache) {
            var origUrl = this.url;
            this.url = url;

            var promise;
            if (nocache === true) {
                promise = this.fetch({nocache: true});
            } else {
                promise = this.fetch();
            }

            if (this.hasCache === true && nocache !== true) {
                var self = this;
                promise.always(function () {
                    self.url = origUrl;
                });
            } else {
                this.url = origUrl;
            }
            return promise;
        },

        getPromise: function () {
            return this.promise;
        },

        unique: function () {
            return new Date().getTime();
        },


        /**
         * Return the constructor, which loosely resembles the static values on the view
         */
        statics: function () {
            return this.constructor;
        }
    });


//---------------------------------------------------------
//
//  BACKBONE VIEW RENDER & CLOSE METHODS
//
//---------------------------------------------------------

    _.extend(Backbone.View.prototype, {

        /**
         * @vent
         *
         * Event Dispatcher
         */
        vent: _.clone(Backbone.Events),


        /**
         * @show
         *
         * Shortcut to just set the html on this element
         *
         * @param html
         */
        show: function(html) {
            this.$el.html(html);
        },


        /**
         * @transitionIn
         *
         * This is a transition effect.  By specifying "default" instead of a function, a default
         * transitionIn effect will be used. A custom transition effect can be implemented by making
         * this a function with a callback argument passed in.
         *
         * transitionIn: function(cb)
         */
        transitionIn: "default",


        /**
         * @doTransitionIn
         *
         * This method invokes any transitionIn methods, if available.  A callback function is required
         * to alert when the transition has been completed
         *
         * @param fn
         * @returns {*}
         */
        doTransitionIn: function(fn) {
            if (this.transitionIn === "default") {
                return this._defaultTransitionIn(fn);
            } else if (_.isFunction(this.transitionIn)) {
                return this.transitionIn(fn);
            }
            if (fn != null) fn();
        },


        /**
         * @setUpForTransitionIn
         *
         * This method is used to setup a view for a transition effect before transitioning. It can
         * be used to apply any necessary classes to the view for the purposes of aiding in the transition.
         * You can override this by setting a new function.  The signature expects synchronous return.
         *
         * @param fn
         */
        setUpTransitionIn: function() {
            if (this.transitionIn === "default" || _.isFunction(this.transitionIn)) {
                //TODO: remove this and replace with real css classes, or whatever you want to do
                this.$el.hide();

                //TODO: This is an example, you would add a new css class(es) here that define the transition
                this.$el.addClass("transitionIn");
            }
            return;
        },


        /**
         * The default TransitionIn Method.
         *
         * @param fn
         * @private
         */
        _defaultTransitionIn: function(fn) {
            //TODO: if using a css transition, you must listen for the transition end:
            this.$el.on("transitionend webkitTransitionEnd", function(event) {
                var $target = $(e.target).off("transitionend webkitTransitionEnd");
                if (fn != null) fn();
            });

            //TODO: Do something here.
            this.$el.fadeIn(1500, function() {
                if (fn != null) fn();
            });
        },


        /**
         * @transitionOut
         *
         * This is a transition effect for the outbound view. By specificying "default" instead of a function,
         * a default transitionOut effect will be used.  A custom transition effect can be implemented by making
         * this a function with a callback argument.
         *
         * transitionOut: function(cb)
         */
        transitionOut: "default",


        /**
         * @doTransitionOut
         *
         * This method invokes any transitionOut methods, if available.  A callback function is required
         * to alert when the transition has been completed
         *
         * @param fn
         * @returns {*}
         */
        doTransitionOut: function(fn) {
            if (this.transitionOut === "default") {
                return this._defaultTransitionOut(fn);
            } else if (_.isFunction(this.transitionOut)) {
                return this.transitionOut(fn);
            }
            if (fn != null) fn();
        },


        /**
         * @setUpForTransitionOut
         *
         * This method is used to setup a view for a transition effect before transitioning out. It can
         * be used to apply any necessary classes to the view for the purposes of aiding in the transition.
         * You can override this by setting a new function.  The signature expects synchronous return.
         *
         * @param fn
         */
        setUpTransitionOut: function() {
            if (this.transitionIn === "default" || _.isFunction(this.transitionIn)) {

                //TODO:  this is just an example, you can add / remove classes here to define your trnasition.
                this.$el.removeClass("transitionIn");
            }
            return;
        },


        /**
         * The default Transition Out Method.
         *
         * @param fn
         * @private
         */
        _defaultTransitionOut: function(fn) {
            //TODO: if using a css transition, you must listen for the transition end, if you want to listen for it
            this.$el.on("transitionend webkitTransitionEnd", function(event) {
                var $target = $(e.target).off("transitionend webkitTransitionEnd");
                if (fn != null) fn();
            });

            //TODO: Do something here
            this.$el.fadeOut(1000, function() {
                if (fn != null) fn();
            });
        },

        /**
         * @close
         *
         * Extends all Backbone Views to implement a close function.  As well,
         * ever instance of a view may implement an additional onClose method, to be
         * overridden and include tasks such as unbinding from model objects.
         *
         * Only called when view is removed by ViewManager.
         *
         * NOTE: Do not override this method, override onPreClose and onClose methods, instead
         *
         */
        close: function () {
            this.onPreClose();

            if (this.subviews != null) {
                for(var i = 0; i < this.subviews.length; i++) {
                    this.subviews[i].close();
                }
                this.subviews = null;
            }

            this.remove();
            this.unbind();
            this.onClose();

            this.vent.trigger("close");
        },

        /**
         * @onPreClose
         *
         * Called before removal, by close method
         */
        onPreClose: function () {

        },

        /**
         * @onClose
         *
         * Called on close, by close method.
         */
        onClose: function () {

        },

        /**
         * @postRender
         *
         * Adds a hookin that can be called every time a view is rendered, and after
         * it is loaded into the DOM.  Only called when View is rendered by ViewManager
         */
        postRender: function () {

        },

        /**
         * @hasUnsaved
         *
         * Adds a hook-in to all views to respond if they have unsaved data or not
         */
        hasUnsaved: function () {
            return false;
        },

        /**
         * @discardChanged
         *
         * Adds a hook-in to alert a view to clear its current changes
         * before navigating away to a new page.
         */
        discardChanges: function () {

        },


        /**
         * Return the constructor, which loosely resembles the static values on the view
         */
        statics: function () {
            return this.constructor;
        },


        addSubView: function(view) {
            if (this.subviews == null) {
                this.subviews = [];
            }

            this.subviews.push(view);
        },


        removeSubView: function(view) {
            if (this.subviews == null) {
                return;
            }

            var i = this.subviews.index(view);
            view.close();

            if (i > -1) {
                this.subviews.splice(i, 1);
            }
        }
    });


    //---------------------------------------------------------
//
//  PASS IN METHOD TO URL FUNCTIONS
//
//---------------------------------------------------------

    /**
     * Override backbone.sync so we can pass in the
     * HTTP Method to the getURL function, as this affects
     * our REST service call.
     *
     * For instance, the default implementation makes a PUT call
     * similar to /classType/:id
     *
     * We don't want that, we may just want to PUT to /classType, and
     * its inferred that we pull the Id of the object out of the content,
     * instead of passing it through the URL.
     */
    Backbone.sync = function (method, model, options) {
        var type = Backbone.methodMap[method];


        //See if we can retrieve from Cache, first
        if (type == "GET") {
            if (model.hasCache && options.nocache !== true) {
                var resp = model.getFromCache();
                if (resp != null) {
                    model.preventCacheClear();
                    options.success(resp, "success", null);
                    model.resumeCacheClear();
                    return model.getPromise();
                } else if (model.isInProgress()) {
                    var tmpPromise = new $.Deferred();
                    var promise = model.getPromise()
                        .done(function (resp) {
                            model.preventCacheClear();
                            options.success(resp, "success", null);
                            model.resumeCacheClear();
                            tmpPromise.resolve();
                        })
                        .fail(function (/*resp,error, message*/) {
                            tmpPromise.rejectWith(promise, arguments);
                        });
                    return tmpPromise;
                }
            }
        }

        //Trap success to cache on way back in:
        if (type == "GET") {
            var success = options.success;
            if (model.hasCache && options.nocache !== true) {
                model.setInProgress();
            }
            options.success = function (resp, status, xhr) {
                if (model.hasCache && options.nocache !== true) {
                    model.setToCache(resp);
                    model.preventCacheClear();
                }

                if (success) {
                    success(resp, status, xhr);
                }

                if (model.hasCache && options.nocache !== true) {
                    model.resumeCacheClear();
                }
            };
        }


        //Added Fetching Property
        model.fetching = true;
        var _success = options.success;
        var _error = options.error;

        options.success = function () {
            model.fetching = false;
            model.fetched = true;
            if (_success) {
                _success.apply(null, arguments);
            }
        };

        options.error = function () {
            model.fetching = false;
            if (_error) {
                _error.apply(null, arguments);
            }
        };
        //end Added Fetching Property

        // Default JSON-request options.
        var params = _.extend({
            type: type,
            dataType: 'json'
        }, options);

        // Ensure that we have a URL.
        if (!params.url) {
            params.url = Backbone.getUrlForSync(model, type) || Backbone.urlError();
        }

        // Ensure that we have the appropriate request data.
        if (!params.data && model && (method == 'create' || method == 'update')) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(model.toJSON());
        }

        // For older servers, emulate JSON by encoding the request into an HTML-form.
        if (Backbone.emulateJSON) {
            params.contentType = 'application/x-www-form-urlencoded';
            params.data = params.data ? {model: params.data} : {};
        }

        // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
        // And an `X-HTTP-Method-Override` header.
        if (Backbone.emulateHTTP) {
            if (type === 'PUT' || type === 'DELETE') {
                if (Backbone.emulateJSON) {
                    params.data._method = type;
                }
                params.type = 'POST';
                params.beforeSend = function (xhr) {
                    xhr.setRequestHeader('X-HTTP-Method-Override', type);
                };
            }
        }

        // Don't process data on a non-GET request.
        if (params.type !== 'GET' && !Backbone.emulateJSON) {
            params.processData = false;
        }

        // Make the request. //Return the promise;
        model.promise = $.ajax(params);
        if (model.hasCache && options.nocache !== true) {
            model.setPromiseToCache(model.promise);
        }
        return model.promise;
        //return $.ajax(params);
    };


//---------------------------------------------------------
//  GET URL FOR SYNC METHODS
//---------------------------------------------------------

    /**
     * New method to accept the HTTP method
     * and get the URL from a parameter, or a function where
     * we pass in the method type
     */
    Backbone.getUrlForSync = function (object, method) {
        if (!(object && object.url)) {
            return null;
        }
        return _.isFunction(object.url) ? object.url(method) : object.url;
    };



//---------------------------------------------------------
//
//  BACKBONE MIXINS
//
//---------------------------------------------------------
    Backbone.utils = Backbone.utils || {};


    // Helper method to extend an already existing method
    Backbone.utils.extendMethod = function (to, from, methodName) {
        // if the method is defined on from ...
        if (!_.isUndefined(from[methodName])) {
            var old = to[methodName];

            // ... we create a new function on to
            to[methodName] = function () {
                // wherein we first call the method which exists on `to`
                var oldReturn = old.apply(this, arguments);

                // and then call the method on `from`
                from[methodName].apply(this, arguments);

                // and then return the expected result, // i.e. what the method on `to` returns
                return oldReturn;
            };
        }
    };


    Backbone.utils.extendMethods = function (to, from, methods) {
        for (var i = 0; i < methods.length; i++) {
            Backbone.utils.extendMethod(to, from, methods[i]);
        }
    };


    Backbone.Collection.mixin = Backbone.Model.mixin = function (from) {
        var to = this.prototype;
        _.defaults(to, from);
        Backbone.utils.extendMethods(to, from, ["initialize"]);

        var methodOverrides = ["getPromise", "unique"];

        for (var i = 0; i < methodOverrides.length; i++) {
            var method = methodOverrides[i];
            if (!_.isUndefined(from[method])) {
                to[method] = from[method];
            }
        }
    };


    Backbone.View.mixin = function (from) {
        var to = this.prototype;

        // we add those methods which exists on `from` but not on `to` to the latter
        _.defaults(to, from);

        // â€¦ and we do the same for events
        _.defaults(to.events, from.events);

        // we then extend `to`'s `initialize`
        var viewMethods = ["initialize", "render", "postRender", "close", "onClose", "hasUnsaved", "discardChanges"];

        Backbone.utils.extendMethods(to, from, viewMethods);
    };


    Backbone.Router.mixin = function (from) {
        var to = this.prototype;

        // we add those methods which exists on `from` but not on `to` to the latter
        _.defaults(to, from);

        // â€¦ and we do the same for routes
        _.defaults(to.routes, from.routes);

        // we then extend `to`'s `initialize`
        var methods = ["initialize"];

        Backbone.utils.extendMethods(to, from, methods);
    };


//---------------------------------------------------------
//
//  VIEW MANAGER
//
//---------------------------------------------------------

    // The self-propagating extend function that Backbone classes use.
    var extend = function (protoProps, classProps) {
        var child = inherits(this, protoProps, classProps);
        child.extend = this.extend;
        return child;
    };


    /**
     * Create a ViewManager class that can be extended. This has some shortcuts
     * for properly handling adding and removing of views, to ensure all bindings
     * are removed.
     */
    Backbone.ViewManager = function (options) {
        this.init(options)
    };

    _.extend(Backbone.ViewManager.prototype, Backbone.Events, {

        mainViewport: "#main-viewport",

        views: {},

        oldViews: {},


        init: function(options) {
            if (options != null) {
                if (options.mainViewport) {
                    this.mainViewport = options.mainViewport;
                }
            }
        },


        replaceMain: function(view) {
            this.show(view, this.mainViewport);
        },


        replaceMainHtml: function(html) {
            this.showHtml(html, this.mainViewport);
        },


        /**
         * @public
         *
         * Pass in a non-rendered Backbone View, along with the selector
         * of the element it should be inserted into.  This method will remove
         * any old view already sitting in the selected element, calling the #close()
         * method on it.  It will then call the #render() method on the new view,
         * add the el property of the new view to the selected element, and finally,
         * call the #afterRender() method on the view, if it exists.
         */
        show: function (view, selector) {
            this._show(view, selector);
        },


        showHtml: function (html, selector, context) {
            var oldView = this._getView(selector);
            if (oldView != null) {
                oldView.close();
            }

            var container = null;
            if (context != null) {
                container = $(selector, context)[0];
            } else {
                container = $(selector)[0];
            }

            if (container == null) {
                return false;
            }

            if (context != null) {
                $(container, context).html(html);
            } else {
                $(container).html(html);
            }

            if (this.onAllRender != null) {
                this.onAllRender();
            }

            return true;
        },


        /**
         * @public
         *
         * Closes the view with necessary selector
         */
        close: function (selector) {
            this._clearView(selector);
        },


        /**
         * @public
         *
         * Retrieves the current view sitting in a given container
         */
        get: function (selector) {
            return this._getView(selector);
        },


        /**
         * @protected
         */
        _show: function (view, selector, beforeAddToDOM, closeOldFunction) {

            var oldView = this._getView(selector);

            if (oldView === view) {
                console.log("Attempting to show the same view as what's currently in place");
                return;
            }

            if (oldView != null) {
                oldView.setUpTransitionOut();
                oldView.doTransitionOut(function() {
                    if (closeOldFunction != null) {
                        closeOldFunction(this);
                    } else {
                        oldView.close();
                    }
                });
            }


            var container = $(selector)[0];
            if (container == null) {
                return false;
            }

            this.views[selector] = view;

            if (beforeAddToDOM != null) {
                beforeAddToDOM();
            }

            if (view == null) {
                $(container).append("");
                return true;
            }

            view.render();
            view.postRender();

            if (this.onAllRender != null) {
                this.onAllRender();
            }

            if (oldView != null) {
                view.setUpTransitionIn();
            }

            $(container).append(view.$el);

            if (oldView != null) {
                view.doTransitionIn();
            }

            return true;
        },


        onAllRender: function() {

        },


        /**
         * @protected
         */
        _showAfter: function (viewToShow, afterView, customSelector, beforeAddToDOM, closeOldFunction) {
            var oldView = this._getView(customSelector);
            if (oldView != null && closeOldFunction != null) {
                closeOldFunction(this);
            } else if (oldView != null) {
                oldView.close();
            }

            this.views[customSelector] = viewToShow;
            this.views[customSelector].render();

            if (beforeAddToDOM != null) {
                beforeAddToDOM();
            }
            $(afterView).after(this.views[customSelector].el);

            this.views[customSelector].postRender();
        },


        _getView: function (selector) {
            return this.views[selector];
        },


        _clearView: function (selector) {
            if (this.views[selector] != null) {
                this.views[selector].close();
            }

            $(selector).html("");
        }

    });

    Backbone.ViewManager.extend = extend;


    //---------------------------------------------------------
//
//  REQUIRED UTILITY METHODS FOR CREATING EXTENDABLE
//  CLASSES
//
//---------------------------------------------------------


    // Shared empty constructor function to aid in prototype-chain creation.
    var Ctor = function () {
    };
    var inherits = function (parent, protoProps, staticProps) {
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent's constructor.
        if (protoProps && protoProps.hasOwnProperty('constructor')) {
            child = protoProps.constructor;
        } else {
            child = function () {
                parent.apply(this, arguments);
            };
        }

        // Inherit class (static) properties from parent.
        _.extend(child, parent);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        Ctor.prototype = parent.prototype;
        child.prototype = new Ctor();

        // Add prototype properties (instance properties) to the subclass,
        // if supplied.
        if (protoProps) {
            _.extend(child.prototype, protoProps);
        }

        // Add static properties to the constructor function, if supplied.
        if (staticProps) {
            _.extend(child, staticProps);
        }

        // Correctly set child's `prototype.constructor`.
        child.prototype.constructor = child;

        // Set a convenience property in case the parent's prototype is needed later.
        child.__super__ = parent.prototype;

        return child;
    };

    return Backbone;
}).call(this);


















