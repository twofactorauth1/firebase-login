define(['handlebars'], function(Handlebars) {

this["hbs"] = this["hbs"] || {};
this["hbs"]["signup"] = this["hbs"]["signup"] || {};
this["hbs"]["signup"]["_signup-partial"] = this["hbs"]["signup"]["_signup-partial"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["signup"] = this["hbs"]["signup"] || {};
this["hbs"]["signup"]["text-template-1"] = this["hbs"]["signup"]["text-template-1"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["signup"] = this["hbs"]["signup"] || {};
this["hbs"]["signup"]["text-template-2"] = this["hbs"]["signup"]["text-template-2"] || {};

this["hbs"] = this["hbs"] || {};
this["hbs"]["utils"] = this["hbs"]["utils"] || {};
this["hbs"]["utils"]["_fetching-data-progress-bar"] = this["hbs"]["utils"]["_fetching-data-progress-bar"] || {};

Handlebars.registerPartial("signup-partial", this["hbs"]["signup"]["_signup-partial"]["signup-partial"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "\n    MY PARTIAL! ";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n";
  return buffer;
  }));

Handlebars.registerPartial("fetching-data-progress-bar", this["hbs"]["utils"]["_fetching-data-progress-bar"]["fetching-data-progress-bar"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
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

this["hbs"]["signup"]["text-template-1"]["hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "\n    HELLO\n";
  });

this["hbs"]["signup"]["text-template-2"]["hbs"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); partials = this.merge(partials, Handlebars.partials); data = data || {};
  var buffer = "", stack1, self=this;


  buffer += "\n    HELLO WORLD ";
  stack1 = self.invokePartial(partials['signup-partial'], 'signup-partial', depth0, helpers, partials, data);
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n";
  return buffer;
  });

return this["hbs"]["utils"]["_fetching-data-progress-bar"];

});