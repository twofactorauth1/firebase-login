define(function() {

    var utils = {

        viewutils: {
            isMobileLayout:function () {
                return (window.innerWidth || document.documentElement.clientWidth) < 768;
            },


            isMobileOrTabletLayout:function () {
                return (window.innerWidth || document.documentElement.clientWidth) <= 1024;
            },


            isTabletLayout:function () {
                var w = window.innerWidth || document.documentElement.clientWidth;
                return w >= 768 && w <= 1024;
            },


            isMobileTabletTouch:function () {
                if (this.isMobileOrTabletLayout() || this.isTouch()){
                    return true;
                }
                return false;
            },


            isMobileOrTouch:function () {
                if (this.isMobileLayout() || this.isTouch()) {
                    return true;
                }
                return false;
            },


            isTouch:function () {
                if ((Modernizr && Modernizr.touch) === true) {
                    return true;
                }
                return false;
            }
        },


        errorutils: {
            getMessageFromJQXHRResponse: function(resp) {
                if (_.isString(resp)) {
                    return resp;
                }

                if (resp && resp.responseText) {
                    try {
                        resp = JSON.parse(resp.responseText);
                        if (resp.message) {
                            var str= "";
                            if (_.isObject(resp.message)) {
                                for (var key in resp.message) {
                                    if (key != null && key != "undefined" && resp.message[key] != null) {
                                        str += key + ": " + resp.message[key];
                                    }
                                }
                            } else {
                                str = resp.message;
                            }

                            if (resp.detail) {
                                str += "Detail: " + resp.detail;
                            }
                            return str;
                        } else if (resp.detail) {
                            return resp.detail;
                        } else if(resp.code) {
                            return resp.code;
                        }
                    } catch(e) {
                        return resp.responseText;
                    }
                }
                return "";
            }
        },


        //-------------------------------------------------
        // -- TEMPLATE MANAGER
        //-------------------------------------------------

        /**
         * Create a TemplateManager class that can be extended. This has some shortcuts
         * for properly handling adding and removing of views, to ensure all bindings
         * are removed.
         */
        templateManager: {

            _templateMappings:{},

            _templateFiles:{},

            compiledTemplates:{},

            callbacksPending:{},

            _setUpTemplateFiles:{},

            /**
             * @setFile Pass in an HTML document containing template markup inside of
             *                        script tags.  This method will pull out all of the script blocks,
             *                        find the "templateId" from the @name attribute on the script block,
             *                        and create a compiled template from it which can be called later using
             *                        the @getNow() method of TemplateManager
             *
             * @param templateHtml An HTML or text file containing one or more templates
             * @param filename The filename to be referenced later on.
             * @param location Defaults to "templates" if none is pased in.
             */
            setFile:function (templateHtml, filename, location) {
                if (this._setUpTemplateFiles[filename] == null) {
                    this._setUpTemplateFiles[filename] = "loaded";
                    var div = '<div id="tmpTemplateHolder"></div>';
                    var body = $(document).find("body");
                    $(body).append(div);

                    div = $("#tmpTemplateHolder");
                    $(div).append(templateHtml);

                    var templateScripts = $(div).find("script[type='text/x-handlebars-template']");
                    for (var i = 0; i < templateScripts.length; i++) {
                        var templateScript = templateScripts[i];
                        var templateId = $(templateScript).attr("name");
                        if (templateId == null) {
                            templateId = $(templateScript).attr("id");
                        }
                        var template = $(templateScript).html();
                        var templ = this.getExistingOrCompileNew(template, templateId, filename, location);

                        var isPartial = $(templateScript).attr("partial");
                        if (isPartial === "true") {
                            Handlebars.registerPartial(templateId, templ);
                        }
                    }

                    $("#tmpTemplateHolder").remove();
                }
            },


            /**
             * @getExistingOrCompileNew Pass in a raw template, give it an ID and a filename, this
             *                          method will compile the template and return the compiled instance. As
             *                          well, this template will be accessible later via the @getNow() method.
             *
             * @param templateHtml The raw template html, no script block should be wrapping the text
             * @param templateId A templateId to use for later reference to the compiled template
             * @param filename The filename from which the template is derived.
             * @param location Defaults to "templates" if no value is passed in.
             *
             * @return Compiled Handlebars Template function
             */
            getExistingOrCompileNew:function (templateHtml, templateId, filename, location) {
                if (location == null) {
                    location = "templates";
                }

                if (filename == null) {
                    filename = this._templateMappings[templateId];

                    if (filename == null) {
                        filename = "";
                    }
                }

                var url = location + "/" + filename;
                var key = url + "_" + templateId;

                if (this.compiledTemplates[key] == null) {
                    var compiled = Handlebars.compile(templateHtml);
                    this.compiledTemplates[key] = compiled;
                }
                return this.compiledTemplates[key];
            },


            /**
             * @getNow Looks up a template by templateId, filename, and location and returns
             *          the compiled template function if it exists.
             *
             * @param templateId
             * @param filename
             * @param location
             * @return Compiled Template Function, or null
             */
            getNow:function (templateId, filename, location) {
                if (location == null) {
                    location = "templates";
                }

                if (filename == null) {
                    filename = this._templateMappings[templateId];

                    if (filename == null) {
                        filename = "";
                    }
                }

                var url = location + "/" + filename;

                var key = url + "_" + templateId;
                var template = this.compiledTemplates[key];

                if (template != null) {
                    return template;
                }

                //check to see if it has already been loaded with page load
                var _tmpId = "#" + templateId;
                var loadedTemplate = $(_tmpId);
                if ($(loadedTemplate)[0] != null) {
                    var compiledTemplate = Handlebars.compile($(loadedTemplate).html());
                    this.compiledTemplates[key] = compiledTemplate;
                    return this.compiledTemplates[key];
                }
            },


            /**
             * Retrieves a javascript template file from the server.  The file should have one or more script
             * blocks annotated with "type=text/x-handlebars-template". This method retrieves the file from the server,
             * parses all template blocks, using the @id attribute as the templateId, and sets the compiled template
             * functions to cache.  The specific template requested will be returned in the callback method.
             *
             * Note that this method will first check to see if the template is already compiled, and if so, returns it,
             * and also checks to see if the template is found on the DOM, in which case it will not call for the file
             * from the server.
             *
             * @param templateId
             * @param filename
             * @param location
             * @param callBack
             * @param context
             */
            get:function (templateId, filename, location, callBack, context) {
                if (location == null) {
                    location = "templates";
                }

                if (filename == null) {
                    filename = this._templateMappings[templateId];

                    if (filename == null) {
                        filename = "";
                    }
                }

                var url = location + "/" + filename;

                //this allows us to load multiple templates with the same ID, from different
                //files
                var key = url + "_" + templateId;

                //Check to see if we've already loaded this template;
                var template = this.compiledTemplates[key];

                if (template != null) {
                    //check to see if this is a javascript file, if it is, we need to eval here
                    if (filename.indexOf(".js") > 0) {
                        eval(template);
                    }
                    if (callBack != null) {
                        callBack(template, context);
                        return;
                    }
                }

                //check to see if it has already been loaded with page load
                if (filename === "") {
                    var _tmpId = "#" + templateId;
                    var loadedTemplate = $(_tmpId);
                    if ($(loadedTemplate)[0] != null) {
                        var compiledTemplate = Handlebars.compile($(loadedTemplate).html());
                        this.compiledTemplates[templateId] = compiledTemplate;

                        callBack(this.compiledTemplates[key], context);
                        return;
                    }
                    throw "No Template with Id " + templateId + " found on Page, and a proper URL could not be created";
                }

                var file = this._templateFiles[url];
                var callbacks;
                if (file) {
                    //We have already loaded the file, and the ID wasn't found, so we're screwed'
                    throw "No Template id found in file provided";
                }
                else if (this.callbacksPending[url] != null) {
                    //We have an outstanding call for this particular file already...queue callback
                    callbacks = this.callbacksPending[url];
                    callbacks.push({callBack:callBack, templateId:templateId, context:context});
                }
                else {
                    //We need to go look for the file and find all templates within that file
                    callbacks = [];
                    callbacks.push({callBack:callBack, templateId:templateId, context:context});
                    this.callbacksPending[url] = callbacks;

                    var self = this;

                    //Grab javascript files here!
                    if (filename.indexOf(".js") > 0) {
                        $.getScript(url, function (data, textStatus, jqxhr) {

                            var templateId = "";
                            var key = url + "_" + templateId;
                            self._templateFiles[url] = "javascript file loaded";

                            self.compiledTemplates[key] = data;

                            var pendingcallbacks = self.callbacksPending[url];
                            if (pendingcallbacks != null) {
                                var i;
                                for (i = 0; i < pendingcallbacks.length; i++) {
                                    var callback = pendingcallbacks[i].callBack;
                                    templateId = pendingcallbacks[i].templateId;
                                    var context = pendingcallbacks[i].context;
                                    key = url + "_" + templateId;

                                    callback(self.compiledTemplates[key], context);
                                }
                                self.callbacksPending[url] = null;
                            }
                        });
                    } else {
                        $.get(url, function (data) {

                            self._templateFiles[url] = data;

                            //add any templates or javascript to the cache
                            $(data).select('script').each(function () {
                                var type = $(this).attr("type");
                                if (type != null) {
                                    var templateId = $(this).attr('id');
                                    var key = url + "_" + templateId;

                                    if (type == "text/x-handlebars-template") {

                                        self.compiledTemplates[key] = Handlebars.compile($(this).html());
                                    }
                                    else if (type == "text/javascript") {
                                        self.compiledTemplates[key] = this;
                                    }
                                    else {
                                        self.compiledTemplates[key] = $(this).html();
                                    }
                                }
                            });


                            var pendingcallbacks = self.callbacksPending[url];
                            if (pendingcallbacks != null) {
                                var i;
                                for (i = 0; i < pendingcallbacks.length; i++) {
                                    var callback = pendingcallbacks[i].callBack;
                                    var templateId = pendingcallbacks[i].templateId;
                                    var context = pendingcallbacks[i].context;
                                    var key = url + "_" + templateId;
                                    callback(self.compiledTemplates[key], context);
                                }
                                self.callbacksPending[url] = null;
                            }
                        });
                    }
                }
            }
        }
    }
})
