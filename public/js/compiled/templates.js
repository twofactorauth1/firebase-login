this["hbs"] = this["hbs"] || {};
this["hbs"]["Utils"] = this["hbs"]["Utils"] || {};
this["hbs"]["Utils"]["_fetching-data-progress-bar-partial"] = this["hbs"]["Utils"]["_fetching-data-progress-bar-partial"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["Utils"] = this["hbs"]["Utils"] || {};
this["hbs"]["Utils"]["fetching-data-progress-bar"] = this["hbs"]["Utils"]["fetching-data-progress-bar"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["alert"] = this["hbs"]["alert"] || {};
this["hbs"]["alert"]["alert-progress"] = this["hbs"]["alert"]["alert-progress"] || {};

this["alert"] = this["alert"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["aws"] = this["hbs"]["aws"] || {};
this["hbs"]["aws"]["_aws-file-upload"] = this["hbs"]["aws"]["_aws-file-upload"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["fileupload"] = this["hbs"]["fileupload"] || {};
this["hbs"]["fileupload"]["jquery-file-upload"] = this["hbs"]["fileupload"]["jquery-file-upload"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["home"] = this["hbs"]["home"] || {};
this["hbs"]["home"]["home-main"] = this["hbs"]["home"]["home-main"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["signup"] = this["hbs"]["signup"] || {};
this["hbs"]["signup"]["_signup-create"] = this["hbs"]["signup"]["_signup-create"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["signup"] = this["hbs"]["signup"] || {};
this["hbs"]["signup"]["_signup-details"] = this["hbs"]["signup"]["_signup-details"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["signup"] = this["hbs"]["signup"] || {};
this["hbs"]["signup"]["_signup-start"] = this["hbs"]["signup"]["_signup-start"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["signup"] = this["hbs"]["signup"] || {};
this["hbs"]["signup"]["signup-main"] = this["hbs"]["signup"]["signup-main"] || {};

Handlebars.registerPartial("fetching-data-progress-bar-partial", this["hbs"]["Utils"]["_fetching-data-progress-bar-partial"]["fetching-data-progress-bar-partial"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                ";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.label); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n            ";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "\n                Gathering Information...\n            ";
  }

  buffer += "\n    <div class=\"progress progress-striped active\">\n        <div class=\"bar\" style=\"width:100%\">\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>\n    </div>\n";
  return buffer;
  }));

Handlebars.registerPartial("aws-file-upload", this["hbs"]["aws"]["_aws-file-upload"]["aws-file-upload"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var stack1;
  if (stack1 = helpers['upload-label']) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0['upload-label']); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program3(depth0,data) {
  
  
  return "Upload File";
  }

  buffer += "\n    <form id=\"form-upload-to-s3\" action=\"\" method=\"post\" enctype=\"multipart/form-data\" style=\"margin-bottom:0px\">\n        <input type=\"hidden\" id=\"key\" name=\"key\" value=\"${filename}\">\n        <input type=\"hidden\" id=\"awsaccesskeyid\" name=\"AWSAccessKeyId\" value=\"\">\n        <input type=\"hidden\" id=\"acl\" name=\"acl\" value=\"private\">\n        <input type=\"hidden\" id=\"redirect\" name=\"success_action_redirect\" value=\"\">\n        <input type=\"hidden\" id=\"policy\" name=\"policy\" value=\"\">\n        <input type=\"hidden\" id=\"signature\" name=\"signature\" value=\"\">\n        <input type=\"hidden\" id=\"contenttype\" name=\"Content-Type\" value=\"text/plain\">\n\n        <input id=\"upload-to-s3-file\" name=\"file\" type=\"file\" class=\"\">\n\n        <br/><br/>\n\n        <div class=\"btn\" id=\"btn-upload-to-s3\" value=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0['upload-label']), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0['upload-label']), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n        <div class=\"btn\" id=\"btn-upload-to-s3-cancel\">Cancel</div>\n    </form>\n\n";
  return buffer;
  }));

Handlebars.registerPartial("signup-create", this["hbs"]["signup"]["_signup-create"]["signup-create"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return "display:block";
  }

  buffer += "\n    <div id=\"create\" class=\"signuppanel\" style=\"";
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data};
  stack2 = ((stack1 = helpers.equals || (depth0 && depth0.equals)),stack1 ? stack1.call(depth0, (depth0 && depth0.place), "create", options) : helperMissing.call(depth0, "equals", (depth0 && depth0.place), "create", options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">\n        <div class=\"form form-inner\">\n            <ul id=\"progressbar\">\n        	<li></li>\n        	<li></li>\n        	<li class=\"active\"></li>\n            </ul>\n            <h4>Create an account</h4>\n            <hr></hr>\n            <div class=\"row social\">\n                <a href=\"/signup/facebook\" class=\"btn btn-large btn-default\">\n                    <i class=\"fa fa-facebook\"/>\n                </a>\n\n                <a href=\"/signup/twitter\" class=\"btn btn-large btn-default\">\n                    <i class=\"fa fa-twitter\"/>\n                </a>\n\n\n                <a href=\"/signup/google\" class=\"btn btn-large btn-default\">\n                    <i class=\"fa fa-google-plus\"/>\n                </a>\n\n                <a href=\"/signup/linkedin\" class=\"btn btn-large btn-default\">\n                    <i class=\"fa fa-linkedin\"/>\n                </a>\n            </div>\n            <hr/>\n\n            <form role=\"form\" id=\"form-create-account\" action=\"/signup\" method=\"post\">\n                <div class=\"form-group row\">\n                    <div class=\"\">\n                        <label>Or create with your email address</label>\n                        <div class=\"input-group\">\n                            <input class=\"form-control\" id=\"input-username\" type=\"text\" name=\"username\" placeholder=\"username\"/>\n                            <span class=\"input-group-addon\"><i id=\"icon-username\" class=\"glyphicon\"/> </span>\n                        </div>\n                        <span id=\"help-username\" class=\"error\" />\n                    </div>\n                </div>\n\n                <div class=\"form-group row\">\n                    <div class=\"\">\n                        <label>Password</label>\n                        <div class=\"input-group\">\n                            <input class=\"form-control\" id=\"input-password\" type=\"password\" name=\"password\" placeholder=\"password\"/>\n                            <span class=\"input-group-addon\"><i id=\"icon-password\" class=\"glyphicon\"/> </span>\n                        </div>\n                        <span id=\"help-password\" class=\"error\" />\n                    </div>\n                </div>\n\n                <div class=\"form-group row\">\n                    <div class=\"\">\n                        <label>Re-enter Password</label>\n\n                        <div class=\"input-group\">\n                            <input class=\"form-control\" id=\"input-password2\" type=\"password\" name=\"password2\" placeholder=\"password\"/>\n                            <span class=\"input-group-addon\"><i id=\"icon-password2\" class=\"glyphicon\"/> </span>\n                        </div>\n                        <span id=\"help-password2\" class=\"error\" />\n                    </div>\n                </div>\n\n                <p class=\"termsOfuse\">By continuing below you agree to the <a href=\"/terms\">Terms of Use</a><p>\n                <button class=\"btn btn-primary btn-default btn-block\" type=\"submit\" value=\"Create Account\" role=\"button\">Create Account</button>\n            </form>\n        </div>\n    </div>\n";
  return buffer;
  }));

Handlebars.registerPartial("signup-details", this["hbs"]["signup"]["_signup-details"]["signup-details"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, self=this, helperMissing=helpers.helperMissing, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return "display:block";
  }

function program3(depth0,data) {
  
  
  return "btn-primary";
  }

function program5(depth0,data) {
  
  
  return "btn-default";
  }

function program7(depth0,data) {
  
  
  return "What is the name of your business";
  }

function program9(depth0,data) {
  
  
  return "Does your professional business have a name?";
  }

function program11(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n                    <div class=\"form-group row\">\n                        <div class=\"\">\n                            <label>\n                                How large is your business?\n                            </label>\n\n                            <div class=\"btn-group\" data-toggle=\"buttons\">\n                                <label class=\"btn btn-default ";
  options = {hash:{},inverse:self.noop,fn:self.program(12, program12, data),data:data};
  stack2 = ((stack1 = helpers.equals || (depth0 && depth0.equals)),stack1 ? stack1.call(depth0, ((stack1 = ((stack1 = (depth0 && depth0.account)),stack1 == null || stack1 === false ? stack1 : stack1.company)),stack1 == null || stack1 === false ? stack1 : stack1.size), 2, options) : helperMissing.call(depth0, "equals", ((stack1 = ((stack1 = (depth0 && depth0.account)),stack1 == null || stack1 === false ? stack1 : stack1.company)),stack1 == null || stack1 === false ? stack1 : stack1.size), 2, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">\n                                    <input type=\"radio\" name=\"radio-company-size\" class=\"radio-company-size\" data-size=2> Small (0-4)\n                                </label>\n\n                                <label class=\"btn btn-default ";
  options = {hash:{},inverse:self.noop,fn:self.program(12, program12, data),data:data};
  stack2 = ((stack1 = helpers.equals || (depth0 && depth0.equals)),stack1 ? stack1.call(depth0, ((stack1 = ((stack1 = (depth0 && depth0.account)),stack1 == null || stack1 === false ? stack1 : stack1.company)),stack1 == null || stack1 === false ? stack1 : stack1.size), 3, options) : helperMissing.call(depth0, "equals", ((stack1 = ((stack1 = (depth0 && depth0.account)),stack1 == null || stack1 === false ? stack1 : stack1.company)),stack1 == null || stack1 === false ? stack1 : stack1.size), 3, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">\n                                    <input type=\"radio\" name=\"radio-company-size\" class=\"radio-company-size\" data-size=3> Medium (5-24)\n                                </label>\n\n                                <label class=\"btn btn-default ";
  options = {hash:{},inverse:self.noop,fn:self.program(12, program12, data),data:data};
  stack2 = ((stack1 = helpers.equals || (depth0 && depth0.equals)),stack1 ? stack1.call(depth0, ((stack1 = ((stack1 = (depth0 && depth0.account)),stack1 == null || stack1 === false ? stack1 : stack1.company)),stack1 == null || stack1 === false ? stack1 : stack1.size), 4, options) : helperMissing.call(depth0, "equals", ((stack1 = ((stack1 = (depth0 && depth0.account)),stack1 == null || stack1 === false ? stack1 : stack1.company)),stack1 == null || stack1 === false ? stack1 : stack1.size), 4, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">\n                                    <input type=\"radio\" name=\"radio-company-size\" class=\"radio-company-size\" data-size=4> Large(25-99)\n                                </label>\n\n                                <label class=\"btn btn-default ";
  options = {hash:{},inverse:self.noop,fn:self.program(12, program12, data),data:data};
  stack2 = ((stack1 = helpers.equals || (depth0 && depth0.equals)),stack1 ? stack1.call(depth0, ((stack1 = ((stack1 = (depth0 && depth0.account)),stack1 == null || stack1 === false ? stack1 : stack1.company)),stack1 == null || stack1 === false ? stack1 : stack1.size), 5, options) : helperMissing.call(depth0, "equals", ((stack1 = ((stack1 = (depth0 && depth0.account)),stack1 == null || stack1 === false ? stack1 : stack1.company)),stack1 == null || stack1 === false ? stack1 : stack1.size), 5, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">\n                                    <input type=\"radio\" name=\"radio-company-size\" class=\"radio-company-size\" data-size=5> Enterprise(100+)\n                                </label>\n                            </div>\n                        </div>\n                    </div>\n                    ";
  return buffer;
  }
function program12(depth0,data) {
  
  
  return "active";
  }

  buffer += "\n    <div id=\"details\" class=\"signuppanel\" style=\"";
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data};
  stack2 = ((stack1 = helpers.equals || (depth0 && depth0.equals)),stack1 ? stack1.call(depth0, (depth0 && depth0.place), "details", options) : helperMissing.call(depth0, "equals", (depth0 && depth0.place), "details", options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">\n        <div class=\"form form-inner\">\n            <ul id=\"progressbar\">\n                <li></li>\n                <li class=\"active\"></li>\n                <li></li>\n            </ul>\n            <h4>Set Up Your Business</h4>\n            <hr>\n            <div>\n                <form role=\"form\">\n                    <div class=\"form-group row\">\n                        <div class=\"\">\n                            <div id=\"btn-newbusiness\" class=\"btn btn-large ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.isNewBusiness), {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\" data-type=\"new_business\">New</div>\n\n                            <div id=\"btn-existingbusiness\" class=\"btn btn-large btn-default ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.isExistingBusiness), {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\" data-type=\"existing_business\">Existing</div>\n\n                        </div>\n                        <div class=\"\">\n                            <label>\n                                ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.isBusiness), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                                ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.isProfessional), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                            </label>\n                            <input class=\"form-control\" type=\"text\" id=\"input-company-name\" value=\""
    + escapeExpression(((stack1 = ((stack1 = ((stack1 = (depth0 && depth0.account)),stack1 == null || stack1 === false ? stack1 : stack1.company)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" />\n                        </div>\n                    </div>\n\n                    <div class=\"form-group row\">\n                        <div class=\"col-xs-6\">\n                            <select id=\"category_parent\" class=\"form-control\">\n                              <option>Fitness</option>\n                              <option>Services</option>\n                              <option>Other</option>\n                            </select>\n                        </div>\n                        <div class=\"col-xs-6\">\n                            <select id=\"category_child\" class=\"form-control\">\n                              <option>Yoga</option>\n                              <option>Personal Trainer</option>\n                              <option>Hair Stylist</option>\n                              <option>Make Up Artist</option>\n                              <option>Other</option>\n                            </select>\n                        </div>\n                    </div>\n\n\n\n                    ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.isBusiness), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                </form>\n\n            </div>\n        </div>\n    </div>\n";
  return buffer;
  }));

Handlebars.registerPartial("signup-start", this["hbs"]["signup"]["_signup-start"]["signup-start"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return "display:block";
  }

function program3(depth0,data) {
  
  
  return "btn-primary";
  }

function program5(depth0,data) {
  
  
  return "btn-default";
  }

  buffer += "\n    <div id=\"start\" class=\"signuppanel\" style=\"";
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data};
  stack2 = ((stack1 = helpers.equals || (depth0 && depth0.equals)),stack1 ? stack1.call(depth0, (depth0 && depth0.place), "start", options) : helperMissing.call(depth0, "equals", (depth0 && depth0.place), "start", options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">\n            <div class=\"form form-inner\" style=\"\">\n            <ul id=\"progressbar\">\n                <li class=\"active\"></li>\n                <li></li>\n                <li></li>\n            </ul>\n            <h4>Choose Your Business Model</h4>\n            <hr>\n            <div class=\"models row\">\n                <div class=\"col-sm-4\">\n                    <div id=\"btn-professional\" class=\"btn btn-large btn-bus-model ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.isProfessional), {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\" data-type=\"professional\"><span class=\"fa fa-user\"></span></div>\n                    <h4>Professional</h4>\n                </div>\n                <div class=\"col-sm-4\">\n                    <div id=\"btn-business\" class=\"btn btn-large btn-default btn-bus-model ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.isBusiness), {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\" data-type=\"business\"><span class=\"fa fa-users\"></span></div>\n                    <h4>Business</h4>\n                </div>\n                <div class=\"col-sm-4\">\n                    <div id=\"btn-enterprise\" class=\"btn btn-large btn-default btn-bus-model ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.isEnterprise), {hash:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\" data-type=\"enterprise\"><span class=\"fa fa-building-o\"></span></div>\n                    <h4>Enterprise</h4>\n                </div>\n            </div>\n        </div>\n    </div>\n";
  return buffer;
  }));

this["hbs"]["Utils"]["fetching-data-progress-bar"]["hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, self=this;


  buffer += "\n    ";
  stack1 = self.invokePartial(partials['fetching-data-progress-bar-partial'], 'fetching-data-progress-bar-partial', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  });

this["hbs"]["alert"]["alert-progress"]["hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.alertType) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.alertType); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <strong>";
  if (stack1 = helpers.heading) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.heading); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</strong><br/>\n        ";
  return buffer;
  }

  buffer += "\n    <div class=\"alert ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.alertType), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.heading), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        <div class=\"progress progress-striped active\">\n            <div class=\"bar\" style=\"width: 100%;\"></div>\n        </div>\n    </div>\n";
  return buffer;
  });

this["alert"]["hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.alertType) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.alertType); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n        <strong>";
  if (stack1 = helpers.heading) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.heading); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</strong><br/>\n        ";
  return buffer;
  }

  buffer += "\n    <div class=\"alert ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.alertType), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n        <button class=\"close\" data-dismiss=\"alert\">×</button>\n        ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.heading), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  if (stack1 = helpers.content) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.content); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n    </div>\n";
  return buffer;
  });

this["hbs"]["fileupload"]["jquery-file-upload"]["hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return "Select file";
  }

function program3(depth0,data) {
  
  
  return "Select files...";
  }

function program5(depth0,data) {
  
  
  return "\n                <button type=\"submit\" class=\"btn btn-primary start visible-md visible-lg\">\n                    <i class=\"glyphicon glyphicon-upload\"></i>\n                    <span>Start upload</span>\n                </button>\n                <button type=\"reset\" class=\"btn btn-warning cancel visible-md visible-lg\">\n                    <i class=\"glyphicon glyphicon-ban-circle\"></i>\n                    <span>Cancel upload</span>\n                </button>\n                <!--\n                <button type=\"button\" class=\"btn btn-danger delete\">\n                    <i class=\"glyphicon glyphicon-trash\"></i>\n                    <span>Delete</span>\n                </button>\n                <input type=\"checkbox\" class=\"toggle\">\n                -->\n                ";
  }

  buffer += "\n    <form id=\"fileupload\" action=\"//jquery-file-upload.appspot.com/\" method=\"POST\" enctype=\"multipart/form-data\">\n        <!-- Redirect browsers with JavaScript disabled to the origin page -->\n        <noscript><input type=\"hidden\" name=\"redirect\" value=\"http://blueimp.github.io/jQuery-File-Upload/\"></noscript>\n        <!-- The fileupload-buttonbar contains buttons to add/delete files and start/cancel the upload -->\n        <div class=\"row fileupload-buttonbar\">\n            <div class=\"col-lg-12\">\n                <!-- The fileinput-button span is used to style the file input field as button -->\n                <span class=\"btn btn-success fileinput-button\">\n                    <i class=\"glyphicon glyphicon-plus\"></i>\n                    <span>";
  options = {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data};
  stack2 = ((stack1 = helpers.equals || (depth0 && depth0.equals)),stack1 ? stack1.call(depth0, (depth0 && depth0.maxNumberOfFiles), 1, options) : helperMissing.call(depth0, "equals", (depth0 && depth0.maxNumberOfFiles), 1, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</span>\n                    <input type=\"file\" name=\"files[]\" multiple>\n                </span>\n\n\n                <!-- ALWAYS SHOW IF SMALL OR MEDIUM -->\n                <button type=\"submit\" class=\"btn btn-primary start hidden-md hidden-lg\">\n                    <i class=\"glyphicon glyphicon-upload\"></i>\n                    <span>Start upload</span>\n                </button>\n                <button type=\"reset\" class=\"btn btn-warning cancel hidden-md hidden-lg\">\n                    <i class=\"glyphicon glyphicon-ban-circle\"></i>\n                    <span>Cancel upload</span>\n                </button>\n\n                <!-- ONLY SHOW IF MAX NUMBER OF FILES > 1 -->\n                ";
  options = {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data};
  stack2 = ((stack1 = helpers.notequals || (depth0 && depth0.notequals)),stack1 ? stack1.call(depth0, (depth0 && depth0.maxNumberOfFiles), 1, options) : helperMissing.call(depth0, "notequals", (depth0 && depth0.maxNumberOfFiles), 1, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                <!-- The global file processing state -->\n                <span class=\"fileupload-process\"></span>\n            </div>\n            <!-- The global progress state -->\n            <div class=\"col-lg-5 fileupload-progress fade\">\n                <!-- The global progress bar -->\n                <div class=\"progress progress-striped active\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\">\n                    <div class=\"progress-bar progress-bar-success\" style=\"width:0%;\"></div>\n                </div>\n                <!-- The extended global progress state -->\n                <div class=\"progress-extended\">&nbsp;</div>\n            </div>\n        </div>\n        <!-- The table listing the files available for upload/download -->\n        <table role=\"presentation\" class=\"table table-striped\"><tbody class=\"files\"></tbody></table>\n    </form>\n";
  return buffer;
  });

this["hbs"]["home"]["home-main"]["hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                    <div class=\"row\">\n                        <a class=\"authenticated\" href=\"/\" data-accountid=\"";
  if (stack1 = helpers._id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0._id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n                            <div class=\"col-xs-10 col-xs-offset-1 col-md-8 col-md-offset-2\">\n                                <div class=\"panel panel-info hand panel-account-go\">\n                                    <div class=\"panel-heading\" style=\"text-align:center\">\n                                        <strong>"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.company)),stack1 == null || stack1 === false ? stack1 : stack1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</strong>\n                                    </div>\n\n                                    <div class=\"panel-body\" style=\"text-align:center\">\n                                        <i class=\"fa fa-truck\" style=\"font-size:3.5em;\"/>\n                                    </div>\n                                </div>\n                            </div>\n                        </a>\n                    </div>\n                    ";
  return buffer;
  }

  buffer += "\n    <div class=\"row\">\n        <div class=\"col-xs-12 col-md-6 col-md-offset-3\">\n            <div class=\"panel panel-success\">\n                <div class=\"panel-heading\" style=\"text-align:center\">\n                    Where do you want to go?\n                </div>\n\n                <div class=\"panel-body\">\n                    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.accounts), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n\n                    <hr/>\n\n                    <div class=\"row\">\n                        <div class=\"col-xs-10 col-xs-offset-1 col-md-8 col-md-offset-2\">\n                            <div class=\"panel panel-default hand panel-account-go\">\n                                <div class=\"panel-heading\" style=\"text-align:center\">\n                                    <strong>Manage Your Account</strong>\n                                </div>\n\n                                <div class=\"panel-body\" style=\"text-align:center\">\n                                    <i class=\"fa fa-gears\" style=\"font-size:3.5em;\"/>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n\n    </div>\n";
  return buffer;
  });

this["hbs"]["signup"]["signup-main"]["hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, stack2, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  return "hidden";
  }

  buffer += "\n    <section class=\"mainpanel\">\n        <span class=\"logo\"></span>\n        <div class=\"signup-inner row\">\n            <div class=\"col-xs-1\">\n                <a class=\"left-nav\"></a>\n            </div>\n            <div class=\"panels col-xs-10\">\n                ";
  stack1 = self.invokePartial(partials['signup-start'], 'signup-start', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  stack1 = self.invokePartial(partials['signup-details'], 'signup-details', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  stack1 = self.invokePartial(partials['signup-create'], 'signup-create', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </div>\n            <div class=\"col-xs-1\">\n                <a class=\"right-nav ";
  options = {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data};
  stack2 = ((stack1 = helpers.superUnless || (depth0 && depth0.superUnless)),stack1 ? stack1.call(depth0, "or", (depth0 && depth0.isProfessional), (depth0 && depth0.isBusiness), (depth0 && depth0.isEnterprise), options) : helperMissing.call(depth0, "superUnless", "or", (depth0 && depth0.isProfessional), (depth0 && depth0.isBusiness), (depth0 && depth0.isEnterprise), options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\"></a>\n            </div>\n        </div>\n    </section>\n";
  return buffer;
  });