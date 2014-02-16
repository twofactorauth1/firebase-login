define(function() {

    //-------------------------------------------------
    // -- TEMPLATE MANAGER
    //-------------------------------------------------

    var templateManager = {

        getTemplateHomeFromPath: function(filename){
            if (typeof hbs === 'undefined') {
                return null;
            }
            var obj = hbs;
            var path = filename.split(".");
            for (var i = 0; i < path.length; i++) {
                try {
                    obj = obj[path[i]];
                } catch(exception) {
                    return null;
                }
            }
            return obj;
        },


        get: function(templateName, fileName) {
            var template = this._getTemplate(templateName, fileName);
            if (template != null) {
                return template;
            }

            // Lets go back to the server for this template

            var self = this;
            $.ajax({
                url : 'templates/' + fileName + '.html',
                success : function(data) {
                    self._processTemplateFile(fileName, data);
                },
                async : false
            });

            template = self._getTemplate(templateName, fileName);
            return template;
        },


        _getTemplate: function(templateName, fileName) {
            var templateHome = this.getTemplateHomeFromPath(fileName);
            if (templateHome != null) {
                var template = templateHome[templateName];
                if (template != null && template.hasOwnProperty("hbs")) {
                    return template.hbs;
                }
            }
            return null;
        },


        _processTemplateFile: function(filename, templateHtml) {
            if (typeof hbs == 'undefined') {
                hbs = {};
            }

            var templateHome = hbs;
            var path = filename.split(".");
            for (var i = 0; i < path.length; i++) {
                if (templateHome[path[i]] == null) {
                    templateHome[path[i]] = {};
                    templateHome = templateHome[path[i]];
                }
                //templateHome = templateHome[path[i]] || {};
            }

            var div = '<div id="tmpTemplateHolder"></div>';
            var body = $(document).find("body");
            $(body).append(div);

            div = $("#tmpTemplateHolder");
            $(div).append(templateHtml);

            var templateScripts = $(div).find("script[type='text/x-handlebars-template']");
            for (var i = 0; i < templateScripts.length; i++) {
                var templateScript = templateScripts[i];
                var templateName = $(templateScript).attr("name");
                if (templateName == null) {
                    templateName = $(templateScript).attr("id");
                }
                var template = $(templateScript).html();
                var compiled = Handlebars.compile(template);

                var isPartial = $(templateScript).attr("partial");
                if (isPartial) {
                    var partialHome = "_" + templateName;
                    templateHome[partialHome] = {};
                    templateHome[partialHome][templateName] = compiled;
                    Handlebars.registerPartial(templateName, compiled);
                } else {
                    templateHome[templateName] = {};
                    templateHome[templateName].hbs = compiled;
                }
            }

            $("#tmpTemplateHolder").remove();
        }
    };

    $$ = $$ || {};
    $$.templateManager = templateManager;

    return $$.templateManager;
});