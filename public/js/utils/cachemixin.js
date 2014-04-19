/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([], function(){

    /**
     * A model that exists in a static scope within a Model or Collection, and is used
     * to manage the cache for that particular model or collection
     */
    var ModelCache = function()
    {
      //Test - remove me.
    };

    _.extend(ModelCache.prototype, Backbone.Events, {

        cache : {},
        promiseCache : {},
        inProgressCache : {},
        cachedTime : new Date().getTime(),


        initialize : function(){
            this.cache  = {};
            this.promiseCache = {};
            this.inProgressCache  = {};
            this.cachedTime = new Date().getTime();
            return this;
        },


        set : function(id, modelOrResp, model){
            if (_.isFunction(modelOrResp.toJSON)){
                this.cache[id] = modelOrResp.toJSON();
                this.promiseCache[id] = model.promise;
            }else{
                this.cache[id] = modelOrResp;
                this.promiseCache[id] = model.promise;
            }
        },


        setPromise : function(id, promise){
            this.promiseCache[id] = promise;
        },


        setInProgress : function(id){
            this.inProgressCache[id] = true;
        },


        removeInProgress : function(id){
            delete this.inProgressCache[id];
        },


        getInProgress : function(id){
            return this.inProgressCache[id] == true;
        },


        get : function(id){
            return this.cache[id];
        },


        getPromise : function(id){
            return this.promiseCache[id];
        },


        clear : function(id){
            this.cachedTime = new Date().getTime();
            if (id == null || id == ""){
                this.cache = {};
                this.promiseCache = {};
                this.inProgressCache = {};
            }else{
                delete this.cache[id];
                delete this.promiseCache[id];
                delete this.inProgressCache[id];
            }
        }
    });



    //INSTANCE MIXIN
    var mixin = {

        hasCache : true,

        initialize : function(){
            if (this.constructor.cache == null){
                this.constructor.cache = new ModelCache().initialize();
            }

            this.on("change", this.clearCache, this);
            this.on("add", this.clearCache, this);
            this.on("remove", this.clearCache, this);
        },

        preventCacheClear:function(){
            this.off("change", this.clearCache, this);
        },


        resumeCacheClear:function(){
            this.on("change", this.clearCache, this)
        },


        _id : function() {
            return _.isFunction(this.url) ? this.url("GET") : this.url
        },


        cache : function() {
            return this.constructor.cache;
        },


        getFromCache : function(){
            return this.cache().get(this._id());
        },


        setToCache : function(resp) {
            this.cache().set(this._id(), resp, this);
            this.cache().removeInProgress(this._id());
        },


        setPromiseToCache : function(promise) {
            this.cache().setPromise(this._id(), promise);
        },


        setInProgress : function() {
            this.cache().setInProgress(this._id());
        },


        isInProgress : function(){
            return this.cache().getInProgress(this._id());
        },


        clearCache : function(clearAll){
            if (clearAll){
                this.cache().clear();
            }else{
                this.cache().clear(this._id());
            }
        },


        getPromise : function(){
            if (this.promise != null){
                return this.promise;
            }
            return this.cache().getPromise(this._id());
        },


        unique : function(){
            return this.cache().cachedTime;
        }
    };

    return mixin;
});
